/**
 * TopPrestationsSection.js — MIXO
 * Section "Top Prestations" — fond gris clair, 3 cartes avec photo + nom +
 * nombre de réservations, badge médaille sur la première (Image 8).
 *
 * @param {Array<{id, nom_prestation, image, nb_reservations}>} prestations
 * @returns {HTMLElement}
 */
export const TopPrestationsSection = (prestations = []) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'tps-wrapper';

    wrapper.innerHTML = `
        <div class="tps-header">
            <i data-lucide="trending-up"></i>
            <span>Top Prestations</span>
        </div>
        <div class="tps-grid" id="tps-grid"></div>
    `;

    const grid = wrapper.querySelector('#tps-grid');

    if (!prestations.length) {
        grid.innerHTML = `<p class="tps-empty">Aucune donnée de réservation pour le moment.</p>`;
        return wrapper;
    }

    prestations.slice(0, 3).forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'tps-card';
        card.innerHTML = `
            <div class="tps-thumb">
                ${p.image ? `<img src="${p.image}" alt="" loading="lazy"/>` : `<i data-lucide="image"></i>`}
                ${i === 0 ? `<span class="tps-medal" title="Service le plus réservé"><i data-lucide="award"></i></span>` : ''}
            </div>
            <div class="tps-info">
                <span class="tps-name">${escapeHtml(p.nom_prestation)}</span>
                <span class="tps-count">${p.nb_reservations} réservation${p.nb_reservations === 1 ? '' : 's'}</span>
            </div>
        `;
        grid.appendChild(card);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}