"""
rendez_vous_views.py — MIXO · Module Rendez-vous
"""
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from ..models import RendezVous
from ..serializers.rendez_vous_serializers import RendezVousCreateSerializer, RendezVousSerializer
from ..permissions import IsClient, IsCoiffeur
from ..validators import verifier_disponibilite_complete, IndisponibiliteError, verifier_service
from services.models import Service
from authentification.models.utilisateur import Utilisateur
from planning.models import Horaire, DisponibiliteException
from notifications.services.notification_service import notifier, TypeNotification
from ..services import notifier_demande_avis


def _verifier_acces(request, rdv):
    if rdv.client_id != request.user.id and rdv.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Vous n'avez pas accès à ce rendez-vous.")


# ══════════════════════════════════════════════════════════════
#  CRÉNEAUX DISPONIBLES (UI de réservation)
# ══════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def creneaux_disponibles(request, coiffeur_id):
    """
    GET /api/rendez-vous/creneaux-disponibles/<uuid:coiffeur_id>/?date=YYYY-MM-DD&service_id=<uuid>
    Calcule les créneaux réservables ce jour-là pour ce coiffeur, en
    croisant Horaire + DisponibiliteException + RendezVous existants.
    """
    date_str   = request.query_params.get('date')
    service_id = request.query_params.get('service_id')

    if not date_str or not service_id:
        return Response({"error": "Paramètres 'date' et 'service_id' requis."}, status=400)

    try:
        date_jour = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({"error": "Format de date invalide (attendu YYYY-MM-DD)."}, status=400)

    coiffeur = get_object_or_404(Utilisateur, pk=coiffeur_id, role='COIFFEUR')
    service  = get_object_or_404(Service, pk=service_id, coiffeur=coiffeur)
    duree    = timedelta(minutes=service.duree_minutes)

    exception = DisponibiliteException.objects.filter(coiffeur=coiffeur, date=date_jour).first()
    if exception and not exception.disponible:
        return Response({"creneaux": [], "motif_indisponibilite": exception.get_categorie_display()})

    jour_semaine = date_jour.weekday()
    horaires_jour = Horaire.objects.filter(coiffeur=coiffeur, jour_semaine=jour_semaine, actif=True)
    if not horaires_jour.exists() and not (exception and exception.disponible):
        return Response({"creneaux": [], "motif_indisponibilite": "Fermé ce jour-là."})

    rdv_existants = list(RendezVous.objects.filter(
        coiffeur=coiffeur, statut__in=['EN_ATTENTE', 'ACCEPTE'],
        date_heure_debut__date=date_jour,
    ).values_list('date_heure_debut', 'date_heure_fin'))

    PAS_MINUTES = 30
    creneaux = []

    for h in horaires_jour:
        curseur = timezone.make_aware(datetime.combine(date_jour, h.heure_debut))
        fin_horaire = timezone.make_aware(datetime.combine(date_jour, h.heure_fin))

        while curseur + duree <= fin_horaire:
            fin_slot = curseur + duree
            conflit = any(curseur < f and fin_slot > d for d, f in rdv_existants)
            if not conflit and curseur > timezone.now():
                creneaux.append(curseur.strftime('%H:%M'))
            curseur += timedelta(minutes=PAS_MINUTES)

    return Response({"creneaux": sorted(set(creneaux)), "date": date_str})


# ══════════════════════════════════════════════════════════════
#  CRÉATION (Client)
# ══════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def creer_rendezvous(request):
    """
    POST /api/rendez-vous/creer/
    Body : { "service": "<uuid>", "date_heure_debut": "2026-07-01T10:00:00Z" }
    """
    serializer = RendezVousCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    service = serializer.validated_data['service']
    debut   = serializer.validated_data['date_heure_debut']
    coiffeur = service.coiffeur
    fin = debut + timedelta(minutes=service.duree_minutes)

    try:
        verifier_disponibilite_complete(service, coiffeur, debut, fin)
    except IndisponibiliteError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    rdv = RendezVous.objects.create(
        client=request.user,
        coiffeur=coiffeur,
        service=service,
        service_nom_snapshot=service.nom_prestation,
        service_prix_snapshot=service.prix,
        service_duree_snapshot=service.duree_minutes,
        date_heure_debut=debut,
        date_heure_fin=fin,
        statut='EN_ATTENTE',
    )

    notifier(
        coiffeur, "Nouvelle demande de rendez-vous",
        f"{request.user.username} souhaite réserver « {service.nom_prestation} » le {debut:%d/%m/%Y à %H:%M}.",
        TypeNotification.RDV_NOUVELLE_DEMANDE, lien=f"/coiffeur/rendez-vous/{rdv.id}",
    )
    notifier(
        request.user, "Demande envoyée",
        f"Votre demande de rendez-vous pour « {service.nom_prestation} » a été envoyée au coiffeur.",
        TypeNotification.RDV_DEMANDE_ENVOYEE, lien=f"/rendez-vous/{rdv.id}",
    )

    return Response(RendezVousSerializer(rdv).data, status=status.HTTP_201_CREATED)


