"""
authentification/firebase_auth.py
Vérifie les ID tokens Firebase envoyés par le frontend.
"""
from firebase_admin import auth as firebase_auth

from .firebase_init import ensure_firebase_app


def verifier_token_firebase(id_token, *, check_revoked=True):
    """
    Vérifie un token Firebase. Lève une exception si invalide/expiré.
    Retourne le dict décodé : {'uid': ..., 'email': ..., ...}
    """
    ensure_firebase_app()
    return firebase_auth.verify_id_token(id_token, check_revoked=check_revoked)
