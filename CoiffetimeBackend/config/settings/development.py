"""
config/settings/development.py
================================
Surcharges pour l'environnement local.
DJANGO_SETTINGS_MODULE=config.settings.development
"""
from .base import *

# ------------------------------------------------------------------ #
# MODE DEBUG ACTIVÉ EN DEV
# ------------------------------------------------------------------ #
DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True

# ------------------------------------------------------------------ #
# BASE DE DONNÉES : SQLite pour le développement local
# Quand tu passes en production, tu utiliseras production.py avec PostgreSQL
# ------------------------------------------------------------------ #
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}