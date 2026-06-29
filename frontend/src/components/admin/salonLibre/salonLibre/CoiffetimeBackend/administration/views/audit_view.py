"""
administration/views/audit_view.py
Retourne le journal de bord avec filtres date/user/action.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers

from authentification.models.audit_log import AuditLog
from ..permissions import EstAdmin


class AuditLogSerializer(serializers.ModelSerializer):
    username    = serializers.SerializerMethodField()
    user_role   = serializers.SerializerMethodField()
    action_label = serializers.SerializerMethodField()

    class Meta:
        model  = AuditLog
        # 💻 CORRECTION ICI : Remplacement de 'cree_le' par 'created_at' et 'adresse_ip' par 'ip_adresse'
        fields = ['id', 'username', 'user_role', 'action', 'action_label',
                  'succes', 'ip_adresse', 'details', 'created_at']

    def get_username(self, obj):
        return obj.utilisateur.username if obj.utilisateur else 'Anonyme'

    def get_user_role(self, obj):
        return obj.utilisateur.role if obj.utilisateur else '—'

    def get_action_label(self, obj):
        labels = {
            'CONNEXION':           'Connexion',
            'CONNEXION_ECHEC':     'Tentative échouée',
            'INSCRIPTION':         'Inscription',
            'DECONNEXION':         'Déconnexion',
            'MODIF_PROFIL':        'Modification profil',
            'MODIF_MOT_DE_PASSE':  'Changement de mot de passe',
            'SUPPRESSION_COMPTE':  'Suppression compte',
            'VERIF_EMAIL':         'Vérification email',
            'VERROUILLAGE':        'Compte verrouillé',
        }
        return labels.get(obj.action, obj.action)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeAuditLogs(request):
    """
    GET /api/admin/audit/
    Paramètres optionnels : user, action, date_debut, date_fin, page
    """
    qs = AuditLog.objects.select_related('utilisateur').order_by('-created_at')

    # Filtres
    user_q      = request.query_params.get('user', '').strip()
    action_q    = request.query_params.get('action', '').strip().upper()
    date_debut  = request.query_params.get('date_debut', '').strip()
    date_fin    = request.query_params.get('date_fin', '').strip()

    if user_q:
        qs = qs.filter(utilisateur__username__icontains=user_q)
    if action_q:
        qs = qs.filter(action=action_q)
    
    # 💻 CORRECTION ICI : Utilisation de 'created_at__date' au lieu de 'cree_le__date'
    if date_debut:
        qs = qs.filter(created_at__date__gte=date_debut)
    if date_fin:
        qs = qs.filter(created_at__date__lte=date_fin)

    # Pagination simple
    try:
        page = max(1, int(request.query_params.get('page', 1)))
    except ValueError:
        page = 1
        
    per_page = 50
    total    = qs.count()
    qs       = qs[(page-1)*per_page : page*per_page]

    return Response({
        "total":    total,
        "page":     page,
        "pages":    (total + per_page - 1) // per_page,
        "resultats": AuditLogSerializer(qs, many=True).data,
    })