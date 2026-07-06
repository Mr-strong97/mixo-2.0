import { ServiceAPI } from './ServiceAPI.js';

export const AdminServicesAPI = {
    getServices: (params = {}) => ServiceAPI.getServices(params),
    getServiceDetail: (id) => ServiceAPI.getServiceDetail(id),
    suspendreService: (id) => ServiceAPI.desactiverService(id),
    supprimerService: (id) => ServiceAPI.supprimerService(id),
};

export default AdminServicesAPI;
