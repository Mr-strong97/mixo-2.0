"""admin_supervision_views.py — MIXO · Supervision admin des nouveaux modules"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from favoris.models import Favori
from favoris.serializers import FavoriSerializer
from historique.services import construire_historique_client
from dashboard_coiffeur.services import construire_stats_globales_coiffeurs


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_favoris(request):
    qs = Favori.objects.select_related('client', 'service', 'service__coiffeur', 'service__categorie').all()
    client_id = request.query_params.get('client_id')
    service_id = request.query_params.get('service_id')
    coiffeur_id = request.query_params.get('coiffeur_id')

    if client_id:
        qs = qs.filter(client_id=client_id)
    if service_id:
        qs = qs.filter(service_id=service_id)
    if coiffeur_id:
        qs = qs.filter(service__coiffeur_id=coiffeur_id)

    return Response({
        'count': qs.count(),
        'resultats': FavoriSerializer(qs[:100], many=True, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_historique_global(request):
    """
    GET /api/admin/extended/historique/
    Retourne un flux unifié sur un client donné ou, sans filtre, un aperçu
    des derniers événements clients.
    """
    client_id = request.query_params.get('client_id')
    if client_id:
        from authentification.models.utilisateur import Utilisateur
        client = Utilisateur.objects.filter(pk=client_id, role='CLIENT').first()
        if client:
            items = construire_historique_client(client, request.query_params)
            return Response({'count': len(items), 'resultats': items[:100]})
        return Response({'count': 0, 'resultats': []})
    return Response({'message': 'Veuillez préciser client_id pour une supervision ciblée.'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_coiffeurs(request):
    return Response({'resultats': construire_stats_globales_coiffeurs()})

