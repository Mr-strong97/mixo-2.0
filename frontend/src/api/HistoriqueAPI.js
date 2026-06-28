/**
 * HistoriqueAPI.js — MIXO
 * Couche API du module Historique.
 */
import api from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const HistoriqueAPI = {
    getMesActivites(params = {}) {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) qs.append(k, v);
        });
        const query = qs.toString();
        return _data(api.get(`historique/mes-activites/${query ? `?${query}` : ''}`));
    },
};

