/**
 * ServiceGallerySlider.js — MIXO
 * Galerie ServiceDetailPage (client) — Image 1.
 * Grande image principale + jusqu'à 3 miniatures cliquables ;
 * la 3ème miniature affiche un overlay "+N photos" si la galerie est plus longue.
 *
 * @param {string|null} mainImage    URL de l'image principale (couverture)
 * @param {Array<string>} galleryImages  URLs des images de galerie supplémentaires
 * @returns {HTMLElement}
 */
export const ServiceGallerySlider = (mainImage, galleryImages = []) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sgs-wrapper';

    const images = [mainImage, ...galleryImages].filter(Boolean);
    const thumbs = galleryImages.slice(0, 3);
    const extra  = Math.max(0, galleryImages.length - 3);

    wrapper.innerHTML = `
        <div class="sgs-main">
            ${images[0]
                ? `<img src="${images[0]}" alt="" class="sgs-main-img" id="sgs-main-img"/>`
                : `<div class="sgs-main-placeholder"><i data-lucide="image"></i></div>`
            }
        </div>
        ${thumbs.length ? `
        <div class="sgs-thumbs">
            ${thumbs.map((img, i) => `
                <div class="sgs-thumb" data-idx="${i + 1}">
                    <img src="${img}" alt="" loading="lazy"/>
                    ${i === 2 && extra > 0 ? `<div class="sgs-overlay">+${extra} photos</div>` : ''}
                </div>
            `).join('')}
        </div>` : ''}
    `;

    if (images.length > 1) {
        wrapper.querySelectorAll('.sgs-thumb').forEach((thumb) => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.dataset.idx, 10);
                if (images[idx]) {
                    const mainImg = wrapper.querySelector('#sgs-main-img');
                    if (mainImg) mainImg.src = images[idx];
                }
            });
        });
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};