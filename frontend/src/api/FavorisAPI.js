/**
 * FavorisAPI.js — MIXO
 * Couche API du module Favoris.
 */
import api from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const FavorisAPI = {
    getMesFavoris() {
        return _data(api.get('favoris/'));
    },

    toggle(serviceId) {
        return _data(api.post('favoris/toggle/', { service_id: serviceId }));
    },

    add(serviceId) {
        return _data(api.post('favoris/', { service_id: serviceId }));
    },

    remove(favoriId) {
        return _data(api.delete(`favoris/${favoriId}/`));
    },

    compter() {
        return _data(api.get('favoris/compter/'));
    },

    estFavori(serviceId) {
        return _data(api.get(`favoris/service/${serviceId}/`));
    },
};

