/**
 * AdminRendezVousAPI.js — MIXO · Admin
 */
import axiosInstance from './axiosConfig.js';
const _data = p => p.then(r => r.data);

export const AdminRendezVousAPI = {
    getListe(params = {}) {
        const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString();
        return _data(axiosInstance.get(`admin/extended/rendez-vous/${q ? '?' + q : ''}`));
    },
    getStats() { return _data(axiosInstance.get('admin/extended/rendez-vous/stats/')); },
};
