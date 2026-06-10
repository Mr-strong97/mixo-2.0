/**
 * NavbarCoiffeur.js — MIXO
 * Liens : Tableau de bord · Rendez-vous · Plannings · Services · Avis · Notifications · Profil
 */
import { NavbarLayout } from './NavbarLayout.js';

export const NavbarCoiffeur = () => NavbarLayout([
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Tableau de bord', route: '/home' },
    { id: 'rdv', icon: 'calendar', label: 'Mes rendez-vous', route: '/rendez-vous' },
    { id: 'plannings', icon: 'clock', label: 'Plannings', route: '/plannings' },
    { id: 'mes services', icon: 'scissors', label: 'Mes services', route: '/coiffeur/services' },
    { id: 'avis', icon: 'star', label: 'Avis clients', route: '/avis' },
    { id: 'notifications', icon: 'bell', label: 'Notifications', route: '/notifications' },
    { id: 'profil', icon: 'user-circle', label: 'Mon profil', route: `/${localStorage.getItem('username')}/${localStorage.getItem('user_id')}` },
]);