from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

# Imports des modèles
from ..models.rendezvous import RendezVous
from notifications.models import Notification

# Imports des serializers
from ..serializers.rendezvous_serializers import RendezVousSerializer, NotificationSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_rendezvous(request):
    if request.method == 'GET':
        # Un client voit ses RDV, un coiffeur voit les siens
        if request.user.role == 'COIFFEUR':
            rdv = RendezVous.objects.filter(coiffeur=request.user)
        else:
            rdv = RendezVous.objects.filter(client=request.user)
        serializer = RendezVousSerializer(rdv, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = RendezVousSerializer(data=request.data)
        if serializer.is_valid():
            # Sécurité : On force le client à être l'utilisateur connecté
            serializer.save(client=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_rendezvous(request, pk):
    rdv = get_object_or_404(RendezVous, pk=pk)

    # Sécurité : Seuls les participants du RDV peuvent y accéder
    if rdv.client != request.user and rdv.coiffeur != request.user:
        return Response({"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(RendezVousSerializer(rdv).data)

    if request.method == 'DELETE':
        rdv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = RendezVousSerializer(rdv, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- VUES POUR LES NOTIFICATIONS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_notifications(request):
    """Récupère les notifications de l'utilisateur connecté."""
    notifications = Notification.objects.filter(utilisateur=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_notification(request, pk):
    """Marquer comme lu ou supprimer une notification spécifique."""
    notification = get_object_or_404(Notification, pk=pk, utilisateur=request.user)

    if request.method == 'PATCH':
        # On change le statut en 'LU'
        notification.statut = 'LU'
        notification.save()
        return Response(NotificationSerializer(notification).data)

    if request.method == 'DELETE':
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
