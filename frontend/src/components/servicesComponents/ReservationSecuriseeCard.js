/**
 * ReservationSecuriseeCard.js — MIXO
 * Petite carte d'information bleue "Réservation Sécurisée" (Image 1).
 *
 * @param {string} [texte]  texte personnalisable (défaut : annulation 24h)
 * @returns {HTMLElement}
 */
export const ReservationSecuriseeCard = (texte = "Annulation gratuite jusqu'à 24h avant.") => {
    const card = document.createElement('div');
    card.className = 'rsc-card';
    card.innerHTML = `
        <i data-lucide="shield-check" class="rsc-icon"></i>
        <div>
            <span class="rsc-title">Réservation Sécurisée</span>
            <p class="rsc-text">${texte}</p>
        </div>
    `;
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};