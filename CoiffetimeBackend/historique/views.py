"""historique/views.py — MIXO · API Historique client"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .permissions import IsClientHistorique
from .serializers import HistoriqueItemSerializer
from .services import construire_historique_client, resumer_historique


class HistoriquePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClientHistorique])
def mes_activites(request):
    items = construire_historique_client(request.user, request.query_params)
    paginator = HistoriquePagination()
    page = paginator.paginate_queryset(items, request)
    serializer = HistoriqueItemSerializer(page, many=True)
    return Response({
        'count': len(items),
        'next': paginator.get_next_link(),
        'previous': paginator.get_previous_link(),
        'page': int(request.query_params.get('page', 1)),
        'resultats': serializer.data,
        'stats': resumer_historique(items),
    })
