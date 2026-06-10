from django.urls import path
from ..views import rendezvous_views

urlpatterns = [
    path('', rendezvous_views.liste_rendezvous, name='rendezvous-list'),
    path('<uuid:pk>/', rendezvous_views.detail_rendezvous, name='rendezvous-detail'),

    # --- Routes pour les Notifications ---
    # URL finale : /api/rendez-vous/notifications/
    path('notifications/', rendezvous_views.liste_notifications, name='liste_notifications'),
    
    # URL finale : /api/rendez-vous/notifications/<id>/
    path('notifications/<int:pk>/', rendezvous_views.detail_notification, name='detail_notification'),
]