"""
authentification/services/firebase_service.py
=============================================
Synchronise les comptes Django avec Firebase.
"""
from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model

from authentification.models.client import Client
from authentification.models.coiffeur import Coiffeur
from authentification.models.utilisateur import RoleChoix, StatutChoix


def synchroniser_utilisateur_firebase(
    claims: dict[str, Any],
    username: str | None = None,
    role: str | None = None,
    avatar_choice: str | None = None,
):
    """
    Crée ou met à jour le compte local à partir d'un token Firebase validé.
    Retourne l'utilisateur synchronisé.
    """
    User = get_user_model()
    email = (claims.get("email") or "").strip().lower()
    uid = (claims.get("uid") or "").strip()
    email_verified = bool(claims.get("email_verified"))

    if not email or not uid:
        raise ValueError("Token Firebase incomplet.")

    explicit_username = (username or "").strip()
    default_username = (claims.get("name") or email.split("@")[0]).strip()
    username_for_creation = (explicit_username or default_username)[:150] or email.split("@")[0]
    role = (role or RoleChoix.CLIENT).upper()
    if role not in {RoleChoix.CLIENT, RoleChoix.COIFFEUR}:
        raise ValueError("Rôle invalide.")
    avatar_choice = (avatar_choice or "").strip()

    user = User.all_objects.filter(firebase_uid=uid).first() or User.all_objects.filter(email=email).first()

    if user is None:
        statut_initial = StatutChoix.ACTIF if role == RoleChoix.CLIENT else StatutChoix.EN_ATTENTE
        user = User(
            username=username_for_creation,
            email=email,
            role=role,
            statut=statut_initial,
            firebase_uid=uid,
            email_verifie=email_verified,
            avatar_choice=avatar_choice,
        )
        user.set_unusable_password()
        user.save()
    else:
        updates = []
        if user.firebase_uid != uid:
            user.firebase_uid = uid
            updates.append("firebase_uid")
        if user.email != email:
            user.email = email
            updates.append("email")
        if explicit_username and user.username != explicit_username:
            user.username = explicit_username[:150]
            updates.append("username")
        if user.email_verifie != email_verified:
            user.email_verifie = email_verified
            updates.append("email_verifie")
        if avatar_choice and user.avatar_choice != avatar_choice:
            user.avatar_choice = avatar_choice
            updates.append("avatar_choice")
        if updates:
            user.save(update_fields=updates)

    profil_role = user.role
    if profil_role == RoleChoix.COIFFEUR:
        Coiffeur.objects.get_or_create(utilisateur=user)
    else:
        Client.objects.get_or_create(utilisateur=user)

    return user
