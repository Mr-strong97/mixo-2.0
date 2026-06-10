// ============================================================
//  ServiceAPI.js — Couche API du module Services
//  Mixo · Module Services v2
//
//  Centralise tous les appels HTTP du module Services.
//  Utilise axiosConfig si disponible, sinon fetch natif.
// ============================================================

import axiosInstance from './axiosConfig.js';

// ── Helpers ────────────────────────────────────────────────────
function _authHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Construit une URL avec query params nettoyés (ignore les vides)
function _url(path, params = {}) {
  const q = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return q ? `${path}?${q}` : path;
}

// ══════════════════════════════════════════════════════════════
export const ServiceAPI = {

  // ── Catégories ─────────────────────────────────────────────

  /**
   * Liste toutes les catégories.
   * @returns {Promise}
   */
  getCategories() {
    return axiosInstance.get('/services/categories/');
  },

  /**
   * Détail d'une catégorie.
   * @param {string} id
   */
  getCategorie(id) {
    return axiosInstance.get(`/services/categories/${id}/`);
  },


  // ── Services Publics (Client) ───────────────────────────────

  /**
   * Liste paginée des services actifs (espace client).
   * @param {Object} params - { search, categorie_id, prix_max, ville, page, page_size }
   * @returns {Promise}
   */
  getServices(params = {}) {
    return axiosInstance.get(_url('/services/', params));
  },

  /**
   * Détail d'un service (lecture enrichie avec galerie).
   * @param {string} id
   */
  getService(id) {
    return axiosInstance.get(`/services/${id}/`);
  },


  // ── Services Coiffeur (Espace privé) ───────────────────────

  /**
   * Mes services — tous statuts, coiffeur connecté.
   * @param {Object} params - { search, statut, page, page_size }
   */
  getMesServices(params = {}) {
    return axiosInstance.get(_url('/services/mes-services/', params));
  },

  /**
   * Crée un nouveau service.
   * Accepte un FormData (multipart/form-data) si des images sont jointes.
   * @param {Object|FormData} data
   * @returns {Promise}
   */
  createService(data) {
    const isFormData = data instanceof FormData;
    return axiosInstance.post('/api/services/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /**
   * Met à jour un service (PUT complet ou PATCH partiel).
   * @param {string}         id
   * @param {Object|FormData} data
   * @param {boolean}        partial - true → PATCH
   */
  updateService(id, data, partial = false) {
    const isFormData = data instanceof FormData;
    const method = partial ? 'patch' : 'put';
    return axiosInstance[method](`/services/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /**
   * Supprime un service.
   * @param {string} id
   */
  deleteService(id) {
    return axiosInstance.delete(`/services/${id}/`);
  },

  /**
   * Active un service (statut → actif).
   * @param {string} id
   */
  activerService(id) {
    return axiosInstance.post(`/services/${id}/activer/`);
  },

  /**
   * Désactive un service (statut → inactif).
   * @param {string} id
   */
  desactiverService(id) {
    return axiosInstance.post(`/api/services/${id}/desactiver/`);
  },


  // ── Galerie d'images ────────────────────────────────────────

  /**
   * Liste les images d'un service.
   * @param {string} serviceId
   */
  getGalerie(serviceId) {
    return axiosInstance.get(`/services/${serviceId}/galerie/`);
  },

  /**
   * Ajoute une image à la galerie.
   * @param {string}   serviceId
   * @param {FormData} formData - doit contenir le champ "image"
   */
  addImage(serviceId, formData) {
    return axiosInstance.post(`/services/${serviceId}/galerie/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Supprime une image de la galerie.
   * @param {string} serviceId
   * @param {string} imageId
   */
  deleteImage(serviceId, imageId) {
    return axiosInstance.delete(`/services/${serviceId}/galerie/${imageId}/delete/`);
  },


  // ── Fallback fetch (sans axios) ────────────────────────────
  // Utilisé par les pages quand axiosConfig n'est pas disponible.

  async fetchJSON(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ..._authHeader(),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.detail || err.error || `HTTP ${res.status}`), { status: res.status, data: err });
    }
    if (res.status === 204) return null;
    return res.json();
  },

  async fetchFormData(url, formData, method = 'POST') {
    const res = await fetch(url, {
      method,
      headers: _authHeader(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.detail || err.error || `HTTP ${res.status}`), { status: res.status, data: err });
    }
    if (res.status === 204) return null;
    return res.json();
  },
};