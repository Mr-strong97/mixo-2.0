/**
 * WeekScheduleGrid.js — MIXO
 * Grille hebdomadaire des horaires — une colonne par jour, créneaux empilés.
 *
 * @param {Array<{id,jour_semaine,jour_semaine_label,heure_debut,heure_fin,actif}>} horaires
 * @param {Object} handlers { onAdd(jour), onEdit(horaire), onDelete(horaire), onToggle(horaire, actif) }
 * @returns {HTMLElement}
 */
const JOURS = [
    { val: 0, label: 'Lundi' }, { val: 1, label: 'Mardi' }, { val: 2, label: 'Mercredi' },
    { val: 3, label: 'Jeudi' }, { val: 4, label: 'Vendredi' }, { val: 5, label: 'Samedi' },
    { val: 6, label: 'Dimanche' },
];

export const WeekScheduleGrid = (horaires = [], handlers = {}) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'wsg-grid';

    JOURS.forEach(jour => {
        const col = document.createElement('div');
        col.className = 'wsg-col';

        const creneauxJour = horaires.filter(h => h.jour_semaine === jour.val);

        col.innerHTML = `
            <div class="wsg-col-header">
                <span>${jour.label}</span>
                <button class="wsg-add-btn" type="button" title="Ajouter un créneau">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="wsg-slots"></div>
        `;

        const slotsEl = col.querySelector('.wsg-slots');

        if (!creneauxJour.length) {
            slotsEl.innerHTML = `<div class="wsg-empty">Fermé</div>`;
        } else {
            creneauxJour.forEach(h => {
                const slot = document.createElement('div');
                slot.className = `wsg-slot ${!h.actif ? 'wsg-slot-inactive' : ''}`;
                slot.innerHTML = `
                    <span class="wsg-slot-time">${h.heure_debut.slice(0,5)} – ${h.heure_fin.slice(0,5)}</span>
                    <div class="wsg-slot-actions">
                        <button class="wsg-icon-btn" data-action="edit" title="Modifier"><i data-lucide="pencil"></i></button>
                        <button class="wsg-icon-btn wsg-icon-danger" data-action="delete" title="Supprimer"><i data-lucide="trash-2"></i></button>
                    </div>
                `;
                slot.querySelector('[data-action="edit"]').addEventListener('click', () => handlers.onEdit?.(h));
                slot.querySelector('[data-action="delete"]').addEventListener('click', () => handlers.onDelete?.(h));
                slotsEl.appendChild(slot);
            });
        }

        col.querySelector('.wsg-add-btn').addEventListener('click', () => handlers.onAdd?.(jour.val));
        wrapper.appendChild(col);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};