# ══════════════════════════════════════════════════════════════
#  LISTES
# ══════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def mes_demandes(request):
    """GET /api/rendez-vous/mes-demandes/?statut=... — RDV du client connecté."""
    qs = RendezVous.objects.filter(client=request.user).select_related('coiffeur', 'service', 'paiement')
    statut = request.query_params.get('statut')
    search = request.query_params.get('search', '').strip()
    if statut:
        qs = qs.filter(statut=statut)
    if search:
        qs = qs.filter(
            Q(service_nom_snapshot__icontains=search)
            | Q(coiffeur__username__icontains=search)
            | Q(statut__icontains=search)
            | Q(statut_paiement__icontains=search)
        )
    return Response(RendezVousSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def mes_rendezvous(request):
    """GET /api/rendez-vous/mes-rendez-vous/?statut=... — RDV du coiffeur connecté."""
    qs = RendezVous.objects.filter(coiffeur=request.user).select_related('client', 'service', 'paiement')
    statut = request.query_params.get('statut')
    search = request.query_params.get('search', '').strip()
    if statut:
        qs = qs.filter(statut=statut)
    if search:
        qs = qs.filter(
            Q(service_nom_snapshot__icontains=search)
            | Q(client__username__icontains=search)
            | Q(statut__icontains=search)
            | Q(statut_paiement__icontains=search)
        )
    return Response(RendezVousSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_rendezvous(request, pk):
    """GET /api/rendez-vous/<uuid>/ — accessible au client, au coiffeur concerné, ou à un admin."""
    rdv = get_object_or_404(RendezVous.objects.select_related('client', 'coiffeur', 'service', 'paiement'), pk=pk)
    _verifier_acces(request, rdv)
    return Response(RendezVousSerializer(rdv).data)


# ══════════════════════════════════════════════════════════════
#  TRANSITIONS DE STATUT
# ══════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def accepter_rendezvous(request, pk):
    """POST /api/rendez-vous/<uuid>/accepter/ — coiffeur propriétaire uniquement."""
    rdv = get_object_or_404(RendezVous, pk=pk)
    if rdv.coiffeur_id != request.user.id:
        raise PermissionDenied("Ce rendez-vous ne vous appartient pas.")
    if rdv.statut != 'EN_ATTENTE':
        return Response({"error": "Ce rendez-vous n'est plus en attente."}, status=400)

    rdv.statut = 'ACCEPTE'
    rdv.save(update_fields=['statut', 'updated_at'])

    notifier(
        rdv.client, "Rendez-vous accepté",
        f"Votre rendez-vous « {rdv.service_nom_snapshot} » le {rdv.date_heure_debut:%d/%m/%Y à %H:%M} a été accepté. Vous pouvez procéder au paiement.",
        TypeNotification.RDV_ACCEPTE, lien=f"/rendez-vous/{rdv.id}",
    )
    return Response(RendezVousSerializer(rdv).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def refuser_rendezvous(request, pk):
    """POST /api/rendez-vous/<uuid>/refuser/ — coiffeur propriétaire uniquement."""
    rdv = get_object_or_404(RendezVous, pk=pk)
    if rdv.coiffeur_id != request.user.id:
        raise PermissionDenied("Ce rendez-vous ne vous appartient pas.")
    if rdv.statut != 'EN_ATTENTE':
        return Response({"error": "Ce rendez-vous n'est plus en attente."}, status=400)

    rdv.statut = 'REFUSE'
    rdv.save(update_fields=['statut', 'updated_at'])

    notifier(
        rdv.client, "Rendez-vous refusé",
        f"Votre demande de rendez-vous « {rdv.service_nom_snapshot} » le {rdv.date_heure_debut:%d/%m/%Y à %H:%M} a été refusée. Le créneau est de nouveau disponible.",
        TypeNotification.RDV_REFUSE, lien=f"/rendez-vous/{rdv.id}",
    )
    return Response(RendezVousSerializer(rdv).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def annuler_rendezvous(request, pk):
    """POST /api/rendez-vous/<uuid>/annuler/ — client OU coiffeur concerné."""
    rdv = get_object_or_404(RendezVous, pk=pk)
    _verifier_acces(request, rdv)

    if not rdv.peut_etre_annule:
        return Response({"error": "Ce rendez-vous ne peut plus être annulé."}, status=400)

    rdv.statut = 'ANNULE'
    rdv.save(update_fields=['statut', 'updated_at'])

    autre_partie = rdv.coiffeur if request.user.id == rdv.client_id else rdv.client
    notifier(
        autre_partie, "Rendez-vous annulé",
        f"Le rendez-vous « {rdv.service_nom_snapshot} » du {rdv.date_heure_debut:%d/%m/%Y à %H:%M} a été annulé par {request.user.username}.",
        TypeNotification.RDV_ANNULE, lien=f"/rendez-vous/{rdv.id}",
    )
    return Response(RendezVousSerializer(rdv).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def terminer_rendezvous(request, pk):
    """POST /api/rendez-vous/<uuid>/terminer/ — marque le RDV terminé et invite le client à laisser un avis."""
    rdv = get_object_or_404(RendezVous, pk=pk)
    if rdv.coiffeur_id != request.user.id:
        raise PermissionDenied("Ce rendez-vous ne vous appartient pas.")
    if rdv.statut != 'ACCEPTE':
        return Response({"error": "Seul un rendez-vous accepté peut être marqué terminé."}, status=400)

    rdv.statut = 'TERMINE'
    rdv.save(update_fields=['statut', 'updated_at'])

    notifier_demande_avis(rdv)
    return Response(RendezVousSerializer(rdv).data)
