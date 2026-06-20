/**
 * AdminPortfolioPage.js — MIXO
 * Espace Admin — Section Portfolios (rendue dans AdminServicesDashboardPage)
 */
import { AdminPortfolioAPI } from '../../api/AdminPortfolioAPI.js';
import { confirmDialog }     from '../../utils/confirmDialog.js';
import { showToast }         from '../../utils/toast.js';

/**
 * Rendu de la section Portfolios dans un conteneur fourni par le dashboard hôte.
 * @param {HTMLElement} container
 */
export const renderAdminPortfolioSection = async (container) => {
    let signaleSeulement = false;

    const render = async () => {
        try {
            const medias = await AdminPortfolioAPI.getMedias(signaleSeulement);

            container.innerHTML = `
                <div class="adb-section-header">
                    <h2>Portfolios</h2>
                    <label class="apf-filter-toggle">
                        <input type="checkbox" id="app-filter-signale" ${signaleSeulement ? 'checked' : ''}/>
                        <span>Signalés uniquement</span>
                    </label>
                </div>

                ${!medias.length
                    ? `<p class="adb-empty">${signaleSeulement ? 'Aucun média signalé.' : 'Aucun média dans le portfolio.'}</p>`
                    : `<div class="app-grid" id="app-grid"></div>`
                }
            `;

            container.querySelector('#app-filter-signale').addEventListener('change', (e) => {
                signaleSeulement = e.target.checked;
                render();
            });

            const grid = container.querySelector('#app-grid');
            if (grid) {
                medias.forEach(m => {
                    const cell = document.createElement('div');
                    cell.className = `app-cell ${m.signale ? 'app-cell-signale' : ''}`;
                    cell.innerHTML = `
                        ${m.type === 'video'
                            ? `<video src="${m.url}" class="app-media" muted></video>`
                            : `<img src="${m.url}" class="app-media" alt=""/>`
                        }
                        <div class="app-info">
                            <span class="app-coiffeur">${escapeHtml(m.coiffeur_username)}</span>
                            ${m.signale ? `<span class="app-signale-tag"><i data-lucide="flag"></i> Signalé</span>` : ''}
                        </div>
                        <div class="app-overlay">
                            ${!m.signale ? `<button class="app-btn" data-action="signaler"><i data-lucide="flag"></i></button>` : ''}
                            <button class="app-btn app-btn-danger" data-action="delete"><i data-lucide="trash-2"></i></button>
                        </div>
                    `;
                    cell.querySelector('[data-action="signaler"]')?.addEventListener('click', () => {
                        const motif = window.prompt('Motif du signalement :');
                        if (motif === null) return;
                        AdminPortfolioAPI.signalerMedia(m.id, motif)
                            .then(() => { showToast('🚩 Média signalé.'); render(); })
                            .catch(() => showToast('❌ Erreur.'));
                    });
                    cell.querySelector('[data-action="delete"]').addEventListener('click', () => {
                        confirmDialog('Supprimer ce média ?', 'Cette action est irréversible.').then((ok) => {
                            if (!ok) return;
                            AdminPortfolioAPI.supprimerMedia(m.id)
                                .then(() => { showToast('🗑 Média supprimé.'); render(); })
                                .catch(() => showToast('❌ Erreur.'));
                        });
                    });
                    grid.appendChild(cell);
                });
            }

            if (window.lucide) window.lucide.createIcons();

        } catch {
            container.innerHTML = `<p class="adb-error">Erreur de chargement des portfolios.</p>`;
        }
    };

    render();
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
