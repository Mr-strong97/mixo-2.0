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

from ..models import Paiement
from ..serializers.paiement_serializers import PaiementSerializer, InitierPaiementSerializer
from ..providers.registry import get_provider
from ..throttles import PaiementInitiationThrottle
from rendez_vous.models import RendezVous
from notifications.services.notification_service import notifier, TypeNotification

logger = logging.getLogger('mixo.paiements')


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
    if Paiement.objects.filter(rendez_vous=rdv, statut='PAYE').exists():
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
        statut=resultat['statut'],
        methode=methode,
        transaction_id=resultat['transaction_id'],
    )

    if resultat['statut'] == 'PAYE':
        # Lie le paiement au rendez-vous et notifie les deux parties
        rdv.paiement = paiement
        rdv.save(update_fields=['paiement', 'updated_at'])

        notifier(
            rdv.client, "Paiement validé",
            f"Votre paiement de {montants['montant_total']}€ pour « {rdv.service_nom_snapshot} » a été confirmé.",
            TypeNotification.PAIEMENT_VALIDE, lien=f"/rendez-vous/{rdv.id}",
        )
        notifier(
            rdv.coiffeur, "Paiement reçu",
            f"Le paiement de {rdv.client.username} pour « {rdv.service_nom_snapshot} » a été validé. Vous recevrez {montants['montant_coiffeur']}€.",
            TypeNotification.PAIEMENT_RECU, lien=f"/coiffeur/rendez-vous/{rdv.id}",
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_paiements(request):
    """GET /api/paiements/mes-paiements/ — paiements du client connecté."""
    qs = Paiement.objects.filter(rendez_vous__client=request.user).select_related('rendez_vous')
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
    if paiement.statut != 'PAYE':
        return Response({"error": "Seul un paiement validé peut être remboursé."}, status=400)

    paiement.statut = 'REMBOURSE'
    paiement.save(update_fields=['statut'])

    notifier(
        paiement.rendez_vous.client, "Remboursement effectué",
        f"Votre paiement de {paiement.montant_total}€ pour « {paiement.rendez_vous.service_nom_snapshot} » a été remboursé.",
        TypeNotification.SYSTEME, lien=f"/rendez-vous/{paiement.rendez_vous.id}",
    )
    logger.info("Remboursement : transaction=%s par admin=%s", paiement.transaction_id, request.user.id)

    return Response(PaiementSerializer(paiement).data)
