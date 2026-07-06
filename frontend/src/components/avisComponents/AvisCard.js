import { confirmDialog } from '../../utils/confirmDialog.js';

/**
 * AvisCard.js — MIXO
 * Carte d'un avis — Espace Coiffeur (Avis Clients).
 *
 * @param {Object} avis { id, note, commentaire, reponse_coiffeur, client_username, created_at, signale }
 * @param {Object} handlers { onRepondre(avisId, texte), onSignaler(avisId) }
 * @returns {HTMLElement}
 */
export const AvisCard = (avis, handlers = {}) => {
    const card = document.createElement('div');
    card.className = 'avc-card';

    const date = new Date(avis.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    const stars = Array.from({ length: 5 }, (_, i) =>
        `<i data-lucide="star" class="avc-star ${i < avis.note ? 'avc-star-filled' : ''}"></i>`
    ).join('');

    card.innerHTML = `
        <div class="avc-top">
            <div class="avc-author">
                <div class="avc-avatar">${avis.client_username?.charAt(0).toUpperCase() || '?'}</div>
                <div>
                    <span class="avc-name">${escapeHtml(avis.client_username)}</span>
                    <span class="avc-date">${date}</span>
                </div>
            </div>
            <div class="avc-stars">${stars}</div>
        </div>
        ${avis.commentaire ? `<p class="avc-commentaire">${escapeHtml(avis.commentaire)}</p>` : ''}
        ${avis.reponse_coiffeur ? `
            <div class="avc-reponse">
                <i data-lucide="message-circle"></i>
                <p>${escapeHtml(avis.reponse_coiffeur)}</p>
            </div>` : ''}
        <div class="avc-actions">
            ${!avis.reponse_coiffeur ? `<button class="avc-btn" data-action="repondre" type="button"><i data-lucide="reply"></i> Répondre</button>` : ''}
            ${!avis.signale ? `<button class="avc-btn avc-btn-warn" data-action="signaler" type="button"><i data-lucide="flag"></i> Signaler</button>` : ''}
        </div>
        <div class="avc-reply-form" id="avc-reply-${avis.id}" style="display:none;">
            <textarea placeholder="Votre réponse…" rows="3"></textarea>
            <div class="avc-reply-actions">
                <button class="avc-reply-cancel" type="button">Annuler</button>
                <button class="avc-reply-save" type="button">Envoyer la réponse</button>
            </div>
        </div>
    `;

    const repondreBtn = card.querySelector('[data-action="repondre"]');
    const replyForm   = card.querySelector(`#avc-reply-${avis.id}`);

    repondreBtn?.addEventListener('click', () => {
        replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
    });

    replyForm?.querySelector('.avc-reply-cancel').addEventListener('click', () => {
        replyForm.style.display = 'none';
    });

    replyForm?.querySelector('.avc-reply-save').addEventListener('click', async () => {
        const texte = replyForm.querySelector('textarea').value.trim();
        if (!texte) return;
        try {
            await handlers.onRepondre?.(avis.id, texte);
        } catch (e) {
            console.error(e);
        }
    });

    card.querySelector('[data-action="signaler"]')?.addEventListener('click', async () => {
        const ok = await confirmDialog(
            'Signaler cet avis ?',
            'Cette action enverra l’avis à la modération. Elle est réservée aux cas réellement abusifs.',
            { confirmText: 'Signaler', cancelText: 'Annuler' }
        );

        if (ok) {
            handlers.onSignaler?.(avis.id);
        }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
