"""historique/permissions.py — MIXO · Permissions du module Historique"""
from rest_framework.permissions import BasePermission


class IsClientHistorique(BasePermission):
    message = "Accès réservé aux clients."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'CLIENT'
        )

