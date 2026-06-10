"""
Permissions.py — MIXO · Module Services
Permissions personnalisées pour l'API Django REST Framework.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCoiffeur(BasePermission):
    """Autorise uniquement les utilisateurs authentifiés avec le rôle COIFFEUR."""

    message = "Seuls les coiffeurs sont autorisés à effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'COIFFEUR'
        )


class IsClient(BasePermission):
    """Autorise uniquement les utilisateurs authentifiés avec le rôle CLIENT."""

    message = "Seuls les clients sont autorisés à effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'CLIENT'
        )


class IsOwnerService(BasePermission):
    """
    Autorise la lecture à tous les utilisateurs authentifiés.
    Réserve la modification et la suppression au coiffeur propriétaire du service.
    """

    message = "Vous n'êtes pas le propriétaire de ce service."

    def has_permission(self, request, view):
        # Tout utilisateur authentifié peut accéder
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Lecture libre pour tous les rôles
        if request.method in SAFE_METHODS:
            return True

        # Écriture : propriétaire du service OU administrateur
        coiffeur = getattr(obj, 'coiffeur', None)
        return coiffeur == request.user or bool(request.user.is_staff)


class IsClientReadOnly(BasePermission):
    """
    Lecture seule pour les clients.
    Bloque toute tentative de création, modification ou suppression.
    """

    message = "Les clients ne peuvent que consulter les services."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        role = getattr(request.user, 'role', None)

        # Admin et coiffeurs ont accès complet (géré par d'autres permissions)
        if role in ('ADMIN', 'COIFFEUR') or request.user.is_staff:
            return True

        # Clients : lecture seule uniquement
        if role == 'CLIENT':
            return request.method in SAFE_METHODS

        return False


class IsAdminServiceManager(BasePermission):
    """
    Accès complet en lecture et écriture réservé aux administrateurs (is_staff).
    Lecture libre pour les autres utilisateurs authentifiés.
    """

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
    """
    Générique : lecture publique, écriture réservée au propriétaire.
    Supporte les objets avec un champ 'coiffeur' ou 'client'.
    """

    message = "Vous n'êtes pas l'auteur de cette ressource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, 'coiffeur', None) or getattr(obj, 'client', None)
        return owner == request.user or bool(request.user.is_staff)