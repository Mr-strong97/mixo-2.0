import axios from 'axios';

// 1. Configuration de l'instance
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour ajouter le token à chaque requête (indispensable pour le profil)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AuthentificationUtilisateurs = {
    // INSCRIPTION
    async register(userData) {
        try {
            const response = await api.post('/auth/inscription/', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || "Erreur d'inscription";
        }
    },

    // CONNEXION
    async login(credentials) {
        try {
            const response = await api.post('/auth/connexion/', credentials);
            
            // Stockage automatique des infos reçues (Règle 1: DRY)
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('user_role', response.data.role);
                localStorage.setItem('username', response.data.username);
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data || "Erreur de connexion";
        }
    },

    // RÉCUPÉRATION DU PROFIL (L'erreur était ici !)
    async getUserProfile(role, id) {
        try {
            // On s'assure que le pluriel est correct pour l'URL Django
            const endpoint = `/auth/${role}s/${id}/`; 
            const response = await api.get(endpoint);
            return response.data;
        } catch (error) {
            console.error(`Erreur profil ${role}:`, error);
            throw error.response?.data || "Impossible de charger le profil";
        }
    },

    // DÉCONNEXION
    logout() {
        localStorage.clear();
        window.navigate('/login');
    }
};

export default api;