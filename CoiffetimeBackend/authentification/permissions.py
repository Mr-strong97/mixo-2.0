"""
authentification/permissions.py
==================================
Permissions pour l'app authentification.

FIX : Classes vides corrigées (ajout de pass / contenu).
NOTE : EstAdmin est dans administration/permissions.py — pas ici.
"""
from rest_framework.permissions import BasePermission

from .models.utilisateur import RoleChoix, StatutChoix


class EstCoiffeur(BasePermission):
    """Autorise uniquement les utilisateurs avec role='COIFFEUR'."""
    message = "Accès réservé aux coiffeurs."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == RoleChoix.COIFFEUR
        )


class EstClient(BasePermission):
    """Autorise uniquement les utilisateurs avec role='CLIENT'."""
    message = "Accès réservé aux clients."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == RoleChoix.CLIENT
        )


class EstUtilisateurActif(BasePermission):
    """Autorise uniquement les utilisateurs avec statut='ACTIF'."""
    message = "Votre compte n'est pas actif."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.statut == StatutChoix.ACTIF
        )


class EstProprietaire(BasePermission):
    """
    Autorise l'accès uniquement si l'utilisateur est
    le propriétaire de la ressource (obj.utilisateur == request.user).
    """
    message = "Vous n'êtes pas autorisé à modifier cet objet."

    def has_object_permission(self, request, view, obj):
        utilisateur = getattr(obj, 'utilisateur', obj)
        return utilisateur == request.user