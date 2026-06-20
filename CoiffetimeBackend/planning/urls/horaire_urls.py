"""
horaire_urls.py — MIXO · Module Horaires
À inclure dans config/urls.py :
    path('api/horaires/', include('horaires.urls.horaire_urls')),
"""
from django.urls import path
from ..views import horaire_views, disponibilite_views

urlpatterns = [

    # ── Mes horaires (Espace Coiffeur) ──────────────────────────────
    path('mes-horaires/',            horaire_views.mes_horaires,        name='horaires-mes-horaires'),
    path('mes-horaires/<uuid:pk>/',  horaire_views.detail_horaire,      name='horaires-detail'),
    path('mes-horaires/<uuid:pk>/desactiver/', horaire_views.desactiver_creneau, name='horaires-desactiver'),

    # ── Planning public (lecture client) ────────────────────────────
    path('planning/<uuid:coiffeur_id>/', horaire_views.planning_coiffeur, name='horaires-planning-public'),

    # ── Mes exceptions de disponibilité (Espace Coiffeur) ───────────
    path('mes-exceptions/',           disponibilite_views.mes_exceptions,   name='disponibilites-mes-exceptions'),
    path('mes-exceptions/<uuid:pk>/', disponibilite_views.detail_exception, name='disponibilites-detail'),

    # ── Disponibilités publiques (lecture client) ───────────────────
    path('disponibilites/<uuid:coiffeur_id>/', disponibilite_views.disponibilites_publiques, name='disponibilites-publiques'),
]
