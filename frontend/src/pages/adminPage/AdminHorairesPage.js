/**
 * AdminHorairesPage.js — MIXO
 * Espace Admin — Section Horaires (rendue dans AdminServicesDashboardPage)
 */
import { AdminHorairesAPI } from '../../api/AdminHorairesAPI.js';

/**
 * Rendu de la section Horaires dans un conteneur fourni par le dashboard hôte.
 * @param {HTMLElement} container
 */
export const renderAdminHorairesSection = async (container) => {
    try {
        const [horaires, anomaliesData] = await Promise.all([
            AdminHorairesAPI.getHoraires(),
            AdminHorairesAPI.getAnomalies(),
        ]);

        container.innerHTML = `
            <div class="adb-section-header">
                <h2>Horaires</h2>
            </div>

            ${anomaliesData.total_anomalies > 0 ? `
                <div class="ahp-anomalies-box">
                    <i data-lucide="alert-triangle"></i>
                    <div>
                        <strong>${anomaliesData.total_anomalies} anomalie(s) détectée(s)</strong>
                        <ul>
                            ${anomaliesData.anomalies.map(a => `
                                <li>${escapeHtml(a.coiffeur)} — ${escapeHtml(a.jour)} : ${escapeHtml(a.detail)} <em>(${a.type === 'chevauchement' ? 'chevauchement' : 'heures incohérentes'})</em></li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            ` : `
                <div class="ahp-ok-box">
                    <i data-lucide="check-circle"></i>
                    <span>Aucune anomalie détectée dans les horaires.</span>
                </div>
            `}

            <h3 class="aap-subtitle">Tous les créneaux (${horaires.length})</h3>
            <div class="ahp-table-wrap">
                <table class="ast-table">
                    <thead><tr><th>COIFFEUR</th><th>JOUR</th><th>HORAIRE</th><th>STATUT</th></tr></thead>
                    <tbody>
                        ${horaires.map(h => `
                            <tr>
                                <td>${escapeHtml(h.coiffeur_username || '—')}</td>
                                <td>${escapeHtml(h.jour_semaine_label)}</td>
                                <td>${h.heure_debut.slice(0,5)} – ${h.heure_fin.slice(0,5)}</td>
                                <td><span class="ast-badge" style="background:${h.actif ? '#DCFCE7' : '#F0F4F9'};color:${h.actif ? '#16A34A' : '#94A3B8'};">${h.actif ? 'Actif' : 'Inactif'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

    } catch {
        container.innerHTML = `<p class="adb-error">Erreur de chargement des horaires.</p>`;
    }
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
