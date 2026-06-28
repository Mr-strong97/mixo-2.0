/**
 * RendezVousRequestCard.js — MIXO
 * Carte demande de rendez-vous — Espace Coiffeur.
 *
 * @param {Object} rdv { id, service_nom_snapshot, service_prix_snapshot, client_username,
 *                        date_heure_debut, statut, est_passe }
 * @param {Object} handlers { onAccepter, onRefuser, onTerminer, onAnnuler }
 * @returns {HTMLElement}
 */
import { StatutBadge } from './StatutBadge.js';

export const RendezVousRequestCard = (rdv, handlers = {}) => {
    const card = document.createElement('div');
    card.className = 'rvc-card';

    const date = new Date(rdv.date_heure_debut).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });

    card.innerHTML = `
        <div class="rvc-top">
            <div>
                <h3 class="rvc-title">${escapeHtml(rdv.service_nom_snapshot)}</h3>
                <span class="rvc-coiffeur">Client : ${escapeHtml(rdv.client_username)}</span>
            </div>
            <div id="rvc-badge"></div>
        </div>
        <div class="rvc-meta">
            <span><i data-lucide="calendar"></i> ${date}</span>
            <span><i data-lucide="euro"></i> ${rdv.service_prix_snapshot} €</span>
        </div>
        <div class="rvc-actions" id="rvc-actions"></div>
    `;

    card.querySelector('#rvc-badge').appendChild(StatutBadge(rdv.statut));
    const actions = card.querySelector('#rvc-actions');

    const addBtn = (label, icon, cls, onClick) => {
        const btn = document.createElement('button');
        btn.className = `rvc-btn ${cls}`;
        btn.type = 'button';
        btn.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
        btn.addEventListener('click', onClick);
        actions.appendChild(btn);
    };

    if (rdv.statut === 'EN_ATTENTE') {
        addBtn('Accepter', 'check', 'rvc-btn-primary', () => handlers.onAccepter?.(rdv));
        addBtn('Refuser',  'x',     'rvc-btn-danger',  () => handlers.onRefuser?.(rdv));
    }

    if (rdv.statut === 'ACCEPTE' && rdv.est_passe) {
        addBtn('Marquer terminé', 'check-check', 'rvc-btn-primary', () => handlers.onTerminer?.(rdv));
    }

    if (rdv.statut === 'EN_ATTENTE' || rdv.statut === 'ACCEPTE') {
        addBtn('Annuler', 'ban', 'rvc-btn-outline', () => handlers.onAnnuler?.(rdv));
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
