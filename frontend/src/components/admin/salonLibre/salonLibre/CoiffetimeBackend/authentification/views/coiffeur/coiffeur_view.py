"""
authentification/views/coiffeur/coiffeur_view.py
===================================================
Vues dédiées aux coiffeurs.
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ...models.coiffeur import Coiffeur
from ...models.audit_log import AuditLog, ActionChoix
from ...permissions import EstCoiffeur
from ...serializers.coiffeur.coiffeur_serializer import (
    CoiffeurSerializer,
    CoiffeurUpdateSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def listeCoiffeurs(request):
    """
    Liste publique des coiffeurs vérifiés.
    Accessible sans authentification (pour la recherche).
    """
    coiffeurs = Coiffeur.objects.select_related('utilisateur').filter(
        utilisateur__role='COIFFEUR'
    )
    serializer = CoiffeurSerializer(coiffeurs, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def detailCoiffeur(request, id):
    """
    GET  → Tout le monde peut voir un profil coiffeur.
    PUT/PATCH → Seul le coiffeur propriétaire peut modifier.
    """
    coiffeur = get_object_or_404(
        Coiffeur.objects.select_related('utilisateur'),
        utilisateur__id=id,
        utilisateur__role='COIFFEUR'
    )

    if request.method == 'GET':
        serializer = CoiffeurSerializer(coiffeur)
        return Response(serializer.data)

    # Sécurité : seul le propriétaire peut modifier
    if request.user.id != coiffeur.utilisateur.id:
        return Response(
            {"error": "Modification non autorisée."},
            status=status.HTTP_403_FORBIDDEN
        )

    partial    = (request.method == 'PATCH')
    serializer = CoiffeurUpdateSerializer(coiffeur, data=request.data, partial=partial)

    if serializer.is_valid():
        serializer.save()
        AuditLog.enregistrer(
            request, ActionChoix.MODIF_PROFIL,
            utilisateur=request.user, succes=True
        )
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)