"""
portfolio_urls.py — MIXO · Module Portfolio
À inclure dans config/urls.py :
    path('api/portfolio/', include('portfolio.urls.portfolio_urls')),
"""
from django.urls import path
from ...views import portfolio_views

urlpatterns = [

    # ── Mon portfolio (Espace Coiffeur) — routes fixes ──────────────
    path('mon-portfolio/',     portfolio_views.mon_portfolio,         name='portfolio-mon-portfolio'),
    path('reordonner/',        portfolio_views.reordonner_portfolio,  name='portfolio-reordonner'),
    path('<uuid:pk>/',         portfolio_views.detail_media,          name='portfolio-detail'),

    # ── Galerie publique (lecture client) ───────────────────────────
    path('coiffeur/<uuid:coiffeur_id>/', portfolio_views.portfolio_public, name='portfolio-public'),
]
