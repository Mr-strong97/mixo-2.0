"""
admin_paiements_views.py — MIXO · Extension Espace Admin
Supervision globale des paiements, commissions, et échecs.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404

from paiements.models import Paiement
from paiements.serializers.paiement_serializers import PaiementSerializer


class AdminPaiementPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_paiements(request):
    """
    GET /api/admin/extended/paiements/
    Filtres : ?statut  ?methode
    """
    qs = Paiement.objects.select_related('rendez_vous').all()

    statut  = request.query_params.get('statut')
    methode = request.query_params.get('methode')

    if statut:
        qs = qs.filter(statut=statut)
    if methode:
        qs = qs.filter(methode=methode)

    paginator = AdminPaiementPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(PaiementSerializer(page, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_detail_paiement(request, pk):
    """GET /api/admin/extended/paiements/<uuid>/"""
    paiement = get_object_or_404(Paiement.objects.select_related('rendez_vous'), pk=pk)
    return Response(PaiementSerializer(paiement).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_paiements(request):
    """
    GET /api/admin/extended/paiements/stats/
    Total des commissions perçues, paiements échoués, répartition par méthode.
    """
    payes = Paiement.objects.filter(statut='PAYE')

    totaux = payes.aggregate(
        total_paye=Sum('montant_total'),
        total_commission=Sum('montant_commission'),
        total_coiffeurs=Sum('montant_coiffeur'),
    )

    par_methode = list(
        payes.values('methode').annotate(nb=Count('id'), total=Sum('montant_total'))
    )

    return Response({
        'total_transactions_payees': payes.count(),
        'total_paye':       totaux['total_paye'] or 0,
        'total_commission': totaux['total_commission'] or 0,
        'total_coiffeurs':  totaux['total_coiffeurs'] or 0,
        'echoues':          Paiement.objects.filter(statut='ECHOUE').count(),
        'rembourses':       Paiement.objects.filter(statut='REMBOURSE').count(),
        'par_methode':      par_methode,
    })
