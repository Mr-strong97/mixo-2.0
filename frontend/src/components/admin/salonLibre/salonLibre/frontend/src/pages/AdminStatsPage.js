/**
 * AdminStatsPage.js
 * ==================
 * Page statistiques admin : graphiques barres, lignes, donut + top users.
 * Emplacement : src/pages/AdminStatsPage.js
 */
import { Navbar }        from '../components/Navbar.js';
import { Footer }        from '../components/Footer.js';
import AdminUtilisateurs from '../api/AdminService.js';
import { requireRole }   from '../utils/AuthGuard.js';

export const AdminStatsPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'stats-page';

    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'stats-main';
    main.innerHTML = `
        <div class="stats-header">
            <h1 class="stats-title">
                <i data-lucide="bar-chart-2"></i>
                Statistiques Utilisateurs
            </h1>
            <p class="stats-subtitle">Activité et croissance de la plateforme</p>
        </div>

        <!-- KPI CARDS -->
        <div class="stats-kpi-grid" id="kpi-grid">
            ${Array(6).fill(0).map(() => `
                <div class="stats-kpi-card">
                    <div class="kpi-skeleton"></div>
                </div>`).join('')}
        </div>

        <!-- GRAPHIQUES LIGNE 1 : Inscriptions + Répartition rôles -->
        <div class="stats-charts-row" id="row-1">
            <div class="stats-chart-card" id="chart-inscriptions">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
            <div class="stats-chart-card" id="chart-roles">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
        </div>

        <!-- GRAPHIQUE LIGNE 2 : Connexions mensuelles + Répartition statuts -->
        <div class="stats-charts-row" id="row-2">
            <div class="stats-chart-card" id="chart-connexions">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
            <div class="stats-chart-card" id="chart-statuts">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
        </div>

        <!-- TABLEAUX TOP USERS -->
        <div class="stats-tables-row" id="tables-row">
            <div class="stats-table-card" id="table-actifs">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
            <div class="stats-table-card" id="table-nouveaux">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
            <div class="stats-table-card" id="table-rarement">
                <div class="stats-loader"><div class="aus-spinner"></div></div>
            </div>
        </div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    // ---------------------------------------------------------------- //
    // CHARGEMENT DES DONNÉES
    // ---------------------------------------------------------------- //
    AdminUtilisateurs.getUserStats().then(data => {
        const c = data.compteurs;
        const g = data.graphiques;

        // ---- KPI (Couleurs accordées à la charte MIXO Blue Premium) ----
        const kpiData = [
            { icon: 'users',        label: 'Total',           val: c.total,        color: '#0A66C2' },
            { icon: 'check-circle', label: 'Actifs',          val: c.actifs,       color: '#2B85E4' },
            { icon: 'clock',        label: 'En attente',      val: c.en_attente,   color: '#f39c12' },
            { icon: 'activity',     label: 'Actifs (7j)',     val: c.actifs_7j,    color: '#0A66C2' },
            { icon: 'trending-up',  label: 'Actifs (30j)',    val: c.actifs_30j,   color: '#2B85E4' },
            { icon: 'moon',         label: 'Inactifs (30j)',  val: c.inactifs_30j, color: '#DE350B' },
        ];

        main.querySelector('#kpi-grid').innerHTML = kpiData.map(k => `
            <div class="stats-kpi-card" style="border-color:${k.color}18">
                <i data-lucide="${k.icon}" style="color:${k.color}"></i>
                <span class="kpi-val">${k.val}</span>
                <span class="kpi-label">${k.label}</span>
            </div>
        `).join('');

        // ---- Graphique barres : Inscriptions ----
        main.querySelector('#chart-inscriptions').innerHTML =
            buildBarChart(
                'Inscriptions mensuelles',
                g.inscriptions_clients,
                g.inscriptions_coiffeurs,
                'Clients', 'Coiffeurs'
            );

        // ---- Graphique donut : Répartition rôles ----
        main.querySelector('#chart-roles').innerHTML =
            buildDonutChart('Répartition des rôles', g.repartition_roles);

        // ---- Graphique lignes : Connexions mensuelles ----
        main.querySelector('#chart-connexions').innerHTML =
            buildLineChart('Connexions mensuelles', g.connexions_mensuelles, '#0A66C2');

        // ---- Graphique donut : Statuts ----
        main.querySelector('#chart-statuts').innerHTML =
            buildDonutChart('Répartition par statut', g.repartition_statuts);

        // ---- Tableaux (Avec wrapper de défilement mobile sécurisé) ----
        main.querySelector('#table-actifs').innerHTML =
            buildTopTable('Les plus actifs récemment', data.top_actifs, 'last_login');
        main.querySelector('#table-nouveaux').innerHTML =
            buildTopTable('Nouveaux inscrits', data.nouveaux, 'date_joined');
        main.querySelector('#table-rarement').innerHTML =
            buildTopTable('Rarement actifs', data.rarement_actifs, 'last_login');

        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);

    }).catch(err => {
        main.innerHTML = `
            <div class="stats-error">
                <i data-lucide="alert-triangle"></i>
                <p>${err.message || 'Une erreur est survenue lors du chargement des statistiques.'}</p>
                <button onclick="window.location.reload()" class="aus-retry">
                    Réessayer
                </button>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    });

    return page;
};

