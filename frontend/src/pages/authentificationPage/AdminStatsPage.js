/**
 * AdminStatsPage.js — MIXO
 * Statistiques & Analyses (Image 1)
 */
import { Navbar }    from '../../components/navbars/Navbar.js';
import { Footer }    from '../../components/Footer.js';
import { requireRole } from '../../utils/AuthGuard.js';
import AdminService  from '../../api/AdminService.js';

export const AdminStatsPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'stats-pg';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'stats-pg-main';

    main.innerHTML = `
        <!-- Header -->
        <div class="stats-pg-header">
            <div>
                <h1 class="stats-pg-title">Statistiques et Analyses</h1>
                <p class="stats-pg-sub">Vue d'ensemble de la performance de votre plateforme.</p>
            </div>
            <button class="stats-pg-export" id="btn-export">
                <i data-lucide="download"></i> Exporter PDF
            </button>
        </div>

        <!-- Filtres période -->
        <div class="stats-pg-filters">
            ${['Jour','Semaine','Mois','Année'].map((f,i) =>
                `<button class="stats-pg-filter ${i===2?'active':''}" data-period="${f.toLowerCase()}">${f}</button>`
            ).join('')}
        </div>

        <!-- KPI principaux -->
        <div class="stats-pg-kpi-row" id="kpi-row">
            <div class="stats-pg-kpi-card skeleton"><div class="stats-sk"></div></div>
            <div class="stats-pg-kpi-card skeleton"><div class="stats-sk"></div></div>
            <div class="stats-pg-kpi-card skeleton"><div class="stats-sk"></div></div>
        </div>

        <!-- Graphiques & donuts -->
        <div class="stats-pg-charts-grid">
            <div class="stats-pg-chart-main" id="chart-inscriptions">
                <div class="stats-pg-loader"><div class="adm-spinner"></div></div>
            </div>
            <div class="stats-pg-charts-side">
                <div class="stats-pg-chart-side" id="chart-roles">
                    <div class="stats-pg-loader"><div class="adm-spinner"></div></div>
                </div>
                <div class="stats-pg-chart-side" id="chart-statuts">
                    <div class="stats-pg-loader"><div class="adm-spinner"></div></div>
                </div>
            </div>
        </div>

        <!-- Tableaux classements -->
        <div class="stats-pg-tables-row">
            <div class="stats-pg-table-card" id="tbl-nouveaux">
                <div class="stats-pg-loader"><div class="adm-spinner"></div></div>
            </div>
            <div class="stats-pg-table-card" id="tbl-actifs">
                <div class="stats-pg-loader"><div class="adm-spinner"></div></div>
            </div>
        </div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    // ── Filtres ─────────────────────────────────────────────────
    main.querySelectorAll('.stats-pg-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            main.querySelectorAll('.stats-pg-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ── Export PDF ──────────────────────────────────────────────
    main.querySelector('#btn-export')?.addEventListener('click', () => window.print());

    // ── Données ─────────────────────────────────────────────────
    AdminService.getUserStats().then(data => {
        const c = data.compteurs;
        const g = data.graphiques;

        // KPI
        const kpis = [
            { icon:'users',    label:'UTILISATEURS TOTAUX', val:c.total,    trend:'+12%', up:true  },
            { icon:'credit-card', label:'REVENU MENSUEL',   val:'12,450€',  trend:'+8.4%',up:true  },
            { icon:'calendar', label:'VOLUME RENDEZ-VOUS',  val:c.actifs_7j||842, trend:'-2.1%',up:false },
        ];

        main.querySelector('#kpi-row').innerHTML = kpis.map(k => `
            <div class="stats-pg-kpi-card">
                <div class="stats-pg-kpi-top">
                    <div class="stats-pg-kpi-icon">
                        <i data-lucide="${k.icon}" style="color:#0A66C2;width:22px;height:22px;"></i>
                    </div>
                    <span class="stats-pg-kpi-trend ${k.up?'up':'down'}">
                        ${k.trend} <i data-lucide="${k.up?'trending-up':'trending-down'}" style="width:13px;height:13px;"></i>
                    </span>
                </div>
                <div class="stats-pg-kpi-label">${k.label}</div>
                <div class="stats-pg-kpi-val">${k.val?.toLocaleString?.() ?? k.val}</div>
            </div>
        `).join('');

        // Graphique barres : inscriptions
        main.querySelector('#chart-inscriptions').innerHTML = buildBarChart(
            'Inscriptions Mensuelles', g.inscriptions_clients, g.inscriptions_coiffeurs
        );

        // Donuts
        main.querySelector('#chart-roles').innerHTML   = buildDonut('RÉPARTITION DES RÔLES',   g.repartition_roles,   true);
        main.querySelector('#chart-statuts').innerHTML = buildDonut('RÉPARTITION PAR STATUT',  g.repartition_statuts, true);

        // Tables
        main.querySelector('#tbl-nouveaux').innerHTML = buildTable('NOUVEAUX INSCRITS', data.nouveaux, 'date_joined');
        main.querySelector('#tbl-actifs').innerHTML   = buildTable('PLUS ACTIFS', data.top_actifs, 'last_login', true);

        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);

    }).catch(err => {
        main.innerHTML += `<div style="text-align:center;padding:40px;color:#DC2626;">${err.message}</div>`;
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

// ── GRAPHIQUE BARRES ─────────────────────────────────────────
function buildBarChart(title, d1 = [], d2 = []) {
    const mois   = [...new Set([...d1, ...d2].map(d => d.mois))];
    const maxVal = Math.max(...d1.map(d => d.total), ...d2.map(d => d.total), 1);
    const H = 160, bW = 18, gap = 8, grpW = bW * 2 + gap + 24;
    const svgW = Math.max(360, mois.length * grpW + 40);
    const get  = (arr, m) => arr.find(d => d.mois === m)?.total || 0;

    const bars = mois.map((m, i) => {
        const v1 = get(d1, m), v2 = get(d2, m);
        const h1 = Math.round((v1 / maxVal) * H);
        const h2 = Math.round((v2 / maxVal) * H);
        const x  = i * grpW + 20;
        const lbl = m.split(' ')[0];
        return `
            <rect x="${x}" y="${H-h1}" width="${bW}" height="${h1}" fill="#0A66C2" rx="4" opacity="0.9"/>
            <rect x="${x+bW+gap}" y="${H-h2}" width="${bW}" height="${h2}" fill="#93C5FD" rx="4"/>
            ${v1>0?`<text x="${x+bW/2}" y="${H-h1-5}" text-anchor="middle" class="sv-val">${v1}</text>`:''}
            ${v2>0?`<text x="${x+bW+gap+bW/2}" y="${H-h2-5}" text-anchor="middle" class="sv-val">${v2}</text>`:''}
            <text x="${x+bW}" y="${H+16}" text-anchor="middle" class="sv-lbl">${lbl}</text>
        `;
    }).join('');

    return `
        <div class="stats-chart-title">${title}</div>
        <div class="stats-chart-legend">
            <span class="sc-dot" style="background:#0A66C2;border-radius:50%;"></span> Clients
            <span class="sc-dot" style="background:#93C5FD;border-radius:50%;margin-left:14px;"></span> Coiffeurs
        </div>
        <div style="overflow-x:auto;padding-bottom:4px;">
            <svg viewBox="0 0 ${svgW} ${H+24}" style="min-width:${svgW}px;width:100%;">
                <line x1="0" y1="${H}" x2="${svgW}" y2="${H}" stroke="#E2E8F0" stroke-width="1"/>
                ${bars}
            </svg>
        </div>
    `;
}

// ── DONUT ────────────────────────────────────────────────────
function buildDonut(title, data = [], showTitle = false) {
    const total = data.reduce((s, d) => s + (d.valeur||0), 0);
    if (!total) return `<div class="stats-chart-title">${title}</div><p class="sc-empty">Aucune donnée</p>`;
    const cx=55,cy=55,r=42,gap=2;let angle=-90;
    const arcs = data.filter(d=>d.valeur>0).map(d=>{
        const deg = (d.valeur/total)*360;
        const start = P(cx,cy,r,angle);
        const end   = P(cx,cy,r,angle+deg-gap);
        const lg    = deg>180?1:0;
        const path  = `M ${start.x} ${start.y} A ${r} ${r} 0 ${lg} 1 ${end.x} ${end.y}`;
        angle+=deg;
        return {...d, path, pct: Math.round((d.valeur/total)*100)};
    });

    return `
        <div class="stats-chart-title">${title}</div>
        <div style="display:flex;align-items:center;gap:14px;">
            <svg viewBox="0 0 110 110" style="width:110px;flex-shrink:0;">
                ${arcs.map(a=>`<path d="${a.path}" fill="none" stroke="${a.couleur||'#0A66C2'}" stroke-width="13" stroke-linecap="round"/>`).join('')}
                <text x="55" y="51" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#1A1D20;">${total}</text>
                <text x="55" y="66" text-anchor="middle" style="font-size:7px;fill:#62676B;text-transform:uppercase;letter-spacing:1px;">TOTAL</text>
            </svg>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${arcs.map(a=>`
                    <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem;">
                        <span style="width:10px;height:10px;border-radius:50%;background:${a.couleur||'#0A66C2'};flex-shrink:0;"></span>
                        <span style="color:#1A1D20;font-weight:500;flex:1;">${a.label}</span>
                        <span style="color:#0A66C2;font-weight:700;">${a.pct}%</span>
                        <span style="color:#62676B;font-size:0.72rem;">(${a.valeur})</span>
                    </div>`).join('')}
            </div>
        </div>
    `;
}

// ── TABLE ────────────────────────────────────────────────────
function buildTable(title, users = [], field, showEmpty = false) {
    const icon = title.includes('ACTIFS') ? '● ' : '';
    const colorDot = title.includes('ACTIFS') ? '#16A34A' : '';

    if (!users?.length) return `
        <div class="stats-pg-table-header">
            <i data-lucide="${title.includes('ACTIFS')?'activity':'user-plus'}" style="color:#0A66C2;width:18px;height:18px;"></i>
            <span class="stats-chart-title">${title}</span>
        </div>
        <div class="stats-empty-state">
            <i data-lucide="user-x" style="color:#94A3B8;width:40px;height:40px;"></i>
            <p style="color:#62676B;font-size:0.84rem;margin:8px 0 4px;">Aucun utilisateur</p>
            <p style="color:#94A3B8;font-size:0.76rem;">Les données d'activité pour cette période ne sont pas encore disponibles.</p>
        </div>`;

    return `
        <div class="stats-pg-table-header">
            <i data-lucide="${title.includes('ACTIFS')?'activity':'user-plus'}" style="color:${colorDot||'#0A66C2'};width:18px;height:18px;"></i>
            <span class="stats-chart-title">${icon}${title}</span>
        </div>
        <table class="adm-tbl" style="margin-top:8px;">
            <thead><tr><th>#</th><th>UTILISATEUR</th><th>RÔLE</th><th>${field==='last_login'?'INSCRIT':'INSCRIT'}</th></tr></thead>
            <tbody>
                ${users.slice(0,5).map((u,i)=>{
                    const date = u[field] ? new Date(u[field]).toLocaleDateString('fr-FR') : '—';
                    const ini  = (u.username||'U').substring(0,2).toUpperCase();
                    const role = (u.role||'CLIENT').toUpperCase();
                    return `<tr>
                        <td style="color:#62676B;font-weight:700;font-size:0.82rem;">${i+1}</td>
                        <td class="adm-tbl-user">
                            <div class="adm-tbl-avatar" style="width:32px;height:32px;font-size:0.65rem;">${ini}</div>
                            <span class="adm-tbl-name" style="font-size:0.84rem;">@${u.username}</span>
                        </td>
                        <td><span class="adm-badge adm-badge-role-${role.toLowerCase()}">${role}</span></td>
                        <td style="font-size:0.78rem;color:#62676B;">${date}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
}

function P(cx,cy,r,deg){const rad=deg*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};}