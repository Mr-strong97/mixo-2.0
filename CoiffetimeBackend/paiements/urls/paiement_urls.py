"""
paiement_urls.py — MIXO · Module Paiements
À inclure dans config/urls.py :
    path('api/paiements/', include('paiements.urls.paiement_urls')),
"""
from django.urls import path
from ..views import paiement_views as v
from ..views import facture_views as f

urlpatterns = [
    path('initier/<uuid:rendez_vous_id>/', v.initier_paiement,     name='paiements-initier'),
    path('sur-place/<uuid:rendez_vous_id>/', v.enregistrer_paiement_sur_place, name='paiements-sur-place'),
    path('mes-paiements/',                  v.mes_paiements,        name='paiements-mes-paiements'),
    path('<uuid:pk>/',                      v.detail_paiement,      name='paiements-detail'),
    path('<uuid:pk>/rembourser/',           v.rembourser_paiement,  name='paiements-rembourser'),
    path('factures/',                       f.mes_factures,         name='paiements-factures'),
    path('factures/<uuid:pk>/',             f.detail_facture,       name='paiements-facture-detail'),
]
