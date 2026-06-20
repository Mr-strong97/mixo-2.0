/**
 * WizardStepper.js — MIXO
 * Stepper horizontal réutilisable (3, 4 étapes ou plus).
 *
 * États visuels :
 *   - Terminé  : cercle vert avec coche ✓
 *   - Actif    : cercle bleu avec le numéro de l'étape
 *   - À venir  : cercle gris clair avec le numéro de l'étape
 *
 * @param {Array<{label:string}>} steps
 * @param {number} currentIndex  index (0-based) de l'étape active
 * @returns {HTMLElement}
 */
export const WizardStepper = (steps = [], currentIndex = 0) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'wzs-stepper';

    steps.forEach((step, i) => {
        const isDone   = i < currentIndex;
        const isActive = i === currentIndex;

        const node = document.createElement('div');
        node.className = 'wzs-step';
        node.innerHTML = `
            <div class="wzs-circle ${isDone ? 'wzs-done' : isActive ? 'wzs-active' : 'wzs-pending'}">
                ${isDone ? '<i data-lucide="check"></i>' : `<span>${i + 1}</span>`}
            </div>
            <span class="wzs-label ${isActive ? 'wzs-label-active' : ''} ${isDone ? 'wzs-label-done' : ''}">
                ${step.label}
            </span>
        `;
        wrapper.appendChild(node);

        if (i < steps.length - 1) {
            const line = document.createElement('div');
            line.className = `wzs-line ${i < currentIndex ? 'wzs-line-done' : ''}`;
            wrapper.appendChild(line);
        }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};