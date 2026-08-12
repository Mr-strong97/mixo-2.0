/**
 * NavbarClient.js — MIXO
 * Navigation principale mobile : Accueil · Services · Rendez-vous · Factures · Paramètres
 */
import { NavbarLayout } from './NavbarLayout.js';
import { FavorisAPI } from '../../api/FavorisAPI.js';

const applyBadge = (count) => {
    window.dispatchEvent(new CustomEvent('mixo:badges-updated', {
        detail: { favoris: Number(count || 0) },
    }));
};

export const NavbarClient = () => {
    const nav = NavbarLayout([
        { id: 'home',          icon: 'home',          label: 'Accueil',        route: '/home' },
        { id: 'services',      icon: 'scissors',      label: 'Services',       route: '/services' },
        { id: 'rdv',           icon: 'calendar-range', label: 'Mes rendez-vous', mobileLabel: 'Rendez-vous', route: '/rendez-vous' },
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
