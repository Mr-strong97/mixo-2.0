from django.apps import AppConfig


class RendezVousConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rendez_vous'

    def ready(self):
        # Charge les signaux du module rendez-vous au démarrage de l'app.
        from .models import signals  # noqa: F401
