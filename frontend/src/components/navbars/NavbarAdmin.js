/**
 * NavbarAdmin.js — MIXO
 * Navigation principale mobile : Utilisateurs · Rendez-vous · Services · Journal · Paramètres
 */
import { NavbarLayout } from './NavbarLayout.js';

export const NavbarAdmin = () => NavbarLayout([
    { id: 'users',         icon: 'users',             label: 'Utilisateurs',     route: '/admin/users' },
    { id: 'rdv',           icon: 'calendar-range',    label: 'Rendez-vous',      route: '/admin/rendez-vous' },
    { id: 'services',      icon: 'scissors',          label: 'Services',         route: '/admin/services' },
    { id: 'journal',       icon: 'activity',          label: 'Journal de bord',  route: '/admin/journal' },
    { id: 'parametres',    icon: 'settings',          label: 'Paramètres',       route: '/admin/parametres' },
]);