// ================================================================ //
// CONSTRUCTEURS DE GRAPHIQUES SVG
// ================================================================ //

function buildBarChart(title, data1, data2, label1, label2) {
    const allMois = [...new Set([...data1, ...data2].map(d => d.mois))];
    const maxVal  = Math.max(...data1.map(d => d.total), ...data2.map(d => d.total), 1);
    const H = 140, bW = 14, gap = 6, grpW = bW * 2 + gap + 22;
    const svgW = Math.max(320, allMois.length * grpW + 40);

    const getVal = (arr, mois) => arr.find(d => d.mois === mois)?.total || 0;

    const bars = allMois.map((mois, i) => {
        const v1 = getVal(data1, mois), v2 = getVal(data2, mois);
        const h1 = Math.round((v1 / maxVal) * H);
        const h2 = Math.round((v2 / maxVal) * H);
        const x  = i * grpW + 20;
        return `
            <rect x="${x}" y="${H-h1}" width="${bW}" height="${h1}" fill="#0A66C2" rx="3" opacity="0.9"/>
            <rect x="${x+bW+gap}" y="${H-h2}" width="${bW}" height="${h2}" fill="#2B85E4" rx="3" opacity="0.75"/>
            ${v1 > 0 ? `<text x="${x+bW/2}" y="${H-h1-5}" text-anchor="middle" class="sv-val">${v1}</text>` : ''}
            ${v2 > 0 ? `<text x="${x+bW+gap+bW/2}" y="${H-h2-5}" text-anchor="middle" class="sv-val">${v2}</text>` : ''}
            <text x="${x+bW}" y="${H+14}" text-anchor="middle" class="sv-lbl">${mois.split(' ')[0]}</text>
        `;
    }).join('');

    return `
        <h3 class="sc-title">${title}</h3>
        <div class="sc-legend">
            <span class="sc-dot" style="background:#0A66C2"></span><span>${label1}</span>
            <span class="sc-dot" style="background:#2B85E4; margin-left:14px"></span><span>${label2}</span>
        </div>
        <div class="sc-scroll">
            <svg viewBox="0 0 ${svgW} ${H+24}" style="min-width:${svgW}px">
                <line x1="0" y1="${H}" x2="${svgW}" y2="${H}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
                ${bars}
            </svg>
        </div>
    `;
}

