/**
 * NavbarAdmin.js — MIXO
 * Paramètres ajouté → /admin/parametres
 */
import { NavbarLayout } from './NavbarLayout.js';

export const NavbarAdmin = () => NavbarLayout([
    { id: 'dashboard',     icon: 'layout-dashboard', label: 'Tableau de bord',  route: '/admin' },
    { id: 'users',         icon: 'users',             label: 'Utilisateurs',     route: '/admin/users' },
    { id: 'rdv',           icon: 'calendar-range',    label: 'Rendez-vous',      route: '/admin/rendez-vous' },
    { id: 'discussion',    icon: 'messages-square',   label: 'Discussion',      route: '/discussion' },
    { id: 'services',      icon: 'scissors',          label: 'Services',         route: '/admin/services' },
    { id: 'stats',         icon: 'bar-chart-2',       label: 'Statistiques',     route: '/admin/stats' },
    { id: 'journal',       icon: 'activity',          label: 'Journal de bord',  route: '/admin/journal' },
    { id: 'factures',      icon: 'receipt-text',      label: 'Factures',         route: '/factures' },
    { id: 'notifications', icon: 'bell',              label: 'Notifications',    route: '/notifications' },
    { id: 'profil',        icon: 'user-cog',          label: 'Profil Admin',     route: '/admin/profile' },
    { id: 'parametres',    icon: 'settings',          label: 'Paramètres',       route: '/admin/parametres' },
]);
