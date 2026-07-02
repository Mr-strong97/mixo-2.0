/**
 * PaiementAPI.js — MIXO
 * Wrapper API du module Paiements.
 */
import axiosInstance from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const PaiementAPI = {

    initier(rendezVousId, methode, numeroBonTelephone = '') {
        return _data(axiosInstance.post(`paiements/initier/${rendezVousId}/`, {
            methode,
            numero_telephone: numeroBonTelephone,
        }));
    },

    payerSurPlace(rendezVousId) {
        return _data(axiosInstance.post(`paiements/sur-place/${rendezVousId}/`));
    },

    getMesPaiements() {
        return _data(axiosInstance.get('paiements/mes-paiements/'));
    },

    getMesFactures() {
        return _data(axiosInstance.get('paiements/factures/'));
    },

    getFactureDetail(id) {
        return _data(axiosInstance.get(`paiements/factures/${id}/`));
    },

    getDetail(id) {
        return _data(axiosInstance.get(`paiements/${id}/`));
    },

    rembourser(id) {
        return _data(axiosInstance.post(`paiements/${id}/rembourser/`));
    },
};

export default PaiementAPI;
