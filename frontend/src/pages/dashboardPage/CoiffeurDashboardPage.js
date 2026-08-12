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
        const priorityRdv = getPriorityRendezVous(recentRdv);
        const username = localStorage.getItem('username') || 'Coiffeur';

        main.innerHTML = `
            <section class="cdp-hero">
                <div class="cdp-hero-copy">
                    <h1>Bonjour ${escapeHtml(username)}, organisez votre journée.</h1>
                    <p>Votre prochain rendez-vous et les actions essentielles sont regroupés en premier.</p>
                </div>
                <div class="cdp-hero-revenue">
                    <span>Revenus totaux</span>
                    <strong>${formatPrix(revenus.total)} <small>FC</small></strong>
                </div>
            </section>

            ${priorityCard(priorityRdv)}

            <div class="cdp-section-heading">
                <h2>Repères d’activité</h2>
                <div class="cdp-heading-actions">
                    <button type="button" data-cdp-route="/coiffeur/rendez-vous"><i data-lucide="calendar-days"></i> Rendez-vous</button>
                    <button type="button" data-cdp-route="/coiffeur/services/new"><i data-lucide="plus"></i> Nouveau service</button>
                </div>
            </div>
            <section class="cdp-stats-grid" id="cdp-stats-grid">
                ${statCard('Rendez-vous', indicateurs.total_rendezvous, 'calendar-range')}
                ${statCard("Aujourd'hui", indicateurs.rendezvous_aujourdhui, 'calendar-check')}
                ${statCard('Cette semaine', indicateurs.rendezvous_semaine, 'calendar-days')}
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
                                <div><span class="cdp-status cdp-status-${normalizeStatut(rdv.statut)}">${escapeHtml(formatStatutLabel(rdv.statut))}</span></div>
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
                                <div class="cdp-mini-score">${formatPrix(service.revenu_total)} FC</div>
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

        main.querySelectorAll('[data-cdp-route]').forEach((button) => {
            button.addEventListener('click', () => window.navigate?.(button.dataset.cdpRoute));
        });

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
            const message = getDashboardErrorMessage(error);
            main.innerHTML = `
                <div class="cdp-empty">
                    <i data-lucide="alert-triangle"></i>
                    <h2>Impossible de charger le dashboard</h2>
                    <p>${escapeHtml(message)}</p>
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

function priorityCard(rdv) {
    if (!rdv) {
        return `
            <article class="cdp-priority cdp-priority-empty">
                <div class="cdp-priority-icon"><i data-lucide="calendar-check"></i></div>
                <div class="cdp-priority-copy">
                    <h2>Votre agenda est à jour</h2>
                    <p>Aucun rendez-vous récent ne demande votre attention. Vous pouvez vérifier vos disponibilités.</p>
                </div>
                <button type="button" class="cdp-priority-button" data-cdp-route="/coiffeur/horaires">
                    Voir mes horaires <i data-lucide="arrow-right"></i>
                </button>
            </article>`;
    }

    const statut = rdv.statut || 'À consulter';
    const price = rdv.service_prix_snapshot ?? rdv.prix ?? null;
    return `
        <article class="cdp-priority">
            <div class="cdp-priority-icon"><i data-lucide="calendar-clock"></i></div>
            <div class="cdp-priority-copy">
                <div class="cdp-priority-topline">
                    <span class="cdp-status cdp-status-${normalizeStatut(statut)}">${escapeHtml(formatStatutLabel(statut))}</span>
                </div>
                <h2>Prochain rendez-vous avec ${escapeHtml(rdv.client_username || 'le client')}</h2>
                <p>${escapeHtml(rdv.service_nom || rdv.service_nom_snapshot || 'Service de coiffure')}</p>
                <div class="cdp-priority-meta">
                    <span><i data-lucide="calendar-days"></i>${formatDate(rdv.date_heure_debut)}</span>
                    ${price !== null ? `<span><i data-lucide="wallet-cards"></i>${formatPrix(price)} FC</span>` : ''}
                </div>
            </div>
            <button type="button" class="cdp-priority-button" data-cdp-route="/coiffeur/rendez-vous">
                Gérer ce rendez-vous <i data-lucide="arrow-right"></i>
            </button>
        </article>`;
}

function getPriorityRendezVous(items = []) {
    return [...items]
        .filter(Boolean)
        .sort((a, b) => new Date(a.date_heure_debut || 0) - new Date(b.date_heure_debut || 0))
        .find((item) => ['EN_ATTENTE', 'ACCEPTE'].includes(String(item.statut || '').toUpperCase()))
        || items[0]
        || null;
}

function metricCard(label, value) {
    return `
        <div class="cdp-revenue-card">
            <span>${escapeHtml(label)}</span>
            <strong>${formatPrix(value)} FC</strong>
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
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function formatStatutLabel(statut) {
    const labels = {
        EN_ATTENTE: 'En attente',
        ACCEPTE: 'Accepté',
        CONFIRME: 'Confirmé',
        REFUSE: 'Refusé',
        ANNULE: 'Annulé',
        TERMINE: 'Terminé',
    };
    const key = String(statut || '').toUpperCase();
    return labels[key] || statut || 'À consulter';
}

function getDashboardErrorMessage(error) {
    const apiDetail = error?.response?.data?.detail;
    if (apiDetail) return apiDetail;
    if (error?.code === 'ECONNABORTED') {
        return 'Le chargement du dashboard a pris trop de temps. Réessayez dans un instant.';
    }
    if (error?.code === 'ERR_CANCELED') {
        return 'Le chargement du dashboard a été interrompu. Réessayez.';
    }
    return 'Réessayez plus tard.';
}

function normalizeStatut(statut) {
    return String(statut || 'inconnu')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-');
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
