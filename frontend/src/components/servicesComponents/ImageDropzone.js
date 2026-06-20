/**
 * ImageDropzone.js — MIXO
 * Zone de glisser-déposer pour l'image de couverture d'un service
 * (Images 2, 6, 7 — "Glisser-déposer l'image principale").
 *
 * @param {string|null} initialUrl  URL d'une image existante à pré-afficher (mode édition)
 * @returns {{ element: HTMLElement, getFile: Function, setPreviewUrl: Function, reset: Function, hasImage: Function }}
 */
export const ImageDropzone = (initialUrl = null) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'idz-wrapper';

    let currentFile = null;

    wrapper.innerHTML = `
        <input type="file" id="idz-input" accept="image/png,image/jpeg,image/webp" hidden/>
        <div class="idz-zone" id="idz-zone" tabindex="0">
            <div class="idz-empty" id="idz-empty">
                <div class="idz-icon-wrap">
                    <i data-lucide="camera" class="idz-icon"></i>
                    <i data-lucide="plus" class="idz-icon-plus"></i>
                </div>
                <p class="idz-text">Glisser-déposer l'image principale</p>
                <span class="idz-hint">Format recommandé : 16:9, min. 1200×675px</span>
            </div>
            <img class="idz-preview" id="idz-preview" alt="Aperçu de l'image de couverture" style="display:none;"/>
            <button class="idz-remove" id="idz-remove" type="button" title="Retirer l'image" style="display:none;">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;

    const input     = wrapper.querySelector('#idz-input');
    const zone      = wrapper.querySelector('#idz-zone');
    const empty     = wrapper.querySelector('#idz-empty');
    const preview   = wrapper.querySelector('#idz-preview');
    const removeBtn = wrapper.querySelector('#idz-remove');

    const showPreview = (url) => {
        preview.src = url;
        preview.style.display   = 'block';
        empty.style.display     = 'none';
        removeBtn.style.display = 'flex';
    };

    const reset = () => {
        currentFile = null;
        preview.removeAttribute('src');
        preview.style.display   = 'none';
        empty.style.display     = 'flex';
        removeBtn.style.display = 'none';
        input.value = '';
    };

    const handleFile = (file) => {
        if (!file || !file.type?.startsWith('image/')) return;
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => showPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    // Clic sur la zone → ouvre le sélecteur de fichier (sauf clic sur "retirer")
    zone.addEventListener('click', (e) => {
        if (e.target.closest('#idz-remove')) return;
        input.click();
    });
    zone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });

    input.addEventListener('change', () => handleFile(input.files[0]));

    // Drag & drop
    ['dragenter', 'dragover'].forEach(evt =>
        zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('idz-dragover'); }));
    ['dragleave', 'drop'].forEach(evt =>
        zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove('idz-dragover'); }));
    zone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

    removeBtn.addEventListener('click', (e) => { e.stopPropagation(); reset(); });

    if (initialUrl) showPreview(initialUrl);

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);

    return {
        element: wrapper,
        getFile: () => currentFile,
        setPreviewUrl: showPreview,
        reset,
        hasImage: () => !!currentFile || preview.style.display === 'block',
    };
};