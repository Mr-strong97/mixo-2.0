/**
 * axiosConfig.js — MIXO
 * Gestion de tous les statuts de connexion :
 *   403 + EN_ATTENTE  → message coiffeur en attente
 *   403 + INACTIF     → redirection page compte suspendu
 *   403 + BANNI       → message bannissement définitif
 *   423               → compte verrouillé
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 8000,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token       = localStorage.getItem('access_token');
    const publicPaths = ['auth/inscription/', 'auth/connexion/'];
    const isPublic    = publicPaths.some(p => config.url?.includes(p));
    if (token && !isPublic) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const res = await axios.post(`${BASE_URL}auth/connexion/rafraichir/`, { refresh });
                    const newToken = res.data.access;
                    localStorage.setItem('access_token', newToken);
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return api(original);
                } catch {
                    AuthentificationUtilisateurs.logout();
                }
            }
        }
        return Promise.reject(error);
    }
);

export const AuthentificationUtilisateurs = {

    register: async (userData) => {
        try {
            return (await api.post('auth/inscription/', userData)).data;
        } catch (error) {
            throw error.response?.data || "Erreur lors de l'inscription";
        }
    },

    login: async (credentials) => {
        try {
            const { data } = await api.post('auth/connexion/', credentials);
            if (data.access) {
                localStorage.setItem('access_token',  data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user_id',       data.user_id);
                localStorage.setItem('user_role',     (data.role     || 'CLIENT').toLowerCase());
                localStorage.setItem('username',      (data.username || '').toLowerCase());
            }
            return data;
        } catch (error) {
            const s = error.response?.status;
            const d = error.response?.data;

            // 423 — compte verrouillé
            if (s === 423) throw new Error(d?.detail || "Compte verrouillé. Réessayez dans 15 minutes.");

            // 403 — statut bloquant
            if (s === 403) {
                const statut = d?.statut;
                if (statut === 'EN_ATTENTE') throw new Error(d.detail);
                if (statut === 'INACTIF') {
                    // Redirige vers la page compte suspendu
                    if (window.navigate) window.navigate('/compte-suspendu');
                    else window.location.href = '/compte-suspendu';
                    throw new Error('SUSPENDED');
                }
                if (statut === 'BANNI') throw new Error(d?.detail || "Votre compte a été banni définitivement.");
                throw new Error(d?.detail || "Accès refusé.");
            }

            throw new Error(d?.detail || "Identifiants incorrects.");
        }
    },

    logout: () => {
        ['access_token', 'refresh_token', 'user_id', 'user_role', 'username']
            .forEach(k => localStorage.removeItem(k));
        if (window.navigate) window.navigate('/login');
        else window.location.href = '/login';
    },

    isAuthenticated: () => !!localStorage.getItem('access_token'),
};

export const ProfilUtilisateur = {
    getUserProfile: async (role, id) => {
        try {
            const ep = role === 'client' ? `auth/clients/${id}/` : `auth/coiffeurs/${id}/`;
            return (await api.get(ep)).data;
        } catch (error) { throw error.response?.data || "Impossible de charger le profil"; }
    },
    updateUserFields: async (id, fields) => {
        try { return (await api.patch(`auth/profil/${id}/`, fields)).data; }
        catch (error) { throw error.response?.data || "Erreur mise à jour"; }
    },
    updateProfileFields: async (role, id, fields) => {
        try {
            const ep = role === 'client' ? `auth/clients/${id}/` : `auth/coiffeurs/${id}/`;
            return (await api.patch(ep, fields)).data;
        } catch (error) { throw error.response?.data || "Erreur mise à jour profil"; }
    },
    getCurrentUser: () => ({
        id:       localStorage.getItem('user_id'),
        role:     localStorage.getItem('user_role'),
        username: localStorage.getItem('username'),
    }),
};

export default api;