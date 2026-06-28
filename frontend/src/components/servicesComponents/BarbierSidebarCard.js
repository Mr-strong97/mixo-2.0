/**
 * BarbierSidebarCard.js — MIXO
 * Carte "VOTRE BARBIER" — sidebar de ServiceDetailPage (Image 1).
 * Avatar + nom + note + avis, bio, langues, badge certifié,
 * bouton "Voir le profil complet".
 *
 * @param {Object} coiffeur {
 *   id, username, photo, note_moyenne, nb_avis, bio, langues, certifie
 * }
 * @returns {HTMLElement}
 */
export const BarbierSidebarCard = (coiffeur = {}) => {
    const card = document.createElement('div');
    card.className = 'bsc-card';

    const initials = (coiffeur.username || '?').substring(0, 2).toUpperCase();
    const note      = coiffeur.note_moyenne ?? '—';
    const avis      = coiffeur.nb_avis ?? 0;
    const langues   = coiffeur.langues || 'Français';

    card.innerHTML = `
        <span class="bsc-label">VOTRE BARBIER</span>
        <div class="bsc-header">
            ${coiffeur.photo
                ? `<img src="${coiffeur.photo}" class="bsc-avatar" alt=""/>`
                : `<div class="bsc-avatar bsc-avatar-placeholder">${initials}</div>`
            }
            <div class="bsc-identity">
                <span class="bsc-name">${escapeHtml(coiffeur.username || '—')}</span>
                <span class="bsc-rating"><i data-lucide="star" class="bsc-star"></i> ${note} (${avis} avis)</span>
            </div>
        </div>
        ${coiffeur.bio ? `<p class="bsc-bio">${escapeHtml(coiffeur.bio)}</p>` : ''}
        <div class="bsc-meta">
            <span><i data-lucide="globe"></i> ${escapeHtml(langues)}</span>
            ${coiffeur.certifie ? `<span><i data-lucide="badge-check"></i> Maître Artisan Certifié</span>` : ''}
        </div>
        <button class="bsc-btn" id="bsc-voir-profil" type="button">Voir le profil complet</button>
    `;

    card.querySelector('#bsc-voir-profil')?.addEventListener('click', () => {
        if (coiffeur.username && coiffeur.id) {
            window.navigate?.(`/profil/${coiffeur.username}/${coiffeur.id}`);
        }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
