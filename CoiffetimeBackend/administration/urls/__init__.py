"""
URLs de base de l'administration.
Le package existe déjà pour l'extension `admin_extended_urls`, donc on expose
ici les routes classiques pour que `include('administration.urls')` fonctionne.
"""
from django.urls import path
from ..views.dashboard_view import statistiquesDashboard
from ..views.stats_view import statistiquesUtilisateurs
from ..views.audit_view import listeAuditLogs
from ..views.reactivation_view import listeDemandesReactivation
from ..views.validation_view import (
    listeCompteEnAttente,
    listeCoiffeursActifs,
    listeClients,
    listeTousUtilisateurs,
    validerOuRejeterCompte,
    suspendreUtilisateur,
)

urlpatterns = [
    path('dashboard/', statistiquesDashboard, name='admin-dashboard'),
    path('stats/utilisateurs/', statistiquesUtilisateurs, name='admin-stats-users'),
    path('audit/', listeAuditLogs, name='admin-audit'),
    path('reactivations/', listeDemandesReactivation, name='admin-reactivations'),
    path('comptes/en-attente/', listeCompteEnAttente, name='admin-en-attente'),
    path('comptes/coiffeurs/', listeCoiffeursActifs, name='admin-coiffeurs'),
    path('comptes/clients/', listeClients, name='admin-clients'),
    path('comptes/tous/', listeTousUtilisateurs, name='admin-tous'),
    path('comptes/<uuid:id>/decision/', validerOuRejeterCompte, name='admin-decision'),
    path('comptes/<uuid:id>/suspendre/', suspendreUtilisateur, name='admin-suspendre'),
]
