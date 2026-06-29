/**
 * AuthGuard.js  — NOUVEAU FICHIER
 * =================================
 * Utilitaires de protection des routes.
 * Emplacement : src/utils/AuthGuard.js
 *
 * Usage dans une page :
 *   import { requireAuth } from '../utils/AuthGuard.js';
 *   if (!requireAuth()) return page; // arrêt immédiat si non connecté
 */

import { AuthentificationUtilisateurs } from '../api/axiosConfig.js';

/**
 * Redirige vers /login si l'utilisateur n'est PAS connecté.
 * À appeler au début de chaque page protégée.
 * @returns {boolean} true = accès autorisé, false = redirigé
 */
export const requireAuth = () => {
    if (!AuthentificationUtilisateurs.isAuthenticated()) {
        if (window.navigate) window.navigate('/login');
        else window.location.href = '/login';
        return false;
    }
    return true;
};

/**
 * Redirige vers /home si l'utilisateur EST déjà connecté.
 * À appeler sur LoginPage et RegisterPage.
 * @returns {boolean} true = accès autorisé (non connecté), false = redirigé
 */
export const requireGuest = () => {
    if (AuthentificationUtilisateurs.isAuthenticated()) {
        if (window.navigate) window.navigate('/home');
        else window.location.href = '/home';
        return false;
    }
    return true;
};

/**
 * Vérifie que l'utilisateur a le bon rôle.
 * @param {'client'|'coiffeur'|'admin'} role
 * @returns {boolean}
 */
export const requireRole = (role) => {
    if (!requireAuth()) return false;
    const userRole = localStorage.getItem('user_role') || '';
    if (userRole !== role) {
        if (window.navigate) window.navigate('/home');
        return false;
    }
    return true;
};