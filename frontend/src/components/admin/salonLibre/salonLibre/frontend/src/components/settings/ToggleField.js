/**
 * ============================================================
 * COMPOSANT ATOMIQUE : ToggleField.js
 * ============================================================
 * Champ spécial : toggle ON/OFF pour le champ "Spécialité".
 * Visible uniquement pour les coiffeurs.
 * Quand activé, affiche un input texte pour saisir la spécialité.
 * ============================================================
 */

/**
 * @param {string}   value      - Valeur initiale de la spécialité
 * @param {boolean}  isCoiffeur - Affiche le champ uniquement si true
 */
export const ToggleField = (value = '', isCoiffeur = false) => {
    const wrapper = document.createElement('div');
    // Masqué pour les clients (Règle 6 : logique par rôle)
    wrapper.className = `settings-field-wrapper${!isCoiffeur ? ' d-none' : ''}`;
    wrapper.id = 'toggle-field-wrapper';

    const isActive = Boolean(value);

    wrapper.innerHTML = `
        <div class="settings-toggle-row">
            <div class="d-flex align-items-center gap-2">
                <i data-lucide="star" class="settings-field-icon"></i>
                <span class="settings-toggle-label">Spécialité</span>
            </div>

            <!-- Toggle switch pill -->
            <label class="toggle-pill" title="Activer la spécialité">
                <input type="checkbox" id="toggle-specialite" ${isActive ? 'checked' : ''} />
                <span class="toggle-slider">
                    <span class="toggle-dot"></span>
                </span>
                <span class="toggle-status-text">${isActive ? 'ON' : 'OFF'}</span>
            </label>
        </div>

        <!-- Input spécialité, visible uniquement si toggle ON -->
        <div class="settings-field-inner mt-2 ${isActive ? '' : 'd-none'}" id="specialite-input-wrapper">
            <i data-lucide="scissors" class="settings-field-icon"></i>
            <input
                type="text"
                id="specialite-value"
                class="settings-input"
                placeholder=" "
                value="${value}"
            />
            <label for="specialite-value" class="settings-field-label">Votre spécialité</label>
        </div>
    `;

    // --- LOGIQUE DU TOGGLE ---
    const checkbox      = wrapper.querySelector('#toggle-specialite');
    const inputWrapper  = wrapper.querySelector('#specialite-input-wrapper');
    const statusText    = wrapper.querySelector('.toggle-status-text');

    checkbox.addEventListener('change', () => {
        const checked = checkbox.checked;
        // Affiche ou masque le champ texte
        inputWrapper.classList.toggle('d-none', !checked);
        statusText.textContent = checked ? 'ON' : 'OFF';
    });

    return wrapper;
};

/**
 * Récupère la valeur finale de la spécialité depuis le ToggleField.
 * Retourne une chaîne vide si le toggle est OFF.
 * @param {HTMLElement} container - Conteneur parent
 */
export const getSpecialiteValue = (container) => {
    const checkbox = container.querySelector('#toggle-specialite');
    const input    = container.querySelector('#specialite-value');
    if (!checkbox || !checkbox.checked) return '';
    return input ? input.value.trim() : '';
};