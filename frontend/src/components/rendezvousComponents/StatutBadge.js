/**
 * StatutBadge.js — MIXO
 * Badge de statut réutilisable pour les rendez-vous.
 *
 * @param {string} statut  EN_ATTENTE | ACCEPTE | REFUSE | ANNULE | TERMINE
 * @returns {HTMLElement}
 */
const STATUT_INFO = {
    EN_ATTENTE: { label: 'En attente', color: '#D97706', icon: 'clock' },
    ACCEPTE:    { label: 'Accepté',    color: '#16A34A', icon: 'check-circle' },
    REFUSE:     { label: 'Refusé',     color: '#DC2626', icon: 'x-circle' },
    ANNULE:     { label: 'Annulé',     color: '#94A3B8', icon: 'ban' },
    TERMINE:    { label: 'Terminé',    color: '#0A66C2', icon: 'check-check' },
};

export const StatutBadge = (statut) => {
    const info = STATUT_INFO[statut] || STATUT_INFO.EN_ATTENTE;
    const badge = document.createElement('span');
    badge.className = 'sbg-badge';
    badge.style.background = `${info.color}15`;
    badge.style.color = info.color;
    badge.innerHTML = `<i data-lucide="${info.icon}"></i> ${info.label}`;
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return badge;
};
