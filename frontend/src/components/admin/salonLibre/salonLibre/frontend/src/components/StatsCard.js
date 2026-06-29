/**
 * Composant Atomique StatsCard (PascalCase)
 * @param {Object} data - Données de la statistique
 */
export const StatsCard = (data) => {
    const card = document.createElement('div');
    
    // Attribution de la classe thématique principale (Évite le code spaghetti)
    const cardTypeClass = data.type === 'highlight' ? 'card-glass-gold' 
                        : data.type === 'ad' ? 'card-glass-ad' 
                        : 'card-glass-standard';

    card.className = `stats-card-item ${cardTypeClass} d-flex flex-column justify-content-center align-items-center text-center`;
    
    const isAd = data.type === 'ad';
    
    card.innerHTML = `
        <h2 class="stats-number m-0">
            ${data.value}
        </h2>
        <p class="stats-label m-0">
            ${data.label}
        </p>
    `;

    return card;
};