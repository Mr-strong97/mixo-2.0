import { onSectionScrollProgress } from '../../utils/scrollReveal.js';

/**
 * TransformationShowcase.js — Mixo
 * Section signature : un canvas sticky joue, image par image, la séquence
 * extraite de la vidéo fournie (visage neutre -> grand sourire) au fil du
 * scroll — la même technique que les pages produit Apple, appliquée au
 * parcours Mixo : "D'une recherche... à un sourire."
 *
 * - Préchargement de 56 frames (public/images/transformation/frame_XXXX.jpg)
 * - Mapping scroll -> index de frame (rAF-throttlé, cf. utils/scrollReveal.js)
 * - 3 cartes-étapes qui s'activent en fonction de la progression du scroll
 */

const FRAME_COUNT = 56;
const FRAME_PATH = '/images/transformation/frame_';

export const TransformationShowcase = () => {
    const section = document.createElement('section');
    section.className = 'mixo-transform';
    section.id = 'experience';

    const steps = [
        {
            num: '01',
            show: 0,
            hide: 0.38,
            title: 'Décrivez ce que vous voulez',
            text: 'Recherchez par prestation, style ou disponibilité : Mixo affiche les coiffeurs qui correspondent, près de chez vous.'
        },
        {
            num: '02',
            show: 0.38,
            hide: 0.72,
            title: 'Choisissez votre coiffeur',
            text: 'Comparez profils, avis et créneaux disponibles, puis réservez votre rendez-vous en un instant.'
        },
        {
            num: '03',
            show: 0.72,
            hide: 1.01,
            title: 'Vivez le rendez-vous Mixo',
            text: 'Rappels automatiques, suivi en temps réel — et un résultat qui se voit, et qui se ressent.'
        }
    ];

    section.innerHTML = `
        <div class="mixo-transform__inner">
            <div class="mixo-transform__sticky">
                <div class="mixo-transform__glow" aria-hidden="true"></div>

                <div class="mixo-transform__heading">
                    <span class="mixo-eyebrow"><i data-lucide="sparkles"></i><span>L'expérience Mixo</span></span>
                    <h2>D'une recherche&hellip; à un sourire.</h2>
                </div>

                <div class="mixo-transform__canvas-wrap">
                    <canvas class="mixo-transform__canvas" aria-hidden="true"></canvas>
                    <div class="mixo-transform__loading">
                        <span class="mixo-transform__spinner" aria-hidden="true"></span>
                        <span class="mixo-transform__loading_text">Chargement de l'aperçu&hellip;</span>
                    </div>
                </div>

                ${steps.map((step) => `
                    <div class="mixo-transform__step" data-show="${step.show}" data-hide="${step.hide}">
                        <span class="mixo-transform__step_num">${step.num}</span>
                        <div>
                            <h3>${step.title}</h3>
                            <p>${step.text}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const canvas = section.querySelector('.mixo-transform__canvas');
    const wrap = section.querySelector('.mixo-transform__canvas-wrap');
    const loading = section.querySelector('.mixo-transform__loading');
    const loadingText = section.querySelector('.mixo-transform__loading_text');
    const stepEls = Array.from(section.querySelectorAll('.mixo-transform__step'));

    const ctx = canvas.getContext('2d');
    const frames = [];
    let loadedCount = 0;
    let ready = false;
    let currentFrame = -1;

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = wrap.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        if (currentFrame >= 0) drawFrame(currentFrame);
    }

    function drawFrame(index) {
        const img = frames[index];
        if (!img || !img.complete || !img.naturalWidth) return;
        // Source carré (640x640) + canvas carré : remplissage direct sans déformation.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    function updateSteps(progress) {
        stepEls.forEach((el, i) => {
            const { show, hide } = steps[i];
            el.classList.toggle('is-active', progress >= show && progress < hide);
        });
    }

    function handleProgress(progress) {
        updateSteps(progress);
        if (!ready) return;

        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.floor(progress * FRAME_COUNT))
        );
        if (frameIndex !== currentFrame) {
            currentFrame = frameIndex;
            drawFrame(currentFrame);
        }
    }

    // Préchargement de la séquence de frames
    for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `${FRAME_PATH}${String(i).padStart(4, '0')}.jpg`;
        const onDone = () => {
            loadedCount++;
            if (loadingText) {
                loadingText.textContent = `Chargement de l'aperçu… ${Math.round((loadedCount / FRAME_COUNT) * 100)}%`;
            }
            if (loadedCount === FRAME_COUNT) {
                ready = true;
                loading?.classList.add('is-hidden');
                resizeCanvas();
                drawFrame(0);
            }
        };
        img.onload = onDone;
        img.onerror = onDone;
        frames.push(img);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    onSectionScrollProgress(section, handleProgress);

    return section;
};
