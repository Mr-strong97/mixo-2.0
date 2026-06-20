import { api } from './axiosConfig.js';

export const AdminHorairesAPI = {
    getHoraires: async () => (await api.get('admin/extended/horaires/')).data,
    getAnomalies: async () => (await api.get('admin/extended/horaires/anomalies/')).data,
    getDisponibilites: async () => (await api.get('admin/extended/disponibilites/')).data,
};

export default AdminHorairesAPI;
