"""
authentification/views/resoudre_email_view.py
Permet au frontend de retrouver l'email à partir du username,
car Firebase authentifie par email, mais notre UI utilise un username.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ..models.utilisateur import Utilisateur


@api_view(['POST'])
@permission_classes([AllowAny])
def resoudreEmail(request):
    """
    POST /api/auth/resoudre-email/
    Body: { "username": "..." }
    """
    username = request.data.get('username', '').strip()

    if not username:
        return Response({"detail": "Nom d'utilisateur requis."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        utilisateur = Utilisateur.objects.get(username=username)
    except Utilisateur.DoesNotExist:
        # Sécurité : message générique, ne confirme pas l'existence précise
        return Response({"detail": "Identifiants incorrects."}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"email": utilisateur.email})