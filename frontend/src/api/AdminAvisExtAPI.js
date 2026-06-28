/**
 * AdminAvisExtAPI.js — MIXO · Admin
 */
import axiosInstance from './axiosConfig.js';
const _data = p => p.then(r => r.data);

export const AdminAvisExtAPI = {
    getListe(signaleSeulement = false) {
        return _data(axiosInstance.get(`admin/extended/avis/${signaleSeulement ? '?signale=true' : ''}`));
    },
    supprimer(id) { return _data(axiosInstance.delete(`admin/extended/avis/${id}/`)); },
    leverSignalement(id) { return _data(axiosInstance.patch(`admin/extended/avis/${id}/lever-signalement/`)); },
};
