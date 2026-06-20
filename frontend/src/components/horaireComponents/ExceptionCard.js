/**
 * ExceptionCard.js — MIXO
 * Carte d'une exception de disponibilité (congé, maladie, jour férié…).
 *
 * @param {Object} exception { id, date, disponible, categorie, categorie_label, motif }
 * @param {Function} onDelete (exception) => void
 * @returns {HTMLElement}
 */
const CATEGORIE_ICONS = {
    conge:                    'palm-tree',
    maladie:                  'thermometer',
    ferie:                    'flag',
    fermeture_exceptionnelle: 'door-closed',
    ouverture_exceptionnelle: 'door-open',
    autre:                    'info',
};

export const ExceptionCard = (exception, onDelete = null) => {
    const card = document.createElement('div');
    card.className = `exc-card ${exception.disponible ? 'exc-card-open' : 'exc-card-closed'}`;

    const dateFormatted = new Date(exception.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    card.innerHTML = `
        <div class="exc-icon">
            <i data-lucide="${CATEGORIE_ICONS[exception.categorie] || 'info'}"></i>
        </div>
        <div class="exc-info">
            <span class="exc-date">${dateFormatted}</span>
            <span class="exc-label">${escapeHtml(exception.categorie_label || exception.categorie)}</span>
            ${exception.motif ? `<span class="exc-motif">${escapeHtml(exception.motif)}</span>` : ''}
        </div>
        <span class="exc-status-badge ${exception.disponible ? 'exc-status-open' : 'exc-status-closed'}">
            ${exception.disponible ? 'Exceptionnellement ouvert' : 'Indisponible'}
        </span>
        <button class="exc-del-btn" type="button" title="Supprimer">
            <i data-lucide="trash-2"></i>
        </button>
    `;

    card.querySelector('.exc-del-btn').addEventListener('click', () => onDelete?.(exception));

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
