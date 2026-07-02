"""
facture_views.py — MIXO · Factures
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from paiements.models import Facture
from paiements.serializers.facture_serializers import FactureSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_factures(request):
    """GET /api/paiements/factures/"""
    qs = Facture.objects.select_related('paiement', 'client', 'coiffeur')
    if not request.user.is_staff:
        qs = qs.filter(Q(client=request.user) | Q(coiffeur=request.user)).distinct()
    return Response(FactureSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_facture(request, pk):
    """GET /api/paiements/factures/<uuid>/"""
    facture = get_object_or_404(Facture.objects.select_related('paiement', 'client', 'coiffeur'), pk=pk)
    if not request.user.is_staff and request.user.id not in {facture.client_id, facture.coiffeur_id}:
        return Response({"detail": "Accès refusé."}, status=403)
    return Response(FactureSerializer(facture).data)
