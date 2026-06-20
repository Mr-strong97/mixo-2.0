"""
horaire_views.py — MIXO · Module Horaires
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Horaire
from ..serializers.horaire_serializers import HoraireSerializer
from ..permissions import IsCoiffeur


def _verifier_proprietaire(request, horaire):
    if horaire.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Cet horaire ne vous appartient pas.")


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def mes_horaires(request):
    """
    GET  → liste tous les créneaux du coiffeur connecté (groupés par jour côté frontend)
    POST → ajoute un nouveau créneau
    """
    if request.method == 'GET':
        horaires = Horaire.objects.filter(coiffeur=request.user)
        return Response(HoraireSerializer(horaires, many=True).data)

    serializer = HoraireSerializer(data=request.data)
    if serializer.is_valid():
        horaire = serializer.save(coiffeur=request.user)
        return Response(HoraireSerializer(horaire).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def detail_horaire(request, pk):
    """GET / PATCH / DELETE — propriétaire ou admin uniquement (sauf GET, ouvert au propriétaire)."""
    horaire = get_object_or_404(Horaire, pk=pk)
    _verifier_proprietaire(request, horaire)

    if request.method == 'GET':
        return Response(HoraireSerializer(horaire).data)

    if request.method == 'DELETE':
        horaire.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = HoraireSerializer(horaire, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(HoraireSerializer(horaire).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCoiffeur])
def desactiver_creneau(request, pk):
    """PATCH /api/horaires/<uuid>/desactiver/ — désactive un créneau sans le supprimer."""
    horaire = get_object_or_404(Horaire, pk=pk)
    _verifier_proprietaire(request, horaire)

    horaire.actif = False
    horaire.save(update_fields=['actif', 'updated_at'])
    return Response(HoraireSerializer(horaire).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def planning_coiffeur(request, coiffeur_id):
    """
    GET /api/horaires/planning/<uuid:coiffeur_id>/
    Planning public d'un coiffeur (créneaux actifs uniquement) — utilisé
    côté client pour afficher les disponibilités sur sa page profil.
    """
    horaires = Horaire.objects.filter(coiffeur_id=coiffeur_id, actif=True)
    return Response(HoraireSerializer(horaires, many=True).data)
