/**
 * NavbarClient.js — MIXO
 * Navigation principale mobile : Accueil · Rendez-vous · Factures · Paramètres
 */
import { NavbarLayout } from './NavbarLayout.js';
import { FavorisAPI } from '../../api/FavorisAPI.js';

const applyBadge = (count) => {
    const badge = document.querySelector('#nl-favoris .nl-badge') || (() => {
        const el = document.querySelector('#nl-favoris');
        if (!el) return null;
        const span = document.createElement('span');
        span.className = 'nl-badge';
        el.appendChild(span);
        return span;
    })();
    if (!badge) return;
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
};

export const NavbarClient = () => {
    const nav = NavbarLayout([
        { id: 'home',          icon: 'home',          label: 'Accueil',        route: '/home' },
        { id: 'rdv',           icon: 'calendar-range', label: 'Mes rendez-vous', route: '/rendez-vous' },
        { id: 'factures',      icon: 'receipt-text',   label: 'Factures',       route: '/factures' },
        { id: 'parametres',    icon: 'settings',      label: 'Paramètres',     route: '/parametres/client' },
    ]);

    FavorisAPI.compter().then(({ count }) => applyBadge(count || 0)).catch(() => applyBadge(0));

    if (document.__mixoFavoritesHandler) {
        window.removeEventListener('mixo:favorites-updated', document.__mixoFavoritesHandler);
    }
    document.__mixoFavoritesHandler = (event) => applyBadge(event.detail?.count ?? 0);
    window.addEventListener('mixo:favorites-updated', document.__mixoFavoritesHandler);

    return nav;
};
