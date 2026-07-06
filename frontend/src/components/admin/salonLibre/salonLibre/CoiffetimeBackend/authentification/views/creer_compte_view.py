"""
authentification/views/creer_compte_view.py
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..serializers.creer_compte_serializer import CreerCompteSerializer
from ..models.audit_log import AuditLog, ActionChoix


@api_view(['POST'])
@permission_classes([AllowAny])
def creerNouveauCompte(request):
    """Inscrit un nouvel utilisateur et crée son profil Client ou Coiffeur."""
    serializer = CreerCompteSerializer(data=request.data)

    if serializer.is_valid():
        utilisateur = serializer.save()
        AuditLog.enregistrer(
            request, ActionChoix.INSCRIPTION,
            utilisateur=utilisateur, succes=True
        )
        return Response(
            {
                "message": "Compte créé avec succès.",
                "user_id": str(utilisateur.id),
                "role":    utilisateur.role,
                "avatar_choice": utilisateur.avatar_choice or '',
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
