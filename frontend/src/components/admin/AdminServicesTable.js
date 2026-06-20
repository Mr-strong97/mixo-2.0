/**
 * AdminServicesTable.js — MIXO
 * Table admin listant tous les services, tous coiffeurs confondus.
 *
 * @param {Array} services { id, nom_prestation, coiffeur_username, categorie_nom, prix, statut }
 * @param {Object} handlers { onView, onSuspend, onDelete }
 * @returns {HTMLElement}
 */
export const AdminServicesTable = (services = [], handlers = {}) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ast-wrap';

    if (!services.length) {
        wrapper.innerHTML = `<p class="ast-empty">Aucun service trouvé.</p>`;
        return wrapper;
    }

    wrapper.innerHTML = `
        <table class="ast-table">
            <thead><tr>
                <th>SERVICE</th><th>COIFFEUR</th><th>CATÉGORIE</th><th>PRIX</th><th>STATUT</th><th>ACTIONS</th>
            </tr></thead>
            <tbody id="ast-tbody"></tbody>
        </table>
    `;

    const tbody = wrapper.querySelector('#ast-tbody');
    const STATUT_COLORS = { actif: '#16A34A', inactif: '#D97706', en_attente: '#0A66C2' };

    services.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ast-name">${escapeHtml(s.nom_prestation)}</td>
            <td>${escapeHtml(s.coiffeur_username)}</td>
            <td>${escapeHtml(s.categorie_nom || '—')}</td>
            <td>${formatPrix(s.prix)} €</td>
            <td><span class="ast-badge" style="background:${STATUT_COLORS[s.statut]}15;color:${STATUT_COLORS[s.statut]};">${s.statut}</span></td>
            <td class="ast-actions">
                <button class="ast-icon-btn" data-action="view" title="Voir"><i data-lucide="eye"></i></button>
                <button class="ast-icon-btn" data-action="suspend" title="Suspendre"><i data-lucide="pause-circle"></i></button>
                <button class="ast-icon-btn ast-icon-danger" data-action="delete" title="Supprimer"><i data-lucide="trash-2"></i></button>
            </td>
        `;
        tr.querySelector('[data-action="view"]').addEventListener('click', () => handlers.onView?.(s));
        tr.querySelector('[data-action="suspend"]').addEventListener('click', () => handlers.onSuspend?.(s));
        tr.querySelector('[data-action="delete"]').addEventListener('click', () => handlers.onDelete?.(s));
        tbody.appendChild(tr);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};

function formatPrix(prix) {
    const n = parseFloat(prix);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
