"""
config/settings/development.py
================================
Surcharges pour l'environnement local.
DJANGO_SETTINGS_MODULE=config.settings.development
"""
import os
import dj_database_url
from .base import *

# ------------------------------------------------------------------ #
# MODE DEBUG ACTIVÉ EN DEV
# ------------------------------------------------------------------ #
DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ------------------------------------------------------------------ #
# BASE DE DONNÉES : SQLite en local si DATABASE_URL n'est pas fourni
# ------------------------------------------------------------------ #
database_url = os.getenv('DATABASE_URL', '').strip()
if database_url:
    DATABASES = {
        'default': dj_database_url.parse(database_url)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
