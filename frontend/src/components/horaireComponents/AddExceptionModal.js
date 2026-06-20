/**
 * AddExceptionModal.js — MIXO
 * Modal d'ajout d'une exception de disponibilité.
 *
 * @param {Function} onSave (payload) => Promise
 * @param {Function} onClose () => void
 * @returns {HTMLElement}
 */
const CATEGORIES = [
    { val: 'conge',                    label: 'Congé' },
    { val: 'maladie',                  label: 'Maladie' },
    { val: 'ferie',                    label: 'Jour férié' },
    { val: 'fermeture_exceptionnelle', label: 'Fermeture exceptionnelle' },
    { val: 'ouverture_exceptionnelle', label: 'Ouverture exceptionnelle' },
    { val: 'autre',                    label: 'Autre' },
];

export const AddExceptionModal = (onSave, onClose) => {
    const overlay = document.createElement('div');
    overlay.className = 'dsr-overlay';

    const today = new Date().toISOString().split('T')[0];

    overlay.innerHTML = `
        <div class="dsr-modal">
            <div class="dsr-header">
                <h3>Ajouter une exception</h3>
                <button class="dsr-close" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="dsr-body">
                <div class="dsr-field">
                    <label>Date</label>
                    <input type="date" id="aem-date" min="${today}" value="${today}"/>
                </div>
                <div class="dsr-field">
                    <label>Catégorie</label>
                    <select id="aem-categorie">
                        ${CATEGORIES.map(c => `<option value="${c.val}">${c.label}</option>`).join('')}
                    </select>
                </div>
                <div class="dsr-field">
                    <label>Motif (optionnel)</label>
                    <input type="text" id="aem-motif" placeholder="Précisez si besoin…"/>
                </div>
                <label class="dsr-checkbox-row">
                    <input type="checkbox" id="aem-disponible"/>
                    <span>Exceptionnellement disponible (au lieu d'indisponible)</span>
                </label>
                <p class="dsr-error" id="aem-error" style="display:none;"></p>
            </div>
            <div class="dsr-footer">
                <button class="dsr-btn-cancel" type="button">Annuler</button>
                <button class="dsr-btn-save" type="button">Ajouter</button>
            </div>
        </div>
    `;

    const close = () => { overlay.remove(); onClose?.(); };
    overlay.querySelector('.dsr-close').addEventListener('click', close);
    overlay.querySelector('.dsr-btn-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('.dsr-btn-save').addEventListener('click', async () => {
        const errEl = overlay.querySelector('#aem-error');
        const payload = {
            date:        overlay.querySelector('#aem-date').value,
            categorie:   overlay.querySelector('#aem-categorie').value,
            motif:       overlay.querySelector('#aem-motif').value.trim(),
            disponible:  overlay.querySelector('#aem-disponible').checked,
        };

        if (!payload.date) {
            errEl.textContent = 'Veuillez sélectionner une date.';
            errEl.style.display = 'block';
            return;
        }

        try {
            await onSave(payload);
            close();
        } catch (e) {
            errEl.textContent = e.response?.data?.date?.[0] || e.message || 'Erreur lors de l\'enregistrement.';
            errEl.style.display = 'block';
        }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return overlay;
};
