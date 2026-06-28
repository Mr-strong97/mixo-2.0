"""historique/urls.py — MIXO · Routes du module Historique"""
from django.urls import path
from . import views

urlpatterns = [
    path('mes-activites/', views.mes_activites, name='historique-mes-activites'),
]

