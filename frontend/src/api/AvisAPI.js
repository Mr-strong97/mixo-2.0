/**
 * AvisAPI.js — MIXO
 * Wrapper API du module Avis.
 */
import axiosInstance from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const AvisAPI = {

    creerAvis(data) {
        return _data(axiosInstance.post('avis/creer/', data));
    },

    modifierAvis(avisId, data) {
        return _data(axiosInstance.patch(`avis/${avisId}/modifier/`, data));
    },

    getMesAvis() {
        return _data(axiosInstance.get('avis/mes-avis/'));
    },

    getMesAvisRecus() {
        return _data(axiosInstance.get('avis/mes-avis-recus/'));
    },

    getAvisCoiffeur(coiffeurId) {
        return _data(axiosInstance.get(`avis/coiffeur/${coiffeurId}/`));
    },

    repondre(avisId, reponse) {
        return _data(axiosInstance.patch(`avis/${avisId}/repondre/`, {
            reponse_coiffeur: reponse,
        }));
    },

    signaler(avisId) {
        return _data(axiosInstance.patch(`avis/${avisId}/signaler/`));
    },
};

export default AvisAPI;
