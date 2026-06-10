/**
 * AuthGuard.js — MIXO
 * checkUserStatus utilise /api/auth/moi/statut/ (qui lui-même
 * compte les notifs depuis l'app notifications dédiée).
 */
import api from '../api/axiosConfig.js';

export const requireAuth = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        if (window.navigate) window.navigate('/login');
        else window.location.href = '/login';
        return false;
    }
    return true;
};

export const requireRole = (role) => {
    if (!requireAuth()) return false;
    const userRole = (localStorage.getItem('user_role') || '').toLowerCase().trim();
    if (userRole !== role.toLowerCase()) {
        if (window.navigate) window.navigate('/home');
        else window.location.href = '/home';
        return false;
    }
    return true;
};

export const requireGuest = () => {
    if (localStorage.getItem('access_token')) {
        if (window.navigate) window.navigate('/home');
        else window.location.href = '/home';
        return false;
    }
    return true;
};

/**
 * Vérifie le statut de l'utilisateur côté serveur.
 * Appelé dans Navbar → exécuté sur chaque page.
 */
export const checkUserStatus = async () => {
    if (!localStorage.getItem('access_token')) return;

    try {
        const res = await api.get('auth/moi/statut/');
        const { statut, non_lues } = res.data;

        // Met à jour le badge cloche
        updateNotifBadge(non_lues ?? 0);

        if (statut === 'INACTIF') {
            if (window.location.pathname !== '/compte-suspendu') {
                if (window.navigate) window.navigate('/compte-suspendu');
                else window.location.href = '/compte-suspendu';
            }
        } else if (statut === 'BANNI') {
            ['access_token','refresh_token','user_id','user_role','username']
                .forEach(k => localStorage.removeItem(k));
            if (window.navigate) window.navigate('/login');
            else window.location.href = '/login';
        }
    } catch {
        // Silencieux
    }
};

export const updateNotifBadge = (count) => {
    const dot   = document.querySelector('.notif-dot');
    const badge = document.querySelector('.notif-badge-count');
    if (dot)   dot.style.display   = count > 0 ? 'block' : 'none';
    if (badge) {
        badge.textContent   = count > 9 ? '9+' : String(count);
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
};