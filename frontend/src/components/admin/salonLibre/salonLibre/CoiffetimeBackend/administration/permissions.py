"""
administration/permissions.py
================================
Permission réservée aux administrateurs.
"""
from rest_framework.permissions import BasePermission


class EstAdmin(BasePermission):
    """Autorise uniquement les utilisateurs avec role='ADMIN'."""
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )