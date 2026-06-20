/**
 * AdminSidebarMenu.js — MIXO
 * Menu interne du Dashboard Administration Services.
 *
 * @param {string} activeSection  'services'|'abonnements'|'horaires'|'portfolio'
 * @param {Function} onChange (section) => void
 * @returns {HTMLElement}
 */
const SECTIONS = [
    { id: 'services',    label: 'Services',     icon: 'scissors' },
    { id: 'abonnements', label: 'Abonnements',   icon: 'credit-card' },
    { id: 'horaires',    label: 'Horaires',      icon: 'calendar-clock' },
    { id: 'portfolio',   label: 'Portfolios',    icon: 'image' },
];

export const AdminSidebarMenu = (activeSection, onChange) => {
    const nav = document.createElement('nav');
    nav.className = 'asm-nav';

    SECTIONS.forEach(sec => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `asm-item ${sec.id === activeSection ? 'asm-active' : ''}`;
        btn.innerHTML = `<i data-lucide="${sec.icon}"></i> ${sec.label}`;
        btn.addEventListener('click', () => onChange(sec.id));
        nav.appendChild(btn);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return nav;
};
