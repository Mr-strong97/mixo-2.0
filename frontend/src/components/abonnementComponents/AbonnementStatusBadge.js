/**
 * AbonnementStatusBadge.js — MIXO
 * Badge compact de statut d'abonnement (utilisable dans navbar, profil, etc.)
 *
 * @param {Object} statut { a_abonnement, periode_essai, expire, plan_nom }
 * @returns {HTMLElement}
 */
export const AbonnementStatusBadge = (statut) => {
    const badge = document.createElement('span');

    let label, cls, icon;
    if (!statut?.a_abonnement || statut.expire) {
        label = 'Aucun abonnement'; cls = 'asb-inactive'; icon = 'circle-off';
    } else if (statut.periode_essai) {
        label = 'Essai gratuit'; cls = 'asb-trial'; icon = 'sparkles';
    } else {
        label = statut.plan_nom || 'Abonné'; cls = 'asb-active'; icon = 'badge-check';
    }

    badge.className = `asb-badge ${cls}`;
    badge.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return badge;
};
