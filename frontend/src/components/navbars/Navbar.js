/**
 * Navbar.js — MIXO
 * Point d'entrée : sélectionne NavbarClient / NavbarCoiffeur / NavbarAdmin
 * selon le rôle stocké dans localStorage.
 */
import { NavbarClient }   from './NavbarClient.js';
import { NavbarCoiffeur } from './NavbarCoiffeur.js';
import { NavbarAdmin }    from './NavbarAdmin.js';

export const Navbar = () => {
    const role = (localStorage.getItem('user_role') || 'client').toLowerCase().trim();

    if (role === 'admin')    return NavbarAdmin();
    if (role === 'coiffeur') return NavbarCoiffeur();
    return NavbarClient();
};

export default Navbar;