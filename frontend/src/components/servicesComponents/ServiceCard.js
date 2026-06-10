// ============================================================
//  ServiceCard.js — Carte de service (Client)
//  Mixo · Module Services
// ============================================================

export class ServiceCard {
  /**
   * Retourne le HTML d'une carte de service.
   * @param {Object} s - Objet service
   * @returns {string} HTML string
   */
  static html(s) {
    const prix = parseFloat(s.prix).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    const duree = _formatDuration(s.duree_minutes);
    const note = parseFloat(s.note_moyenne || 0).toFixed(1);
    const stars = _renderStars(s.note_moyenne || 0);

    return `
      <article class="service-card" data-id="${s.id}">
        <!-- Image -->
        <div class="service-card__img-wrap">
          ${s.image_principale
            ? `<img class="service-card__img" src="${s.image_principale}" alt="${s.nom_prestation}" loading="lazy">`
            : `<div class="service-card__img-placeholder">
                 <span class="service-card__cat-icon">${_catIcon(s.categorie)}</span>
               </div>`
          }
          ${s.categorie
            ? `<span class="service-card__badge">${s.categorie}</span>`
            : ''}
          <button class="service-card__wishlist" title="Sauvegarder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>

        <!-- Corps -->
        <div class="service-card__body">
          <h3 class="service-card__title">${s.nom_prestation}</h3>

          <!-- Coiffeur -->
          <div class="service-card__coiffeur">
            <div class="service-card__avatar">
              ${s.coiffeur_photo
                ? `<img src="${s.coiffeur_photo}" alt="${s.coiffeur_nom}">`
                : `<span>${(s.coiffeur_nom || '?').charAt(0).toUpperCase()}</span>`}
            </div>
            <span class="service-card__coiffeur-name">${s.coiffeur_nom || 'Coiffeur'}</span>
          </div>

          <!-- Note -->
          <div class="service-card__rating">
            <div class="service-card__stars">${stars}</div>
            <span class="service-card__rating-score">${note}</span>
            <span class="service-card__rating-count">(${s.nb_avis || 0} avis)</span>
          </div>

          <!-- Meta -->
          <div class="service-card__meta">
            <span class="service-card__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${duree}
            </span>
            ${s.ville ? `
            <span class="service-card__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${s.ville}
            </span>` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div class="service-card__footer">
          <div class="service-card__price">${prix}</div>
          <div class="service-card__actions">
            <a href="#/services/${s.id}" class="service-card__btn service-card__btn--ghost" data-detail="${s.id}">
              Voir
            </a>
            <button class="service-card__btn service-card__btn--primary" data-book="${s.id}">
              Réserver
            </button>
          </div>
        </div>
      </article>
    `;
  }
}

// ── Helpers ────────────────────────────────────────────────────
function _formatDuration(min) {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function _renderStars(note) {
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      html += `<svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i === full && half) {
      html += `<svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none" style="clip-path:inset(0 50% 0 0)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      html += `<svg width="12" height="12" viewBox="0 0 24 24" fill="#E5E7EB" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return html;
}

function _catIcon(cat) {
  const map = {
    'Coupe': '✂️', 'Coloration': '🎨', 'Soin': '💆', 'Coiffage': '💇',
    'Tresse': '🪢', 'Lissage': '✨', 'Barbe': '🧔', 'Brushing': '💨',
  };
  return map[cat] || '💈';
}