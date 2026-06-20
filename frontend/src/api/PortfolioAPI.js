import { api } from './axiosConfig.js';

export const PortfolioAPI = {
    getMonPortfolio: async () => (await api.get('media-portfolio/mon-portfolio/')).data,
    ajouterMedia: async (file) => {
        const fd = new FormData();
        fd.append('media', file);
        return (await api.post('media-portfolio/mon-portfolio/', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })).data;
    },
    modifierMedia: async (id, payload) => (await api.patch(`media-portfolio/${id}/`, payload)).data,
    supprimerMedia: async (id) => (await api.delete(`media-portfolio/${id}/`)).data,
    reordonner: async (ids) => (await api.post('media-portfolio/reordonner/', { ids })).data,
};

export default PortfolioAPI;
