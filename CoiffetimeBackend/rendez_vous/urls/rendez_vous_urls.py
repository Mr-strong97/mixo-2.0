"""
rendez_vous_urls.py — MIXO · Module Rendez-vous
À inclure dans config/urls.py :
    path('api/rendez-vous/', include('rendez_vous.urls.rendez_vous_urls')),
"""
from django.urls import path
from ..views import rendez_vous_views as v

urlpatterns = [

    # ── Réservation (routes fixes — avant <uuid:pk>/) ───────────
    path('creneaux-disponibles/<uuid:coiffeur_id>/', v.creneaux_disponibles, name='rdv-creneaux'),
    path('creer/',            v.creer_rendezvous, name='rdv-creer'),
    path('mes-demandes/',     v.mes_demandes,      name='rdv-mes-demandes'),
    path('mes-rendez-vous/',  v.mes_rendezvous,    name='rdv-mes-rendezvous'),

    # ── Détail + transitions ─────────────────────────────────────
    path('<uuid:pk>/',           v.detail_rendezvous,   name='rdv-detail'),
    path('<uuid:pk>/accepter/',  v.accepter_rendezvous,  name='rdv-accepter'),
    path('<uuid:pk>/refuser/',   v.refuser_rendezvous,   name='rdv-refuser'),
    path('<uuid:pk>/annuler/',   v.annuler_rendezvous,   name='rdv-annuler'),
    path('<uuid:pk>/terminer/',  v.terminer_rendezvous,  name='rdv-terminer'),
]
