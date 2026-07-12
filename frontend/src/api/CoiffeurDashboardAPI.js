/**
 * CoiffeurDashboardAPI.js — MIXO
 * API du tableau de bord professionnel.
 */
import api from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const CoiffeurDashboardAPI = {
    getMonDashboard() {
        return _data(api.get('dashboard-coiffeur/mon-dashboard/', { timeout: 30000 }));
    },

    getStatsCoiffeurs() {
        return _data(api.get('dashboard-coiffeur/stats-coiffeurs/', { timeout: 30000 }));
    },
};
