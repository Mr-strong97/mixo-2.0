/**
 * ServiceTableRow.js — MIXO
 * Ligne de tableau "Mes services" (Image 8) :
 * SERVICE | CATÉGORIE | PRIX | DURÉE | RÉSERVATIONS | STATUT (toggle) | ACTIONS
 *
 * @param {Object} service { id, nom_prestation, description, image,
 *                            categorie_nom, prix, duree_minutes,
 *                            nb_reservations, statut, actif }
 * @param {Object} handlers { onView, onEdit, onDelete, onToggle }
 * @returns {HTMLTableRowElement}
 */
export const ServiceTableRow = (service, handlers = {}) => {
    const tr = document.createElement('tr');
    tr.className = 'str-row';

    const isActive = service.statut === 'actif' && service.actif;
    const description = service.description || '';
    const descCourte  = description.length > 60 ? `${description.slice(0, 60)}…` : description;

    tr.innerHTML = `
        <td class="str-service">
            ${service.image
                ? `<img src="${service.image}" class="str-thumb" alt="" loading="lazy"/>`
                : `<div class="str-thumb str-thumb-placeholder"><i data-lucide="image"></i></div>`
            }
            <div class="str-info">
                <span class="str-name">${escapeHtml(service.nom_prestation)}</span>
                <span class="str-desc">${escapeHtml(descCourte)}</span>
            </div>
        </td>
        <td><span class="str-badge-cat">${escapeHtml(service.categorie_nom || '—')}</span></td>
        <td class="str-price">${formatPrix(service.prix)}&nbsp;€</td>
        <td class="str-muted">${service.duree_minutes} min</td>
        <td class="str-muted">${service.nb_reservations ?? 0}</td>
        <td>
            <label class="str-toggle" title="${isActive ? 'Désactiver' : 'Activer'} ce service">
                <input type="checkbox" ${isActive ? 'checked' : ''}/>
                <span class="str-toggle-slider"></span>
            </label>
        </td>
        <td class="str-actions">
            <button class="str-icon-btn" data-action="view"   title="Voir"><i data-lucide="eye"></i></button>
            <button class="str-icon-btn" data-action="edit"   title="Modifier"><i data-lucide="pencil"></i></button>
            <button class="str-icon-btn str-icon-danger" data-action="delete" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </td>
    `;

    tr.querySelector('[data-action="view"]')?.addEventListener('click', () => handlers.onView?.(service));
    tr.querySelector('[data-action="edit"]')?.addEventListener('click', () => handlers.onEdit?.(service));
    tr.querySelector('[data-action="delete"]')?.addEventListener('click', () => handlers.onDelete?.(service));
    tr.querySelector('.str-toggle input')?.addEventListener('change', (e) =>
        handlers.onToggle?.(service, e.target.checked));

    return tr;
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