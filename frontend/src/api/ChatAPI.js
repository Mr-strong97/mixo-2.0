/**
 * ChatAPI.js — MIXO
 * API du module Discussion / Chat.
 */
import api from './axiosConfig.js';

const _data = (promise) => promise.then((response) => response.data);

const buildQuery = (params = {}) => {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
    if (!entries.length) return '';
    return `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()}`;
};

export const ChatAPI = {
    getSummary() {
        return _data(api.get('chat/summary/'));
    },

    getConversations() {
        return _data(api.get('chat/conversations/'));
    },

    getAdminConversations() {
        return _data(api.get('chat/conversations/admin/'));
    },

    getRendezVous() {
        return _data(api.get('chat/rendez-vous/'));
    },

    openFromRendezVous(rendezVousId) {
        return _data(api.post('chat/conversations/from-rdv/', { rendez_vous_id: rendezVousId }));
    },

    getConversation(conversationId) {
        return _data(api.get(`chat/conversations/${conversationId}/`));
    },

    getMessages(conversationId, params = {}) {
        return _data(api.get(`chat/conversations/${conversationId}/messages/${buildQuery(params)}`));
    },

    sendMessage(conversationId, content) {
        return _data(api.post(`chat/conversations/${conversationId}/messages/`, { content }));
    },

    markRead(conversationId) {
        return _data(api.post(`chat/conversations/${conversationId}/read/`));
    },

    setTyping(conversationId, isTyping = true) {
        return _data(api.post(`chat/conversations/${conversationId}/typing/`, { is_typing: Boolean(isTyping) }));
    },
};

export default ChatAPI;

