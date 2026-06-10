"""
authentification/views/client/client_view.py
===============================================
Vues dédiées aux clients.
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ...models.client    import Client
from ...models.audit_log import AuditLog, ActionChoix
from ...serializers.client.client_serializer import (
    ClientSerializer,
    ClientUpdateSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listeClients(request):
    """
    Liste des clients — réservée aux admins.
    Un client ne peut pas voir la liste des autres clients.
    """
    if request.user.role != 'ADMIN':
        return Response(
            {"error": "Accès réservé aux administrateurs."},
            status=status.HTTP_403_FORBIDDEN
        )
    clients    = Client.objects.select_related('utilisateur').all()
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def espaceClient(request, id):
    """
    GET      → Le client voit son propre profil.
    PUT/PATCH → Le client modifie son propre profil.
    """
    client = get_object_or_404(
        Client.objects.select_related('utilisateur'),
        utilisateur__id=id,
        utilisateur__role='CLIENT'
    )

    # Sécurité : un client ne peut accéder qu'à son propre espace
    if request.user.id != client.utilisateur.id and request.user.role != 'ADMIN':
        return Response(
            {"error": "Accès non autorisé à cet espace client."},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        serializer = ClientSerializer(client)
        return Response(serializer.data)

    partial    = (request.method == 'PATCH')
    serializer = ClientUpdateSerializer(client, data=request.data, partial=partial)

    if serializer.is_valid():
        serializer.save()
        AuditLog.enregistrer(
            request, ActionChoix.MODIF_PROFIL,
            utilisateur=request.user, succes=True
        )
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)