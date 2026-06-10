/**
 * ============================================================
 * COMPOSANT ATOMIQUE : FormField.js
 * ============================================================
 * Input réutilisable avec icône Lucide, label flottant et style glass.
 * C'est la brique de base de tous les formulaires du projet.
 * ============================================================
 */

/**
 * @param {Object} config
 * @param {string} config.id          - Identifiant unique du champ
 * @param {string} config.type        - 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select'
 * @param {string} config.label       - Label affiché
 * @param {string} config.icon        - Nom icône Lucide
 * @param {string} config.value       - Valeur initiale
 * @param {boolean} config.disabled   - Si true, champ en lecture seule
 * @param {string[]} config.options   - Pour type='select', liste des options
 * @param {boolean} config.hidden     - Masque complètement le champ si true
 */
export const FormField = ({
    id,
    type      = 'text',
    label     = '',
    icon      = 'edit',
    value     = '',
    disabled  = false,
    options   = [],
    hidden    = false,
} = {}) => {
    const wrapper = document.createElement('div');
    wrapper.className = `settings-field-wrapper${hidden ? ' d-none' : ''}`;
    wrapper.dataset.fieldId = id;

    // Construction de l'élément input/textarea/select
    let inputEl;

    if (type === 'textarea') {
        inputEl = `
            <textarea
                id="${id}"
                class="settings-input"
                placeholder=" "
                rows="3"
                ${disabled ? 'disabled' : ''}
            >${value}</textarea>
        `;
    } else if (type === 'select') {
        const optionsHtml = options.map(opt =>
            `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        inputEl = `
            <select id="${id}" class="settings-input" ${disabled ? 'disabled' : ''}>
                <option value="" disabled ${!value ? 'selected' : ''}>Choisir...</option>
                ${optionsHtml}
            </select>
        `;
    } else {
        inputEl = `
            <input
                id="${id}"
                type="${type}"
                class="settings-input"
                placeholder=" "
                value="${value}"
                ${disabled ? 'disabled' : ''}
            />
        `;
    }

    wrapper.innerHTML = `
        <div class="settings-field-inner">
            <i data-lucide="${icon}" class="settings-field-icon"></i>
            ${inputEl}
            <label for="${id}" class="settings-field-label">${label}</label>
        </div>
    `;

    return wrapper;
};

/**
 * Récupère la valeur actuelle d'un FormField par son id.
 * Utile dans SettingsForm pour lire tous les champs.
 * @param {HTMLElement} container - Conteneur parent
 * @param {string} id             - id du champ
 */
export const getFieldValue = (container, id) => {
    const el = container.querySelector(`#${id}`);
    return el ? el.value.trim() : '';
};