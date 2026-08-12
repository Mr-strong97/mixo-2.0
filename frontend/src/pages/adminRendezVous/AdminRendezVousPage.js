/**
 * AdminRendezVousPage.js — MIXO
 * Supervision administrateur des rendez-vous.
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import AdminService from '../../api/AdminService.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';

import '../../styles/adminStyles/AdminRendezVousPage.css';

const STATUS = [
    ['', 'Tous'],
    ['EN_ATTENTE', 'En attente'],
    ['ACCEPTE', 'Accepté'],
    ['REFUSE', 'Refusé'],
    ['ANNULE', 'Annulé'],
    ['SUSPENDU', 'Suspendu'],
    ['TERMINE', 'Terminé'],
];

export const AdminRendezVousPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'arv-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'arv-main';
    main.innerHTML = `
        <section class="arv-hero">
            <div>
                <h1>Gestion des rendez-vous</h1>
                <p>Recherche, filtres, détail complet et actions administratives tracées.</p>
            </div>
            <div class="arv-hero-actions">
                <button class="adm-btn adm-btn-primary" id="arv-refresh" type="button"><i data-lucide="refresh-cw"></i> Actualiser</button>
                <button class="adm-btn adm-btn-ghost" id="arv-stats" type="button"><i data-lucide="bar-chart-2"></i> Statistiques</button>
            </div>
        </section>

        <section class="arv-toolbar">
            <div class="arv-search">
                <i data-lucide="search"></i>
                <input id="arv-search" type="search" placeholder="Client, coiffeur, service…">
            </div>
            <input id="arv-date" type="date" class="arv-date">
            <select id="arv-status" class="arv-select">
                ${STATUS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
            </select>
            <button class="adm-btn adm-btn-primary" id="arv-apply" type="button"><i data-lucide="filter"></i> Filtrer</button>
        </section>

        <section class="arv-stats" id="arv-stats-row"></section>

        <section class="arv-layout">
            <article class="arv-card">
                <div class="arv-card-head">
                    <div>
                        <h2>Rendez-vous enregistrés</h2>
                    </div>
                    <span class="adm-pill" id="arv-count">0</span>
                </div>
                <div class="arv-table-wrap" id="arv-table"></div>
            </article>

            <aside class="arv-detail" id="arv-detail">
                <div class="adm-empty">Sélectionnez un rendez-vous pour voir son détail.</div>
            </aside>
        </section>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    const state = { items: [], selected: null, stats: null };

    const load = async () => {
        main.querySelector('#arv-table').innerHTML = `<div class="adm-dash-loader"><div class="adm-spinner"></div></div>`;
        try {
            const [items, stats] = await Promise.all([
                AdminService.getRendezVous({
                    search: main.querySelector('#arv-search').value.trim(),
                    statut: main.querySelector('#arv-status').value,
                    date: main.querySelector('#arv-date').value,
                    page_size: 100,
                }),
                AdminService.getRendezVousStats(),
            ]);

            state.items = items.resultats || items.results || [];
            state.stats = stats;
            render();
        } catch (error) {
            main.querySelector('#arv-table').innerHTML = `<div class="adm-empty adm-empty-error">${escapeHtml(error.message || 'Impossible de charger les rendez-vous.')}</div>`;
        }
    };

    const render = async () => {
        main.querySelector('#arv-count').textContent = `${state.items.length}`;
        main.querySelector('#arv-stats-row').innerHTML = renderStats(state.stats);
        main.querySelector('#arv-table').innerHTML = renderTable(state.items);
        main.querySelector('#arv-detail').innerHTML = state.selected
            ? renderDetail(state.selected)
            : `<div class="adm-empty">Sélectionnez un rendez-vous pour voir son détail.</div>`;

        main.querySelectorAll('[data-rdv-id]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.rdvId;
                try {
                    state.selected = await AdminService.getRendezVousDetail(id);
                    render();
                } catch (error) {
                    showToast(error.message || 'Impossible de charger le détail.', 'error');
                }
            });
        });

        main.querySelectorAll('[data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.rdvId;
                const motif = prompt('Motif d’annulation ?') || '';
                if (!motif.trim()) return;
                try {
                    await AdminService.cancelRendezVous(id, { motif });
                    showToast('✅ Rendez-vous annulé.');
                    await load();
                } catch (error) {
                    showToast(error.message || 'Erreur.', 'error');
                }
            });
        });

        main.querySelectorAll('[data-action="suspend"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.rdvId;
                const motif = prompt('Motif de suspension ?') || '';
                if (!motif.trim()) return;
                try {
                    await AdminService.suspendRendezVous(id, { motif });
                    showToast('⏸ Rendez-vous suspendu.');
                    await load();
                } catch (error) {
                    showToast(error.message || 'Erreur.', 'error');
                }
            });
        });

        main.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.rdvId;
                const dt = prompt('Nouvelle date/heure ISO (ex: 2026-06-28T14:00:00Z) ?');
                if (!dt) return;
                try {
                    await AdminService.updateRendezVous(id, { date_heure_debut: dt });
                    showToast('✅ Rendez-vous mis à jour.');
                    await load();
                } catch (error) {
                    showToast(error.message || 'Erreur.', 'error');
                }
            });
        });

        if (window.lucide) window.lucide.createIcons();
    };

    main.querySelector('#arv-refresh').addEventListener('click', load);
    main.querySelector('#arv-apply').addEventListener('click', load);
    main.querySelector('#arv-stats').addEventListener('click', () => window.navigate?.('/admin'));

    load();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

function renderStats(stats) {
    const s = stats || {};
    const values = [
        ['Total', s.total ?? 0, 'calendar'],
        ['En attente', s.en_attente ?? 0, 'clock'],
        ['Acceptés', s.acceptes ?? 0, 'check-circle'],
        ['Annulés', s.annules ?? 0, 'ban'],
        ['Terminés', s.termines ?? 0, 'badge-check'],
    ];
    return values.map(([label, value, icon]) => `
        <article class="arv-stat-card">
            <i data-lucide="${icon}"></i>
            <div>
                <span>${label}</span>
                <strong>${value}</strong>
            </div>
        </article>
    `).join('');
}

function renderTable(items) {
    if (!items.length) return `<div class="adm-empty">Aucun rendez-vous trouvé.</div>`;
    return `
        <table class="arv-table">
            <thead><tr><th>#</th><th>Client</th><th>Coiffeur</th><th>Service</th><th>Date</th><th>Statut</th><th>Paiement</th><th>Actions</th></tr></thead>
            <tbody>
                ${items.map((rdv, i) => {
                    const statut = String(rdv.statut || 'INCONNU');
                    return `
                    <tr>
                        <td data-label="N°">${i + 1}</td>
                        <td data-label="Client">${escapeHtml(rdv.client_username || '')}</td>
                        <td data-label="Coiffeur">${escapeHtml(rdv.coiffeur_username || '')}</td>
                        <td data-label="Service">${escapeHtml(rdv.service_name || rdv.service_nom_snapshot || '')}</td>
                        <td data-label="Date">${formatDate(rdv.date_heure_debut)}</td>
                        <td data-label="Statut"><span class="arv-badge arv-badge-${statut.toLowerCase()}">${escapeHtml(statut)}</span></td>
                        <td data-label="Paiement">${rdv.paiement ? escapeHtml(String(rdv.paiement)) : '—'}</td>
                        <td class="arv-actions" data-label="Actions">
                            <button class="adm-icon-btn" data-rdv-id="${rdv.id}" title="Détail"><i data-lucide="eye"></i></button>
                            <button class="adm-icon-btn" data-action="edit" data-rdv-id="${rdv.id}" title="Modifier"><i data-lucide="pencil"></i></button>
                            <button class="adm-icon-btn" data-action="suspend" data-rdv-id="${rdv.id}" title="Suspendre"><i data-lucide="pause-circle"></i></button>
                            <button class="adm-icon-btn" data-action="cancel" data-rdv-id="${rdv.id}" title="Annuler"><i data-lucide="x-circle"></i></button>
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function renderDetail(rdv) {
    const client = rdv.client_detail || {};
    const coiffeur = rdv.coiffeur_detail || {};
    const service = rdv.service_detail || {};
    const paiement = rdv.paiement_detail || {};
    return `
        <div class="arv-detail-card">
            <div class="arv-detail-head">
                <div>
                    <h2>${escapeHtml(service.nom_prestation || rdv.service_nom_snapshot || 'Rendez-vous')}</h2>
                </div>
                <span class="arv-badge arv-badge-${String(rdv.statut || 'inconnu').toLowerCase()}">${escapeHtml(rdv.statut || 'INCONNU')}</span>
            </div>

            <div class="arv-detail-grid">
                <div><span>Client</span><strong>@${escapeHtml(client.username || rdv.client_username || '')}</strong><p>${escapeHtml(client.email || '')}</p></div>
                <div><span>Coiffeur</span><strong>@${escapeHtml(coiffeur.username || rdv.coiffeur_username || '')}</strong><p>${escapeHtml(coiffeur.specialite || '')}</p></div>
                <div><span>Date</span><strong>${formatDate(rdv.date_heure_debut)}</strong><p>${formatDate(rdv.date_heure_fin)}</p></div>
                <div><span>Paiement</span><strong>${paiement ? formatMoney(paiement.montant_total || 0) : '—'}</strong><p>${escapeHtml(paiement.statut || '—')}</p></div>
            </div>

            <div class="arv-detail-block">
                <h3>Service</h3>
                <p>${escapeHtml(service.description || rdv.service_nom_snapshot || '')}</p>
            </div>

            <div class="arv-detail-block">
                <h3>Historique</h3>
                ${(rdv.historique || []).length
                    ? rdv.historique.map(h => `
                        <div class="arv-history-row">
                            <strong>${escapeHtml(h.action)}</strong>
                            <p>${formatDate(h.created_at)} · ${escapeHtml(JSON.stringify(h.details || {}))}</p>
                        </div>
                    `).join('')
                    : `<p class="adm-empty">Aucun historique disponible.</p>`
                }
            </div>
        </div>
    `;
}

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
}

function formatMoney(value) {
    const n = Number(value || 0);
    return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} FC`;
}

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
