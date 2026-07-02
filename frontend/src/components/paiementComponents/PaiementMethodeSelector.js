/**
 * PaiementMethodeSelector.js — MIXO
 * Sélecteur de méthode de paiement mobile money.
 *
 * @param {Function} onChange (methode) => void
 * @returns {{ element: HTMLElement, getMethode: Function }}
 */
const METHODES = [
    { val: 'AIRTEL_MONEY',   label: 'Airtel Money',   emoji: '<img src="/images/airtel.png" alt="Airtel Money" />' },
    { val: 'ORANGE_MONEY',   label: 'Orange Money',   emoji: '<img src="/images/orange.png" alt="Orange Money" />' },
    { val: 'MPESA',          label: 'M-Pesa',         emoji: '<img src="/images/vodacom.png" alt="M-Pesa" />' },
    { val: 'AFRICELL_MONEY', label: 'Africell Money', emoji: '<img src="/images/africell.png" alt="Africell Money" />' },
];

export const PaiementMethodeSelector = (onChange = null) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'pms-wrapper';

    let selected = null;

    wrapper.innerHTML = `<div class="pms-grid"></div>`;
    const grid = wrapper.querySelector('.pms-grid');

    METHODES.forEach(m => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'pms-card';
        card.dataset.val = m.val;
        card.innerHTML = `
            <span class="pms-emoji">${m.emoji}</span>
            <span class="pms-label">${m.label}</span>
        `;
        card.addEventListener('click', () => {
            grid.querySelectorAll('.pms-card').forEach(c => c.classList.remove('pms-card-active'));
            card.classList.add('pms-card-active');
            selected = m.val;
            onChange?.(m.val);
        });
        grid.appendChild(card);
    });

    return {
        element: wrapper,
        getMethode: () => selected,
    };
};
