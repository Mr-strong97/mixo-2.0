"""
authentification/views/status_view.py
=======================================
Endpoint léger pour vérifier le statut de l'utilisateur connecté.
Appelé à chaque chargement de page côté frontend.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification, StatutNotification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monStatut(request):
    """
    GET /api/auth/moi/statut/
    Retourne le statut et le nombre de notifications non lues.
    """
    user     = request.user
    non_lues = Notification.objects.filter(
        utilisateur=user,
        statut=StatutNotification.NON_LU,
    ).count()

    return Response({
        "id":          str(user.id),
        "username":    user.username,
        "role":        user.role,
        "statut":      user.statut,
        "email_verifie": user.email_verifie,
        "non_lues":    non_lues,
    })
