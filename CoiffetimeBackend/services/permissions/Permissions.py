"""
Permissions.py — MIXO · Module Services
Permissions personnalisées pour l'API Django REST Framework.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCoiffeur(BasePermission):
    message = "Seuls les coiffeurs sont autorisés à effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'COIFFEUR'
        )


class IsClient(BasePermission):
    message = "Seuls les clients sont autorisés à effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'CLIENT'
        )


class IsOwnerService(BasePermission):
    message = "Vous n'êtes pas le propriétaire de ce service."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        coiffeur = getattr(obj, 'coiffeur', None)
        return coiffeur == request.user or bool(request.user.is_staff)


class IsClientReadOnly(BasePermission):
    message = "Les clients ne peuvent que consulter les services."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        role = getattr(request.user, 'role', None)
        if role in ('ADMIN', 'COIFFEUR') or request.user.is_staff:
            return True

        if role == 'CLIENT':
            return request.method in SAFE_METHODS

        return False


class IsAdminServiceManager(BasePermission):
    message = "Accès complet réservé aux administrateurs."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.method in SAFE_METHODS:
            return True

        return bool(request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_staff)


class IsOwnerOrReadOnly(BasePermission):
    message = "Vous n'êtes pas l'auteur de cette ressource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, 'coiffeur', None) or getattr(obj, 'client', None)
        return owner == request.user or bool(request.user.is_staff)
