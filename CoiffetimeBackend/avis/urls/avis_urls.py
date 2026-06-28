"""
avis_urls.py — MIXO · Module Avis
À inclure dans config/urls.py :
    path('api/avis/', include('avis.urls.avis_urls')),
"""
from django.urls import path
from ..views import avis_views as v

urlpatterns = [
    path('creer/',                       v.creer_avis,       name='avis-creer'),
    path('mes-avis/',                    v.mes_avis,         name='avis-mes-avis'),
    path('mes-avis-recus/',              v.mes_avis_recus,   name='avis-mes-avis-recus'),
    path('coiffeur/<uuid:coiffeur_id>/', v.avis_coiffeur,    name='avis-coiffeur-public'),
    path('<uuid:pk>/repondre/',          v.repondre_avis,    name='avis-repondre'),
    path('<uuid:pk>/signaler/',          v.signaler_avis,    name='avis-signaler'),
]
