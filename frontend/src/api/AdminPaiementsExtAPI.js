/**
 * AdminPaiementsExtAPI.js — MIXO · Admin
 */
import axiosInstance from './axiosConfig.js';
const _data = p => p.then(r => r.data);

export const AdminPaiementsExtAPI = {
    getListe(params = {}) {
        const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString();
        return _data(axiosInstance.get(`admin/extended/paiements/${q ? '?' + q : ''}`));
    },
    getStats() { return _data(axiosInstance.get('admin/extended/paiements/stats/')); },
    getDetail(id) { return _data(axiosInstance.get(`admin/extended/paiements/${id}/`)); },
};
