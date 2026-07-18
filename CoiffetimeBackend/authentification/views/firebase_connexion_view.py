"""
authentification/views/firebase_connexion_view.py
Connexion via Firebase : le frontend envoie un ID token.
"""
from django.db import transaction
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from ..models.utilisateur import StatutChoix
from ..models.audit_log import AuditLog, ActionChoix
from ..serializers.firebase_auth_serializer import FirebaseSessionSerializer
from ..services.firebase_service import synchroniser_utilisateur_firebase


@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def connexionFirebase(request):
    """
    POST /api/auth/firebase/connexion/
    Body: { "id_token": "...", "username": "...?" }
    """
    serializer = FirebaseSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    decoded = serializer.firebase_claims

    if not decoded.get('email_verified') and not settings.DEBUG:
        return Response(
            {
                "detail": "Veuillez d'abord vérifier votre email Firebase.",
                "statut": "EMAIL_NON_VERIFIE",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if not decoded.get('email_verified') and settings.DEBUG:
        decoded = {**decoded, 'email_verified': True}

    utilisateur = synchroniser_utilisateur_firebase(
        decoded,
        username=(request.data.get('username') or '').strip() or None,
    )

    if utilisateur.est_verrouille:
        AuditLog.enregistrer(
            request, ActionChoix.CONNEXION_ECHEC,
            utilisateur=utilisateur, succes=False,
            details={'raison': 'compte_verrouille'}
        )
        return Response(
            {"detail": "Compte temporairement verrouillé. Réessayez dans 15 minutes."},
            status=status.HTTP_423_LOCKED
        )

    if utilisateur.statut == StatutChoix.EN_ATTENTE and not settings.DEBUG:
        AuditLog.enregistrer(
            request, ActionChoix.CONNEXION_ECHEC,
            utilisateur=utilisateur, succes=False,
            details={'raison': 'compte_en_attente'}
        )
        return Response(
            {
                "detail": "Votre compte est en cours de validation par notre équipe. "
                          "Vous recevrez un email dès qu'il sera activé (24-48h).",
                "statut": "EN_ATTENTE"
            },
            status=status.HTTP_403_FORBIDDEN
        )

    if utilisateur.statut == StatutChoix.EN_ATTENTE and settings.DEBUG:
        utilisateur.statut = StatutChoix.ACTIF
        utilisateur.save(update_fields=['statut'])

    if utilisateur.statut == StatutChoix.BANNI:
        return Response(
            {
                "detail": "Votre compte a été suspendu ou banni.",
                "statut": "BANNI",
                "motif_sanction": utilisateur.motif_sanction,
                "date_sanction": utilisateur.date_sanction.isoformat() if utilisateur.date_sanction else None,
                "conditions_reactivation": utilisateur.conditions_reactivation,
            },
            status=status.HTTP_403_FORBIDDEN
        )

    utilisateur.reinitialiser_tentatives()
    AuditLog.enregistrer(request, ActionChoix.CONNEXION, utilisateur=utilisateur, succes=True)

    return Response({
        "message":  "Connexion Firebase réussie.",
        "user_id":  str(utilisateur.id),
        "username": utilisateur.username,
        "role":     utilisateur.role,
        "avatar_choice": utilisateur.avatar_choice,
        "email":    utilisateur.email,
        "statut":   utilisateur.statut,
        "firebase_uid": utilisateur.firebase_uid,
    })
