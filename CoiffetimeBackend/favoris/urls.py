"""favoris/urls.py — MIXO · Routes du module Favoris"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.mes_favoris, name='favoris-mes-favoris'),
    path('toggle/', views.toggle_favori, name='favoris-toggle'),
    path('compter/', views.compter_mes_favoris, name='favoris-compter'),
    path('<uuid:pk>/', views.supprimer_favori, name='favoris-supprimer'),
    path('service/<uuid:service_id>/', views.est_favori, name='favoris-est-favori'),
]

