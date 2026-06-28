"""dashboard_coiffeur/permissions.py — MIXO · Permissions du module Dashboard Coiffeur"""
from rest_framework.permissions import BasePermission


class IsCoiffeurDashboard(BasePermission):
    message = "Accès réservé aux coiffeurs."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'COIFFEUR'
        )

