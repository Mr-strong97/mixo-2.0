"""
paiement_views.py — MIXO · Module Paiements

Sécurité appliquée :
  - Montant TOUJOURS recalculé côté serveur depuis rendez_vous.service_prix_snapshot
    (jamais accepté depuis le payload client) → empêche la manipulation du prix.
  - Vérification stricte du propriétaire du rendez-vous avant tout paiement.
  - Blocage du double paiement (un seul paiement PAYE par rendez-vous).
  - Le rendez-vous doit être au statut ACCEPTE avant tout paiement.
  - Rate limiting sur l'initiation (cf. throttles.py).
  - Journalisation de toute tentative (succès ou échec) via logger.
"""
import logging
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Paiement, Facture
from ..serializers.paiement_serializers import PaiementSerializer, InitierPaiementSerializer
from ..serializers.facture_serializers import FactureSerializer
from ..providers.registry import get_provider
from ..services import generer_facture_depuis_paiement
from ..throttles import PaiementInitiationThrottle
from rendez_vous.models import RendezVous
from notifications.services.notification_service import notifier, TypeNotification

logger = logging.getLogger('mixo.paiements')


def _appliquer_paiement_valide(rdv, paiement, statut_paiement, message_client, message_coiffeur, preuve_paiement=''):
    rdv.paiement = paiement
    rdv.statut_paiement = statut_paiement
    rdv.save(update_fields=['paiement', 'statut_paiement', 'updated_at'])
    facture = generer_facture_depuis_paiement(paiement, preuve_paiement=preuve_paiement)
    notifier(
        rdv.client, "Paiement validé",
        message_client,
        TypeNotification.PAIEMENT_VALIDE, lien=f"/factures/{facture.id}",
    )
    notifier(
        rdv.coiffeur, "Paiement reçu",
        message_coiffeur,
        TypeNotification.PAIEMENT_RECU, lien=f"/factures/{facture.id}",
    )
    return facture


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([PaiementInitiationThrottle])
def initier_paiement(request, rendez_vous_id):
    """
    POST /api/paiements/initier/<uuid:rendez_vous_id>/
    Body : { "methode": "AIRTEL_MONEY", "numero_telephone": "..." (optionnel) }
    """
    rdv = get_object_or_404(RendezVous, pk=rendez_vous_id)

    # ── Vérification du propriétaire ────────────────────────────
    if rdv.client_id != request.user.id:
        logger.warning("Tentative de paiement non autorisée : user=%s rdv=%s", request.user.id, rdv.id)
        raise PermissionDenied("Vous ne pouvez payer que vos propres rendez-vous.")

    if rdv.statut != 'ACCEPTE':
        return Response({"error": "Ce rendez-vous doit être accepté avant le paiement."}, status=400)

    # ── Blocage du double paiement ──────────────────────────────
    if Paiement.objects.filter(rendez_vous=rdv, statut__in={'PAYE_EN_LIGNE', 'PAYE_SUR_PLACE'}).exists():
        return Response({"error": "Ce rendez-vous a déjà été payé."}, status=400)

    serializer = InitierPaiementSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    methode = serializer.validated_data['methode']
    numero  = serializer.validated_data.get('numero_telephone')

    provider = get_provider(methode)
    if not provider:
        return Response({"error": "Méthode de paiement non supportée."}, status=400)

    # ── Montant TOUJOURS recalculé côté serveur ─────────────────
    montants = Paiement.calculer_montants(rdv.service_prix_snapshot)

    resultat = provider.initier(montants['montant_total'], numero_telephone=numero)

    paiement = Paiement.objects.create(
        rendez_vous=rdv,
        montant_total=montants['montant_total'],
        montant_commission=montants['montant_commission'],
        montant_coiffeur=montants['montant_coiffeur'],
        statut='PAYE_EN_LIGNE' if resultat['statut'] == 'PAYE_EN_LIGNE' else resultat['statut'],
        methode=methode,
        transaction_id=resultat['transaction_id'],
    )

    if paiement.statut == 'PAYE_EN_LIGNE':
        _appliquer_paiement_valide(
            rdv,
            paiement,
            'PAYE_EN_LIGNE',
            f"Votre paiement de {montants['montant_total']} CDF pour « {rdv.service_nom_snapshot} » a été confirmé.",
            f"Le paiement de {rdv.client.username} pour « {rdv.service_nom_snapshot} » a été validé. Vous recevrez {montants['montant_coiffeur']} CDF.",
        )
        logger.info("Paiement réussi : transaction=%s rdv=%s montant=%s", paiement.transaction_id, rdv.id, montants['montant_total'])
    else:
        notifier(
            rdv.client, "Échec du paiement",
            f"Le paiement pour « {rdv.service_nom_snapshot} » a échoué. Veuillez réessayer.",
            TypeNotification.PAIEMENT_ECHOUE, lien=f"/rendez-vous/{rdv.id}",
        )
        logger.warning("Paiement échoué : transaction=%s rdv=%s", paiement.transaction_id, rdv.id)

    return Response(PaiementSerializer(paiement).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enregistrer_paiement_sur_place(request, rendez_vous_id):
    """POST /api/paiements/sur-place/<uuid:rendez_vous_id>/"""
    rdv = get_object_or_404(RendezVous, pk=rendez_vous_id)
    if rdv.statut != 'ACCEPTE':
        return Response({"error": "Ce rendez-vous doit être accepté avant de pouvoir être marqué comme payé."}, status=400)

    if rdv.est_paye:
        return Response({"error": "Ce rendez-vous est déjà payé."}, status=400)

    if request.user.id not in {rdv.client_id, rdv.coiffeur_id} and not request.user.is_staff:
        raise PermissionDenied("Vous ne pouvez pas enregistrer ce paiement.")

    montants = Paiement.calculer_montants(rdv.service_prix_snapshot)
    paiement = Paiement.objects.create(
        rendez_vous=rdv,
        montant_total=montants['montant_total'],
        montant_commission=montants['montant_commission'],
        montant_coiffeur=montants['montant_coiffeur'],
        statut='PAYE_SUR_PLACE',
        methode='SUR_PLACE',
        transaction_id=f"SURPLACE-{rdv.id.hex[:12].upper()}",
    )

    facture = _appliquer_paiement_valide(
        rdv,
        paiement,
        'PAYE_SUR_PLACE',
        f"Votre paiement sur place de {montants['montant_total']} CDF pour « {rdv.service_nom_snapshot} » a été enregistré.",
        f"Le paiement sur place de {rdv.client.username} pour « {rdv.service_nom_snapshot} » a été enregistré.",
    )

    return Response({
        "paiement": PaiementSerializer(paiement).data,
        "facture": FactureSerializer(facture).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_paiements(request):
    """GET /api/paiements/mes-paiements/ — paiements du client ou coiffeur connecté."""
    if request.user.is_staff:
        qs = Paiement.objects.all()
    elif request.user.role == 'COIFFEUR':
        qs = Paiement.objects.filter(rendez_vous__coiffeur=request.user)
    else:
        qs = Paiement.objects.filter(rendez_vous__client=request.user)
    qs = qs.select_related('rendez_vous')
    return Response(PaiementSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_paiement(request, pk):
    """GET /api/paiements/<uuid>/ — client propriétaire, coiffeur concerné, ou admin."""
    paiement = get_object_or_404(Paiement.objects.select_related('rendez_vous'), pk=pk)
    rdv = paiement.rendez_vous

    if rdv.client_id != request.user.id and rdv.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Vous n'avez pas accès à ce paiement.")

    return Response(PaiementSerializer(paiement).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def rembourser_paiement(request, pk):
    """POST /api/paiements/<uuid>/rembourser/ — admin uniquement."""
    paiement = get_object_or_404(Paiement, pk=pk)
    if paiement.statut not in {'PAYE_EN_LIGNE', 'PAYE_SUR_PLACE'}:
        return Response({"error": "Seul un paiement validé peut être remboursé."}, status=400)

    paiement.statut = 'REMBOURSE'
    paiement.save(update_fields=['statut'])
    paiement.rendez_vous.statut_paiement = 'ANNULE'
    paiement.rendez_vous.save(update_fields=['statut_paiement', 'updated_at'])
    if hasattr(paiement, 'facture'):
        facture = paiement.facture
        facture.statut = 'ANNULEE'
        facture.save(update_fields=['statut', 'updated_at'])

    notifier(
        paiement.rendez_vous.client, "Remboursement effectué",
        f"Votre paiement de {paiement.montant_total} CDF pour « {paiement.rendez_vous.service_nom_snapshot} » a été remboursé.",
        TypeNotification.SYSTEME, lien=f"/rendez-vous/{paiement.rendez_vous.id}",
    )
    logger.info("Remboursement : transaction=%s par admin=%s", paiement.transaction_id, request.user.id)

    return Response(PaiementSerializer(paiement).data)
