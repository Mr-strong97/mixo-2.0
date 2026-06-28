"""
avis_views.py — MIXO · Module Avis

Contrainte métier centrale : un client ne peut laisser un avis QUE s'il
est le client du rendez-vous, que ce rendez-vous est TERMINE, et qu'aucun
avis n'existe déjà pour ce rendez-vous (garanti aussi par le OneToOne en
base, mais vérifié ici pour renvoyer un message clair plutôt qu'une 500).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Avis
from ..serializers.avis_serializers import AvisCreateSerializer, AvisSerializer, RepondreAvisSerializer
from ..permissions import IsClient, IsCoiffeur
from ..utils.stats import calculer_stats_avis
from rendez_vous.models import RendezVous
from authentification.models.utilisateur import Utilisateur
from notifications.services.notification_service import notifier, TypeNotification


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def creer_avis(request):
    """POST /api/avis/creer/ — Body: { rendez_vous, note, commentaire }"""
    serializer = AvisCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    rdv = serializer.validated_data['rendez_vous']

    if rdv.client_id != request.user.id:
        raise PermissionDenied("Vous ne pouvez laisser un avis que sur vos propres rendez-vous.")
    if rdv.statut != 'TERMINE':
        return Response({"error": "Seul un rendez-vous terminé peut recevoir un avis."}, status=400)
    if Avis.objects.filter(rendez_vous=rdv).exists():
        return Response({"error": "Un avis a déjà été laissé pour ce rendez-vous."}, status=400)

    avis = Avis.objects.create(
        client=request.user,
        rendez_vous=rdv,
        coiffeur=rdv.coiffeur,
        note=serializer.validated_data['note'],
        commentaire=serializer.validated_data.get('commentaire', ''),
    )

    notifier(
        rdv.coiffeur, "Nouvel avis reçu",
        f"{request.user.username} vous a laissé une note de {avis.note}/5.",
        TypeNotification.NOUVEL_AVIS, lien=f"/coiffeur/avis/{avis.id}",
    )

    return Response(AvisSerializer(avis).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def mes_avis(request):
    """GET /api/avis/mes-avis/ — avis laissés par le client connecté."""
    qs = Avis.objects.filter(client=request.user).select_related('rendez_vous')
    return Response(AvisSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def avis_coiffeur(request, coiffeur_id):
    """
    GET /api/avis/coiffeur/<uuid:coiffeur_id>/
    Liste publique des avis d'un coiffeur + statistiques (note moyenne, répartition).
    """
    coiffeur = get_object_or_404(Utilisateur, pk=coiffeur_id, role='COIFFEUR')
    qs = Avis.objects.filter(coiffeur=coiffeur, signale=False).select_related('client')
    return Response({
        'stats': calculer_stats_avis(coiffeur),
        'avis': AvisSerializer(qs, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def mes_avis_recus(request):
    """GET /api/avis/mes-avis-recus/ — avis du coiffeur connecté + stats."""
    qs = Avis.objects.filter(coiffeur=request.user).select_related('client')
    return Response({
        'stats': calculer_stats_avis(request.user),
        'avis': AvisSerializer(qs, many=True).data,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def repondre_avis(request, pk):
    """PATCH /api/avis/<uuid>/repondre/ — coiffeur concerné uniquement."""
    avis = get_object_or_404(Avis, pk=pk)
    if avis.coiffeur_id != request.user.id:
        raise PermissionDenied("Cet avis ne vous concerne pas.")

    serializer = RepondreAvisSerializer(avis, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        notifier(
            avis.client, "Réponse à votre avis",
            f"{request.user.username} a répondu à votre avis.",
            TypeNotification.AVIS_REPONSE_COIFFEUR, lien=f"/avis/{avis.id}",
        )
        return Response(AvisSerializer(avis).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def signaler_avis(request, pk):
    """PATCH /api/avis/<uuid>/signaler/ — le coiffeur concerné peut signaler un avis abusif pour modération admin."""
    avis = get_object_or_404(Avis, pk=pk)
    if avis.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Vous ne pouvez signaler que les avis qui vous concernent.")

    avis.signale = True
    avis.save(update_fields=['signale'])
    return Response(AvisSerializer(avis).data)
