"""
authentification/permissions.py
==================================
Permissions DRF réutilisables dans toutes les vues.
"""
from rest_framework.permissions import BasePermission


class EstProprietaire(BasePermission):
    """
    Autorise l'accès uniquement si l'utilisateur connecté
    est le propriétaire de la ressource (même UUID).
    Usage : permission_classes=[IsAuthenticated, EstProprietaire]
    """
    message = "Vous ne pouvez accéder qu'à votre propre compte."

    def has_object_permission(self, request, view, obj):
        # obj est un Utilisateur — on compare son id avec l'utilisateur connecté
        return obj.id == request.user.id


class EstCoiffeur(BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle COIFFEUR."""
    message = "Cette action est réservée aux coiffeurs."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'COIFFEUR'
        )


class EstClient(BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle CLIENT."""
    message = "Cette action est réservée aux clients."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'CLIENT'
        )


class EstAdminOuProprietaire(BasePermission):
    """
    Admin = accès total.
    Utilisateur normal = accès à son propre objet uniquement.
    """
    message = "Permission refusée."

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj.id == request.user.id