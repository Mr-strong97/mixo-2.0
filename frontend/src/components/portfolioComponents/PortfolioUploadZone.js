/**
 * PortfolioUploadZone.js — MIXO
 * Zone d'ajout de nouvelles réalisations (image ou vidéo) au portfolio.
 *
 * @param {Function} onFilesSelected (FileList) => void
 * @returns {HTMLElement}
 */
export const PortfolioUploadZone = (onFilesSelected) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'pfu-wrapper';

    wrapper.innerHTML = `
        <input type="file" id="pfu-input" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" multiple hidden/>
        <div class="pfu-zone" id="pfu-zone" tabindex="0">
            <i data-lucide="upload-cloud" class="pfu-icon"></i>
            <p class="pfu-text">Glissez vos photos ou vidéos ici</p>
            <span class="pfu-hint">ou cliquez pour parcourir — JPG, PNG, WEBP, MP4 (max 15 Mo)</span>
        </div>
    `;

    const input = wrapper.querySelector('#pfu-input');
    const zone  = wrapper.querySelector('#pfu-zone');

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') input.click(); });

    input.addEventListener('change', () => {
        if (input.files.length) onFilesSelected(input.files);
        input.value = '';
    });

    ['dragenter', 'dragover'].forEach(evt =>
        zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('pfu-dragover'); }));
    ['dragleave', 'drop'].forEach(evt =>
        zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove('pfu-dragover'); }));
    zone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};
