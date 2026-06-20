/**
 * PortfolioLightbox.js — MIXO
 * Visionneuse plein écran pour parcourir les réalisations d'un portfolio.
 *
 * @param {Array<{id,url,type,titre}>} medias
 * @param {number} startIndex
 * @returns {void}  monte directement l'overlay sur document.body
 */
export const PortfolioLightbox = (medias = [], startIndex = 0) => {
    if (!medias.length) return;

    let current = startIndex;

    const overlay = document.createElement('div');
    overlay.className = 'pfl-overlay';

    const render = () => {
        const media = medias[current];
        overlay.innerHTML = `
            <button class="pfl-close" type="button"><i data-lucide="x"></i></button>
            ${medias.length > 1 ? `<button class="pfl-nav pfl-prev" type="button"><i data-lucide="chevron-left"></i></button>` : ''}
            <div class="pfl-content">
                ${media.type === 'video'
                    ? `<video src="${media.url}" controls autoplay class="pfl-media"></video>`
                    : `<img src="${media.url}" class="pfl-media" alt="${escapeAttr(media.titre || '')}"/>`
                }
                ${media.titre ? `<p class="pfl-caption">${escapeHtml(media.titre)}</p>` : ''}
            </div>
            ${medias.length > 1 ? `<button class="pfl-nav pfl-next" type="button"><i data-lucide="chevron-right"></i></button>` : ''}
            <span class="pfl-counter">${current + 1} / ${medias.length}</span>
        `;

        overlay.querySelector('.pfl-close').addEventListener('click', close);
        overlay.querySelector('.pfl-prev')?.addEventListener('click', () => { current = (current - 1 + medias.length) % medias.length; render(); });
        overlay.querySelector('.pfl-next')?.addEventListener('click', () => { current = (current + 1) % medias.length; render(); });

        if (window.lucide) window.lucide.createIcons();
    };

    const close = () => {
        overlay.remove();
        document.removeEventListener('keydown', onKeydown);
    };

    const onKeydown = (e) => {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft')  { current = (current - 1 + medias.length) % medias.length; render(); }
        if (e.key === 'ArrowRight') { current = (current + 1) % medias.length; render(); }
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKeydown);

    document.body.appendChild(overlay);
    render();
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
