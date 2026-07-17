# Backend Coiffetime

Backend Django REST Framework du projet MIXO.

## Ce que contient ce backend

- `authentification/` pour les comptes, le login Firebase et les profils.
- `services/`, `rendez_vous/`, `paiements/`, `avis/`, `planning/`, `chat/`, `notifications/`, `abonnements/`, `historique/` pour les fonctionnalités métier.
- `config/settings/` pour séparer le mode développement et le mode production.

## Configuration importante

Le backend lit ses variables d'environnement depuis:

- `CoiffetimeBackend/.env`
- `.env.backend` à la racine du dépôt

Variables principales à définir en production:

- `SECRET_KEY`
- `DJANGO_SETTINGS_MODULE=config.settings.production`
- `ALLOWED_HOSTS`
- `DATABASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`
- `FIREBASE_ADMIN_CREDENTIALS_PATH`

## Lancement local

```bash
cd CoiffetimeBackend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Si `DATABASE_URL` est absent en local, le mode développement retombe sur SQLite.

## Production

- `manage.py` reste orienté développement pour le travail local.
- `wsgi.py` et `asgi.py` démarrent en mode production par défaut.
- Le conteneur Docker exécute `migrate`, `collectstatic`, puis `gunicorn`.
- Nginx doit proxyfier `/api/` et `/admin/` vers le service backend.

## Fichiers sensibles

Ne jamais versionner:

- les fichiers `.env`
- les clés Firebase Admin
- les dossiers `media/`, `staticfiles/`, `node_modules/`, `dist/`

