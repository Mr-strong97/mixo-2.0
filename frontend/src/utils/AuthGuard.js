/**
 * AuthGuard.js — MIXO
 * checkUserStatus utilise /api/auth/moi/statut/ (qui lui-même
 * compte les notifs depuis l'app notifications dédiée).
 */
import api from '../api/axiosConfig.js';
import { auth } from '../firebase-config.js';

export const requireAuth = () => {
    if (!auth.currentUser && !localStorage.getItem('user_id')) {
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
    if (auth.currentUser || localStorage.getItem('user_id')) {
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
    if (!auth.currentUser && !localStorage.getItem('user_id')) return;

    try {
        const res = await api.get('auth/moi/statut/');
        const { statut, non_lues, compteurs = {} } = res.data;

        // Met à jour le badge cloche
        updateNotifBadge(non_lues ?? 0);
        updateSectionBadges(compteurs);

        if (statut === 'INACTIF') {
            if (window.location.pathname !== '/compte-suspendu') {
                if (window.navigate) window.navigate('/compte-suspendu');
                else window.location.href = '/compte-suspendu';
            }
        } else if (statut === 'BANNI') {
            if (window.location.pathname !== '/compte-suspendu') {
                if (window.navigate) window.navigate('/compte-suspendu');
                else window.location.href = '/compte-suspendu';
            }
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

export const updateSectionBadges = (counts = {}) => {
    window.dispatchEvent(new CustomEvent('mixo:badges-updated', {
        detail: {
            notifications: counts.notifications ?? 0,
            services: counts.services ?? 0,
            rdv: counts.rdv ?? 0,
            avis: counts.avis ?? 0,
            factures: counts.factures ?? 0,
            discussion: counts.discussion ?? 0,
        },
    }));
};
