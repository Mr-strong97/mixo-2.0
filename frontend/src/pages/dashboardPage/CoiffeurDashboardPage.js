/**
 * CoiffeurDashboardPage.js — MIXO
 * Tableau de bord professionnel
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { CoiffeurDashboardAPI } from '../../api/CoiffeurDashboardAPI.js';
import { AvisAPI } from '../../api/AvisAPI.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';

import '../../styles/dashboardStyles/CoiffeurDashboardPage.css';

export const CoiffeurDashboardPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'cdp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'cdp-main';
    main.innerHTML = `<div class="cdp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const renderBars = (items = [], metric = 'total') => {
        const max = Math.max(...items.map(i => Number(i[metric] || 0)), 1);
        return items.map(item => `
            <div class="cdp-chart-row">
                <div class="cdp-chart-label">${escapeHtml(item.date || item.label || '')}</div>
                <div class="cdp-chart-bar"><span style="width:${Math.max(8, (Number(item[metric] || 0) / max) * 100)}%"></span></div>
                <div class="cdp-chart-value">${Number(item[metric] || 0).toFixed(metric === 'total' && typeof item[metric] === 'number' && !Number.isInteger(item[metric]) ? 2 : 0)}</div>
            </div>
        `).join('');
    };

    const render = (data) => {
        const indicateurs = data.indicateurs || {};
        const revenus = data.revenus || {};
        const recentRdv = data.rendezvous_recents || [];
        const recentAvis = data.avis_recents || [];

        main.innerHTML = `
            <section class="cdp-hero">
                <div>
                    <p class="cdp-kicker">Dashboard professionnel</p>
                    <h1>Vue globale de votre activité</h1>
                    <p>Suivi des rendez-vous, revenus, avis et services les plus performants.</p>
                </div>
                <div class="cdp-hero-revenue">
                    <span>Revenus totaux</span>
                    <strong>${formatPrix(revenus.total)} €</strong>
                </div>
            </section>

            <section class="cdp-stats-grid" id="cdp-stats-grid">
                ${statCard('Rendez-vous', indicateurs.total_rendezvous, 'calendar-range')}
                ${statCard("Aujourd'hui", indicateurs.rendezvous_aujourdhui, 'calendar-check')}
                ${statCard('Cette semaine', indicateurs.rendezvous_semaine, 'calendar-week')}
                ${statCard('Services', indicateurs.total_services, 'scissors')}
                ${statCard('Clients', indicateurs.total_clients, 'users')}
                ${statCard('Avis reçus', indicateurs.nombre_avis, 'star')}
                ${statCard('Note moyenne', indicateurs.note_moyenne, 'star-half')}
            </section>

            <section class="cdp-revenue-grid">
                ${metricCard('Revenus du jour', revenus.jour)}
                ${metricCard('Revenus de la semaine', revenus.semaine)}
                ${metricCard('Revenus du mois', revenus.mois)}
                ${metricCard('Revenus totaux', revenus.total)}
            </section>

            <section class="cdp-columns">
                <article class="cdp-panel">
                    <div class="cdp-panel-head">
                        <h2>Rendez-vous récents</h2>
                        <span>${recentRdv.length} éléments</span>
                    </div>
                    <div class="cdp-table">
                        ${recentRdv.length ? recentRdv.map(rdv => `
                            <div class="cdp-table-row">
                                <div>
                                    <strong>${escapeHtml(rdv.client_username)}</strong>
                                    <span>${escapeHtml(rdv.service_nom)}</span>
                                </div>
                                <div>${formatDate(rdv.date_heure_debut)}</div>
                                <div><span class="cdp-status cdp-status-${rdv.statut.toLowerCase()}">${escapeHtml(rdv.statut)}</span></div>
                            </div>
                        `).join('') : '<p class="cdp-empty-inline">Aucun rendez-vous récent.</p>'}
                    </div>
                </article>

                <article class="cdp-panel">
                    <div class="cdp-panel-head">
                        <h2>Avis récents</h2>
                        <span>${recentAvis.length} éléments</span>
                    </div>
                    <div class="cdp-review-list">
                        ${recentAvis.length ? recentAvis.map(avis => `
                            <div class="cdp-review-card">
                                <div class="cdp-review-head">
                                    <strong>${escapeHtml(avis.client_username)}</strong>
                                    <span>⭐ ${avis.note}/5</span>
                                </div>
                                <p>${escapeHtml(avis.commentaire || 'Aucun commentaire.')}</p>
                                ${avis.reponse_coiffeur ? `<div class="cdp-review-reply"><strong>Votre réponse :</strong> ${escapeHtml(avis.reponse_coiffeur)}</div>` : ''}
                                <div class="cdp-review-actions">
                                    ${avis.reponse_coiffeur ? '' : `<button class="btn btn-outline-primary btn-sm" type="button" data-reply="${avis.id}">Répondre</button>`}
                                </div>
                            </div>
                        `).join('') : '<p class="cdp-empty-inline">Aucun avis récent.</p>'}
                    </div>
                </article>
            </section>

            <section class="cdp-columns">
                <article class="cdp-panel">
                    <div class="cdp-panel-head">
                        <h2>Services les plus demandés</h2>
                        <span>Réservations</span>
                    </div>
                    <div class="cdp-top-services">
                        ${(data.services_populaires || []).map(service => `
                            <div class="cdp-top-item">
                                <div>
                                    <strong>${escapeHtml(service.nom_prestation)}</strong>
                                    <span>${service.total_reservations} réservations</span>
                                </div>
                                <div class="cdp-mini-score">⭐ ${service.note_moyenne || 0}</div>
                            </div>
                        `).join('') || '<p class="cdp-empty-inline">Aucune donnée disponible.</p>'}
                    </div>
                </article>

                <article class="cdp-panel">
                    <div class="cdp-panel-head">
                        <h2>Services les plus rentables</h2>
                        <span>Revenus</span>
                    </div>
                    <div class="cdp-top-services">
                        ${(data.services_plus_rentables || []).map(service => `
                            <div class="cdp-top-item">
                                <div>
                                    <strong>${escapeHtml(service.nom_prestation)}</strong>
                                    <span>${service.total_reservations} réservations</span>
                                </div>
                                <div class="cdp-mini-score">${formatPrix(service.revenu_total)} €</div>
                            </div>
                        `).join('') || '<p class="cdp-empty-inline">Aucune donnée disponible.</p>'}
                    </div>
                </article>
            </section>

            <section class="cdp-charts">
                <article class="cdp-panel">
                    <div class="cdp-panel-head"><h2>Évolution des rendez-vous</h2></div>
                    <div class="cdp-chart">${renderBars(data.graphiques?.rendezvous || [], 'total')}</div>
                </article>
                <article class="cdp-panel">
                    <div class="cdp-panel-head"><h2>Évolution des revenus</h2></div>
                    <div class="cdp-chart">${renderBars(data.graphiques?.revenus || [], 'total')}</div>
                </article>
                <article class="cdp-panel">
                    <div class="cdp-panel-head"><h2>Évolution des avis</h2></div>
                    <div class="cdp-chart">${renderBars(data.graphiques?.avis || [], 'total')}</div>
                </article>
            </section>
        `;

        main.querySelectorAll('[data-reply]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const avisId = btn.getAttribute('data-reply');
                const reponse = window.prompt("Votre réponse à l'avis :");
                if (!reponse) return;
                try {
                    await AvisAPI.repondre(avisId, reponse);
                    showToast('✅ Réponse envoyée.');
                    charger();
                } catch (error) {
                    showToast(error.response?.data?.detail || 'Impossible de répondre à cet avis.', 'error');
                }
            });
        });

        if (window.lucide) window.lucide.createIcons();
    };

    const charger = async () => {
        main.innerHTML = `<div class="cdp-loader"><div class="mxo-spinner"></div></div>`;
        try {
            const data = await CoiffeurDashboardAPI.getMonDashboard();
            render(data);
        } catch (error) {
            main.innerHTML = `
                <div class="cdp-empty">
                    <i data-lucide="alert-triangle"></i>
                    <h2>Impossible de charger le dashboard</h2>
                    <p>${error.response?.data?.detail || 'Réessayez plus tard.'}</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    charger();
    return page;
};

function statCard(label, value, icon) {
    return `
        <div class="cdp-stat">
            <div class="cdp-stat-icon"><i data-lucide="${icon}"></i></div>
            <span>${escapeHtml(label)}</span>
            <strong>${value ?? 0}</strong>
        </div>
    `;
}

function metricCard(label, value) {
    return `
        <div class="cdp-revenue-card">
            <span>${escapeHtml(label)}</span>
            <strong>${formatPrix(value)} €</strong>
        </div>
    `;
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPrix(prix) {
    const n = parseFloat(prix);
    if (Number.isNaN(n)) return '0';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

