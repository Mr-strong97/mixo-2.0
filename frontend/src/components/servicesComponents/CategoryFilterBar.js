/**
 * CategoryFilterBar.js — MIXO
 * Chips de catégories scrollables horizontalement (Image 3 + Image 8).
 * "Toutes les catégories" est toujours ajouté en premier (id = null).
 *
 * @param {Array<{id:string,nom:string,icone?:string}>} categories
 * @param {string|null} activeId  id de la catégorie active (null = toutes)
 * @param {Function|null} onChange (categorieId|null) => void
 * @returns {HTMLElement}
 */
export const CategoryFilterBar = (categories = [], activeId = null, onChange = null) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'cfb-wrapper';

    const all = [{ id: null, nom: 'Toutes les catégories', icone: null }, ...categories];

    all.forEach((cat) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `cfb-chip ${cat.id === activeId ? 'cfb-active' : ''}`;
        chip.dataset.id = cat.id ?? '';
        chip.innerHTML = `${cat.icone ? `<span class="cfb-icon">${cat.icone}</span>` : ''}${escapeHtml(cat.nom)}`;

        chip.addEventListener('click', () => {
            wrapper.querySelectorAll('.cfb-chip').forEach(c => c.classList.remove('cfb-active'));
            chip.classList.add('cfb-active');
            if (onChange) onChange(cat.id);
        });

        wrapper.appendChild(chip);
    });

    return wrapper;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}