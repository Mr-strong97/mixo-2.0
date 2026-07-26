/**
 * NavbarCoiffeur.js — MIXO
 * Navigation principale mobile : Accueil · Rendez-vous · Horaires · Factures · Paramètres
 */
import { NavbarLayout } from './NavbarLayout.js';

export const NavbarCoiffeur = () => NavbarLayout([
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Tableau de bord', route: '/coiffeur/dashboard' },
    { id: 'rdv', icon: 'calendar', label: 'Mes rendez-vous', route: '/rendez-vous' },
    { id: 'factures', icon: 'receipt-text', label: 'Factures', route: '/factures' },
    { id: 'horaires', icon: 'calendar-clock', label: 'Horaires', route: '/coiffeur/horaires' },
    { id: 'parametres', icon: 'settings', label: 'Paramètres', route: '/parametres/coiffeur' },
]);
