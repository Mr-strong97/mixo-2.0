"""
config/settings/base.py
========================
Paramètres communs à tous les environnements.
Ne jamais changer DEBUG ou DATABASES ici.
"""
import os
from datetime import timedelta
from pathlib import Path
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Remonte deux niveaux : config/settings/base.py → projet/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / '.env')

# ------------------------------------------------------------------ #
# SÉCURITÉ
# ------------------------------------------------------------------ #
SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'django-insecure-changeme-at-least-50-chars-long-for-jwt-ok'
)

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ------------------------------------------------------------------ #
# APPLICATIONS
# ------------------------------------------------------------------ #
INSTALLED_APPS = [
    # Django natif
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Packages tiers
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',

    # Apps du projet
    'authentification',
    'services',
    'rendez_vous',
    'paiements',
    'planning',
    'avis',
    'notifications',
    'media_portfolio',
    'administration',
    'abonnements',
]

# ------------------------------------------------------------------ #
# MIDDLEWARE
# ------------------------------------------------------------------ #
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ------------------------------------------------------------------ #
# CORS (Frontend Vite port 5173)
# ------------------------------------------------------------------ #
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ------------------------------------------------------------------ #
# ROUTES & MOTEURS
# ------------------------------------------------------------------ #
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
AUTH_USER_MODEL = 'authentification.Utilisateur'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ------------------------------------------------------------------ #
# REST FRAMEWORK + JWT
# ------------------------------------------------------------------ #
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ------------------------------------------------------------------ #
# INTERNATIONALISATION
# ------------------------------------------------------------------ #
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------ #
# FICHIERS
# ------------------------------------------------------------------ #
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'