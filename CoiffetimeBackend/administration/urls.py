"""
administration/urls.py — URLs complètes
"""
from django.urls import path
from .views.dashboard_view    import statistiquesDashboard
from .views.stats_view        import statistiquesUtilisateurs
from .views.audit_view        import listeAuditLogs
from .views.reactivation_view import listeDemandesReactivation
from .views.validation_view   import (
    listeCompteEnAttente,
    listeCoiffeursActifs,
    listeClients,
    listeTousUtilisateurs,
    validerOuRejeterCompte,
    suspendreUtilisateur,
)

urlpatterns = [
    # Dashboard
    path('dashboard/',                   statistiquesDashboard,      name='admin-dashboard'),

    # Statistiques
    path('stats/utilisateurs/',          statistiquesUtilisateurs,   name='admin-stats-users'),

    # Journal de bord
    path('audit/',                       listeAuditLogs,             name='admin-audit'),

    # Demandes de réactivation
    path('reactivations/',               listeDemandesReactivation,  name='admin-reactivations'),

    # Comptes
    path('comptes/en-attente/',          listeCompteEnAttente,       name='admin-en-attente'),
    path('comptes/coiffeurs/',           listeCoiffeursActifs,       name='admin-coiffeurs'),
    path('comptes/clients/',             listeClients,               name='admin-clients'),
    path('comptes/tous/',                listeTousUtilisateurs,      name='admin-tous'),
    path('comptes/<uuid:id>/decision/',  validerOuRejeterCompte,     name='admin-decision'),
    path('comptes/<uuid:id>/suspendre/', suspendreUtilisateur,       name='admin-suspendre'),
]