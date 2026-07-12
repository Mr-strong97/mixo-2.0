/**
 * axiosConfig.js — MIXO
 * Authentification basée sur Firebase.
 */
import axios from 'axios';
import {
    createUserWithEmailAndPassword,
    deleteUser,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { auth, getFirebaseIdToken } from '../firebase-config.js';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
    const url = String(config.url || '');
    const isFirebaseAuthEndpoint = url.includes('auth/firebase/inscription/') || url.includes('auth/firebase/connexion/');

    if (isFirebaseAuthEndpoint) {
        return config;
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        config.headers = config.headers || {};
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
    }

    const token = await getFirebaseIdToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

const setSessionProfile = (data = {}) => {
    if (data.user_id) localStorage.setItem('user_id', data.user_id);
    if (data.role) localStorage.setItem('user_role', String(data.role).toLowerCase());
    if (data.username) localStorage.setItem('username', String(data.username));
    if (data.email) localStorage.setItem('email', String(data.email).toLowerCase());
    if (data.avatar_choice !== undefined) localStorage.setItem('avatar_choice', String(data.avatar_choice || ''));
    if (data.statut) localStorage.setItem('mixo_account_status', JSON.stringify(data));
};

const clearSessionProfile = () => {
    ['access_token', 'refresh_token', 'user_id', 'user_role', 'username', 'email', 'avatar_choice']
        .forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem('mixo_account_status');
};

const firebaseErrorMessage = (error) => {
    const code = error?.code || '';
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Cette adresse email est déjà utilisée.';
        case 'auth/invalid-email':
            return "L'adresse email est invalide.";
        case 'auth/weak-password':
            return 'Le mot de passe est trop faible.';
        case 'auth/missing-password':
            return 'Le mot de passe est requis.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Identifiants incorrects.';
        case 'auth/operation-not-allowed':
            return "La connexion Email/Mot de passe n'est pas activée dans Firebase Auth.";
        case 'auth/unauthorized-domain':
            return "Domaine non autorisé par Firebase Auth. Ajoute localhost/127.0.0.1 dans les Authorized domains.";
        case 'auth/api-key-not-valid':
        case 'auth/configuration-not-found':
        case 'auth/app-not-authorized':
            return "Configuration Firebase invalide ou projet mal relié. Vérifie apiKey, authDomain et projectId.";
        case 'auth/too-many-requests':
            return 'Trop de tentatives. Réessayez plus tard.';
        case 'auth/network-request-failed':
            return 'Problème réseau. Réessayez.';
        case 'auth/requires-recent-login':
            return 'Reconnectez-vous avant d’effectuer cette action.';
        default:
            return error?.message || 'Une erreur est survenue.';
    }
};

const extractApiErrorMessage = (error, fallback = 'Une erreur est survenue.') => {
    const data = error?.response?.data;
    if (!data) return firebaseErrorMessage(error) || fallback;

    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
        return data.non_field_errors[0];
    }

    const firstFieldError = Object.values(data).flat().find((item) => typeof item === 'string' && item.trim());
    if (firstFieldError) return firstFieldError;

    return firebaseErrorMessage(error) || fallback;
};

export const AuthentificationUtilisateurs = {
    async register(userData) {
        const {
            email,
            password,
            username,
            role = 'CLIENT',
            avatar_choice = '',
            recaptcha_token,
        } = userData || {};
        if (!email || !password || !username) {
            throw new Error("Email, nom d'utilisateur et mot de passe requis.");
        }

        let createdUser = null;
        try {
            createdUser = await createUserWithEmailAndPassword(auth, email.trim(), password);
            if (createdUser.user) {
                await sendEmailVerification(createdUser.user);
            }

            const idToken = await createdUser.user.getIdToken(true);
            const response = await api.post('auth/firebase/inscription/', {
                id_token: idToken,
                username: username.trim(),
                role,
                avatar_choice,
                recaptcha_token,
            });
            clearSessionProfile();
            await signOut(auth);
            return response.data;
        } catch (error) {
            console.error('[Firebase register]', {
                code: error?.code,
                message: error?.message,
                status: error?.response?.status,
                response: error?.response?.data,
                customData: error?.customData,
            });
            if (createdUser?.user) {
                try { await deleteUser(createdUser.user); } catch {}
            }
            throw new Error(extractApiErrorMessage(error));
        }
    },

    async login(credentials) {
        const email = (credentials?.email || '').trim();
        const password = credentials?.password || '';
        if (!email || !password) {
            throw new Error("Email et mot de passe requis.");
        }

        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await user.getIdToken(true);
            const { data } = await api.post('auth/firebase/connexion/', { id_token: idToken });
            setSessionProfile(data);
            return data;
        } catch (error) {
            console.error('[Firebase login]', {
                code: error?.code,
                message: error?.message,
                status: error?.response?.status,
                response: error?.response?.data,
                customData: error?.customData,
            });
            const status = error?.response?.status;
            const data = error?.response?.data;
            try { await signOut(auth); } catch {}

            if (status === 403 && data?.statut === 'EMAIL_NON_VERIFIE') {
                throw new Error(data.detail || "Veuillez vérifier votre email Firebase.");
            }
            if (status === 423) {
                throw new Error(data?.detail || "Compte verrouillé. Réessayez dans 15 minutes.");
            }
            if (status === 403) {
                if (data?.statut === 'EN_ATTENTE') throw new Error(data?.detail || 'Compte en attente.');
                if (data?.statut === 'BANNI' || data?.statut === 'INACTIF') {
                    localStorage.setItem('mixo_account_status', JSON.stringify(data || {}));
                    if (window.navigate) window.navigate('/compte-suspendu');
                    else window.location.href = '/compte-suspendu';
                    throw new Error(data?.detail || 'Accès refusé.');
                }
                throw new Error(data?.detail || 'Accès refusé.');
            }

            throw new Error(extractApiErrorMessage(error));
        }
    },

    async forgotPassword(email) {
        if (!email) throw new Error('Email requis.');
        return sendPasswordResetEmail(auth, email.trim());
    },

    async logout() {
        clearSessionProfile();
        try { await signOut(auth); } catch {}
        if (window.navigate) window.navigate('/login');
        else window.location.href = '/login';
    },

    isAuthenticated: () => !!auth.currentUser,
    currentUser: () => auth.currentUser,
};

export const ProfilUtilisateur = {
    getUserProfile: async (role, id) => {
        try {
            const ep = role === 'client' ? `auth/clients/${id}/` : `auth/coiffeurs/${id}/`;
            return (await api.get(ep)).data;
        } catch (error) {
            throw error.response?.data || new Error('Impossible de charger le profil');
        }
    },
    updateUserFields: async (id, fields) => {
        try { return (await api.patch(`auth/profil/${id}/`, fields)).data; }
        catch (error) { throw error.response?.data || new Error('Erreur mise à jour'); }
    },
    updateProfileFields: async (role, id, fields) => {
        try {
            const ep = role === 'client' ? `auth/clients/${id}/` : `auth/coiffeurs/${id}/`;
            return (await api.patch(ep, fields)).data;
        } catch (error) { throw error.response?.data || new Error('Erreur mise à jour profil'); }
    },
    getCurrentUser: () => ({
        id: localStorage.getItem('user_id'),
        role: localStorage.getItem('user_role'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        avatarChoice: localStorage.getItem('avatar_choice'),
    }),
};

export default api;
