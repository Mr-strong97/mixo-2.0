"""
authentification/views/utilisateur_view.py
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models.utilisateur import Utilisateur
from ..serializers.utilisateur_serializer import UtilisateurSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listerTousLesUtilisateurs(request):
    """Réservé aux administrateurs uniquement."""
    if request.user.role != 'ADMIN':
        return Response(
            {"error": "Accès réservé aux administrateurs."},
            status=status.HTTP_403_FORBIDDEN
        )
    utilisateurs = Utilisateur.objects.all()
    serializer   = UtilisateurSerializer(utilisateurs, many=True)
    return Response(serializer.data)