function buildLineChart(title, data, color = '#0A66C2') {
    if (!data || data.length === 0) return `<h3 class="sc-title">${title}</h3><p class="sc-empty">Aucune donnée disponible</p>`;
    const maxVal = Math.max(...data.map(d => d.total), 1);
    const H = 120, W = 400, padL = 30, padR = 20, padT = 20, padB = 30;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const stepX  = data.length > 1 ? innerW / (data.length - 1) : innerW;

    const points = data.map((d, i) => {
        const x = padL + i * stepX;
        const y = padT + innerH - Math.round((d.total / maxVal) * innerH);
        return `${x},${y}`;
    }).join(' ');

    const dots = data.map((d, i) => {
        const x = padL + i * stepX;
        const y = padT + innerH - Math.round((d.total / maxVal) * innerH);
        return `
            <circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="#fff" stroke-width="1"/>
            <text x="${x}" y="${y-8}" text-anchor="middle" class="sv-val">${d.total}</text>
            <text x="${x}" y="${H-2}" text-anchor="middle" class="sv-lbl">${d.mois.split(' ')[0]}</text>
        `;
    }).join('');

    const firstX = padL, lastX = padL + (data.length-1) * stepX;
    const area = `${firstX},${padT+innerH} ${points} ${lastX},${padT+innerH}`;

    return `
        <h3 class="sc-title">${title}</h3>
        <div class="sc-scroll">
            <svg viewBox="0 0 ${W} ${H}" style="min-width:${W}px; width:100%">
                <polygon points="${area}" fill="${color}" opacity="0.06"/>
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                ${dots}
            </svg>
        </div>
    `;
}

function buildDonutChart(title, data) {
    const total = data.reduce((s, d) => s + d.valeur, 0);
    if (total === 0) return `<h3 class="sc-title">${title}</h3><p class="sc-empty">Aucune donnée disponible</p>`;

    const cx = 70, cy = 70, r = 52, gap = 3;
    let angle = -90;

    const arcs = data.filter(d => d.valeur > 0).map(d => {
        const deg   = (d.valeur / total) * 360;
        const start = polar(cx, cy, r, angle);
        const end   = polar(cx, cy, r, angle + deg - gap);
        const large = deg > 180 ? 1 : 0;
        const path  = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
        angle += deg;
        return { ...d, path, pct: Math.round((d.valeur / total) * 100) };
    });

    const legend = arcs.map(a => `
        <div class="sc-legend-item">
            <span class="sc-dot" style="background:${a.couleur || 'var(--adm-blue)'}"></span>
            <span class="sc-leg-txt">${a.label}</span>
            <span class="sc-leg-pct">${a.pct}%</span>
            <span class="sc-leg-count">(${a.valeur})</span>
        </div>
    `).join('');

    return `
        <h3 class="sc-title">${title}</h3>
        <div class="sc-donut-layout">
            <svg viewBox="0 0 140 140" style="width:140px; flex-shrink:0;">
                ${arcs.map(a => `
                    <path d="${a.path}" fill="none" stroke="${a.couleur || 'var(--adm-blue)'}"
                          stroke-width="14" stroke-linecap="round"/>
                `).join('')}
                <text x="70" y="66" text-anchor="middle" class="sv-center-val">${total}</text>
                <text x="70" y="82" text-anchor="middle" class="sv-center-lbl">Total</text>
            </svg>
            <div class="sc-donut-legend">${legend}</div>
        </div>
    `;
}

function buildTopTable(title, users, dateField) {
    if (!users || users.length === 0) {
        return `<h3 class="sc-title">${title}</h3><p class="sc-empty">Aucun utilisateur trouvé</p>`;
    }
    const rows = users.map((u, i) => {
        const date = u[dateField]
            ? new Date(u[dateField]).toLocaleDateString('fr-FR')
            : 'Jamais';
        const roleClean = (u.role || 'client').toLowerCase();
        return `
            <tr>
                <td class="tb-rank">${i + 1}</td>
                <td class="tb-user">
                    <span class="tb-avatar">${(u.username || 'U').substring(0, 2).toUpperCase()}</span>
                    <span class="tb-username">@${u.username}</span>
                </td>
                <td>
                    <span class="tb-role tb-role-${roleClean}">${u.role || 'CLIENT'}</span>
                </td>
                <td class="tb-date">${date}</td>
            </tr>
        `;
    }).join('');

    return `
        <h3 class="sc-title">${title}</h3>
        <div class="stats-table-wrapper">
            <table class="sc-table">
                <thead>
                    <tr>
                        <th style="width: 30px">#</th>
                        <th>Utilisateur</th>
                        <th>Rôle</th>
                        <th>${dateField === 'last_login' ? 'Dernière connexion' : 'Inscrit le'}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}