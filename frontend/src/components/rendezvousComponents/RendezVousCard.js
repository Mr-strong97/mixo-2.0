/**
 * RendezVousCard.js — MIXO
 * Carte rendez-vous — Espace Client.
 *
 * @param {Object} rdv { id, service_nom_snapshot, service_prix_snapshot, coiffeur_username,
 *                        date_heure_debut, statut, peut_etre_annule, est_paye,
 *                        mode_paiement_label, statut_paiement_label }
 * @param {Object} handlers { onAnnuler, onPayer, onLaisserAvis, onVoir }
 * @returns {HTMLElement}
 */
import { StatutBadge } from './StatutBadge.js';

export const RendezVousCard = (rdv, handlers = {}) => {
    const card = document.createElement('div');
    card.className = 'rvc-card';

    const date = new Date(rdv.date_heure_debut).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });
    const paymentLabel = rdv.mode_paiement_label || rdv.statut_paiement_label || '';
    const paymentMeta = paymentLabel && paymentLabel !== 'Non disponible'
        ? `<span><i data-lucide="credit-card"></i> ${escapeHtml(paymentLabel)}</span>`
        : '';

    card.innerHTML = `
        <div class="rvc-top">
            <div>
                <h3 class="rvc-title">${escapeHtml(rdv.service_nom_snapshot)}</h3>
                <span class="rvc-coiffeur">Avec ${escapeHtml(rdv.coiffeur_username)}</span>
            </div>
            <div id="rvc-badge"></div>
        </div>
        <div class="rvc-meta">
            <span><i data-lucide="calendar"></i> ${date}</span>
            <span><i data-lucide="banknote"></i> ${rdv.service_prix_snapshot} CDF</span>
            ${paymentMeta}
        </div>
        <div class="rvc-actions" id="rvc-actions"></div>
    `;

    card.querySelector('#rvc-badge').appendChild(StatutBadge(rdv.statut));

    const actions = card.querySelector('#rvc-actions');

    if (rdv.statut === 'ACCEPTE' && !rdv.est_paye) {
        const btn = document.createElement('button');
        btn.className = 'rvc-btn rvc-btn-primary';
        btn.type = 'button';
        btn.innerHTML = `<i data-lucide="credit-card"></i> Payer maintenant`;
        btn.addEventListener('click', () => handlers.onPayer?.(rdv));
        actions.appendChild(btn);
    }

    if (rdv.statut === 'TERMINE' && !rdv.a_un_avis) {
        const btn = document.createElement('button');
        btn.className = 'rvc-btn rvc-btn-outline';
        btn.type = 'button';
        btn.innerHTML = `<i data-lucide="star"></i> Laisser un avis`;
        btn.addEventListener('click', () => handlers.onLaisserAvis?.(rdv));
        actions.appendChild(btn);
    } else if (rdv.statut === 'TERMINE' && rdv.a_un_avis) {
        const done = document.createElement('span');
        done.className = 'rvc-completed-label';
        done.textContent = 'Avis déjà publié';
        actions.appendChild(done);
    }

    if (rdv.peut_etre_annule) {
        const btn = document.createElement('button');
        btn.className = 'rvc-btn rvc-btn-danger';
        btn.type = 'button';
        btn.innerHTML = `<i data-lucide="x"></i> Annuler`;
        btn.addEventListener('click', () => handlers.onAnnuler?.(rdv));
        actions.appendChild(btn);
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
