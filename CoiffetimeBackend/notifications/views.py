"""
notifications/views.py
========================
Tous les endpoints liés aux notifications.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification, StatutNotification
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mesNotifications(request):
    """
    GET /api/notifications/
    Retourne les 50 dernières notifications + compteur non lues.
    Filtre optionnel : ?type=DANGER&statut=NON_LU
    """
    qs = Notification.objects.filter(utilisateur=request.user)

    # Filtres optionnels
    type_f   = request.query_params.get('type', '').upper()
    statut_f = request.query_params.get('statut', '').upper()
    if type_f:   qs = qs.filter(type=type_f)
    if statut_f: qs = qs.filter(statut=statut_f)

    non_lues = Notification.objects.filter(
        utilisateur=request.user,
        statut=StatutNotification.NON_LU
    ).count()

    return Response({
        "count":     qs.count(),
        "non_lues":  non_lues,
        "resultats": NotificationSerializer(qs[:50], many=True).data,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def marquerCommeLue(request, id):
    """PATCH /api/notifications/{id}/lire/"""
    try:
        notif        = Notification.objects.get(id=id, utilisateur=request.user)
        notif.statut = StatutNotification.LU
        notif.save(update_fields=['statut'])
        return Response({"message": "Notification marquée comme lue."})
    except Notification.DoesNotExist:
        return Response(
            {"detail": "Notification introuvable."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toutMarquerCommeLu(request):
    """PATCH /api/notifications/tout-lire/"""
    Notification.objects.filter(
        utilisateur=request.user,
        statut=StatutNotification.NON_LU
    ).update(statut=StatutNotification.LU)
    return Response({"message": "Toutes les notifications marquées comme lues."})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimerNotification(request, id):
    """DELETE /api/notifications/{id}/supprimer/"""
    try:
        notif = Notification.objects.get(id=id, utilisateur=request.user)
        notif.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Notification.DoesNotExist:
        return Response(
            {"detail": "Notification introuvable."},
            status=status.HTTP_404_NOT_FOUND
        )