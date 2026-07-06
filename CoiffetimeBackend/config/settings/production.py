"""
config/settings/production.py
================================
Surcharges pour l'environnement de production.
DJANGO_SETTINGS_MODULE=config.settings.production
"""
import os
import dj_database_url
from .base import *

# ------------------------------------------------------------------ #
# SÉCURITÉ PRODUCTION
# ------------------------------------------------------------------ #
DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# ------------------------------------------------------------------ #
# BASE DE DONNÉES : PostgreSQL (Neon) en production
# Lit directement DATABASE_URL depuis le .env
# ------------------------------------------------------------------ #
DATABASES = {
    'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
}

# ------------------------------------------------------------------ #
# SÉCURITÉ HTTPS
# ------------------------------------------------------------------ #
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True