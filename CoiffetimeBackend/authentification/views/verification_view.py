"""
authentification/views/verification_view.py
=============================================
FIX : Suppression de l'import incorrect 'EstAdmin' depuis
      authentification.permissions. EstAdmin est dans
      administration/permissions.py et n'a rien à faire ici.

Les endpoints de vérification sont soit publics (AllowAny)
soit authentifiés (IsAuthenticated) — jamais admin-only.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models.utilisateur import Utilisateur, StatutChoix
from ..models.token       import Token, TypeToken
from ..models.audit_log   import AuditLog, ActionChoix
from ..compte             import validerMotDePasse
from ..services.email_service import (
    envoyer_email_verification,
    envoyer_email_reset_password,
)


# ------------------------------------------------------------------ #
# VÉRIFICATION EMAIL
# ------------------------------------------------------------------ #

@api_view(['POST'])
@permission_classes([AllowAny])
def demanderVerificationEmail(request):
    """
    POST /api/auth/email/demander-verification/
    Body: { "email": "..." }
    """
    email = request.data.get('email', '').strip().lower()

    try:
        utilisateur = Utilisateur.objects.get(email=email)
    except Utilisateur.DoesNotExist:
        # Sécurité : ne révèle pas si l'email existe
        return Response(
            {"message": "Si cet email existe, un lien de vérification a été envoyé."},
            status=status.HTTP_200_OK
        )

    if utilisateur.email_verifie:
        return Response(
            {"message": "Cet email est déjà vérifié."},
            status=status.HTTP_400_BAD_REQUEST
        )

    token_brut, _ = Token.creer(
        utilisateur=utilisateur,
        type_token=TypeToken.VERIFICATION_EMAIL,
        duree_minutes=1440
    )
    envoyer_email_verification(utilisateur, token_brut)

    return Response(
        {"message": "Email de vérification envoyé. Vérifiez votre boîte mail."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def verifierEmail(request):
    """
    POST /api/auth/email/verifier/
    Body: { "token": "..." }
    """
    token_brut = request.data.get('token', '').strip()

    if not token_brut:
        return Response(
            {"detail": "Token manquant."},
            status=status.HTTP_400_BAD_REQUEST
        )

    token_obj = Token.verifier(token_brut, TypeToken.VERIFICATION_EMAIL)

    if not token_obj:
        return Response(
            {"detail": "Lien invalide ou expiré. Demandez un nouveau lien."},
            status=status.HTTP_400_BAD_REQUEST
        )

    utilisateur = token_obj.utilisateur
    utilisateur.email_verifie = True

    if utilisateur.statut == StatutChoix.EN_ATTENTE and utilisateur.role == 'CLIENT':
        utilisateur.statut = StatutChoix.ACTIF

    utilisateur.save(update_fields=['email_verifie', 'statut'])
    token_obj.consommer()

    AuditLog.enregistrer(
        request, ActionChoix.MODIF_PROFIL,
        utilisateur=utilisateur, succes=True,
        details={'action': 'email_verifie'}
    )

    return Response(
        {
            "message": "Email vérifié avec succès !",
            "email_verifie": True,
            "username": utilisateur.username,
            "role": utilisateur.role,
        },
        status=status.HTTP_200_OK
    )


# ------------------------------------------------------------------ #
# RESET MOT DE PASSE
# ------------------------------------------------------------------ #

@api_view(['POST'])
@permission_classes([AllowAny])
def demanderResetMotDePasse(request):
    """
    POST /api/auth/password/demander-reset/
    Body: { "email": "..." }
    """
    email = request.data.get('email', '').strip().lower()

    try:
        utilisateur = Utilisateur.objects.get(email=email)
    except Utilisateur.DoesNotExist:
        return Response(
            {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."},
            status=status.HTTP_200_OK
        )

    token_brut, _ = Token.creer(
        utilisateur=utilisateur,
        type_token=TypeToken.RESET_MDP,
        duree_minutes=60
    )
    envoyer_email_reset_password(utilisateur, token_brut)

    AuditLog.enregistrer(
        request, ActionChoix.MODIF_MOT_DE_PASSE,
        utilisateur=utilisateur, succes=True,
        details={'action': 'reset_demande'}
    )

    return Response(
        {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def confirmerResetMotDePasse(request):
    """
    POST /api/auth/password/confirmer-reset/
    Body: { "token": "...", "nouveau_mot_de_passe": "..." }
    """
    token_brut  = request.data.get('token', '').strip()
    nouveau_mdp = request.data.get('nouveau_mot_de_passe', '')

    if not token_brut or not nouveau_mdp:
        return Response(
            {"detail": "Token et nouveau mot de passe requis."},
            status=status.HTTP_400_BAD_REQUEST
        )

    token_obj = Token.verifier(token_brut, TypeToken.RESET_MDP)
    if not token_obj:
        return Response(
            {"detail": "Lien invalide ou expiré."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validerMotDePasse(nouveau_mdp)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    utilisateur = token_obj.utilisateur
    utilisateur.set_password(nouveau_mdp)
    utilisateur.tentatives_connexion = 0
    utilisateur.verrouille_jusqua    = None
    utilisateur.save(update_fields=['password', 'tentatives_connexion', 'verrouille_jusqua'])

    token_obj.consommer()

    AuditLog.enregistrer(
        request, ActionChoix.MODIF_MOT_DE_PASSE,
        utilisateur=utilisateur, succes=True,
        details={'action': 'reset_confirme'}
    )

    return Response(
        {"message": "Mot de passe réinitialisé. Vous pouvez vous connecter."},
        status=status.HTTP_200_OK
    )