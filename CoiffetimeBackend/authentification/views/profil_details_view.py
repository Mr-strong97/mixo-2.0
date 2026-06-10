"""
authentification/views/profil_details_view.py
================================================
CRUD complet du profil avec soft delete et audit.
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.utilisateur import Utilisateur
from ..models.audit_log   import AuditLog, ActionChoix
from ..serializers.utilisateur_serializer import UtilisateurSerializer


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detailsProfil(request, id):
    """
    GET    → Voir le profil.
    PATCH  → Modifier partiellement (username, first_name, last_name).
    DELETE → Suppression douce (RGPD) — ne supprime pas de la BDD.
    """
    user_cible = get_object_or_404(Utilisateur, id=id)

    # Seul le propriétaire ou un admin peut accéder
    if request.user.id != user_cible.id and request.user.role != 'ADMIN':
        return Response(
            {"error": "Permission refusée."},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        return Response(UtilisateurSerializer(user_cible).data)

    if request.method in ['PUT', 'PATCH']:
        partial    = (request.method == 'PATCH')
        serializer = UtilisateurSerializer(user_cible, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            AuditLog.enregistrer(
                request, ActionChoix.MODIF_PROFIL,
                utilisateur=request.user, succes=True
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        # Soft delete : le compte est marqué supprimé, pas effacé de la BDD
        user_cible.soft_delete()
        AuditLog.enregistrer(
            request, ActionChoix.SUPPRESSION_COMPTE,
            utilisateur=request.user, succes=True
        )
        return Response(
            {"message": "Compte désactivé avec succès (RGPD)."},
            status=status.HTTP_204_NO_CONTENT
        )