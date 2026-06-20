import { api } from './axiosConfig.js';

export const AdminPortfolioAPI = {
    getMedias: async (signaleSeulement = false) => (
        await api.get('admin/extended/portfolio/', {
            params: signaleSeulement ? { signale: 1 } : {},
        })
    ).data,
    signalerMedia: async (id, motif) => (await api.patch(`admin/extended/portfolio/${id}/signaler/`, { motif_signalement: motif })).data,
    supprimerMedia: async (id) => (await api.delete(`admin/extended/portfolio/${id}/`)).data,
};

export default AdminPortfolioAPI;
