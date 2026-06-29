/**
 * AdminService.js — MIXO
 * Toutes les méthodes API pour l'administration.
 */
import { api } from './axiosConfig.js';

const err = (error, fallback) => {
    const s   = error.response?.status;
    const msg = error.response?.data?.detail || fallback;
    console.error(`AdminService [${s || 'réseau'}]:`, msg);
    throw new Error(s ? `[${s}] ${msg}` : msg);
};

export const AdminUtilisateurs = {
    getDashboardStats:    async () => { try { return (await api.get('admin/dashboard/')).data; } catch(e){ err(e,"Statistiques indisponibles."); } },
    getPlatformDashboard: async () => { try { return (await api.get('admin/dashboard/')).data; } catch(e){ err(e,"Tableau de bord indisponible."); } },
    getUserStats:         async () => { try { return (await api.get('admin/stats/utilisateurs/')).data; } catch(e){ err(e,"Stats utilisateurs indisponibles."); } },
    getPendingUsers:      async () => { try { return (await api.get('admin/comptes/en-attente/')).data; } catch(e){ err(e,"En attente indisponibles."); } },
    getActiveHairdressers:async () => { try { return (await api.get('admin/comptes/coiffeurs/')).data; } catch(e){ err(e,"Coiffeurs indisponibles."); } },
    getClients:           async (statut='ACTIF') => { try { return (await api.get(`admin/comptes/clients/?statut=${statut}`)).data; } catch(e){ err(e,"Clients indisponibles."); } },
    getAllUsers:           async (params={}) => {
        try {
            const q = new URLSearchParams(params).toString();
            return (await api.get(`admin/comptes/tous/?${q}`)).data;
        } catch(e){ err(e,"Utilisateurs indisponibles."); }
    },
    validateUser:         async (userId) => { try { return (await api.patch(`admin/comptes/${userId}/decision/`, { action:'valider' })).data; } catch(e){ err(e,"Erreur validation."); } },
    rejectUser:           async (userId, raison='') => { try { return (await api.patch(`admin/comptes/${userId}/decision/`, { action:'rejeter', raison })).data; } catch(e){ err(e,"Erreur rejet."); } },
    suspendUser:          async (userId, raison, duree='') => { try { return (await api.patch(`admin/comptes/${userId}/suspendre/`, { action:'suspendre', raison, duree })).data; } catch(e){ err(e,e.response?.data?.detail||"Erreur suspension."); } },
    banUser:              async (userId, raison) => { try { return (await api.patch(`admin/comptes/${userId}/suspendre/`, { action:'bannir', raison })).data; } catch(e){ err(e,e.response?.data?.detail||"Erreur bannissement."); } },
    reactivateUser:       async (userId) => { try { return (await api.patch(`admin/comptes/${userId}/suspendre/`, { action:'reactiver' })).data; } catch(e){ err(e,"Erreur réactivation."); } },
    getReactivationRequests: async () => { try { return (await api.get('admin/reactivations/')).data; } catch(e){ err(e,"Demandes indisponibles."); } },
    getAuditLogs:         async (params={}) => {
        try {
            const q = new URLSearchParams(params).toString();
            return (await api.get(`admin/audit/?${q}`)).data;
        } catch(e){ err(e,"Journal indisponible."); }
    },
    getRendezVous: async (params = {}) => {
        try {
            const q = new URLSearchParams(params).toString();
            return (await api.get(`admin/extended/rendez-vous/${q ? `?${q}` : ''}`)).data;
        } catch (e) { err(e, "Rendez-vous indisponibles."); }
    },
    getRendezVousStats: async () => {
        try { return (await api.get('admin/extended/rendez-vous/stats/')).data; }
        catch (e) { err(e, "Stats rendez-vous indisponibles."); }
    },
    getRendezVousDetail: async (id) => {
        try { return (await api.get(`admin/extended/rendez-vous/${id}/`)).data; }
        catch (e) { err(e, "Détail rendez-vous indisponible."); }
    },
    updateRendezVous: async (id, payload) => {
        try { return (await api.patch(`admin/extended/rendez-vous/${id}/modifier/`, payload)).data; }
        catch (e) { err(e, e.response?.data?.detail || "Impossible de modifier le rendez-vous."); }
    },
    cancelRendezVous: async (id, payload = {}) => {
        try { return (await api.post(`admin/extended/rendez-vous/${id}/annuler/`, payload)).data; }
        catch (e) { err(e, e.response?.data?.detail || "Impossible d'annuler le rendez-vous."); }
    },
    suspendRendezVous: async (id, payload = {}) => {
        try { return (await api.post(`admin/extended/rendez-vous/${id}/suspendre/`, payload)).data; }
        catch (e) { err(e, e.response?.data?.detail || "Impossible de suspendre le rendez-vous."); }
    },
    getSecurityOverview: async () => {
        try { return (await api.get('admin/security/')).data; }
        catch (e) { err(e, "Sécurité indisponible."); }
    },
    revokeSessions: async (scope = 'others') => {
        try { return (await api.post('admin/security/revoke-sessions/', { scope })).data; }
        catch (e) { err(e, "Impossible de révoquer les sessions."); }
    },
};

export default AdminUtilisateurs;
