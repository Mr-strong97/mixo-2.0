"""
service_urls.py — MIXO · URLs du module Services
"""
from django.urls import path
from ..views import service_views

urlpatterns = [
    path('categories/', service_views.liste_categories, name='categories-list'),
    path('categories/<uuid:pk>/', service_views.detail_categorie, name='categories-detail'),
    path('mes-services/', service_views.mes_services, name='services-mes-services'),
    path('mes-services/stats/', service_views.stats_services, name='services-stats'),
    path('', service_views.liste_services, name='services-list'),
    path('<uuid:pk>/', service_views.detail_service, name='services-detail'),
    path('<uuid:pk>/activer/', service_views.activer_service, name='services-activer'),
    path('<uuid:pk>/desactiver/', service_views.desactiver_service, name='services-desactiver'),
    path('<uuid:pk>/galerie/', service_views.galerie_service, name='services-galerie'),
    path('<uuid:service_pk>/galerie/<uuid:image_pk>/delete/', service_views.supprimer_image_service, name='services-galerie-delete'),
]
