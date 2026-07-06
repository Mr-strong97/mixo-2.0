"""
authentification/views/connexion_view.py
==========================================
CHANGEMENTS :
  - Bloque la connexion si le compte est EN_ATTENTE (coiffeurs non validés).
  - Message d'erreur explicite avec statut 403.
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError

from ..models.utilisateur import Utilisateur, StatutChoix
from ..models.audit_log   import AuditLog, ActionChoix


class ConnexionSerializer(TokenObtainPairSerializer):
    """Ajoute username, role et user_id dans la réponse JWT."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role']     = user.role
        token['avatar_choice'] = user.avatar_choice or ''
        return token


class ConnexionPersonnaliseeView(TokenObtainPairView):
    serializer_class = ConnexionSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')

        try:
            utilisateur = Utilisateur.objects.get(username=username)
        except Utilisateur.DoesNotExist:
            AuditLog.enregistrer(
                request, ActionChoix.CONNEXION_ECHEC,
                succes=False, details={'raison': 'utilisateur_inconnu'}
            )
            return Response(
                {"detail": "Identifiants incorrects."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Compte verrouillé (trop de tentatives)
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

        # Coiffeur EN_ATTENTE → bloqué jusqu'à validation admin
        if utilisateur.statut == StatutChoix.EN_ATTENTE:
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

        # Compte banni
        if utilisateur.statut == StatutChoix.BANNI:
            return Response(
                {"detail": "Votre compte a été suspendu. Contactez le support."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            response = super().post(request, *args, **kwargs)
            utilisateur.reinitialiser_tentatives()
            AuditLog.enregistrer(
                request, ActionChoix.CONNEXION,
                utilisateur=utilisateur, succes=True
            )
            response.data['user_id']  = str(utilisateur.id)
            response.data['username'] = utilisateur.username
            response.data['role']     = utilisateur.role
            response.data['avatar_choice'] = utilisateur.avatar_choice or ''
            return response

        except TokenError:
            utilisateur.incrementer_tentatives()
            AuditLog.enregistrer(
                request, ActionChoix.CONNEXION_ECHEC,
                utilisateur=utilisateur, succes=False,
                details={'tentatives': utilisateur.tentatives_connexion}
            )
            return Response(
                {"detail": "Identifiants incorrects."},
                status=status.HTTP_401_UNAUTHORIZED
            )
