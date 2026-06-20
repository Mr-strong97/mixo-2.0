"""permissions.py — MIXO · Module Portfolio"""
from rest_framework.permissions import BasePermission


class IsCoiffeur(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'COIFFEUR'
        )


class IsOwnerMedia(BasePermission):
    """Le coiffeur ne peut gérer que ses propres médias (ou un admin)."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.coiffeur_id == request.user.id
