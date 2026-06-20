"""
admin_abonnements_views.py — MIXO · Extension Espace Admin
Supervision globale des abonnements + gestion des plans.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from abonnements.models import AbonnementPlan, AbonnementUtilisateur
from abonnements.serializers.abonnement_serializers import (
    AbonnementPlanSerializer,
    AbonnementUtilisateurSerializer,
)


class AdminAbonnementPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_abonnements(request):
    """
    GET /api/admin/abonnements/
    Liste tous les abonnements souscrits, avec filtres :
        ?actif=true|false  ?periode_essai=true|false  ?coiffeur_id
    """
    qs = AbonnementUtilisateur.objects.select_related('coiffeur', 'abonnement_plan').all()

    actif         = request.query_params.get('actif')
    periode_essai = request.query_params.get('periode_essai')
    coiffeur_id   = request.query_params.get('coiffeur_id')

    if actif is not None:
        qs = qs.filter(actif=(actif.lower() == 'true'))
    if periode_essai is not None:
        qs = qs.filter(periode_essai=(periode_essai.lower() == 'true'))
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)

    paginator = AdminAbonnementPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = AbonnementUtilisateurSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_abonnements(request):
    """
    GET /api/admin/abonnements/stats/
    Vue d'ensemble : nombre d'essais actifs, d'abonnés payants, de plans, etc.
    """
    total            = AbonnementUtilisateur.objects.count()
    essais_actifs    = AbonnementUtilisateur.objects.filter(periode_essai=True, actif=True).count()
    payants_actifs   = AbonnementUtilisateur.objects.filter(periode_essai=False, actif=True).count()
    expires          = AbonnementUtilisateur.objects.filter(actif=False).count()

    repartition_plans = []
    for plan in AbonnementPlan.objects.filter(actif=True):
        repartition_plans.append({
            'plan':   plan.plan,
            'nom':    plan.nom,
            'nb_abonnes': AbonnementUtilisateur.objects.filter(abonnement_plan=plan, actif=True).count(),
        })

    return Response({
        'total':              total,
        'essais_actifs':      essais_actifs,
        'payants_actifs':     payants_actifs,
        'expires':            expires,
        'repartition_plans':  repartition_plans,
    })


# ══════════════════════════════════════════════════════════════
#  GESTION DES PLANS (admin) — CRUD complet
# ══════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_liste_plans(request):
    """GET → tous les plans (actifs et inactifs). POST → créer un plan."""
    if request.method == 'GET':
        plans = AbonnementPlan.objects.all()
        return Response(AbonnementPlanSerializer(plans, many=True).data)

    serializer = AbonnementPlanSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_detail_plan(request, pk):
    """PATCH → modifier un plan. DELETE → désactiver (jamais de suppression dure)."""
    plan = get_object_or_404(AbonnementPlan, pk=pk)

    if request.method == 'DELETE':
        plan.actif = False
        plan.save(update_fields=['actif', 'updated_at'])
        return Response({"message": "Plan désactivé."})

    serializer = AbonnementPlanSerializer(plan, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
