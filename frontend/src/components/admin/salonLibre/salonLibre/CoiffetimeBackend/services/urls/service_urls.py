from django.urls import path
from ..views import service_views

urlpatterns = [
    # Services
    path('', service_views.liste_services),
    path('<uuid:pk>/', service_views.detail_service),
    
    # Avis & Horaires (à compléter avec tes fonctions de vues)
    # Avis
    path('avis/', service_views.liste_avis, name='avis-list'),
    path('avis/<uuid:pk>/', service_views.detail_avis, name='avis-detail'),
    
    #Horaire
    path('horaires/', service_views.liste_horaires, name='horaire-list'),
    path('horaires/<uuid:pk>/', service_views.detail_horaire, name='horaire-detail'),

]