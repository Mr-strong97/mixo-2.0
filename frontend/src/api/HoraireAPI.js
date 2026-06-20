import { api } from './axiosConfig.js';

export const HoraireAPI = {
    getMesHoraires: async () => (await api.get('planning/mes-horaires/')).data,
    creerHoraire: async (payload) => (await api.post('planning/mes-horaires/', payload)).data,
    modifierHoraire: async (id, payload) => (await api.patch(`planning/mes-horaires/${id}/`, payload)).data,
    supprimerHoraire: async (id) => (await api.delete(`planning/mes-horaires/${id}/`)).data,
};

export default HoraireAPI;
