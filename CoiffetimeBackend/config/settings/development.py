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

# ------------------------------------------------------------------ #
# BASE DE DONNÉES : Neon (unique base pour dev et prod)
# ------------------------------------------------------------------ #
DATABASES = {
    'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
}