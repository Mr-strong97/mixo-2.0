/**
 * AuthService.js — MIXO
 * Relais vers le client centralisé (axiosConfig.js).
 * Toute la logique d'authentification réelle vit dans axiosConfig.js (Firebase).
 * Ce fichier ne doit contenir AUCUNE instance axios ni AUCUN fallback d'URL.
 */
import { AuthentificationUtilisateurs, ProfilUtilisateur, api } from '../../api/axiosConfig.js';

export const AuthService = {
    register: AuthentificationUtilisateurs.register,
    login: AuthentificationUtilisateurs.login,
    logout: AuthentificationUtilisateurs.logout,
    forgotPassword: AuthentificationUtilisateurs.forgotPassword,
    isAuthenticated: AuthentificationUtilisateurs.isAuthenticated,
    currentUser: AuthentificationUtilisateurs.currentUser,
    getUserProfile: ProfilUtilisateur.getUserProfile,
};

export default api;