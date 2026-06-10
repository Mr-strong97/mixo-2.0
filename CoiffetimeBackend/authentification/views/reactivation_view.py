"""
authentification/views/reactivation_view.py
L'utilisateur suspendu peut soumettre une demande de réactivation.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.utilisateur import StatutChoix
from ..models.audit_log   import AuditLog, ActionChoix


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def demanderReactivation(request):
    """
    POST /api/auth/reactivation/demander/
    Body: { "message": "..." }
    """
    utilisateur = request.user

    if utilisateur.statut != StatutChoix.INACTIF:
        return Response(
            {"detail": "Votre compte n'est pas suspendu."},
            status=status.HTTP_400_BAD_REQUEST
        )

    message = request.data.get('message', '').strip()
    if not message or len(message) < 20:
        return Response(
            {"detail": "Veuillez écrire un message d'au moins 20 caractères."},
            status=status.HTTP_400_BAD_REQUEST
        )

    AuditLog.enregistrer(
        request, 'DEMANDE_REACTIVATION',
        utilisateur=utilisateur, succes=True,
        details={'message': message}
    )

    return Response({
        "message": "Votre demande a été envoyée. L'équipe Mixo vous répondra sous 24-48h."
    })