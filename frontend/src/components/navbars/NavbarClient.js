/**
 * NavbarClient.js — MIXO
 * Liens : Accueil · Services · Espace Client · Favoris · Historique · Notifications
 */
import { NavbarLayout } from './NavbarLayout.js';

export const NavbarClient = () => NavbarLayout([
    { id: 'home',          icon: 'home',          label: 'Accueil',        route: '/home' },
    { id: 'services',      icon: 'grid',           label: 'Services',       route: '/services' },
    { id: 'favoris',       icon: 'heart',          label: 'Favoris',        route: '/favoris' },
    { id: 'historique',    icon: 'clock',          label: 'Historique',     route: '/historique' },
    { id: 'notifications', icon: 'bell',           label: 'Notifications',  route: '/notifications' },
    { id: 'parametres',    icon: 'settings',      label: 'Paramètres',     route: '/parametres/client' },
]);