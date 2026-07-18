# MIXO

- [Guide backend](README.backend.md)
- [Guide frontend](README.frontend.md)

## Déploiement Dokploy / Hostinger

Le dépôt contient un déploiement Docker unique dans `docker-compose.yml` :
PostgreSQL, Django ASGI et le frontend Vite servi par Nginx. Le domaine public
pointe uniquement sur le service `web` (port `80`) ; Nginx redirige `/api/`,
`/admin/` et `/ws/` vers Django.

Dans Dokploy, crée une application **Compose**, sélectionne
`docker-compose.yml`, ajoute les variables de `deployment.env.example`, puis
associe ton domaine au service `web` sur le port `80`. `FRONTEND_URL` doit être
l'URL HTTPS exacte de ce domaine et `ALLOWED_HOSTS` son nom sans `https://`.
# MIXO-m
