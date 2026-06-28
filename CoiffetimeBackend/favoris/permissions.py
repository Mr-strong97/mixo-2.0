"""favoris/permissions.py — MIXO · Permissions du module Favoris"""
from rest_framework.permissions import BasePermission


class IsClientFavoris(BasePermission):
    message = "Accès réservé aux clients."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'CLIENT'
        )


class IsOwnerFavori(BasePermission):
    message = "Ce favori ne vous appartient pas."

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_staff or obj.client_id == request.user.id)

