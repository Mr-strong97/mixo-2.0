"""
notifications/urls.py
"""
from django.urls import path
from .views import (
    mesNotifications,
    marquerCommeLue,
    toutMarquerCommeLu,
    supprimerNotification,
)

urlpatterns = [
    path('',                          mesNotifications,      name='mes-notifs'),
    path('tout-lire/',                toutMarquerCommeLu,    name='tout-lire'),
    path('<uuid:id>/lire/',           marquerCommeLue,       name='marquer-lue'),
    path('<uuid:id>/supprimer/',      supprimerNotification, name='suppr-notif'),
]