"""
administration/urls.py — URLs complètes
"""
from pathlib import Path
from django.urls import path
from .views.dashboard_view    import statistiquesDashboard
from .views.stats_view        import statistiquesUtilisateurs
from .views.audit_view        import listeAuditLogs
from .views.reactivation_view import listeDemandesReactivation
from .views.security_view     import admin_security_overview, admin_revoquer_sessions
from .views.admin_rendezvous_views import (
    admin_liste_rendezvous,
    admin_detail_rendezvous,
    admin_modifier_rendezvous,
    admin_annuler_rendezvous,
    admin_suspendre_rendezvous,
    admin_stats_rendezvous,
)
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

    # Sécurité & sessions
    path('security/',                    admin_security_overview,    name='admin-security'),
    path('security/revoke-sessions/',    admin_revoquer_sessions,    name='admin-security-revoke-sessions'),

    # Rendez-vous
    path('rendez-vous/',                 admin_liste_rendezvous,     name='admin-rdv-list'),
    path('rendez-vous/stats/',           admin_stats_rendezvous,     name='admin-rdv-stats'),
    path('rendez-vous/<uuid:pk>/',       admin_detail_rendezvous,    name='admin-rdv-detail'),
    path('rendez-vous/<uuid:pk>/modifier/', admin_modifier_rendezvous, name='admin-rdv-modifier'),
    path('rendez-vous/<uuid:pk>/annuler/', admin_annuler_rendezvous,  name='admin-rdv-annuler'),
    path('rendez-vous/<uuid:pk>/suspendre/', admin_suspendre_rendezvous, name='admin-rdv-suspendre'),

    # Comptes
    path('comptes/en-attente/',          listeCompteEnAttente,       name='admin-en-attente'),
    path('comptes/coiffeurs/',           listeCoiffeursActifs,       name='admin-coiffeurs'),
    path('comptes/clients/',             listeClients,               name='admin-clients'),
    path('comptes/tous/',                listeTousUtilisateurs,      name='admin-tous'),
    path('comptes/<uuid:id>/decision/',  validerOuRejeterCompte,     name='admin-decision'),
    path('comptes/<uuid:id>/suspendre/', suspendreUtilisateur,       name='admin-suspendre'),
]

# Permet à ce module de se comporter aussi comme un package pour
# `administration.urls.admin_extended_urls`.
__path__ = [str(Path(__file__).resolve().with_name('urls'))]
