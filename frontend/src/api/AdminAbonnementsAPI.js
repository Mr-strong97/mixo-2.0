import { api } from './axiosConfig.js';

export const AdminAbonnementsAPI = {
    getStats: async () => (await api.get('admin/extended/abonnements/stats/')).data,
    getPlans: async () => (await api.get('admin/extended/abonnements/plans/')).data,
    creerPlan: async (payload) => (await api.post('admin/extended/abonnements/plans/', payload)).data,
    modifierPlan: async (id, payload) => (await api.patch(`admin/extended/abonnements/plans/${id}/`, payload)).data,
    desactiverPlan: async (id) => (await api.delete(`admin/extended/abonnements/plans/${id}/`)).data,
};

export default AdminAbonnementsAPI;
