"""
admin_avis_views.py — MIXO · Extension Espace Admin
Modération des avis (consultation globale + signalés + suppression).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from avis.models import Avis
from avis.serializers.avis_serializers import AvisSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_avis(request):
    """
    GET /api/admin/extended/avis/
    Filtres : ?signale=true  ?coiffeur_id  ?note
    """
    qs = Avis.objects.select_related('client', 'coiffeur').all()

    signale     = request.query_params.get('signale')
    coiffeur_id = request.query_params.get('coiffeur_id')
    note        = request.query_params.get('note')

    if signale is not None:
        qs = qs.filter(signale=(signale.lower() == 'true'))
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)
    if note:
        qs = qs.filter(note=note)

    return Response(AvisSerializer(qs, many=True).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_supprimer_avis(request, pk):
    """DELETE /api/admin/extended/avis/<uuid>/ — suppression définitive d'un avis abusif."""
    avis = get_object_or_404(Avis, pk=pk)
    avis.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_lever_signalement(request, pk):
    """PATCH /api/admin/extended/avis/<uuid>/lever-signalement/ — l'admin juge l'avis légitime."""
    avis = get_object_or_404(Avis, pk=pk)
    avis.signale = False
    avis.save(update_fields=['signale'])
    return Response(AvisSerializer(avis).data)
