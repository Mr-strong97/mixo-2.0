"""
permissions.py — MIXO · Module Abonnements
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCoiffeur(BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle COIFFEUR."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'COIFFEUR'
        )


class IsOwnerAbonnement(BasePermission):
    """Le coiffeur ne peut voir/modifier que ses propres abonnements (ou un admin)."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.coiffeur_id == request.user.id


class IsAdminOrReadOnly(BasePermission):
    """Lecture pour tous les authentifiés, écriture réservée aux administrateurs."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_staff)
