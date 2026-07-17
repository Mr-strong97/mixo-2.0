# Frontend MIXO

Frontend Vite du projet MIXO.

## Ce que fait ce frontend

- Interface utilisateur principale.
- Authentification Firebase.
- Appels API centralisés via `src/api/axiosConfig.js`.
- Chargement des images, pages de profil, rendez-vous, paiements, avis et dashboard.

## Configuration

Le frontend lit ses variables depuis:

- `frontend/.env`
- `.env.frontend` à la racine si tu l’utilises dans Docker ou dans un pipeline

Variables utiles:

- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_RECAPTCHA_SITE_KEY`

## Lancement local

```bash
cd frontend
npm install
npm run dev
```

## Build de production

```bash
cd frontend
npm run build
```

Le build sort dans `frontend/dist/`.

## Déploiement

- Si le frontend et le backend sont servis sous le même domaine, garde `VITE_API_URL=/api/`.
- Si tu sépares les domaines, mets une URL complète vers l'API.
- Le reverse-proxy Nginx doit servir le build statique et rediriger `/api/` vers le backend.

## Fichiers à garder hors Git

- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/.env`
- les autres fichiers `*.local`
