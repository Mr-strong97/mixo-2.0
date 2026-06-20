"""
apps.py — MIXO · Module Abonnements
"""
from django.apps import AppConfig


class AbonnementsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'abonnements'
    verbose_name = 'Abonnements'

    def ready(self):
        # Branche les signaux (essai gratuit auto à l'inscription d'un coiffeur)
        import abonnements.signals  # noqa: F401
