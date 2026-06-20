/**
 * ServiceStatsCards.js — MIXO
 * 4 cartes KPI pour CoiffeurServicesPage (Image 8) :
 * TOTAL SERVICES · ACTIFS · DÉSACTIVÉS · RENDEZ-VOUS LIÉS
 *
 * @param {{
 *   total?:             number,
 *   actifs?:            number,
 *   desactives?:        number,
 *   reservations_liees?: number
 * }} stats
 * @returns {HTMLElement}
 */
export const ServiceStatsCards = (stats = {}) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ssc-grid';

    const cards = [
        {
            label: 'TOTAL SERVICES',
            value: stats.total ?? 0,
            icon:  'archive',
            color: '#0A66C2',
        },
        {
            label: 'ACTIFS',
            value: stats.actifs ?? 0,
            icon:  'check-circle',
            color: '#16A34A',
        },
        {
            label: 'DÉSACTIVÉS',
            value: stats.desactives ?? 0,
            icon:  'pause-circle',
            color: '#D97706',
        },
        {
            label: 'RENDEZ-VOUS LIÉS',
            value: stats.reservations_liees ?? 0,
            icon:  'calendar-check',
            color: '#7C3AED',
        },
    ];

    wrapper.innerHTML = cards.map(c => `
        <div class="ssc-card">
            <div class="ssc-text">
                <span class="ssc-label">${c.label}</span>
                <span class="ssc-value">${Number(c.value).toLocaleString('fr-FR')}</span>
            </div>
            <div class="ssc-icon" style="background:${c.color}14;color:${c.color};">
                <i data-lucide="${c.icon}"></i>
            </div>
        </div>
    `).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};