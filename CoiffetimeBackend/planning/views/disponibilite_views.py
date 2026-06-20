"""
disponibilite_views.py — MIXO · Module Horaires
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import DisponibiliteException
from ..serializers.disponibilite_serializers import DisponibiliteExceptionSerializer
from ..permissions import IsCoiffeur


def _verifier_proprietaire(request, exception):
    if exception.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Cette exception ne vous appartient pas.")


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def mes_exceptions(request):
    """
    GET  → liste les exceptions du coiffeur connecté (?a_partir_de=YYYY-MM-DD optionnel)
    POST → ajoute une nouvelle exception (congé, maladie, jour férié…)
    """
    if request.method == 'GET':
        qs = DisponibiliteException.objects.filter(coiffeur=request.user)
        a_partir_de = request.query_params.get('a_partir_de')
        if a_partir_de:
            qs = qs.filter(date__gte=a_partir_de)
        return Response(DisponibiliteExceptionSerializer(qs, many=True).data)

    serializer = DisponibiliteExceptionSerializer(data=request.data)
    if serializer.is_valid():
        exception = serializer.save(coiffeur=request.user)
        return Response(
            DisponibiliteExceptionSerializer(exception).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def detail_exception(request, pk):
    """GET / PATCH / DELETE — propriétaire ou admin uniquement."""
    exception = get_object_or_404(DisponibiliteException, pk=pk)
    _verifier_proprietaire(request, exception)

    if request.method == 'GET':
        return Response(DisponibiliteExceptionSerializer(exception).data)

    if request.method == 'DELETE':
        exception.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = DisponibiliteExceptionSerializer(exception, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(DisponibiliteExceptionSerializer(exception).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def disponibilites_publiques(request, coiffeur_id):
    """
    GET /api/horaires/disponibilites/<uuid:coiffeur_id>/
    Exceptions à venir d'un coiffeur (lecture publique authentifiée),
    destinées à être croisées avec son planning lors d'une réservation.
    """
    from django.utils import timezone
    qs = DisponibiliteException.objects.filter(
        coiffeur_id=coiffeur_id,
        date__gte=timezone.localdate(),
    )
    return Response(DisponibiliteExceptionSerializer(qs, many=True).data)
