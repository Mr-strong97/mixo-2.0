from rest_framework.permissions import BasePermission


def _is_admin(user):
    return getattr(user, 'is_authenticated', False) and (
        getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False)
    )


class EstParticipantConversation(BasePermission):
    message = "Vous n'êtes pas autorisé à accéder à cette conversation."

    def has_object_permission(self, request, view, obj):
        if _is_admin(request.user):
            return True
        if hasattr(obj, 'can_user_access'):
            return obj.can_user_access(request.user)
        if hasattr(obj, 'conversation'):
            return obj.conversation.can_user_access(request.user)
        return False


class EstUtilisateurChat(BasePermission):
    message = "Accès refusé."

    def has_permission(self, request, view):
        return getattr(request.user, 'is_authenticated', False)

