"""
admin_rendezvous_views.py — MIXO · Extension Espace Admin
Supervision globale des rendez-vous.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count

from rendez_vous.models import RendezVous
from rendez_vous.serializers.rendez_vous_serializers import RendezVousSerializer


class AdminRendezVousPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_rendezvous(request):
    """
    GET /api/admin/extended/rendez-vous/
    Filtres : ?statut  ?coiffeur_id  ?client_id
    """
    qs = RendezVous.objects.select_related('client', 'coiffeur', 'service').all()

    statut      = request.query_params.get('statut')
    coiffeur_id = request.query_params.get('coiffeur_id')
    client_id   = request.query_params.get('client_id')

    if statut:
        qs = qs.filter(statut=statut)
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)
    if client_id:
        qs = qs.filter(client_id=client_id)

    paginator = AdminRendezVousPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(RendezVousSerializer(page, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_rendezvous(request):
    """GET /api/admin/extended/rendez-vous/stats/ — vue d'ensemble plateforme."""
    qs = RendezVous.objects.all()
    par_statut = {row['statut']: row['n'] for row in qs.values('statut').annotate(n=Count('id'))}

    return Response({
        'total': qs.count(),
        'en_attente': par_statut.get('EN_ATTENTE', 0),
        'acceptes':   par_statut.get('ACCEPTE', 0),
        'refuses':    par_statut.get('REFUSE', 0),
        'annules':    par_statut.get('ANNULE', 0),
        'termines':   par_statut.get('TERMINE', 0),
    })
