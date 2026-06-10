"""
administration/views/stats_view.py
====================================
Statistiques détaillées des utilisateurs pour les graphiques admin.
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from authentification.models.utilisateur import Utilisateur, RoleChoix, StatutChoix
from ..permissions import EstAdmin
from ..serializers.admin_serializer import UtilisateurAdminSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def statistiquesUtilisateurs(request):
    """
    GET /api/admin/stats/utilisateurs/
    Retourne toutes les métriques nécessaires aux graphiques.
    """
    now           = timezone.now()
    il_y_a_7j     = now - timedelta(days=7)
    il_y_a_30j    = now - timedelta(days=30)
    il_y_a_180j   = now - timedelta(days=180)

    # ---- Compteurs globaux ----
    total         = Utilisateur.objects.count()
    actifs        = Utilisateur.objects.filter(statut=StatutChoix.ACTIF).count()
    en_attente    = Utilisateur.objects.filter(statut=StatutChoix.EN_ATTENTE).count()
    bannis        = Utilisateur.objects.filter(statut=StatutChoix.BANNI).count()
    suspendus     = Utilisateur.objects.filter(statut=StatutChoix.INACTIF).count()
    clients       = Utilisateur.objects.filter(role=RoleChoix.CLIENT).count()
    coiffeurs     = Utilisateur.objects.filter(role=RoleChoix.COIFFEUR).count()

    # ---- Activité récente ----
    actifs_7j     = Utilisateur.objects.filter(last_login__gte=il_y_a_7j).count()
    actifs_30j    = Utilisateur.objects.filter(last_login__gte=il_y_a_30j).count()
    # Utilisateurs jamais connectés ou inactifs depuis 30j
    inactifs_30j  = Utilisateur.objects.filter(
        last_login__lt=il_y_a_30j
    ).count()

    # ---- Top 5 les plus actifs récemment ----
    top_actifs = Utilisateur.objects.filter(
        last_login__isnull=False
    ).order_by('-last_login')[:5]

    # ---- Top 5 les plus récemment inscrits ----
    nouveaux = Utilisateur.objects.order_by('-date_joined')[:5]

    # ---- Utilisateurs rarement actifs (connectés il y a > 30j) ----
    rarement_actifs = Utilisateur.objects.filter(
        last_login__lt=il_y_a_30j,
        statut=StatutChoix.ACTIF
    ).order_by('last_login')[:5]

    # ---- Croissance mensuelle sur 6 mois (pour graphiques) ----
    def inscriptions_par_mois(role=None):
        qs = Utilisateur.objects.filter(date_joined__gte=il_y_a_180j)
        if role:
            qs = qs.filter(role=role)
        return list(
            qs.annotate(mois=TruncMonth('date_joined'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
            .values('mois', 'total')
        )

    def formater(qs_list):
        return [
            {"mois": e['mois'].strftime('%b %Y'), "total": e['total']}
            for e in qs_list
        ]

    # ---- Connexions par mois (approximation via last_login) ----
    def connexions_par_mois():
        return list(
            Utilisateur.objects.filter(
                last_login__gte=il_y_a_180j,
                last_login__isnull=False
            )
            .annotate(mois=TruncMonth('last_login'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
            .values('mois', 'total')
        )

    return Response({
        # Compteurs
        "compteurs": {
            "total":       total,
            "actifs":      actifs,
            "en_attente":  en_attente,
            "bannis":      bannis,
            "suspendus":   suspendus,
            "clients":     clients,
            "coiffeurs":   coiffeurs,
            "actifs_7j":   actifs_7j,
            "actifs_30j":  actifs_30j,
            "inactifs_30j": inactifs_30j,
        },

        # Top utilisateurs
        "top_actifs":       UtilisateurAdminSerializer(top_actifs, many=True).data,
        "nouveaux":         UtilisateurAdminSerializer(nouveaux, many=True).data,
        "rarement_actifs":  UtilisateurAdminSerializer(rarement_actifs, many=True).data,

        # Données graphiques
        "graphiques": {
            "inscriptions_total":    formater(inscriptions_par_mois()),
            "inscriptions_clients":  formater(inscriptions_par_mois(RoleChoix.CLIENT)),
            "inscriptions_coiffeurs":formater(inscriptions_par_mois(RoleChoix.COIFFEUR)),
            "connexions_mensuelles": formater(connexions_par_mois()),
            "repartition_roles": [
                {"label": "Clients",   "valeur": clients,   "couleur": "#C4A66A"},
                {"label": "Coiffeurs", "valeur": coiffeurs, "couleur": "rgba(255,255,255,0.8)"},
                {"label": "Admins",    "valeur": max(0, total - clients - coiffeurs), "couleur": "#534AB7"},
            ],
            "repartition_statuts": [
                {"label": "Actifs",     "valeur": actifs,     "couleur": "#27ae60"},
                {"label": "En attente", "valeur": en_attente, "couleur": "#f39c12"},
                {"label": "Suspendus",  "valeur": suspendus,  "couleur": "#95a5a6"},
                {"label": "Bannis",     "valeur": bannis,     "couleur": "#e74c3c"},
            ],
        },
    })
