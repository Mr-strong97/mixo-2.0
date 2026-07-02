"""
apps.py — MIXO · Module Abonnements
"""
from django.apps import AppConfig


class AbonnementsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'abonnements'
    verbose_name = 'Abonnements'

    def ready(self):
        # Module désactivé en Version 1.
        return
