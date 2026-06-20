import { api } from './axiosConfig.js';

export const DisponibiliteAPI = {
    getMesExceptions: async () => (await api.get('planning/mes-exceptions/')).data,
    creerException: async (payload) => (await api.post('planning/mes-exceptions/', payload)).data,
    supprimerException: async (id) => (await api.delete(`planning/mes-exceptions/${id}/`)).data,
};

export default DisponibiliteAPI;
