import { StatsModel } from '../models/StatsModel.js';
import { StatsCard } from './StatsCard.js';

/**
 * Composant Moyen StatsCatalogue
 * Gère l'assemblage et l'alignement responsive de la rangée de statistiques.
 */
export const StatsCatalogue = () => {
    const statsData = StatsModel.getStats();

    const section = document.createElement('section');
    section.className = 'stats-catalogue-section container my-5';

    // Conteneur principal "bandeau" vitré
    section.innerHTML = `
        <div class="glass-strip-container">
            <div class="row g-3" id="stats-dynamic-row"></div>
        </div>
    `;

    const row = section.querySelector('#stats-dynamic-row');

    // Injection via boucle DRY
    statsData.forEach(stat => {
        const col = document.createElement('div');
        // Mobile: 12 (empilé) | Tablette: 6 (2x2) | PC portable & grand écran: 3 (4 alignés)
        col.className = 'col-12 col-md-6 col-lg-3';
        
        const card = StatsCard(stat);
        col.appendChild(card);
        
        row.appendChild(col);
    });

    return section;
};