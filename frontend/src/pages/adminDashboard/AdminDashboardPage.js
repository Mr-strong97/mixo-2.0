/**
 * AdminDashboardPage.js — MIXO
 * Tableau de bord administrateur global.
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import AdminService from '../../api/AdminService.js';
import { requireRole } from '../../utils/AuthGuard.js';

import '../../styles/adminStyles/AdminDashboardHome.css';

export const AdminDashboardPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-dash-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'adm-dash-main';
    main.innerHTML = `
        <section class="adm-dash-hero">
            <div class="adm-dash-hero-copy">
                <p class="adm-dash-kicker">Centre de contrôle</p>
                <h1>Tableau de bord administrateur</h1>
                <p>Supervision globale de la plateforme, des comptes, des rendez-vous, des paiements et du journal système.</p>
            </div>
            <div class="adm-dash-hero-actions">
                <button class="adm-btn adm-btn-primary" id="adm-dash-refresh" type="button"><i data-lucide="refresh-cw"></i> Actualiser</button>
                <button class="adm-btn adm-btn-ghost" id="adm-dash-go-rdv" type="button"><i data-lucide="calendar"></i> Rendez-vous</button>
            </div>
        </section>

        <section class="adm-dash-kpis" id="adm-dash-kpis">
            <div class="adm-dash-skel"></div>
        </section>

        <section class="adm-dash-grid">
            <article class="adm-card adm-card-wide" id="adm-dash-activity">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Activité récente</p>
                        <h2>Événements de la plateforme</h2>
                    </div>
                    <span class="adm-pill">Temps réel</span>
                </div>
                <div class="adm-activity-list" id="adm-activity-list">
                    <div class="adm-dash-loader"><div class="adm-spinner"></div></div>
                </div>
            </article>

            <article class="adm-card" id="adm-dash-users-chart">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Utilisateurs</p>
                        <h2>Inscriptions</h2>
                    </div>
                </div>
            </article>

            <article class="adm-card" id="adm-dash-roles-chart">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Utilisateurs</p>
                        <h2>Répartition</h2>
                    </div>
                </div>
            </article>

            <article class="adm-card" id="adm-dash-services-chart">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Services</p>
                        <h2>Populaires</h2>
                    </div>
                </div>
            </article>

            <article class="adm-card" id="adm-dash-rdv-chart">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Rendez-vous</p>
                        <h2>Répartition statuts</h2>
                    </div>
                </div>
            </article>

            <article class="adm-card" id="adm-dash-pay-chart">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Paiements</p>
                        <h2>Revenus</h2>
                    </div>
                </div>
            </article>
        </section>

        <section class="adm-shortcuts">
            ${shortcut('/admin', 'layout-dashboard', 'Dashboard')}
            ${shortcut('/admin/rendez-vous', 'calendar', 'Rendez-vous')}
            ${shortcut('/admin/services', 'scissors', 'Services')}
            ${shortcut('/admin/journal', 'activity', 'Journal')}
            ${shortcut('/admin/parametres', 'settings', 'Paramètres')}
        </section>

        <section class="adm-recent-panels">
            <article class="adm-card">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Utilisateurs récents</p>
                        <h2>Nouveaux comptes</h2>
                    </div>
                </div>
                <div class="adm-mini-table" id="adm-users-table"></div>
            </article>
            <article class="adm-card">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Rendez-vous récents</p>
                        <h2>Activité réservation</h2>
                    </div>
                </div>
                <div class="adm-mini-table" id="adm-rdv-table"></div>
            </article>
            <article class="adm-card">
                <div class="adm-card-head">
                    <div>
                        <p class="adm-card-kicker">Paiements récents</p>
                        <h2>Transactions</h2>
                    </div>
                </div>
                <div class="adm-mini-table" id="adm-pay-table"></div>
            </article>
        </section>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    const state = { data: null };

    const render = (data) => {
        state.data = data;

        const totals = data.totaux || {};
        const kpis = [
            { label: 'Utilisateurs', value: totals.utilisateurs ?? 0, icon: 'users' },
            { label: 'Clients', value: totals.clients ?? 0, icon: 'user' },
            { label: 'Coiffeurs', value: totals.coiffeurs ?? 0, icon: 'scissors' },
            { label: 'Administrateurs', value: totals.administrateurs ?? 0, icon: 'shield' },
            { label: 'Services', value: totals.services ?? 0, icon: 'sparkles' },
            { label: 'Rendez-vous', value: totals.rendez_vous ?? 0, icon: 'calendar' },
            { label: 'Paiements', value: totals.paiements ?? 0, icon: 'credit-card' },
            { label: 'Avis', value: totals.avis ?? 0, icon: 'star' },
            { label: 'Notifications', value: totals.notifications ?? 0, icon: 'bell' },
        ];

        main.querySelector('#adm-dash-kpis').innerHTML = kpis.map(k => `
            <article class="adm-kpi-card">
                <div class="adm-kpi-ico"><i data-lucide="${k.icon}"></i></div>
                <div>
                    <span class="adm-kpi-label">${k.label}</span>
                    <strong class="adm-kpi-value">${formatNumber(k.value)}</strong>
                </div>
            </article>
        `).join('');

        const graph = data.graphiques || {};
        main.querySelector('#adm-dash-users-chart').innerHTML = cardBody(`
            ${buildBars('Inscriptions mensuelles', graph.utilisateurs?.inscriptions_clients || [], graph.utilisateurs?.inscriptions_coiffeurs || [])}
        `);
        main.querySelector('#adm-dash-roles-chart').innerHTML = cardBody(buildDonut('Répartition des rôles', graph.utilisateurs?.repartition_roles || []));
        main.querySelector('#adm-dash-services-chart').innerHTML = cardBody(buildRankList('Top services réservés', graph.services?.reserves || [], 'nb_reservations'));
        main.querySelector('#adm-dash-rdv-chart').innerHTML = cardBody(buildDonut('Rendez-vous par statut', graph.rendez_vous?.par_statut || []));
        main.querySelector('#adm-dash-pay-chart').innerHTML = cardBody(buildPaySummary(graph.paiements || {}));

        main.querySelector('#adm-activity-list').innerHTML = (data.recent_activity || []).length
            ? data.recent_activity.map(item => `
                <div class="adm-activity-item">
                    <div class="adm-activity-ico adm-activity-${item.type}">
                        <i data-lucide="${activityIcon(item.type)}"></i>
                    </div>
                    <div class="adm-activity-text">
                        <strong>${escapeHtml(item.label)}</strong>
                        <span>${activityDesc(item)}</span>
                    </div>
                    <time>${formatDate(item.created_at)}</time>
                </div>
            `).join('')
            : `<p class="adm-empty">Aucune activité récente.</p>`;

        main.querySelector('#adm-users-table').innerHTML = miniRows(data.recent_users || [], (u) => `
            <div class="adm-mini-row">
                <span class="adm-mini-avatar">${escapeHtml((u.username || 'U').substring(0, 2).toUpperCase())}</span>
                <div>
                    <strong>@${escapeHtml(u.username)}</strong>
                    <p>${escapeHtml((u.role || '').toUpperCase())}</p>
                </div>
                <time>${formatDate(u.date_joined)}</time>
            </div>
        `);

        main.querySelector('#adm-rdv-table').innerHTML = miniRows(data.recent_rendez_vous || [], (r) => `
            <div class="adm-mini-row">
                <span class="adm-mini-avatar adm-mini-avatar-blue"><i data-lucide="calendar"></i></span>
                <div>
                    <strong>${escapeHtml(r.service)}</strong>
                    <p>${escapeHtml(r.client)} · ${escapeHtml(r.coiffeur)} · ${escapeHtml(r.statut)}</p>
                </div>
                <time>${formatDate(r.date_heure_debut)}</time>
            </div>
        `);

        main.querySelector('#adm-pay-table').innerHTML = miniRows(data.recent_paiements || [], (p) => `
            <div class="adm-mini-row">
                <span class="adm-mini-avatar adm-mini-avatar-green"><i data-lucide="credit-card"></i></span>
                <div>
                    <strong>${escapeHtml(p.transaction_id)}</strong>
                    <p>${escapeHtml(p.methode)} · ${escapeHtml(p.statut)}</p>
                </div>
                <time>${formatMoney(p.montant_total)}</time>
            </div>
        `);

        if (window.lucide) window.lucide.createIcons();
    };

    const load = async () => {
        main.querySelector('#adm-dash-kpis').innerHTML = `<div class="adm-dash-skel"></div>`;
        try {
            const data = await AdminService.getPlatformDashboard();
            render(data);
        } catch (error) {
            main.querySelector('#adm-dash-kpis').innerHTML = `<div class="adm-empty adm-empty-error">${escapeHtml(error.message || 'Impossible de charger le dashboard.')}</div>`;
        }
    };

    main.querySelector('#adm-dash-refresh').addEventListener('click', load);
    main.querySelector('#adm-dash-go-rdv').addEventListener('click', () => window.navigate?.('/admin/rendez-vous'));

    load();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

function shortcut(route, icon, label) {
    return `
        <button class="adm-shortcut" type="button" onclick="window.navigate?.('${route}')">
            <i data-lucide="${icon}"></i>
            <span>${label}</span>
        </button>`;
}

function cardBody(inner) {
    return `<div class="adm-card-body">${inner}</div>`;
}

function buildBars(title, d1 = [], d2 = []) {
    const months = [...new Set([...d1, ...d2].map(d => d.mois))];
    const max = Math.max(...d1.map(d => Number(d.total) || 0), ...d2.map(d => Number(d.total) || 0), 1);
    const height = 150;
    const width = Math.max(300, months.length * 72 + 30);
    return `
        <div class="adm-chart-title">${title}</div>
        <div class="adm-chart-scroll">
            <svg viewBox="0 0 ${width} ${height + 24}">
                <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="rgba(0,0,0,.08)"/>
                ${months.map((m, i) => {
                    const v1 = d1.find(d => d.mois === m)?.total || 0;
                    const v2 = d2.find(d => d.mois === m)?.total || 0;
                    const x = i * 72 + 20;
                    const h1 = Math.round((v1 / max) * height);
                    const h2 = Math.round((v2 / max) * height);
                    return `
                        <rect x="${x}" y="${height - h1}" width="16" height="${h1}" rx="4" fill="#0A66C2"/>
                        <rect x="${x + 22}" y="${height - h2}" width="16" height="${h2}" rx="4" fill="#93C5FD"/>
                        <text x="${x + 18}" y="${height + 16}" text-anchor="middle" class="adm-chart-label">${escapeHtml(m.split(' ')[0] || m)}</text>
                    `;
                }).join('')}
            </svg>
        </div>`;
}

function buildDonut(title, data = []) {
    const total = data.reduce((sum, d) => sum + (Number(d.valeur) || 0), 0);
    if (!total) return `<div class="adm-empty">Aucune donnée</div>`;
    let angle = -90;
    const arcs = data.filter(d => Number(d.valeur) > 0).map(d => {
        const val = Number(d.valeur) || 0;
        const deg = (val / total) * 360;
        const start = polar(65, 65, 44, angle);
        const end = polar(65, 65, 44, angle + deg - 2);
        const large = deg > 180 ? 1 : 0;
        angle += deg;
        return {
            ...d,
            pct: Math.round((val / total) * 100),
            path: `M ${start.x} ${start.y} A 44 44 0 ${large} 1 ${end.x} ${end.y}`,
        };
    });
    return `
        <div class="adm-chart-title">${title}</div>
        <div class="adm-donut">
            <svg viewBox="0 0 130 130">
                ${arcs.map(a => `<path d="${a.path}" fill="none" stroke="${a.couleur || '#0A66C2'}" stroke-width="12" stroke-linecap="round"/>`).join('')}
                <text x="65" y="61" text-anchor="middle" class="adm-donut-total">${total}</text>
                <text x="65" y="76" text-anchor="middle" class="adm-donut-caption">Total</text>
            </svg>
            <div class="adm-donut-legend">
                ${arcs.map(a => `
                    <div class="adm-donut-row">
                        <span class="adm-dot" style="background:${a.couleur || '#0A66C2'}"></span>
                        <span>${escapeHtml(a.label)}</span>
                        <strong>${a.pct}%</strong>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function buildRankList(title, list = [], valueKey = 'total') {
    if (!list.length) return `<div class="adm-empty">${title}: aucune donnée</div>`;
    return `
        <div class="adm-chart-title">${title}</div>
        <div class="adm-rank-list">
            ${list.slice(0, 5).map((item, index) => `
                <div class="adm-rank-row">
                    <span class="adm-rank-index">${index + 1}</span>
                    <div class="adm-rank-copy">
                        <strong>${escapeHtml(item.nom_prestation || item.label || item.methode || '—')}</strong>
                        <p>${escapeHtml(item.categorie_nom || item.methode || '')}</p>
                    </div>
                    <span class="adm-rank-value">${formatNumber(item[valueKey] ?? item.total ?? item.nb_reservations ?? 0)}</span>
                </div>
            `).join('')}
        </div>`;
}

function buildPaySummary(paiements = {}) {
    const total = (paiements.revenus || []).reduce((s, d) => s + (Number(d.valeur) || 0), 0);
    const rows = paiements.par_methode || [];
    return `
        <div class="adm-chart-title">Revenus et commissions</div>
        <div class="adm-pay-summary">
            <div><span>Validés</span><strong>${formatNumber(paiements.valide || 0)}</strong></div>
            <div><span>Échoués</span><strong>${formatNumber(paiements.echoue || 0)}</strong></div>
            <div><span>Total revenus</span><strong>${formatMoney(total)}</strong></div>
        </div>
        <div class="adm-rank-list">
            ${rows.slice(0, 4).map(item => `
                <div class="adm-rank-row">
                    <span class="adm-rank-index"><i data-lucide="credit-card"></i></span>
                    <div class="adm-rank-copy">
                        <strong>${escapeHtml(item.label || item.methode || '—')}</strong>
                        <p>${formatMoney(item.montant || 0)}</p>
                    </div>
                    <span class="adm-rank-value">${formatNumber(item.total || 0)}</span>
                </div>
            `).join('')}
        </div>`;
}

function miniRows(rows = [], renderItem) {
    if (!rows.length) return `<div class="adm-empty">Aucune donnée récente.</div>`;
    return rows.map(renderItem).join('');
}

function activityIcon(type) {
    return {
        user: 'user-plus',
        rdv: 'calendar',
        paiement: 'credit-card',
        service: 'scissors',
        avis: 'star',
    }[type] || 'activity';
}

function activityDesc(item) {
    if (item.type === 'user') return `@${item.username} · ${item.role}`;
    if (item.type === 'rdv') return `${item.client} avec ${item.coiffeur}`;
    if (item.type === 'paiement') return `${item.username || 'Client'} · ${item.statut}`;
    if (item.type === 'service') return `${item.username} · ${item.nom}`;
    if (item.type === 'avis') return `${item.username} · note ${item.note}/5`;
    return '';
}

function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('fr-FR');
}

function formatMoney(value) {
    const n = Number(value || 0);
    return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;
}

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
