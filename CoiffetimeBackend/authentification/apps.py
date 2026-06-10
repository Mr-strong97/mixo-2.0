from django.apps import AppConfig

class AuthentificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentification'

    def ready(self):
        # Cette ligne force Django à charger tes modèles au démarrage
        import authentification.models