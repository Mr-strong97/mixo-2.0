"""favoris/views.py — MIXO · API Favoris"""
from django.shortcuts import get_object_or_404
from django.db.utils import OperationalError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from services.models import Service

from .models import Favori
from .permissions import IsClientFavoris, IsOwnerFavori
from .serializers import FavoriSerializer, FavoriToggleSerializer
from .services import ajouter_favori, basculer_favori, compter_favoris_client, lister_favoris_client, retirer_favori


def _service_appartient_au_client(service: Service, user):
    if user.is_staff:
        return True
    return service.est_actif or service.coiffeur_id == user.id


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsClientFavoris])
def mes_favoris(request):
    if request.method == 'GET':
        qs = lister_favoris_client(request.user)
        return Response({
            'count': qs.count(),
            'resultats': FavoriSerializer(qs, many=True, context={'request': request}).data,
        })

    serializer = FavoriToggleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = get_object_or_404(Service.objects.select_related('coiffeur', 'categorie'), pk=serializer.validated_data['service_id'])
    if not _service_appartient_au_client(service, request.user):
        raise PermissionDenied("Service indisponible.")
    favori, created = ajouter_favori(request.user, service)
    return Response({
        'ajoute': created,
        'favori': FavoriSerializer(favori, context={'request': request}).data,
        'count': compter_favoris_client(request.user),
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClientFavoris])
def toggle_favori(request):
    serializer = FavoriToggleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = get_object_or_404(Service.objects.select_related('coiffeur', 'categorie'), pk=serializer.validated_data['service_id'])
    if not _service_appartient_au_client(service, request.user):
        raise PermissionDenied("Service indisponible.")
    resultat = basculer_favori(request.user, service)
    return Response({
        'ajoute': resultat['ajoute'],
        'favori': FavoriSerializer(resultat['favori'], context={'request': request}).data if resultat['favori'] else None,
        'count': compter_favoris_client(request.user),
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsClientFavoris])
def supprimer_favori(request, pk):
    favori = get_object_or_404(Favori.objects.select_related('service'), pk=pk)
    if favori.client_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Ce favori ne vous appartient pas.")
    favori.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClientFavoris])
def compter_mes_favoris(request):
    try:
        count = compter_favoris_client(request.user)
    except OperationalError:
        count = 0
    return Response({'count': count})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClientFavoris])
def est_favori(request, service_id):
    service = get_object_or_404(Service, pk=service_id)
    favori = Favori.objects.filter(client=request.user, service=service).exists()
    return Response({'service_id': str(service.id), 'est_favori': favori})
