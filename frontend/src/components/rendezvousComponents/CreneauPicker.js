/**
 * CreneauPicker.js — MIXO
 * Sélecteur date + créneau horaire pour la réservation.
 *
 * @param {string} coiffeurId
 * @param {string} serviceId
 * @param {Function} onSlotSelected (dateISO, heureStr) => void
 * @returns {{ element: HTMLElement, getSelection: Function }}
 */
import { RendezVousAPI } from '../../api/RendezVousAPI.js';

export const CreneauPicker = (coiffeurId, serviceId, onSlotSelected) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'crp-wrapper';

    const toLocalDateInputValue = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

    const today = toLocalDateInputValue(new Date());
    let selectedDate = today;
    let selectedHeure = null;

    wrapper.innerHTML = `
        <div class="crp-field">
            <label>Date</label>
            <input type="date" id="crp-date" min="${today}" value="${today}"/>
        </div>
        <div class="crp-slots-wrap">
            <label>Créneaux disponibles</label>
            <div id="crp-slots" class="crp-slots"><div class="mxo-spinner"></div></div>
        </div>
    `;

    const dateInput = wrapper.querySelector('#crp-date');
    const slotsEl   = wrapper.querySelector('#crp-slots');

    const chargerCreneaux = async (date = selectedDate, autoSelectFirstAvailable = false) => {
        slotsEl.innerHTML = `<div class="mxo-spinner"></div>`;
        selectedHeure = null;
        try {
            const data = await RendezVousAPI.getCreneauxDisponibles(coiffeurId, date, serviceId);
            if (!data.creneaux?.length) {
                slotsEl.innerHTML = `<p class="crp-empty">${data.motif_indisponibilite || 'Aucun créneau disponible ce jour-là.'}</p>`;
                return false;
            }
            selectedDate = date;
            dateInput.value = date;
            slotsEl.innerHTML = '';
            data.creneaux.forEach(heure => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'crp-slot-btn';
                btn.textContent = heure;
                btn.addEventListener('click', () => {
                    slotsEl.querySelectorAll('.crp-slot-btn').forEach(b => b.classList.remove('crp-slot-active'));
                    btn.classList.add('crp-slot-active');
                    selectedHeure = heure;
                    onSlotSelected?.(selectedDate, selectedHeure);
                });
                slotsEl.appendChild(btn);
            });
            if (autoSelectFirstAvailable && data.creneaux.length) {
                const firstBtn = slotsEl.querySelector('.crp-slot-btn');
                firstBtn?.click();
            }
            return true;
        } catch {
            slotsEl.innerHTML = `<p class="crp-empty">Erreur de chargement des créneaux.</p>`;
            return false;
        }
    };

    dateInput.addEventListener('change', () => {
        selectedDate = dateInput.value;
        chargerCreneaux();
    });

    const initialiser = async () => {
        const start = new Date();
        for (let offset = 0; offset < 14; offset += 1) {
            const candidate = toLocalDateInputValue(addDays(start, offset));
            const hasSlots = await chargerCreneaux(candidate, offset === 0);
            if (hasSlots) return;
        }
        slotsEl.innerHTML = `<p class="crp-empty">Aucun créneau disponible dans les 14 prochains jours.</p>`;
    };

    initialiser();

    return {
        element: wrapper,
        getSelection: () => (selectedHeure ? { date: selectedDate, heure: selectedHeure } : null),
    };
};
