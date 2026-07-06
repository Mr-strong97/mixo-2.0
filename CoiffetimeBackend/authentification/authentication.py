"""
authentification/authentication.py
===================================
Authentification DRF basée sur Firebase.
Le frontend envoie un Firebase ID token dans le header Authorization:
    Bearer <firebase-id-token>
"""
from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .firebase_auth import verifier_token_firebase


class FirebaseAuthentication(BaseAuthentication):
    """Auth DRF qui vérifie le token Firebase puis aligne l'utilisateur local."""

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()
        if not auth_header:
            return None

        if auth_header[0].decode("utf-8").lower() != self.keyword.lower():
            return None

        if len(auth_header) != 2:
            raise AuthenticationFailed("En-tête Authorization invalide.")

        id_token = auth_header[1].decode("utf-8")
        try:
            decoded = verifier_token_firebase(id_token)
        except Exception as exc:
            raise AuthenticationFailed("Token Firebase invalide ou expiré.") from exc

        utilisateur = self._get_user_from_claims(decoded)
        if utilisateur is None:
            # On laisse les vues publiques gérer elles-mêmes la synchronisation
            # Firebase -> Django quand le compte local n'existe pas encore.
            return None

        if not utilisateur.is_active:
            raise AuthenticationFailed("Compte inactif.")

        return (utilisateur, decoded)

    def authenticate_header(self, request):
        return self.keyword

    def _get_user_from_claims(self, claims: dict[str, Any]):
        User = get_user_model()
        email = (claims.get("email") or "").strip().lower()
        uid = (claims.get("uid") or "").strip()
        email_verified = bool(claims.get("email_verified"))

        if not email or not uid:
            return None

        try:
            user = User.all_objects.get(firebase_uid=uid)
        except User.DoesNotExist:
            try:
                user = User.all_objects.get(email=email)
            except User.DoesNotExist:
                return None

        if user.firebase_uid and user.firebase_uid != uid:
            return None

        updates = []
        if not user.firebase_uid:
            user.firebase_uid = uid
            updates.append("firebase_uid")

        if user.email != email:
            user.email = email
            updates.append("email")

        if user.email_verifie != email_verified:
            user.email_verifie = email_verified
            updates.append("email_verifie")

        if updates:
            user.save(update_fields=updates)

        return user
