/**
 * PortfolioGrid.js — MIXO
 * Grille de galerie portfolio — réordonnable par glisser-déposer,
 * avec mise en avant et suppression par média.
 *
 * @param {Array<{id,url,type,titre,mis_en_avant}>} medias
 * @param {Object} handlers { onDelete(media), onToggleAvant(media), onReorder(idsOrdonnes), onView(media) }
 * @returns {HTMLElement}
 */
export const PortfolioGrid = (medias = [], handlers = {}) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'pfg-grid';

    if (!medias.length) {
        wrapper.innerHTML = `
            <div class="pfg-empty">
                <i data-lucide="image-off"></i>
                <p>Aucune réalisation pour le moment.</p>
            </div>`;
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
        return wrapper;
    }

    let draggedId = null;

    medias.forEach(media => {
        const cell = document.createElement('div');
        cell.className = 'pfg-cell';
        cell.draggable = true;
        cell.dataset.id = media.id;

        cell.innerHTML = `
            ${media.type === 'video'
                ? `<video src="${media.url}" class="pfg-media" muted></video>`
                : `<img src="${media.url}" class="pfg-media" alt="${escapeAttr(media.titre || '')}" loading="lazy"/>`
            }
            ${media.mis_en_avant ? `<span class="pfg-star"><i data-lucide="star"></i></span>` : ''}
            <div class="pfg-overlay">
                <button class="pfg-icon-btn" data-action="view" title="Voir"><i data-lucide="eye"></i></button>
                <button class="pfg-icon-btn" data-action="avant" title="${media.mis_en_avant ? 'Retirer la mise en avant' : 'Mettre en avant'}">
                    <i data-lucide="star"></i>
                </button>
                <button class="pfg-icon-btn pfg-icon-danger" data-action="delete" title="Supprimer"><i data-lucide="trash-2"></i></button>
            </div>
        `;

        cell.querySelector('[data-action="view"]')?.addEventListener('click', () => handlers.onView?.(media));
        cell.querySelector('[data-action="avant"]')?.addEventListener('click', () => handlers.onToggleAvant?.(media));
        cell.querySelector('[data-action="delete"]')?.addEventListener('click', () => handlers.onDelete?.(media));

        // ── Drag & drop pour réordonner ──────────────────────
        cell.addEventListener('dragstart', () => { draggedId = media.id; cell.classList.add('pfg-dragging'); });
        cell.addEventListener('dragend',   () => { cell.classList.remove('pfg-dragging'); });
        cell.addEventListener('dragover',  (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedId === media.id) return;

            const ids = Array.from(wrapper.children).map(c => c.dataset.id);
            const fromIdx = ids.indexOf(draggedId);
            const toIdx   = ids.indexOf(String(media.id));
            ids.splice(fromIdx, 1);
            ids.splice(toIdx, 0, draggedId);

            handlers.onReorder?.(ids);
        });

        wrapper.appendChild(cell);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};

function escapeAttr(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
