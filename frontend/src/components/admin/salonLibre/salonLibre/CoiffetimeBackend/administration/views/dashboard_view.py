"""
administration/views/dashboard_view.py
"""
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models.functions import TruncMonth
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from authentification.models.utilisateur import Utilisateur, RoleChoix, StatutChoix
from ..permissions import EstAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def statistiquesDashboard(request):
    """GET /api/admin/dashboard/ — stats globales + données graphiques."""

    # ---- Compteurs globaux ----
    total      = Utilisateur.objects.count()
    clients    = Utilisateur.objects.filter(role=RoleChoix.CLIENT).count()
    coiffeurs  = Utilisateur.objects.filter(role=RoleChoix.COIFFEUR).count()
    en_attente = Utilisateur.objects.filter(
        role=RoleChoix.COIFFEUR, statut=StatutChoix.EN_ATTENTE
    ).count()
    actifs     = Utilisateur.objects.filter(
        role=RoleChoix.COIFFEUR, statut=StatutChoix.ACTIF
    ).count()
    bannis     = Utilisateur.objects.filter(statut=StatutChoix.BANNI).count()
    suspendus  = Utilisateur.objects.filter(statut=StatutChoix.INACTIF).count()

    # ---- Inscriptions des 6 derniers mois (pour histogramme) ----
    six_mois_avant = timezone.now() - timedelta(days=180)

    def inscriptions_par_mois(role):
        return (
            Utilisateur.objects
            .filter(role=role, date_joined__gte=six_mois_avant)
            .annotate(mois=TruncMonth('date_joined'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
        )

    def formater(qs):
        return [
            {
                "mois":  entry['mois'].strftime('%b %Y'),
                "total": entry['total']
            }
            for entry in qs
        ]

    return Response({
        # Compteurs
        "total_utilisateurs":   total,
        "total_clients":        clients,
        "total_coiffeurs":      coiffeurs,
        "coiffeurs_en_attente": en_attente,
        "coiffeurs_actifs":     actifs,
        "comptes_bannis":       bannis,
        "comptes_suspendus":    suspendus,

        # Données graphiques
        "graphique": {
            "repartition": [
                {"label": "Clients",   "valeur": clients,   "couleur": "#C4A66A"},
                {"label": "Coiffeurs", "valeur": coiffeurs, "couleur": "#ffffff"},
            ],
            "inscriptions_clients":   formater(inscriptions_par_mois(RoleChoix.CLIENT)),
            "inscriptions_coiffeurs": formater(inscriptions_par_mois(RoleChoix.COIFFEUR)),
        },
    })