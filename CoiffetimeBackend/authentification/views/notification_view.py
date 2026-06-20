"""
authentification/views/notification_view.py
"""
from rest_framework import status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'titre', 'message', 'type', 'statut', 'lien', 'created_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mesNotifications(request):
    """GET /api/auth/notifications/"""
    notifs    = Notification.objects.filter(utilisateur=request.user)
    non_lues  = notifs.filter(statut='NON_LU').count()
    return Response({
        "count":     notifs.count(),
        "non_lues":  non_lues,
        "resultats": NotificationSerializer(notifs[:50], many=True).data,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marquerCommeLue(request, id):
    """PATCH /api/auth/notifications/{id}/lire/"""
    try:
        notif    = Notification.objects.get(id=id, utilisateur=request.user)
        notif.statut = 'LU'
        notif.save(update_fields=['statut'])
        return Response({"message": "Notification marquée comme lue."})
    except Notification.DoesNotExist:
        return Response({"detail": "Introuvable."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toutMarquerCommeLu(request):
    """PATCH /api/auth/notifications/tout-lire/"""
    Notification.objects.filter(utilisateur=request.user, statut='NON_LU').update(statut='LU')
    return Response({"message": "Toutes marquées comme lues."})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimerNotification(request, id):
    """DELETE /api/auth/notifications/{id}/supprimer/"""
    try:
        Notification.objects.get(id=id, utilisateur=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Notification.DoesNotExist:
        return Response({"detail": "Introuvable."}, status=status.HTTP_404_NOT_FOUND)
