/**
 * AdminPlanForm.js — MIXO
 * Modal de création/modification d'un plan d'abonnement (Espace Admin).
 *
 * @param {Object|null} planExistant
 * @param {Function} onSave (payload) => Promise
 * @param {Function} onClose () => void
 * @returns {HTMLElement}
 */
export const AdminPlanForm = (planExistant, onSave, onClose) => {
    const overlay = document.createElement('div');
    overlay.className = 'dsr-overlay';
    const isEdit = !!planExistant;

    overlay.innerHTML = `
        <div class="dsr-modal apf-modal">
            <div class="dsr-header">
                <h3>${isEdit ? 'Modifier le plan' : 'Nouveau plan'}</h3>
                <button class="dsr-close" type="button"><i data-lucide="x"></i></button>
            </div>
            <div class="dsr-body">
                <div class="dsr-field">
                    <label>Nom du plan</label>
                    <input type="text" id="apf-nom" value="${escapeAttr(planExistant?.nom || '')}"/>
                </div>
                <div class="dsr-row">
                    <div class="dsr-field">
                        <label>Type</label>
                        <select id="apf-type">
                            <option value="STANDARD" ${planExistant?.plan === 'STANDARD' ? 'selected' : ''}>Standard</option>
                            <option value="PREMIUM"  ${planExistant?.plan === 'PREMIUM'  ? 'selected' : ''}>Premium</option>
                            <option value="PRO"      ${planExistant?.plan === 'PRO'      ? 'selected' : ''}>Pro</option>
                        </select>
                    </div>
                    <div class="dsr-field">
                        <label>Prix mensuel (FC)</label>
                        <input type="number" id="apf-prix" min="0" step="0.01" value="${planExistant?.prix_mensuel || ''}"/>
                    </div>
                </div>
                <div class="dsr-field">
                    <label>Description</label>
                    <textarea id="apf-description" rows="2">${escapeHtml(planExistant?.description || '')}</textarea>
                </div>
                <div class="dsr-field">
                    <label>Avantages (un par ligne)</label>
                    <textarea id="apf-avantages" rows="4">${escapeHtml(planExistant?.avantages || '')}</textarea>
                </div>
                <p class="dsr-error" id="apf-error" style="display:none;"></p>
            </div>
            <div class="dsr-footer">
                <button class="dsr-btn-cancel" type="button">Annuler</button>
                <button class="dsr-btn-save" type="button">${isEdit ? 'Enregistrer' : 'Créer'}</button>
            </div>
        </div>
    `;

    const close = () => { overlay.remove(); onClose?.(); };
    overlay.querySelector('.dsr-close').addEventListener('click', close);
    overlay.querySelector('.dsr-btn-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('.dsr-btn-save').addEventListener('click', async () => {
        const errEl = overlay.querySelector('#apf-error');
        const payload = {
            nom:          overlay.querySelector('#apf-nom').value.trim(),
            plan:         overlay.querySelector('#apf-type').value,
            prix_mensuel: overlay.querySelector('#apf-prix').value,
            description:  overlay.querySelector('#apf-description').value.trim(),
            avantages:    overlay.querySelector('#apf-avantages').value.trim(),
        };

        if (!payload.nom) {
            errEl.textContent = 'Le nom du plan est obligatoire.';
            errEl.style.display = 'block';
            return;
        }

        try {
            await onSave(payload);
            close();
        } catch (e) {
            errEl.textContent = e.message || 'Erreur lors de l\'enregistrement.';
            errEl.style.display = 'block';
        }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return overlay;
};

function escapeAttr(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
