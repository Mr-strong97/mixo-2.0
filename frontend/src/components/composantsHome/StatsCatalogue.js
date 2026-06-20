import { animateCountUp } from '../../utils/scrollReveal.js';

/**
 * StatsCatalogue.js — Mixo
 * Bandeau de statistiques de la plateforme, avec animation "count-up"
 * (easeOutExpo) déclenchée à l'entrée dans le viewport.
 */
export const StatsCatalogue = () => {
    const section = document.createElement('section');
    section.className = 'mixo-stats-catalogue mixo-catalogue-section';

    const stats = [
        { icon: 'users', target: 12400, suffix: '+', label: 'Clients inscrits' },
        { icon: 'scissors', target: 850, suffix: '+', label: 'Coiffeurs actifs' },
        { icon: 'list-checks', target: 3200, suffix: '+', label: 'Services publiés' },
        { icon: 'calendar-check', target: 47600, suffix: '+', label: 'Rendez-vous réalisés' }
    ];

    section.innerHTML = `
        <div class="m_stats_grid">
            ${stats.map((stat, i) => `
                <div class="m_stat_card" data-animate="fade-up" data-delay="${i * 80}">
                    <span class="m_stat_icon_box"><i data-lucide="${stat.icon}"></i></span>
                    <div class="m_stat_info">
                        <p class="m_stat_number" data-target="${stat.target}" data-suffix="${stat.suffix}">0${stat.suffix}</p>
                        <p class="m_stat_label">${stat.label}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Déclenche le count-up une seule fois, dès que la grille entre dans le viewport.
    const numbers = Array.from(section.querySelectorAll('.m_stat_number'));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                numbers.forEach((el, i) => {
                    const target = Number(el.dataset.target);
                    const suffix = el.dataset.suffix || '';
                    setTimeout(() => animateCountUp(el, target, { suffix }), i * 150);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.4 });

    observer.observe(section);

    return section;
};
