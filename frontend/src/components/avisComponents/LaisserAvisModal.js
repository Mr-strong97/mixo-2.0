/**
 * LaisserAvisModal.js — MIXO
 * Modal de dépôt d'avis (déclenché après un rendez-vous TERMINE).
 *
 * @param {Object} rdv  { id, service_nom_snapshot, coiffeur_username }
 * @param {Function} onSave (payload) => Promise
 * @param {Function} onClose () => void
 * @returns {HTMLElement}
 */
export const LaisserAvisModal = (rdv, onSave, onClose) => {
    const overlay = document.createElement('div');
    overlay.className = 'dsr-overlay';

    overlay.innerHTML = `
        <div class="dsr-modal lam-modal">
            <div class="dsr-header">
                <h3>Votre avis</h3>
                <button class="dsr-close" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="dsr-body">
                <p class="lam-service">
                    <strong>${escapeHtml(rdv.service_nom_snapshot)}</strong>
                    avec ${escapeHtml(rdv.coiffeur_username)}
                </p>
                <div class="lam-stars" id="lam-stars">
                    ${[1,2,3,4,5].map(i => `
                        <button type="button" class="lam-star" data-val="${i}" title="${i} étoile${i>1?'s':''}">
                            <i data-lucide="star"></i>
                        </button>`).join('')}
                </div>
                <p class="lam-note-label" id="lam-note-label">Sélectionnez une note</p>
                <div class="dsr-field">
                    <label>Commentaire (optionnel)</label>
                    <textarea id="lam-commentaire" rows="3" placeholder="Décrivez votre expérience…"></textarea>
                </div>
                <p class="dsr-error" id="lam-error" style="display:none;"></p>
            </div>
            <div class="dsr-footer">
                <button class="dsr-btn-cancel" type="button">Plus tard</button>
                <button class="dsr-btn-save" type="button" disabled>Envoyer l'avis</button>
            </div>
        </div>
    `;

    let selectedNote = 0;
    const NOTE_LABELS = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'];

    const stars = overlay.querySelectorAll('.lam-star');
    const noteLabel = overlay.querySelector('#lam-note-label');
    const saveBtn = overlay.querySelector('.dsr-btn-save');

    const colorStars = (note) => {
        stars.forEach((s, i) => {
            s.classList.toggle('lam-star-active', i < note);
        });
        noteLabel.textContent = note ? `${note}/5 — ${NOTE_LABELS[note]}` : 'Sélectionnez une note';
        saveBtn.disabled = note === 0;
    };

    stars.forEach((star, i) => {
        star.addEventListener('mouseover', () => colorStars(i + 1));
        star.addEventListener('mouseleave', () => colorStars(selectedNote));
        star.addEventListener('click', () => {
            selectedNote = i + 1;
            colorStars(selectedNote);
        });
    });

    const close = () => { overlay.remove(); onClose?.(); };
    overlay.querySelector('.dsr-close').addEventListener('click', close);
    overlay.querySelector('.dsr-btn-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    saveBtn.addEventListener('click', async () => {
        const errEl = overlay.querySelector('#lam-error');
        if (!selectedNote) {
            errEl.textContent = 'Veuillez sélectionner une note.';
            errEl.style.display = 'block';
            return;
        }
        try {
            await onSave({
                rendez_vous: rdv.id,
                note: selectedNote,
                commentaire: overlay.querySelector('#lam-commentaire').value.trim(),
            });
            close();
        } catch (e) {
            errEl.textContent = e.response?.data?.error || e.message || 'Erreur lors de l\'envoi.';
            errEl.style.display = 'block';
        }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return overlay;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
