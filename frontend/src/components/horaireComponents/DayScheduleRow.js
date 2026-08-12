/**
 * DayScheduleRow.js — MIXO
 * Formulaire modal d'ajout/modification d'un créneau horaire.
 *
 * @param {number} jourSemaine  jour pré-sélectionné (0-6)
 * @param {Object|null} horaireExistant  si fourni, mode édition
 * @param {Function} onSave (payload) => Promise
 * @param {Function} onClose () => void
 * @returns {HTMLElement}  l'overlay modal (déjà monté sur document.body par l'appelant si besoin)
 */
const JOURS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const DayScheduleRow = (jourSemaine, horaireExistant, onSave, onClose) => {
    const overlay = document.createElement('div');
    overlay.className = 'dsr-overlay';

    const isEdit = !!horaireExistant;

    overlay.innerHTML = `
        <div class="dsr-modal" role="dialog" aria-modal="true" aria-labelledby="dsr-title">
            <div class="dsr-header">
                <h3 id="dsr-title">${isEdit ? 'Modifier le créneau' : 'Ajouter un créneau'} — ${JOURS_LABELS[jourSemaine]}</h3>
                <button class="dsr-close" type="button" aria-label="Fermer"><i data-lucide="x"></i></button>
            </div>
            <div class="dsr-body">
                <div class="dsr-row">
                    <div class="dsr-field">
                        <label>Heure de début</label>
                        <input type="time" id="dsr-debut" value="${horaireExistant?.heure_debut?.slice(0,5) || '09:00'}"/>
                    </div>
                    <div class="dsr-field">
                        <label>Heure de fin</label>
                        <input type="time" id="dsr-fin" value="${horaireExistant?.heure_fin?.slice(0,5) || '18:00'}"/>
                    </div>
                </div>
                <p class="dsr-error" id="dsr-error" style="display:none;"></p>
            </div>
            <div class="dsr-footer">
                <button class="dsr-btn-cancel" type="button">Annuler</button>
                <button class="dsr-btn-save" type="button">${isEdit ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
        </div>
    `;

    const close = () => { overlay.remove(); onClose?.(); };
    overlay.querySelector('.dsr-close').addEventListener('click', close);
    overlay.querySelector('.dsr-btn-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    overlay.querySelector('.dsr-btn-save').addEventListener('click', async () => {
        const debut = overlay.querySelector('#dsr-debut').value;
        const fin   = overlay.querySelector('#dsr-fin').value;
        const errEl = overlay.querySelector('#dsr-error');

        if (debut >= fin) {
            errEl.textContent = "L'heure de fin doit être postérieure à l'heure de début.";
            errEl.style.display = 'block';
            return;
        }

        try {
            await onSave({
                jour_semaine: jourSemaine,
                heure_debut: `${debut}:00`,
                heure_fin: `${fin}:00`,
            });
            close();
        } catch (e) {
            errEl.textContent = e.message || 'Erreur lors de l\'enregistrement.';
            errEl.style.display = 'block';
        }
    });

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
        overlay.querySelector('#dsr-debut')?.focus();
    }, 0);
    return overlay;
};
