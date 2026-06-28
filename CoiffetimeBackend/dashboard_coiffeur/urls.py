"""dashboard_coiffeur/urls.py — MIXO · Routes du dashboard coiffeur"""
from django.urls import path
from . import views

urlpatterns = [
    path('mon-dashboard/', views.mon_dashboard, name='dashboard-coiffeur-mon-dashboard'),
    path('stats-coiffeurs/', views.stats_coiffeurs, name='dashboard-coiffeur-stats'),
]

