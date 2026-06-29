"""
security_view.py — MIXO
Sécurité admin : aperçu des connexions et révocation des sessions.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from authentification.models.audit_log import AuditLog
from ..permissions import EstAdmin
from ..services import lister_sessions_utilisateur, revoquer_sessions_utilisateur


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def admin_security_overview(request):
    user = request.user
    recent_logs = AuditLog.objects.filter(utilisateur=user).order_by('-created_at')[:10]

    return Response({
        'profil': {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'telephone': getattr(user, 'telephone', ''),
            'photo': (
                request.build_absolute_uri(user.photo.url)
                if getattr(user, 'photo', None) and getattr(user.photo, 'url', None)
                else None
            ),
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        },
        'sessions_actives': lister_sessions_utilisateur(user),
        'connexions_recentes': [
            {
                'id': str(log.id),
                'action': log.action,
                'succes': log.succes,
                'ip_adresse': log.ip_adresse,
                'created_at': log.created_at,
            }
            for log in recent_logs
        ],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, EstAdmin])
def admin_revoquer_sessions(request):
    current_jti = None
    if request.auth is not None:
        current_jti = getattr(request.auth, 'payload', {}).get('jti') if hasattr(request.auth, 'payload') else None
    scope = request.data.get('scope', 'others')
    if scope not in ('others', 'all'):
        return Response({'detail': 'Scope invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    revoked = revoquer_sessions_utilisateur(
        request.user,
        current_jti=None if scope == 'all' else current_jti,
    )
    return Response({
        'message': 'Sessions révoquées.',
        'revoked': revoked,
        'scope': scope,
    })
