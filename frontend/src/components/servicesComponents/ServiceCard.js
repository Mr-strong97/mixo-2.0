/**
 * ServiceCard.js — MIXO
 * Carte service côté client — grille ClientServicesPage (Image 3).
 * Badge catégorie en haut à gauche, cœur favoris en haut à droite,
 * note + avis, avatar coiffeur, durée + ville, boutons Voir / Réserver.
 *
 * @param {Object} service {
 *   id, nom_prestation, prix, duree_minutes, image, ville,
 *   categorie_nom, categorie_icone, coiffeur_username, coiffeur_photo,
 *   note_moyenne, nb_avis, est_favori
 * }
 * @param {Function|null} onFavoriteToggle (serviceId, actif) => void
 * @returns {HTMLElement}
 */
export const ServiceCard = (service, onFavoriteToggle = null) => {
    const card = document.createElement('div');
    card.className = 'svc-card';

    const badge = (service.categorie_nom || 'Service').toUpperCase();
    const note  = service.note_moyenne ?? 4.8;
    const avis  = service.nb_avis ?? 0;
    const initiale = (service.coiffeur_username || '?').charAt(0).toUpperCase();

    card.innerHTML = `
        <div class="svc-card-media">
            ${service.image
                ? `<img src="${service.image}" alt="${escapeHtml(service.nom_prestation)}" class="svc-card-img" loading="lazy"/>`
                : `<div class="svc-card-placeholder"><i data-lucide="image"></i></div>`
            }
            <span class="svc-card-badge">${escapeHtml(badge)}</span>
            <button class="svc-card-fav ${service.est_favori ? 'svc-card-fav-active' : ''}" type="button" title="Ajouter aux favoris">
                <i data-lucide="heart"></i>
            </button>
        </div>
        <div class="svc-card-body">
            <div class="svc-card-title-row">
                <h3 class="svc-card-title">${escapeHtml(service.nom_prestation)}</h3>
                <span class="svc-card-price">${formatPrix(service.prix)}€</span>
            </div>
            <div class="svc-card-rating">
                <i data-lucide="star" class="svc-star"></i>
                <span>${note} (${avis} avis)</span>
            </div>
            <div class="svc-card-coiffeur">
                ${service.coiffeur_photo
                    ? `<img src="${service.coiffeur_photo}" class="svc-card-avatar" alt=""/>`
                    : `<div class="svc-card-avatar svc-card-avatar-placeholder">${initiale}</div>`
                }
                <span>Par ${escapeHtml(service.coiffeur_username || '—')}</span>
            </div>
            <div class="svc-card-meta">
                <span><i data-lucide="clock"></i> ${service.duree_minutes} min</span>
                <span><i data-lucide="map-pin"></i> ${escapeHtml(service.ville || '—')}</span>
            </div>
            <div class="svc-card-actions">
                <button class="svc-btn svc-btn-outline" data-action="voir" type="button">Voir</button>
                <button class="svc-btn svc-btn-primary" data-action="reserver" type="button">Réserver</button>
            </div>
        </div>
    `;

    // ── Favoris ─────────────────────────────────────────────
    const favBtn = card.querySelector('.svc-card-fav');
    let isFav = !!service.est_favori;
    favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isFav = !isFav;
        favBtn.classList.toggle('svc-card-fav-active', isFav);
        if (onFavoriteToggle) onFavoriteToggle(service.id, isFav);
    });

    // ── Navigation ──────────────────────────────────────────
    const goToDetail = () => window.navigate?.(`/services/${service.id}`);

    card.querySelector('[data-action="voir"]').addEventListener('click', goToDetail);
    card.querySelector('[data-action="reserver"]').addEventListener('click', () =>
        window.navigate?.(`/services/${service.id}?reserver=1`));
    card.querySelector('.svc-card-media').addEventListener('click', (e) => {
        if (e.target.closest('.svc-card-fav')) return;
        goToDetail();
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
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