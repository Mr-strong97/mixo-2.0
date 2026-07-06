// ============================================================
//  ServiceAPI.js — MIXO · Couche API du module Services (v3)
//
//  CORRECTIONS appliquées :
//  ✅ createService  → POST   services/          (pas /creer/)
//  ✅ updateService  → PATCH  services/<id>/     (pas /modifier/)
//  ✅ deleteService  → DELETE services/<id>/     (pas /supprimer/)
//  ✅ activerService → POST   services/<id>/activer/   (pas PATCH)
//  ✅ desactiver     → POST   services/<id>/desactiver/ (pas PATCH)
//  ✅ Pagination DRF normalisée → {resultats, total, pages, page}
// ============================================================

import axiosInstance from './axiosConfig.js';
import { getFirebaseIdToken } from '../firebase-config.js';

// ── Helpers ──────────────────────────────────────────────────
async function _authHeader() {
    const token = await getFirebaseIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Construit une query string en ignorant les valeurs vides/nulles */
function _url(path, params = {}) {
    const q = Object.entries(params)
        .filter(([, v]) => v !== '' && v !== null && v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    return q ? `${path}?${q}` : path;
}

/** Extrait .data d'une réponse axios */
const _data = (promise) => promise.then(r => r.data);

/**
 * Normalise la réponse paginée DRF → format attendu par les pages Mixo.
 *
 * DRF retourne : { count, next, previous, results }
 * Pages Mixo attendent : { total, resultats, pages, page }
 */
const _normalizePage = (pageSize = 20) => (d) => {
    // Déjà au bon format (réponse non-paginée ou format personnalisé)
    if (Array.isArray(d))                return { resultats: d, total: d.length, pages: 1, page: 1 };
    if (d.resultats !== undefined)       return d;

    // Format DRF standard
    const total     = d.count    ?? d.total    ?? 0;
    const resultats = d.results  ?? d.resultats ?? [];
    const pages     = Math.max(1, Math.ceil(total / pageSize));

    return { resultats, total, pages, page: d.page ?? 1 };
};

// ════════════════════════════════════════════════════════════
export const ServiceAPI = {

    // ── Catégories ────────────────────────────────────────────
    getCategories() {
        return _data(axiosInstance.get('services/categories/'));
    },

    getCategorie(id) {
        return _data(axiosInstance.get(`services/categories/${id}/`));
    },


    // ── Espace Client — liste & détail ────────────────────────

    /**
     * Liste paginée des services actifs.
     * @param {Object} params { recherche, categorie, categorie_id, prix_max,
     *                          ville, page, page_size, par_page }
     */
    getServices(params = {}) {
        const pageSize = parseInt(params.par_page || params.page_size || 20);
        // DRF attend page_size, pas par_page
        const p = { ...params, page_size: pageSize };
        delete p.par_page;
        return _data(axiosInstance.get(_url('services/', p)))
            .then(_normalizePage(pageSize));
    },

    /** Détail complet d'un service (avec galerie). */
    getService(id) {
        return _data(axiosInstance.get(`services/${id}/`));
    },

    /** Alias — utilisé dans ServiceDetailPage et CoiffeurServiceDetailPage. */
    getServiceDetail(id) {
        return this.getService(id);
    },


    // ── Espace Coiffeur ────────────────────────────────────────

    /**
     * Mes services (tous statuts).
     * @param {Object} params { search, statut, page, page_size, par_page }
     */
    getMesServices(params = {}) {
        const pageSize = parseInt(params.par_page || params.page_size || 20);
        const p = { ...params, page_size: pageSize };
        delete p.par_page;
        return _data(axiosInstance.get(_url('services/mes-services/', p)))
            .then(_normalizePage(pageSize));
    },

    /** Statistiques du coiffeur connecté. */
    getStats() {
        return _data(axiosInstance.get('services/mes-services/stats/'));
    },


    // ── CRUD ──────────────────────────────────────────────────

    /**
     * ✅ CORRIGÉ — POST vers services/ (liste_services gère le POST)
     * @param {Object|FormData} data
     */
    createService(data) {
        const isFormData = data instanceof FormData;
        return _data(axiosInstance.post('services/', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
        }));
    },

    /** Alias */
    creerService(data) {
        return this.createService(data);
    },

    /**
     * ✅ CORRIGÉ — PATCH vers services/<id>/ (detail_service gère PATCH/PUT)
     * @param {string}          id
     * @param {Object|FormData} data
     * @param {boolean}         partial  true → PATCH (défaut)
     */
    updateService(id, data, partial = true) {
        const isFormData = data instanceof FormData;
        const method = partial ? 'patch' : 'put';
        return _data(axiosInstance[method](`services/${id}/`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
        }));
    },

    /** Alias */
    modifierService(id, data) {
        return this.updateService(id, data, true);
    },

    /**
     * ✅ CORRIGÉ — DELETE vers services/<id>/ (detail_service gère DELETE)
     * @param {string} id
     */
    deleteService(id) {
        return _data(axiosInstance.delete(`services/${id}/`));
    },

    /** Alias */
    supprimerService(id) {
        return this.deleteService(id);
    },

    /**
     * ✅ CORRIGÉ — POST (tes vues utilisent POST, pas PATCH)
     * @param {string} id
     */
    activerService(id) {
        return _data(axiosInstance.post(`services/${id}/activer/`));
    },

    /**
     * ✅ CORRIGÉ — POST (tes vues utilisent POST, pas PATCH)
     * @param {string} id
     */
    desactiverService(id) {
        return _data(axiosInstance.post(`services/${id}/desactiver/`));
    },


    // ── Galerie d'images ──────────────────────────────────────

    getGalerie(serviceId) {
        return _data(axiosInstance.get(`services/${serviceId}/galerie/`));
    },

    /**
     * @param {string}              serviceId
     * @param {FormData|FileList|File[]} files
     */
    addImage(serviceId, files) {
        const fd = files instanceof FormData ? files : (() => {
            const f = new FormData();
            Array.from(files).forEach(file => f.append('image', file));
            return f;
        })();
        return _data(axiosInstance.post(`services/${serviceId}/galerie/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }));
    },

    /** Alias */
    uploadGalerie(serviceId, files) {
        return this.addImage(serviceId, files);
    },

    deleteImage(serviceId, imageId) {
        return _data(axiosInstance.delete(`services/${serviceId}/galerie/${imageId}/delete/`));
    },

    /** Alias */
    supprimerImageGalerie(serviceId, imageId) {
        return this.deleteImage(serviceId, imageId);
    },


    // ── Fallback fetch natif ───────────────────────────────────

    async fetchJSON(url, options = {}) {
        const authHeader = await _authHeader();
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeader,
                ...(options.headers || {}),
            },
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw Object.assign(
                new Error(err.detail || err.error || `HTTP ${res.status}`),
                { status: res.status, data: err },
            );
        }
        return res.status === 204 ? null : res.json();
    },

    async fetchFormData(url, formData, method = 'POST') {
        const res = await fetch(url, { method, headers: await _authHeader(), body: formData });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw Object.assign(
                new Error(err.detail || err.error || `HTTP ${res.status}`),
                { status: res.status, data: err },
            );
        }
        return res.status === 204 ? null : res.json();
    },
};

// Export alias pour compatibilité avec les anciens imports { ServiceApi }
export { ServiceAPI as ServiceApi };
