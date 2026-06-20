/**
 * TrialBanner.js — MIXO
 * Bannière d'essai gratuit affichée en haut de l'espace coiffeur.
 *
 * @param {Object} statut { periode_essai, jours_restants, expire }
 * @param {Function} onVoirPlans () => void
 * @returns {HTMLElement|null}  null si pas d'essai en cours
 */
export const TrialBanner = (statut, onVoirPlans = null) => {
    if (!statut?.periode_essai || statut.expire) return null;

    const urgent = statut.jours_restants <= 3;
    const banner = document.createElement('div');
    banner.className = `trb-banner ${urgent ? 'trb-urgent' : ''}`;

    banner.innerHTML = `
        <div class="trb-content">
            <i data-lucide="${urgent ? 'alarm-clock' : 'sparkles'}"></i>
            <div>
                <strong>Essai gratuit en cours</strong>
                <span>${statut.jours_restants} jour${statut.jours_restants > 1 ? 's' : ''} restant${statut.jours_restants > 1 ? 's' : ''} de visibilité premium offerte.</span>
            </div>
        </div>
        <button class="trb-btn" type="button">Voir les plans</button>
    `;

    banner.querySelector('.trb-btn').addEventListener('click', () => onVoirPlans?.());

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return banner;
};
