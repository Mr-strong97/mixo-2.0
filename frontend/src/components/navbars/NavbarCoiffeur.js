/**
 * NavbarCoiffeur.js — MIXO
 * Liens : Tableau de bord · Rendez-vous · Plannings · Services · Avis · Notifications · Profil
 */
import { NavbarLayout } from './NavbarLayout.js';

export const NavbarCoiffeur = () => NavbarLayout([
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Tableau de bord', route: '/coiffeur/dashboard' },
    { id: 'rdv', icon: 'calendar', label: 'Mes rendez-vous', route: '/rendez-vous' },
    { id: 'services', icon: 'scissors', label: 'Mes services', route: '/coiffeur/services' },
    { id: 'factures', icon: 'receipt-text', label: 'Factures', route: '/factures' },
    { id: 'horaires', icon: 'calendar-clock', label: 'Horaires', route: '/coiffeur/horaires' },
    { id: 'portfolio', icon: 'image', label: 'Portfolio', route: '/coiffeur/portfolio' },
    { id: 'avis', icon: 'star', label: 'Avis clients', route: '/avis' },
    { id: 'parametres', icon: 'settings', label: 'Paramètres', route: '/parametres/coiffeur' },
]);
