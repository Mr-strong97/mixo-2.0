/**
 * StatsCatalogue.js — Coiffetime / MIXO
 * Composant de statistiques et de présentation des chiffres clés du catalogue
 */
export const StatsCatalogue = (data = {}) => {
    const statsContainer = document.createElement('section');
    statsContainer.className = 'mixo-stats-catalogue';

    // Valeurs par défaut si aucune donnée dynamique n'est fournie par l'API
    const totalCoiffeurs = data.coiffeurs || '24';
    const totalAvis = data.avis || '4.9';
    const totalPrestations = data.prestations || '15+';

    statsContainer.innerHTML = `
        <div class="m_stats_grid">
            <!-- Stat 1 : Artisans Coiffeurs -->
            <div class="m_stat_card">
                <div class="m_stat_icon_box" style="background: rgba(26, 86, 219, 0.08); color: #1A56DB;">
                    <i data-lucide="scissors"></i>
                </div>
                <div class="m_stat_info">
                    <h3 class="m_stat_number">${totalCoiffeurs}</h3>
                    <p class="m_stat_label">Coiffeurs Experts en ligne</p>
                </div>
            </div>

            <!-- Stat 2 : Note & Satisfaction -->
            <div class="m_stat_card">
                <div class="m_stat_icon_box" style="background: rgba(245, 158, 11, 0.08); color: #F59E0B;">
                    <i data-lucide="star" style="fill: #F59E0B;"></i>
                </div>
                <div class="m_stat_info">
                    <h3 class="m_stat_number">${totalAvis} <span class="m_stat_small">/5</span></h3>
                    <p class="m_stat_label">Avis de notre communauté</p>
                </div>
            </div>

            <!-- Stat 3 : Services & Spécialités -->
            <div class="m_stat_card">
                <div class="m_stat_icon_box" style="background: rgba(16, 185, 129, 0.08); color: #10B981;">
                    <i data-lucide="shield-check"></i>
                </div>
                <div class="m_stat_info">
                    <h3 class="m_stat_number">${totalPrestations}</h3>
                    <p class="m_stat_label">Prestations & Soins signatures</p>
                </div>
            </div>
        </div>
    `;

    return statsContainer;
};