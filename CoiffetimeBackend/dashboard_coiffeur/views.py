"""dashboard_coiffeur/views.py — MIXO · API Dashboard Coiffeur"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import IsCoiffeurDashboard
from .services import construire_dashboard_coiffeur, construire_stats_globales_coiffeurs


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoiffeurDashboard])
def mon_dashboard(request):
    return Response(construire_dashboard_coiffeur(request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoiffeurDashboard])
def stats_coiffeurs(request):
    return Response({'resultats': construire_stats_globales_coiffeurs()})

