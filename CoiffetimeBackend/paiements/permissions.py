"""permissions.py — MIXO · Module Paiements"""
from rest_framework.permissions import BasePermission


class IsOwnerPaiement(BasePermission):
    """
    Seul le client propriétaire du rendez-vous (ou un admin) peut accéder
    au paiement. Empêche explicitement qu'un utilisateur paie ou consulte
    le rendez-vous d'un autre.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.rendez_vous.client_id == request.user.id
