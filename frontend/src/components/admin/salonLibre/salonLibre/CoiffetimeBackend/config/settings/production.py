"""
config/settings/production.py
================================
Surcharges pour l'environnement de production.
DJANGO_SETTINGS_MODULE=config.settings.production
"""
import os
from .base import *

# ------------------------------------------------------------------ #
# SÉCURITÉ PRODUCTION
# ------------------------------------------------------------------ #
DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# ------------------------------------------------------------------ #
# BASE DE DONNÉES : PostgreSQL en production
# Remplis ces valeurs dans ton fichier .env
# ------------------------------------------------------------------ #
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.getenv('DB_NAME', '_db'),
        'USER':     os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST':     os.getenv('DB_HOST', 'localhost'),
        'PORT':     os.getenv('DB_PORT', '5432'),
    }
}

# ------------------------------------------------------------------ #
# SÉCURITÉ HTTPS
# ------------------------------------------------------------------ #
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True