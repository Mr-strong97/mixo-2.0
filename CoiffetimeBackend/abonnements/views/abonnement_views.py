"""
abonnement_views.py — MIXO · Module Abonnements
"""
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone

from ..models import AbonnementPlan, AbonnementUtilisateur
from ..serializers.abonnement_serializers import (
    AbonnementPlanSerializer,
    AbonnementUtilisateurSerializer,
)
from ..permissions import IsCoiffeur
from ..utils.trial_manager import (
    statut_abonnement_dict,
    verifier_et_expirer_abonnements,
    abonnement_courant,
)


def _verifier_proprietaire(request, abo):
    if abo.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Cet abonnement ne vous appartient pas.")


# ══════════════════════════════════════════════════════════════
#  PLANS — lecture publique (authentifiés), écriture admin
# ══════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_plans(request):
    """
    GET  → liste tous les plans actifs (tous rôles authentifiés)
    POST → crée un plan (admin uniquement)
    """
    if request.method == 'GET':
        plans = AbonnementPlan.objects.filter(actif=True)
        return Response(AbonnementPlanSerializer(plans, many=True).data)

    if not request.user.is_staff:
        return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)

    serializer = AbonnementPlanSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_plan(request, pk):
    """GET (tous), PATCH/DELETE (admin uniquement — DELETE désactive plutôt que supprime)."""
    plan = get_object_or_404(AbonnementPlan, pk=pk)

    if request.method == 'GET':
        return Response(AbonnementPlanSerializer(plan).data)

    if not request.user.is_staff:
        return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        # On désactive plutôt que supprimer pour préserver l'historique des souscriptions
        plan.actif = False
        plan.save(update_fields=['actif', 'updated_at'])
        return Response({"message": "Plan désactivé."}, status=status.HTTP_200_OK)

    serializer = AbonnementPlanSerializer(plan, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════════════════════
#  MON ABONNEMENT (Espace Coiffeur)
# ══════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def mon_statut_abonnement(request):
    """
    GET /api/abonnements/mon-statut/
    Statut d'abonnement du coiffeur connecté (essai/payant, jours restants…).
    Expire paresseusement les abonnements dépassés avant de répondre.
    """
    verifier_et_expirer_abonnements()
    return Response(statut_abonnement_dict(request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def mon_historique_abonnements(request):
    """GET /api/abonnements/mon-historique/ — tous les abonnements passés/actuels du coiffeur."""
    abos = AbonnementUtilisateur.objects.filter(coiffeur=request.user)
    return Response(AbonnementUtilisateurSerializer(abos, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def souscrire_plan(request, plan_id):
    """
    POST /api/abonnements/souscrire/<uuid:plan_id>/
    Souscrit le coiffeur connecté à un plan payant. Désactive l'abonnement
    courant (essai ou ancien plan) et en crée un nouveau.

    Note : l'intégration paiement réel (Stripe, etc.) n'est pas implémentée
    ici — cette vue pose les fondations pour un futur webhook de paiement
    qui appellerait la même logique après confirmation du paiement.
    """
    plan = get_object_or_404(AbonnementPlan, pk=plan_id, actif=True)

    # Désactive l'abonnement courant s'il existe
    ancien = abonnement_courant(request.user)
    if ancien:
        ancien.actif = False
        ancien.save(update_fields=['actif'])

    today = timezone.localdate()
    nouvel_abo = AbonnementUtilisateur.objects.create(
        coiffeur=request.user,
        abonnement_plan=plan,
        date_debut=today,
        date_fin=today + timedelta(days=30 * plan.duree_mois),
        actif=True,
        periode_essai=False,
    )

    return Response(
        AbonnementUtilisateurSerializer(nouvel_abo).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def annuler_abonnement(request):
    """POST /api/abonnements/annuler/ — désactive l'abonnement actif du coiffeur connecté."""
    abo = abonnement_courant(request.user)
    if not abo:
        return Response({"error": "Aucun abonnement actif."}, status=status.HTTP_404_NOT_FOUND)

    abo.actif = False
    abo.save(update_fields=['actif'])
    return Response({"message": "Abonnement annulé."})
