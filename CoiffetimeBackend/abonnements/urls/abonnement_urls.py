"""
abonnement_urls.py — MIXO · Module Abonnements
À inclure dans config/urls.py :
    path('api/abonnements/', include('abonnements.urls.abonnement_urls')),
"""
from django.urls import path
from ..views import abonnement_views

urlpatterns = [

    # ── Plans (lecture publique authentifiée, écriture admin) ─────
    path('plans/',           abonnement_views.liste_plans,  name='abonnements-plans-list'),
    path('plans/<uuid:pk>/', abonnement_views.detail_plan,  name='abonnements-plans-detail'),

    # ── Mon abonnement (Espace Coiffeur) — routes fixes ────────────
    path('mon-statut/',     abonnement_views.mon_statut_abonnement,     name='abonnements-mon-statut'),
    path('mon-historique/', abonnement_views.mon_historique_abonnements, name='abonnements-mon-historique'),
    path('annuler/',        abonnement_views.annuler_abonnement,        name='abonnements-annuler'),

    # ── Souscription à un plan ──────────────────────────────────────
    path('souscrire/<uuid:plan_id>/', abonnement_views.souscrire_plan, name='abonnements-souscrire'),
]
