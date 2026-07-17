"""
config/settings/production.py
================================
Surcharges pour l'environnement de production.
DJANGO_SETTINGS_MODULE=config.settings.production
"""
import os
import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from .base import *

# ------------------------------------------------------------------ #
# SÉCURITÉ PRODUCTION
# ------------------------------------------------------------------ #
DEBUG = False

ALLOWED_HOSTS = [host for host in os.getenv('ALLOWED_HOSTS', '').split(',') if host.strip()]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "ALLOWED_HOSTS doit être défini dans l'environnement de production."
    )

frontend_url = os.getenv('FRONTEND_URL', '').strip().rstrip('/')
if frontend_url:
    CSRF_TRUSTED_ORIGINS = [frontend_url]

# ------------------------------------------------------------------ #
# BASE DE DONNÉES : PostgreSQL (Neon) en production
# Lit directement DATABASE_URL depuis l'environnement
# ------------------------------------------------------------------ #
database_url = os.getenv('DATABASE_URL', '').strip()
if not database_url:
    raise ImproperlyConfigured(
        "DATABASE_URL doit être défini dans l'environnement de production."
    )

DATABASES = {
    'default': dj_database_url.parse(database_url)
}

# ------------------------------------------------------------------ #
# SÉCURITÉ HTTPS
# ------------------------------------------------------------------ #
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
