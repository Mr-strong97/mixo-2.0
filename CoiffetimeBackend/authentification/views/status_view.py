"""
authentification/views/status_view.py
Vérifie le statut utilisateur + notifications non lues (depuis app notifications).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification, StatutNotification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monStatut(request):
    """GET /api/auth/moi/statut/"""
    user     = request.user
    non_lues = Notification.objects.filter(
        utilisateur=user,
        statut=StatutNotification.NON_LU
    ).count()

    return Response({
        "id":            str(user.id),
        "username":      user.username,
        "role":          user.role,
        "statut":        user.statut,
        "email_verifie": user.email_verifie,
        "non_lues":      non_lues,
    })