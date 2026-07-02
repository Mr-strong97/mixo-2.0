/**
 * CoiffeurServiceDetailPage.js — MIXO
 * Espace Coiffeur — Consultation détaillée d'un service ("Voir")
 * URL : /coiffeur/services/:id
 */
import { Navbar }               from '../../components/navbars/Navbar.js';
import { Footer }                from '../../components/Footer.js';
import { ServiceGallerySlider }  from '../../components/servicesComponents/ServiceGallerySlider.js';
import { ServiceAPI }            from '../../api/ServiceAPI.js';
import { requireRole }           from '../../utils/AuthGuard.js';
import { showToast }             from '../../utils/toast.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/serviceStyles/CoiffeurServices.css';

const STATUT_INFO = {
    actif:      { label: 'En ligne',   color: '#16A34A' },
    inactif:    { label: 'Désactivé',  color: '#D97706' },
    en_attente: { label: 'En attente', color: '#0A66C2' },
};

export const CoiffeurServiceDetailPage = ({ id } = {}) => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'cvd-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'cvd-main';
    main.innerHTML = `<div class="cvd-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const charger = async () => {
        try {
            const s = await ServiceAPI.getServiceDetail(id);
            const statutInfo = STATUT_INFO[s.statut] || STATUT_INFO.actif;
            const date = s.created_at
                ? new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—';

            main.innerHTML = `
                <div class="cvd-header">
                    <button class="cvd-back" id="cvd-back" type="button" title="Retour">
                        <i data-lucide="arrow-left"></i>
                    </button>
                    <h1>${escapeHtml(s.nom_prestation)}</h1>
                    <span class="cvd-status" style="background:${statutInfo.color}15;color:${statutInfo.color};">
                        <span class="cvd-status-dot" style="background:${statutInfo.color};"></span>
                        Statut : ${statutInfo.label}
                    </span>
                </div>

                <div class="cvd-layout">
                    <div id="cvd-gallery"></div>

                    <div class="cvd-info-card">
                        <div class="cvd-row"><span>Catégorie</span><strong>${escapeHtml(s.categorie_nom || '—')}</strong></div>
                        <div class="cvd-row"><span>Prix</span><strong>${formatPrix(s.prix)} FC</strong></div>
                        <div class="cvd-row"><span>Durée</span><strong>${s.duree_minutes} min</strong></div>
                        <div class="cvd-row"><span>Ville / Salon</span><strong>${escapeHtml(s.ville || '—')}</strong></div>
                        <div class="cvd-row"><span>Publié le</span><strong>${date}</strong></div>
                        <div class="cvd-row"><span>Réservations liées</span><strong>${s.nb_reservations ?? 0}</strong></div>

                        <div class="cvd-desc">
                            <span class="cvd-desc-label">Description</span>
                            <p>${escapeHtml(s.description) || 'Aucune description renseignée.'}</p>
                        </div>

                        <div class="cvd-btn-row">
                            <button class="cvd-edit-btn" id="cvd-edit" type="button">
                                <i data-lucide="pencil"></i> Modifier ce service
                            </button>
                            <button class="cvd-toggle-btn" id="cvd-toggle" type="button">
                                <i data-lucide="${s.statut === 'actif' && s.actif ? 'pause-circle' : 'check-circle'}"></i>
                                ${s.statut === 'actif' && s.actif ? 'Désactiver' : 'Activer'}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const galleryUrls = (s.galerie || []).map(g => g.image);
            main.querySelector('#cvd-gallery').appendChild(ServiceGallerySlider(s.image, galleryUrls));

            main.querySelector('#cvd-back').addEventListener('click', () => window.navigate?.('/coiffeur/services'));
            main.querySelector('#cvd-edit').addEventListener('click', () => window.navigate?.(`/coiffeur/services/${id}/edit`));
            main.querySelector('#cvd-toggle').addEventListener('click', async () => {
                try {
                    if (s.statut === 'actif' && s.actif) await ServiceAPI.desactiverService(id);
                    else await ServiceAPI.activerService(id);
                    showToast('✅ Statut mis à jour.');
                    charger();
                } catch (e) { showToast(`❌ ${e.message || 'Erreur.'}`); }
            });

            if (window.lucide) window.lucide.createIcons();

        } catch {
            main.innerHTML = `
                <div class="cvd-error">
                    <i data-lucide="alert-triangle"></i>
                    <p>Ce service est introuvable.</p>
                    <button class="cvd-edit-btn" id="cvd-error-back" type="button">Retour à mes services</button>
                </div>`;
            main.querySelector('#cvd-error-back').addEventListener('click', () => window.navigate?.('/coiffeur/services'));
            if (window.lucide) window.lucide.createIcons();
        }
    };

    charger();
    return page;
};

// ── Helpers ─────────────────────────────────────────────────
function formatPrix(prix) {
    const n = parseFloat(prix);
    if (Number.isNaN(n)) return '0';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}