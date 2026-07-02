/**
 * RendezVousAPI.js — MIXO
 * Wrapper API du module Rendez-vous.
 */
import axiosInstance from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const RendezVousAPI = {

    getCreneauxDisponibles(coiffeurId, date, serviceId) {
        return _data(axiosInstance.get(
            `rendez-vous/creneaux-disponibles/${coiffeurId}/?date=${date}&service_id=${serviceId}`
        ));
    },

    creer(serviceId, dateHeureDebutISO) {
        return _data(axiosInstance.post('rendez-vous/creer/', {
            service: serviceId,
            date_heure_debut: dateHeureDebutISO,
        }));
    },

    getMesDemandes(statut = '', search = '') {
        const params = new URLSearchParams();
        if (statut) params.set('statut', statut);
        if (search) params.set('search', search);
        const qs = params.toString();
        return _data(axiosInstance.get(`rendez-vous/mes-demandes/${qs ? `?${qs}` : ''}`));
    },

    getMesRendezVous(statut = '', search = '') {
        const params = new URLSearchParams();
        if (statut) params.set('statut', statut);
        if (search) params.set('search', search);
        const qs = params.toString();
        return _data(axiosInstance.get(`rendez-vous/mes-rendez-vous/${qs ? `?${qs}` : ''}`));
    },

    getDetail(id) {
        return _data(axiosInstance.get(`rendez-vous/${id}/`));
    },

    accepter(id) {
        return _data(axiosInstance.post(`rendez-vous/${id}/accepter/`));
    },

    refuser(id) {
        return _data(axiosInstance.post(`rendez-vous/${id}/refuser/`));
    },

    annuler(id) {
        return _data(axiosInstance.post(`rendez-vous/${id}/annuler/`));
    },

    terminer(id) {
        return _data(axiosInstance.post(`rendez-vous/${id}/terminer/`));
    },
};

export default RendezVousAPI;
