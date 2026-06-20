import { api } from './axiosConfig.js';

export const AbonnementAPI = {
    getMonStatut: async () => (await api.get('abonnements/mon-statut/')).data,
    getPlans: async () => (await api.get('abonnements/plans/')).data,
    souscrire: async (planId) => (await api.post(`abonnements/souscrire/${planId}/`)).data,
    annuler: async () => (await api.post('abonnements/annuler/')).data,
};

export default AbonnementAPI;
