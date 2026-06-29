/**
 * Composant Input avec icône et style transparent
 * @param {string} type - type de l'input (text, email, password)
 * @param {string} placeholder - texte d'aide
 * @param {string} iconName - nom de l'icône Lucide
 */
export const InputGroup = (type, placeholder, iconName) => {
    const div = document.createElement('div');
    div.className = 'input-group-custom mb-3';

    div.innerHTML = `
        <div class="input-wrapper">
            <i data-lucide="${iconName}" class="input-icon"></i>
            <input type="${type}" placeholder="${placeholder}" class="glass-input">
        </div>
    `;
    return div;
};