"""permissions.py — MIXO · Module Rendez-vous"""
from rest_framework.permissions import BasePermission


class IsClient(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'CLIENT'
        )


class IsCoiffeur(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'COIFFEUR'
        )


class IsOwnerRendezVous(BasePermission):
    """Le client OU le coiffeur concerné par le RDV peuvent y accéder (ou un admin)."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.client_id == request.user.id or obj.coiffeur_id == request.user.id
