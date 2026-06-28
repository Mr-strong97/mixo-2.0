/**
 * NotificationAPI.js — MIXO
 * Wrapper API du module Notifications.
 */
import axiosInstance from './axiosConfig.js';

const _data = (promise) => promise.then(r => r.data);

export const NotificationAPI = {

    getMesNotifications(page = 1) {
        return _data(axiosInstance.get(`notifications/?page=${page}`));
    },

    marquerLue(id) {
        return _data(axiosInstance.patch(`notifications/${id}/lire/`));
    },

    marquerToutesLues() {
        return _data(axiosInstance.patch('notifications/tout-lire/'));
    },

    getNonLues() {
        return _data(axiosInstance.get('notifications/'))
            .then(data => ({ count: data.non_lues || 0 }));
    },
};

export default NotificationAPI;
