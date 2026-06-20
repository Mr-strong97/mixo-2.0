"""
admin_portfolio_views.py — MIXO · Extension Espace Admin
Modération du portfolio (signalement, suppression).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from media_portfolio.models import PortfolioMedia
from media_portfolio.serializers.portfolio_serializers import PortfolioMediaAdminSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_medias(request):
    """
    GET /api/admin/portfolio/
    Liste tous les médias, tous coiffeurs confondus.
        ?signale=true → uniquement les médias signalés
        ?coiffeur_id
    """
    qs = PortfolioMedia.objects.select_related('coiffeur').all()

    signale     = request.query_params.get('signale')
    coiffeur_id = request.query_params.get('coiffeur_id')

    if signale is not None:
        qs = qs.filter(signale=(signale.lower() == 'true'))
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)

    return Response(
        PortfolioMediaAdminSerializer(qs, many=True, context={'request': request}).data
    )


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_signaler_media(request, pk):
    """
    PATCH /api/admin/portfolio/<uuid>/signaler/
    Body : { "motif_signalement": "..." }
    Marque un média comme signalé (contenu inapproprié) sans le supprimer.
    """
    media = get_object_or_404(PortfolioMedia, pk=pk)
    media.signale = True
    media.motif_signalement = request.data.get('motif_signalement', '')
    media.save(update_fields=['signale', 'motif_signalement'])
    return Response(PortfolioMediaAdminSerializer(media, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_supprimer_media(request, pk):
    """DELETE /api/admin/portfolio/<uuid>/ — suppression définitive par un admin."""
    media = get_object_or_404(PortfolioMedia, pk=pk)
    media.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
