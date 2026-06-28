/**
 * RatingStarsBar.js — MIXO
 * Répartition des notes sous forme de barres de progression.
 *
 * @param {{ note_moyenne, total, repartition: {'1':n,'2':n,...} }} stats
 * @returns {HTMLElement}
 */
export const RatingStarsBar = (stats) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'rsb-wrapper';

    wrapper.innerHTML = `
        <div class="rsb-global">
            <span class="rsb-moyenne">${stats.note_moyenne}</span>
            <div class="rsb-stars">
                ${Array.from({ length: 5 }, (_, i) =>
                    `<i data-lucide="star" class="rsb-star ${i < Math.round(stats.note_moyenne) ? 'rsb-star-filled' : ''}"></i>`
                ).join('')}
            </div>
            <span class="rsb-total">${stats.total} avis</span>
        </div>
        <div class="rsb-bars">
            ${[5,4,3,2,1].map(n => {
                const count = stats.repartition?.[String(n)] || 0;
                const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return `
                    <div class="rsb-row">
                        <span class="rsb-label">${n} ★</span>
                        <div class="rsb-bar-track">
                            <div class="rsb-bar-fill" style="width:${pct}%;"></div>
                        </div>
                        <span class="rsb-count">${count}</span>
                    </div>`;
            }).join('')}
        </div>
    `;

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};
