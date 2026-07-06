"""
authentification/firebase_init.py
Initialise le SDK Firebase Admin une seule fois au premier besoin.
"""
from __future__ import annotations

import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials
from django.conf import settings


def _resolve_cred_path() -> Path | None:
    configured = os.getenv("FIREBASE_ADMIN_CREDENTIALS_PATH")
    if configured:
        return Path(configured)

    default = Path(settings.BASE_DIR) / "config" / "secrets" / "firebase-adminsdk.json"
    return default if default.exists() else None


def ensure_firebase_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cred_path = _resolve_cred_path()
    if cred_path is None or not cred_path.exists():
        raise RuntimeError(
            "Firebase Admin n'est pas configuré. Définissez FIREBASE_ADMIN_CREDENTIALS_PATH "
            "ou ajoutez config/secrets/firebase-adminsdk.json."
        )

    cred = credentials.Certificate(str(cred_path))
    return firebase_admin.initialize_app(cred)
