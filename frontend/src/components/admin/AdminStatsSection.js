/**
 * AdminStatsSection.js — MIXO
 * Statistiques : KPI + graphiques SVG + tableaux top users
 * Emplacement : src/components/admin/AdminStatsSection.js
 */
import AdminUtilisateurs from '../../api/AdminService.js';

export const AdminStatsSection = () => {
    const section = document.createElement('div');
    section.className = 'stats-section';

    section.innerHTML = `
        <h2 class="aus-title">
            <i data-lucide="bar-chart-2"></i>
            Statistiques de la plateforme
        </h2>

        <div class="stats-kpi-grid" id="kpi-grid">
            ${Array(6).fill(0).map(() => `<div class="stats-kpi-card"><div class="kpi-skel"></div></div>`).join('')}
        </div>

        <div class="stats-charts-row">
            <div class="stats-chart-card" id="chart-bar"></div>
            <div class="stats-chart-card" id="chart-donut"></div>
        </div>

        <div class="stats-charts-row" style="margin-top:16px;">
            <div class="stats-chart-card" id="chart-line"></div>
            <div class="stats-chart-card" id="chart-statuts"></div>
        </div>

        <div class="stats-tables-row">
            <div class="stats-table-card" id="tbl-actifs"></div>
            <div class="stats-table-card" id="tbl-nouveaux"></div>
            <div class="stats-table-card" id="tbl-inactifs"></div>
        </div>
    `;

    AdminUtilisateurs.getUserStats().then(data => {
        const c = data.compteurs, g = data.graphiques;

        // KPI
        const kpis = [
            { icon:'users',        label:'Total',        val:c.total,        clr:'#1A56DB' },
            { icon:'check-circle', label:'Actifs',       val:c.actifs,       clr:'#10B981' },
            { icon:'clock',        label:'En attente',   val:c.en_attente,   clr:'#F59E0B' },
            { icon:'activity',     label:'Actifs 7j',    val:c.actifs_7j,    clr:'#3B82F6' },
            { icon:'trending-up',  label:'Actifs 30j',   val:c.actifs_30j,   clr:'#1A56DB' },
            { icon:'moon',         label:'Inactifs 30j', val:c.inactifs_30j, clr:'#EF4444' },
        ];
        section.querySelector('#kpi-grid').innerHTML = kpis.map(k => `
            <div class="stats-kpi-card" style="border-color:${k.clr}22;">
                <i data-lucide="${k.icon}" style="color:${k.clr}"></i>
                <span class="kpi-val">${k.val}</span>
                <span class="kpi-label">${k.label}</span>
            </div>
        `).join('');

        section.querySelector('#chart-bar').innerHTML     = buildBar('Inscriptions mensuelles', g.inscriptions_clients, g.inscriptions_coiffeurs);
        section.querySelector('#chart-donut').innerHTML   = buildDonut('Répartition des rôles', g.repartition_roles);
        section.querySelector('#chart-line').innerHTML    = buildLine('Connexions mensuelles', g.connexions_mensuelles);
        section.querySelector('#chart-statuts').innerHTML = buildDonut('Répartition par statut', g.repartition_statuts);

        section.querySelector('#tbl-actifs').innerHTML    = buildTable('🟢 Plus actifs', data.top_actifs, 'last_login');
        section.querySelector('#tbl-nouveaux').innerHTML  = buildTable('🆕 Nouveaux inscrits', data.nouveaux, 'date_joined');
        section.querySelector('#tbl-inactifs').innerHTML  = buildTable('😴 Rarement actifs', data.rarement_actifs, 'last_login');

        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);

    }).catch(err => {
        section.innerHTML = `<p style="color:var(--danger);text-align:center;padding:40px">${err.message}</p>`;
    });

    return section;
};

// ── Graphique barres ──────────────────────────────────────────
function buildBar(title, d1, d2) {
    const mois   = [...new Set([...d1,...d2].map(d => d.mois))];
    const maxVal = Math.max(...d1.map(d=>d.total),...d2.map(d=>d.total),1);
    const H=130, bW=13, gap=5, gW=bW*2+gap+20, svgW=Math.max(300,mois.length*gW+40);
    const getV = (arr,m) => arr.find(d=>d.mois===m)?.total||0;
    const bars  = mois.map((m,i)=>{
        const v1=getV(d1,m),v2=getV(d2,m);
        const h1=Math.round(v1/maxVal*H),h2=Math.round(v2/maxVal*H);
        const x=i*gW+20;
        return `
            <rect x="${x}" y="${H-h1}" width="${bW}" height="${h1}" fill="#1A56DB" rx="3"/>
            <rect x="${x+bW+gap}" y="${H-h2}" width="${bW}" height="${h2}" fill="#3B82F6" rx="3" opacity="0.75"/>
            ${v1>0?`<text x="${x+bW/2}" y="${H-h1-5}" text-anchor="middle" class="sv-val">${v1}</text>`:''}
            ${v2>0?`<text x="${x+bW+gap+bW/2}" y="${H-h2-5}" text-anchor="middle" class="sv-val">${v2}</text>`:''}
            <text x="${x+bW}" y="${H+14}" text-anchor="middle" class="sv-lbl">${m.split(' ')[0]}</text>
        `;
    }).join('');
    return `
        <h3 class="sc-title">${title}</h3>
        <div class="sc-legend">
            <span class="sc-dot" style="background:#1A56DB"></span>Clients
            <span class="sc-dot" style="background:#3B82F6;margin-left:12px"></span>Coiffeurs
        </div>
        <div class="sc-scroll">
            <svg viewBox="0 0 ${svgW} ${H+24}" style="min-width:${svgW}px">
                <line x1="0" y1="${H}" x2="${svgW}" y2="${H}" stroke="var(--border)" stroke-width="1"/>
                ${bars}
            </svg>
        </div>`;
}

