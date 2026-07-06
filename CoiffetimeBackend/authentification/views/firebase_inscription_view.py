"""
authentification/views/firebase_inscription_view.py
Création/synchronisation du compte Django après inscription Firebase.
"""
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ..models.utilisateur import Utilisateur, RoleChoix, StatutChoix
from ..models.audit_log import AuditLog, ActionChoix
from ..serializers.firebase_auth_serializer import FirebaseInscriptionSerializer
from ..services.firebase_service import synchroniser_utilisateur_firebase


@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def inscriptionFirebase(request):
    """
    POST /api/auth/firebase/inscription/
    Body: { "id_token": "...", "username": "...", "role": "CLIENT"|"COIFFEUR" }
    """
    serializer = FirebaseInscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    decoded = serializer.firebase_claims
    username = serializer.validated_data['username']
    role = serializer.validated_data.get('role', RoleChoix.CLIENT)
    avatar_choice = serializer.validated_data.get('avatar_choice', '')

    if Utilisateur.all_objects.filter(email=(decoded.get('email') or '').strip().lower()).exists() and not Utilisateur.all_objects.filter(firebase_uid=decoded.get('uid')).exists():
        return Response({"detail": "Cet email est déjà utilisé."}, status=status.HTTP_400_BAD_REQUEST)

    if Utilisateur.all_objects.filter(username=username).exclude(firebase_uid=decoded.get('uid')).exists():
        return Response({"detail": "Ce nom d'utilisateur est déjà pris."}, status=status.HTTP_400_BAD_REQUEST)

    utilisateur = synchroniser_utilisateur_firebase(
        decoded,
        username=username,
        role=role,
        avatar_choice=avatar_choice,
    )

    AuditLog.enregistrer(request, ActionChoix.INSCRIPTION, utilisateur=utilisateur, succes=True)

    return Response(
        {
            "message": "Compte créé avec succès.",
            "user_id": str(utilisateur.id),
            "username": utilisateur.username,
            "role": utilisateur.role,
            "avatar_choice": utilisateur.avatar_choice,
            "statut": utilisateur.statut,
            "email": utilisateur.email,
        },
        status=status.HTTP_201_CREATED
    )
