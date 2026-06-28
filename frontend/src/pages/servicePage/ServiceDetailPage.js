/**
 * ServiceDetailPage.js — MIXO
 * Espace Client — Détail d'un service (Image 1)
 * URL : /services/:id
 */
import { Navbar }                   from '../../components/navbars/Navbar.js';
import { Footer }                   from '../../components/Footer.js';
import { ServiceGallerySlider }     from '../../components/servicesComponents/ServiceGallerySlider.js';
import { BarbierSidebarCard }       from '../../components/servicesComponents/BarbierSidebarCard.js';
import { ReservationSecuriseeCard } from '../../components/servicesComponents/ReservationSecuriseeCard.js';
import { ServiceAPI }               from '../../api/ServiceAPI.js';
import { FavorisAPI }               from '../../api/FavorisAPI.js';
import { requireAuth }              from '../../utils/AuthGuard.js';
import { showToast }                from '../../utils/toast.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/serviceStyles/ServiceDetail.css';

export const ServiceDetailPage = ({ id } = {}) => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'sdp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'sdp-main';
    main.innerHTML = `<div class="sdp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const charger = async () => {
        try {
            const s = await ServiceAPI.getServiceDetail(id);

            main.innerHTML = `
                <div class="sdp-layout">

                    <div class="sdp-content">
                        <div id="sdp-gallery"></div>

                        <div class="sdp-info">
                            <div class="sdp-title-row">
                                <h1 class="sdp-title">${escapeHtml(s.nom_prestation)}</h1>
                                <div class="sdp-title-actions">
                                    <button class="sdp-icon-btn" id="sdp-share" type="button" title="Partager">
                                        <i data-lucide="share-2"></i>
                                    </button>
                                    <button class="sdp-icon-btn" id="sdp-fav" type="button" title="Favoris">
                                        <i data-lucide="heart"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="sdp-meta-row">
                                <i data-lucide="clock"></i> ${s.duree_minutes} min
                                <span class="sdp-sep">•</span>
                                <span class="sdp-price">${formatPrix(s.prix)}€</span>
                            </div>

                            <p class="sdp-description">${escapeHtml(s.description) || 'Aucune description disponible pour ce service.'}</p>

                            <div class="sdp-actions">
                                <button class="sdp-btn sdp-btn-primary" id="sdp-reserver" type="button">
                                    <i data-lucide="calendar"></i> Réserver maintenant
                                </button>
                                <button class="sdp-btn sdp-btn-outline" id="sdp-retour" type="button">
                                    Retour au catalogue
                                </button>
                            </div>
                        </div>
                    </div>

                    <aside class="sdp-sidebar" id="sdp-sidebar"></aside>
                </div>
            `;

            let isFav = !!s.est_favori;

            // ── Galerie ──────────────────────────────────────────
            const galleryUrls = (s.galerie || []).map(g => g.image);
            main.querySelector('#sdp-gallery').appendChild(
                ServiceGallerySlider(s.image, galleryUrls)
            );

            // ── Sidebar ──────────────────────────────────────────
            const sidebar = main.querySelector('#sdp-sidebar');
            sidebar.appendChild(BarbierSidebarCard({
                id: s.coiffeur,
                username: s.coiffeur_username,
                photo: s.coiffeur_photo,
                note_moyenne: s.note_moyenne ?? 4.9,
                nb_avis: s.nb_avis ?? 0,
                bio: s.coiffeur_bio,
                langues: s.coiffeur_langues || 'Français',
                certifie: true,
            }));
            sidebar.appendChild(ReservationSecuriseeCard());

            // ── Actions ──────────────────────────────────────────
            main.querySelector('#sdp-retour').addEventListener('click', () => window.navigate?.('/services'));
            main.querySelector('#sdp-reserver').addEventListener('click', () => window.navigate?.(`/services/${id}/reserver`));
            const favBtn = main.querySelector('#sdp-fav');
            const syncFavUI = () => {
                favBtn.classList.toggle('sdp-fav-active', isFav);
                favBtn.title = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';
            };
            syncFavUI();
            favBtn.addEventListener('click', async () => {
                try {
                    const res = await FavorisAPI.toggle(id);
                    isFav = !!res.ajoute || false;
                    if (typeof res.count === 'number') {
                        window.dispatchEvent(new CustomEvent('mixo:favorites-updated', { detail: { count: res.count } }));
                    }
                    syncFavUI();
                    showToast(isFav ? 'Service ajouté aux favoris.' : 'Service retiré des favoris.');
                } catch (error) {
                    showToast(error.response?.data?.detail || 'Impossible de mettre à jour les favoris.', 'error');
                }
            });
            main.querySelector('#sdp-share').addEventListener('click', () => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('🔗 Lien copié dans le presse-papiers !');
            });

            if (window.lucide) window.lucide.createIcons();

        } catch {
            main.innerHTML = `
                <div class="sdp-error">
                    <i data-lucide="alert-triangle"></i>
                    <p>Ce service est introuvable ou n'est plus disponible.</p>
                    <button class="sdp-btn sdp-btn-outline" id="sdp-back-error" type="button">Retour au catalogue</button>
                </div>`;
            main.querySelector('#sdp-back-error').addEventListener('click', () => window.navigate?.('/services'));
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