// ── Graphique ligne ───────────────────────────────────────────
function buildLine(title, data) {
    if (!data?.length) return `<h3 class="sc-title">${title}</h3><p class="sc-empty">Aucune donnée</p>`;
    const maxV=Math.max(...data.map(d=>d.total),1),H=110,W=380,pL=28,pR=18,pT=18,pB=28;
    const iW=W-pL-pR,iH=H-pT-pB,sx=data.length>1?iW/(data.length-1):iW;
    const pts=data.map((d,i)=>`${pL+i*sx},${pT+iH-Math.round(d.total/maxV*iH)}`).join(' ');
    const dots=data.map((d,i)=>{
        const x=pL+i*sx,y=pT+iH-Math.round(d.total/maxV*iH);
        return `<circle cx="${x}" cy="${y}" r="4" fill="#1A56DB" stroke="var(--bg-dark)" stroke-width="1.5"/>
                <text x="${x}" y="${y-9}" text-anchor="middle" class="sv-val">${d.total}</text>
                <text x="${x}" y="${H-2}" text-anchor="middle" class="sv-lbl">${d.mois.split(' ')[0]}</text>`;
    }).join('');
    const fX=pL,lX=pL+(data.length-1)*sx;
    return `
        <h3 class="sc-title">${title}</h3>
        <div class="sc-scroll">
            <svg viewBox="0 0 ${W} ${H}" style="width:100%">
                <polygon points="${fX},${pT+iH} ${pts} ${lX},${pT+iH}" fill="#1A56DB" opacity="0.06"/>
                <polyline points="${pts}" fill="none" stroke="#1A56DB" stroke-width="2.5" stroke-linecap="round"/>
                ${dots}
            </svg>
        </div>`;
}

// ── Donut ─────────────────────────────────────────────────────
function buildDonut(title, data) {
    const total=data.reduce((s,d)=>s+d.valeur,0);
    if(!total) return `<h3 class="sc-title">${title}</h3><p class="sc-empty">Aucune donnée</p>`;
    const cx=65,cy=65,r=48,gap=3;let angle=-90;
    const arcs=data.filter(d=>d.valeur>0).map(d=>{
        const deg=d.valeur/total*360,start=P(cx,cy,r,angle),end=P(cx,cy,r,angle+deg-gap);
        const lg=deg>180?1:0,path=`M ${start.x} ${start.y} A ${r} ${r} 0 ${lg} 1 ${end.x} ${end.y}`;
        angle+=deg;
        return {...d,path,pct:Math.round(d.valeur/total*100)};
    });
    return `
        <h3 class="sc-title">${title}</h3>
        <div class="sc-donut-layout">
            <svg viewBox="0 0 130 130" style="width:130px;flex-shrink:0">
                ${arcs.map(a=>`<path d="${a.path}" fill="none" stroke="${a.couleur}" stroke-width="14" stroke-linecap="round"/>`).join('')}
                <text x="65" y="61" text-anchor="middle" class="sv-center-val">${total}</text>
                <text x="65" y="77" text-anchor="middle" class="sv-center-lbl">Total</text>
            </svg>
            <div class="sc-donut-legend">
                ${arcs.map(a=>`<div class="sc-legend-item">
                    <span class="sc-dot" style="background:${a.couleur}"></span>
                    <span class="sc-leg-txt">${a.label}</span>
                    <span class="sc-leg-pct">${a.pct}%</span>
                    <span class="sc-leg-cnt">(${a.valeur})</span>
                </div>`).join('')}
            </div>
        </div>`;
}

// ── Tableau ───────────────────────────────────────────────────
function buildTable(title, users, field) {
    if(!users?.length) return `<h3 class="sc-title">${title}</h3><p class="sc-empty">Aucun utilisateur</p>`;
    return `
        <h3 class="sc-title">${title}</h3>
        <table class="sc-table">
            <thead><tr><th>#</th><th>Utilisateur</th><th>Rôle</th><th>${field==='last_login'?'Connexion':'Inscrit'}</th></tr></thead>
            <tbody>${users.map((u,i)=>`
                <tr>
                    <td class="tb-rank" data-label="Rang">${i+1}</td>
                    <td class="tb-user" data-label="Utilisateur">
                        <span class="tb-av">${(u.username||'U').substring(0,2).toUpperCase()}</span>
                        <span>@${u.username}</span>
                    </td>
                    <td data-label="Rôle"><span class="tb-role tb-role-${(u.role||'').toLowerCase()}">${u.role}</span></td>
                    <td class="tb-date" data-label="Date">${u[field]?new Date(u[field]).toLocaleDateString('fr-FR'):'Jamais'}</td>
                </tr>`).join('')}
            </tbody>
        </table>`;
}

function P(cx,cy,r,deg){const rad=deg*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};}
