/**
 * PlanCard.js — MIXO
 * Carte d'un plan d'abonnement (Espace Coiffeur — choix de plan).
 *
 * @param {Object} plan { id, nom, plan, prix_mensuel, liste_avantages, mise_en_avant_priorite }
 * @param {boolean} isCurrent  plan actuellement souscrit
 * @param {Function} onSouscrire (planId) => void
 * @returns {HTMLElement}
 */
export const PlanCard = (plan, isCurrent = false, onSouscrire = null) => {
    const card = document.createElement('div');
    card.className = `pln-card ${isCurrent ? 'pln-card-current' : ''} ${plan.mise_en_avant_priorite >= 2 ? 'pln-card-highlight' : ''}`;

    card.innerHTML = `
        ${plan.mise_en_avant_priorite >= 2 ? '<span class="pln-badge">Recommandé</span>' : ''}
        <h3 class="pln-name">${escapeHtml(plan.nom)}</h3>
        <div class="pln-price">
            <span class="pln-amount">${formatPrix(plan.prix_mensuel)}FC</span>
            <span class="pln-period">/mois</span>
        </div>
        <ul class="pln-avantages">
            ${(plan.liste_avantages || []).map(a => `<li><i data-lucide="check"></i> ${escapeHtml(a)}</li>`).join('')}
        </ul>
        <button class="pln-btn ${isCurrent ? 'pln-btn-current' : 'pln-btn-primary'}" type="button" ${isCurrent ? 'disabled' : ''}>
            ${isCurrent ? 'Plan actuel' : 'Souscrire'}
        </button>
    `;

    if (!isCurrent && onSouscrire) {
        card.querySelector('.pln-btn').addEventListener('click', () => onSouscrire(plan.id));
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};

function formatPrix(prix) {
    const n = parseFloat(prix);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
