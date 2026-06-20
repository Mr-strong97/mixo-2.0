import { ServiceAPI } from './ServiceAPI.js';

export const AdminServicesAPI = {
    getServices: (params = {}) => ServiceAPI.getServices(params),
    suspendreService: (id) => ServiceAPI.desactiverService(id),
    supprimerService: (id) => ServiceAPI.supprimerService(id),
};

export default AdminServicesAPI;
