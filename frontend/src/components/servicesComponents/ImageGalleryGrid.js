/**
 * ImageGalleryGrid.js — MIXO
 * Grille "Galerie photos" avec compteur X/N, ajout multiple et suppression
 * (Images 2, 4, 7 — "0/8 photos" en création, "Galerie (3/5)" en édition).
 *
 * @param {Array<{id:string,url:string}>} existingImages  images déjà sauvegardées (mode édition)
 * @param {number} maxImages  nombre maximum d'images (8 par défaut, 5 en édition)
 * @param {Function|null} onDeleteExisting  callback(imageId) appelé à la suppression d'une image existante
 * @returns {{ element: HTMLElement, getNewFiles: Function, getExisting: Function, refresh: Function }}
 */
export const ImageGalleryGrid = (existingImages = [], maxImages = 8, onDeleteExisting = null) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'igg-wrapper';

    let existing = [...existingImages];
    let newFiles = [];

    wrapper.innerHTML = `
        <div class="igg-header">
            <span class="igg-title">Galerie photos</span>
            <span class="igg-counter" id="igg-counter">0/${maxImages} photos</span>
        </div>
        <input type="file" id="igg-input" accept="image/png,image/jpeg,image/webp" multiple hidden/>
        <div class="igg-grid" id="igg-grid"></div>
    `;

    const grid    = wrapper.querySelector('#igg-grid');
    const counter = wrapper.querySelector('#igg-counter');
    const input   = wrapper.querySelector('#igg-input');

    const total = () => existing.length + newFiles.length;

    const render = () => {
        grid.innerHTML = '';
        counter.textContent = `${total()}/${maxImages} photos`;

        // Cellule "Ajouter" — toujours en premier si de la place reste disponible
        if (total() < maxImages) {
            const addCell = document.createElement('button');
            addCell.type = 'button';
            addCell.className = 'igg-cell igg-add';
            addCell.innerHTML = `<i data-lucide="plus"></i><span>Ajouter</span>`;
            addCell.addEventListener('click', () => input.click());
            grid.appendChild(addCell);
        }

        // Images déjà sauvegardées
        existing.forEach((img) => {
            const cell = document.createElement('div');
            cell.className = 'igg-cell igg-filled';
            cell.innerHTML = `
                <img src="${img.url}" alt="" loading="lazy"/>
                <button type="button" class="igg-del" title="Supprimer"><i data-lucide="trash-2"></i></button>
            `;
            cell.querySelector('.igg-del').addEventListener('click', () => {
                existing = existing.filter(i => i.id !== img.id);
                if (onDeleteExisting) onDeleteExisting(img.id);
                render();
            });
            grid.appendChild(cell);
        });

        // Nouveaux fichiers (aperçu local via FileReader)
        newFiles.forEach((file, idx) => {
            const cell = document.createElement('div');
            cell.className = 'igg-cell igg-filled igg-new';
            cell.innerHTML = `
                <img alt="" loading="lazy"/>
                <span class="igg-new-badge">Nouveau</span>
                <button type="button" class="igg-del" title="Retirer"><i data-lucide="trash-2"></i></button>
            `;
            const imgEl = cell.querySelector('img');
            const reader = new FileReader();
            reader.onload = (e) => { imgEl.src = e.target.result; };
            reader.readAsDataURL(file);

            cell.querySelector('.igg-del').addEventListener('click', () => {
                newFiles = newFiles.filter((_, i) => i !== idx);
                render();
            });
            grid.appendChild(cell);
        });

        // Cases vides restantes (placeholders visuels)
        const occupied  = (total() < maxImages ? 1 : 0) + total();
        const remaining = Math.max(0, maxImages - occupied);
        for (let i = 0; i < remaining; i++) {
            const cell = document.createElement('div');
            cell.className = 'igg-cell igg-empty';
            cell.innerHTML = `<i data-lucide="image"></i>`;
            grid.appendChild(cell);
        }

        if (window.lucide) window.lucide.createIcons();
    };

    input.addEventListener('change', () => {
        const files = Array.from(input.files);
        const space = maxImages - total();
        if (space <= 0) { input.value = ''; return; }
        newFiles.push(...files.slice(0, space));
        input.value = '';
        render();
    });

    render();

    return {
        element: wrapper,
        getNewFiles: () => newFiles,
        getExisting: () => existing,
        refresh: render,
    };
};