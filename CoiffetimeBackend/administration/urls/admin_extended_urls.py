"""
admin_extended_urls.py — MIXO · Extension Espace Admin (v2)

Combine les routes déjà livrées précédemment (Services, Abonnements,
Horaires, Portfolio) avec les nouvelles (Rendez-vous, Paiements, Avis).

À inclure dans config/urls.py :
    path('api/admin/extended/', include('administration.urls.admin_extended_urls')),

Toutes les vues sont protégées par IsAdminUser (is_staff=True).
"""
from django.urls import path
from ..views import (
    admin_services_views,
    admin_abonnements_views,
    admin_horaires_views,
    admin_portfolio_views,
    admin_rendezvous_views,
    admin_paiements_views,
    admin_avis_views,
    admin_supervision_views,
)

urlpatterns = [

    # ── Gestion des services ─────────────────────────────────────
    path('services/',                     admin_services_views.admin_liste_services,     name='admin-services-list'),
    path('services/<uuid:pk>/',           admin_services_views.admin_detail_service,     name='admin-services-detail'),
    path('services/<uuid:pk>/suspendre/', admin_services_views.admin_suspendre_service,  name='admin-services-suspendre'),
    path('services/<uuid:pk>/supprimer/', admin_services_views.admin_supprimer_service,  name='admin-services-supprimer'),

    # ── Gestion des abonnements & plans ─────────────────────────
    path('abonnements/',                 admin_abonnements_views.admin_liste_abonnements, name='admin-abonnements-list'),
    path('abonnements/stats/',           admin_abonnements_views.admin_stats_abonnements, name='admin-abonnements-stats'),
    path('abonnements/plans/',           admin_abonnements_views.admin_liste_plans,       name='admin-plans-list'),
    path('abonnements/plans/<uuid:pk>/', admin_abonnements_views.admin_detail_plan,       name='admin-plans-detail'),

    # ── Gestion des horaires ────────────────────────────────────
    path('horaires/',                    admin_horaires_views.admin_liste_horaires,       name='admin-horaires-list'),
    path('horaires/anomalies/',          admin_horaires_views.admin_anomalies_horaires,   name='admin-horaires-anomalies'),
    path('disponibilites/',              admin_horaires_views.admin_liste_disponibilites, name='admin-disponibilites-list'),

    # ── Gestion des portfolios ───────────────────────────────────
    path('portfolio/',                    admin_portfolio_views.admin_liste_medias,       name='admin-portfolio-list'),
    path('portfolio/<uuid:pk>/signaler/', admin_portfolio_views.admin_signaler_media,     name='admin-portfolio-signaler'),
    path('portfolio/<uuid:pk>/',          admin_portfolio_views.admin_supprimer_media,    name='admin-portfolio-supprimer'),

    # ── Gestion des rendez-vous ──────────────────────────────────
    path('rendez-vous/',                 admin_rendezvous_views.admin_liste_rendezvous,   name='admin-rdv-list'),
    path('rendez-vous/stats/',           admin_rendezvous_views.admin_stats_rendezvous,   name='admin-rdv-stats'),

    # ── Gestion des paiements ────────────────────────────────────
    path('paiements/',                   admin_paiements_views.admin_liste_paiements,     name='admin-paiements-list'),
    path('paiements/stats/',             admin_paiements_views.admin_stats_paiements,     name='admin-paiements-stats'),
    path('paiements/<uuid:pk>/',         admin_paiements_views.admin_detail_paiement,     name='admin-paiements-detail'),

    # ── Gestion des avis ──────────────────────────────────────────
    path('avis/',                              admin_avis_views.admin_liste_avis,          name='admin-avis-list'),
    path('avis/<uuid:pk>/',                    admin_avis_views.admin_supprimer_avis,      name='admin-avis-supprimer'),
    path('avis/<uuid:pk>/lever-signalement/',  admin_avis_views.admin_lever_signalement,   name='admin-avis-lever-signalement'),

    # ── Supervision nouveaux modules ────────────────────────────
    path('favoris/',            admin_supervision_views.admin_liste_favoris,      name='admin-favoris-list'),
    path('historique/',         admin_supervision_views.admin_historique_global,   name='admin-historique-global'),
    path('coiffeurs/stats/',    admin_supervision_views.admin_stats_coiffeurs,    name='admin-coiffeurs-stats'),
]
