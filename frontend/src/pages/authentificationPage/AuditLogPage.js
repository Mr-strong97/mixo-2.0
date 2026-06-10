/**
 * AuditLogPage.js — MIXO
 * Page indépendante du Journal de bord (Image 2)
 * URL : /admin/journal
 */
import { Navbar }    from '../../components/navbars/Navbar.js';
import { Footer }    from '../../components/Footer.js';
import { requireRole } from '../../utils/AuthGuard.js';
import api           from '../../api/axiosConfig.js';

const ACTIONS = {
    CONNEXION:          { label:'Connexion',          icon:'log-in',        color:'#0A66C2' },
    CONNEXION_ECHEC:    { label:'Échec de connexion', icon:'x-circle',      color:'#DC2626' },
    DECONNEXION:        { label:'Déconnexion',        icon:'log-out',       color:'#6B7280' },
    INSCRIPTION:        { label:'Inscription',        icon:'user-plus',     color:'#16A34A' },
    MODIF_PROFIL:       { label:'Modification profil',icon:'edit',          color:'#D97706' },
    MODIF_MOT_DE_PASSE: { label:'Changement MDP',     icon:'key',           color:'#D97706' },
    SUPPRESSION_COMPTE: { label:'Suppression compte', icon:'trash',         color:'#DC2626' },
    VERIF_EMAIL:        { label:'Email vérifié',      icon:'mail-check',    color:'#16A34A' },
    VERROUILLAGE:       { label:'Compte verrouillé',  icon:'lock',          color:'#DC2626' },
    SUSPENSION:         { label:'Suspension',         icon:'pause-circle',  color:'#D97706' },
    BANNISSEMENT:       { label:'Bannissement',       icon:'ban',           color:'#DC2626' },
    REACTIVATION:       { label:'Réactivation',       icon:'rotate-ccw',    color:'#16A34A' },
};

const PER_PAGE = 10;

export const AuditLogPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'audit-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'audit-main';
    main.innerHTML = `
        <!-- Header -->
        <div class="audit-page-header">
            <div>
                <h1 class="audit-page-title">Journal de bord</h1>
                <p class="audit-page-sub">Suivi détaillé des activités système et des modifications effectuées par les utilisateurs.</p>
            </div>
            <div class="audit-page-btns">
                <button class="audit-btn-export" id="btn-export">
                    <i data-lucide="download"></i> Exporter CSV
                </button>
                <button class="audit-btn-refresh" id="btn-refresh">
                    <i data-lucide="refresh-cw"></i> Actualiser
                </button>
            </div>
        </div>

        <!-- KPI rapides -->
        <div class="audit-kpi-row" id="audit-kpi">
            ${[
                { id:'k-connexions', icon:'log-in',   label:'CONNEXIONS',   color:'#0A66C2' },
                { id:'k-inscrits',   icon:'user-plus', label:'INSCRIPTIONS', color:'#16A34A' },
                { id:'k-modifs',     icon:'edit',      label:'MODIFICATIONS',color:'#D97706' },
                { id:'k-erreurs',    icon:'alert-triangle',label:'ERREURS',  color:'#DC2626' },
            ].map(k => `
                <div class="audit-kpi-card">
                    <div class="audit-kpi-ico" style="background:${k.color}12;border:1px solid ${k.color}20;">
                        <i data-lucide="${k.icon}" style="color:${k.color};width:20px;height:20px;"></i>
                    </div>
                    <div>
                        <div class="audit-kpi-label">${k.label}</div>
                        <div class="audit-kpi-val" id="${k.id}">…</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Filtres -->
        <div class="audit-filter-card">
            <div class="audit-filter-group">
                <label class="audit-filter-label">Type d'action</label>
                <select id="f-action" class="audit-filter-select">
                    <option value="">Toutes les actions</option>
                    ${Object.entries(ACTIONS).map(([k,v]) =>
                        `<option value="${k}">${v.label}</option>`).join('')}
                </select>
            </div>
            <div class="audit-filter-group">
                <label class="audit-filter-label">Date début</label>
                <input type="date" id="f-start" class="audit-filter-input" placeholder="mm/dd/yyyy"/>
            </div>
            <div class="audit-filter-group">
                <label class="audit-filter-label">Date fin</label>
                <input type="date" id="f-end" class="audit-filter-input" placeholder="mm/dd/yyyy"/>
            </div>
            <div class="audit-filter-group">
                <label class="audit-filter-label">Utilisateur</label>
                <input type="text" id="f-user" class="audit-filter-input" placeholder="@username"/>
            </div>
            <button class="audit-btn-apply" id="btn-filter">Appliquer les filtres</button>
        </div>

        <!-- Table -->
        <div class="audit-table-card">
            <div id="audit-table-zone">
                <div class="audit-tbl-loader"><div class="adm-spinner"></div></div>
            </div>
        </div>

        <!-- Modal détail -->
        <div id="audit-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);
             z-index:9999;align-items:center;justify-content:center;backdrop-filter:blur(3px);">
            <div id="audit-modal-box" style="background:#fff;border-radius:20px;padding:36px 32px;
                 max-width:500px;width:90%;box-shadow:0 24px 60px rgba(0,0,0,0.15);max-height:80vh;overflow-y:auto;">
            </div>
        </div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    const tblZone  = main.querySelector('#audit-table-zone');
    const modal    = main.querySelector('#audit-modal');
    const modalBox = main.querySelector('#audit-modal-box');
    let allLogs = [], currentPage = 1, totalCount = 0;

    // ── CHARGER ────────────────────────────────────────────────
    const charger = async (pg = 1) => {
        currentPage = pg;
        tblZone.innerHTML = `<div class="audit-tbl-loader"><div class="adm-spinner"></div></div>`;

        const params = new URLSearchParams({ page: pg });
        const action = main.querySelector('#f-action').value;
        const start  = main.querySelector('#f-start').value;
        const end    = main.querySelector('#f-end').value;
        const user   = main.querySelector('#f-user').value.trim();
        if (action) params.set('action', action);
        if (start)  params.set('date_debut', start);
        if (end)    params.set('date_fin', end);
        if (user)   params.set('user', user);

        try {
            const res  = await api.get(`admin/audit/?${params}`);
            const data = res.data;
            allLogs    = data.resultats || [];
            totalCount = data.total     || 0;

            // Mise à jour KPI (depuis premier chargement)
            if (pg === 1 && !action && !start && !end && !user) updateKPI(allLogs);

            renderTable(allLogs, data.pages, pg);
        } catch (err) {
            tblZone.innerHTML = `<div class="audit-empty"><i data-lucide="alert-triangle" style="color:#DC2626;"></i><p>${err.message}</p></div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    // ── KPI ────────────────────────────────────────────────────
    const updateKPI = (logs) => {
        const cnt = (action) => logs.filter(l => l.action === action).length;
        main.querySelector('#k-connexions').textContent = logs.filter(l => l.action === 'CONNEXION').length;
        main.querySelector('#k-inscrits').textContent   = cnt('INSCRIPTION');
        main.querySelector('#k-modifs').textContent     = cnt('MODIF_PROFIL');
        main.querySelector('#k-erreurs').textContent    = logs.filter(l => !l.succes).length;
    };

    // ── RENDER TABLE ───────────────────────────────────────────
    const renderTable = (logs, pages, pg) => {
        if (!logs.length) {
            tblZone.innerHTML = `<div class="audit-empty"><i data-lucide="inbox"></i><p>Aucune activité trouvée.</p></div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        tblZone.innerHTML = `
            <table class="adm-tbl">
                <thead><tr>
                    <th>Utilisateur</th><th>Rôle</th><th>Action</th>
                    <th>Statut</th><th>Adresse IP</th><th>Date & Heure</th><th>Détails</th>
                </tr></thead>
                <tbody id="audit-tbody"></tbody>
            </table>
            <div class="adm-tbl-footer">
                <span class="adm-tbl-info">Affichage de 1 à ${Math.min(PER_PAGE, logs.length)} sur ${totalCount} entrées</span>
                <div id="audit-pag" class="adm-pagination"></div>
            </div>
        `;

        const tbody = tblZone.querySelector('#audit-tbody');
        logs.forEach(log => {
            const info  = ACTIONS[log.action] || { label: log.action, icon: 'activity', color:'#6B7280' };
            const dt    = log.created_at || log.cree_le;
            const date  = dt ? new Date(dt).toLocaleDateString('fr-FR') : '—';
            const heure = dt ? new Date(dt).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '—';
            const ini   = (log.username || 'U').substring(0, 2).toUpperCase();

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="adm-tbl-user">
                    <div class="adm-tbl-avatar" style="width:36px;height:36px;font-size:0.72rem;">${ini}</div>
                    <div>
                        <div class="adm-tbl-name">@${log.username || '—'}</div>
                        <div class="adm-tbl-email" style="font-size:0.68rem;">${log.email || ''}</div>
                    </div>
                </td>
                <td><span class="adm-badge adm-badge-role-${(log.user_role||'').toLowerCase()}">${log.user_role || '—'}</span></td>
                <td style="font-size:0.84rem;color:#1A1D20;">${info.label}</td>
                <td>
                    ${log.succes
                        ? `<span style="width:28px;height:28px;border-radius:50%;background:rgba(22,163,74,0.1);display:inline-flex;align-items:center;justify-content:center;"><i data-lucide="check-circle" style="color:#16A34A;width:16px;height:16px;"></i></span>`
                        : `<span style="width:28px;height:28px;border-radius:50%;background:rgba(220,38,38,0.1);display:inline-flex;align-items:center;justify-content:center;"><i data-lucide="alert-circle" style="color:#DC2626;width:16px;height:16px;"></i></span>`
                    }
                </td>
                <td style="font-size:0.78rem;color:#62676B;font-family:monospace;">${log.adresse_ip || log.ip_adresse || '—'}</td>
                <td style="font-size:0.78rem;color:#1A1D20;">
                    <div>${date}</div>
                    <div style="color:#62676B;">${heure}</div>
                </td>
                <td>
                    <button class="adm-icon-btn" style="background:rgba(10,102,194,0.06);border:1px solid rgba(10,102,194,0.15);color:#0A66C2;" data-log-idx="${logs.indexOf(log)}" title="Voir détails">
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Boutons détails
        tblZone.querySelectorAll('[data-log-idx]').forEach(btn => {
            btn.addEventListener('click', () => openDetailModal(logs[parseInt(btn.dataset.logIdx)]));
        });

        // Pagination
        if (pages > 1) {
            const pagEl = tblZone.querySelector('#audit-pag');
            buildPagination(pagEl, pg, pages);
        }

        if (window.lucide) window.lucide.createIcons();
    };

    // ── MODAL DÉTAIL ───────────────────────────────────────────
    const openDetailModal = (log) => {
        const info = ACTIONS[log.action] || { label: log.action, icon:'activity', color:'#6B7280' };
        const dt   = log.created_at || log.cree_le;
        modalBox.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <div style="width:44px;height:44px;border-radius:50%;background:${info.color}15;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i data-lucide="${info.icon}" style="color:${info.color};width:20px;height:20px;"></i>
                </div>
                <div>
                    <div style="font-weight:700;font-size:1rem;color:#1A1D20;">${info.label}</div>
                    <div style="font-size:0.78rem;color:#62676B;">@${log.username || '—'}</div>
                </div>
                <span style="margin-left:auto;padding:4px 12px;border-radius:100px;font-size:0.65rem;font-weight:700;
                    background:${log.succes?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)'};
                    color:${log.succes?'#16A34A':'#DC2626'};">
                    ${log.succes ? 'Succès' : 'Échec'}
                </span>
            </div>
            ${[
                ['Utilisateur',  `@${log.username || '—'}`],
                ['Rôle',         log.user_role || '—'],
                ['Adresse IP',   log.adresse_ip || log.ip_adresse || '—'],
                ['Date & Heure', dt ? new Date(dt).toLocaleString('fr-FR') : '—'],
                ['Action',       info.label],
                ['Détails',      log.details ? JSON.stringify(log.details) : '—'],
            ].map(([l,v]) => `
                <div style="display:flex;justify-content:space-between;padding:10px 0;
                    border-bottom:1px solid #F0F4F9;font-size:0.84rem;gap:16px;">
                    <span style="color:#62676B;font-weight:500;flex-shrink:0;">${l}</span>
                    <span style="color:#1A1D20;font-weight:600;text-align:right;word-break:break-all;">${v}</span>
                </div>`).join('')}
            <button id="detail-close" style="width:100%;margin-top:20px;height:46px;background:#0A66C2;border:none;
                border-radius:12px;color:#fff;font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;">
                Fermer
            </button>
        `;
        modal.style.display = 'flex';
        modalBox.querySelector('#detail-close').addEventListener('click', () => { modal.style.display = 'none'; });
        if (window.lucide) window.lucide.createIcons();
    };

    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // ── PAGINATION ──────────────────────────────────────────────
    const buildPagination = (el, pg, pages) => {
        el.innerHTML = '';
        const btn = (label, p, active = false) => {
            const b = document.createElement('button');
            b.className = `adm-page-btn ${active ? 'active' : ''}`;
            b.textContent = label;
            b.disabled = p < 1 || p > pages;
            b.addEventListener('click', () => charger(p));
            el.appendChild(b);
        };
        btn('<', pg - 1);
        for (let i = 1; i <= Math.min(pages, 5); i++) btn(i, i, i === pg);
        btn('>', pg + 1);
    };

    // ── EXPORT CSV ─────────────────────────────────────────────
    main.querySelector('#btn-export').addEventListener('click', () => {
        if (!allLogs.length) { return; }
        const rows = [['Utilisateur','Rôle','Action','Statut','IP','Date'],
            ...allLogs.map(l => [
                l.username, l.user_role, l.action,
                l.succes ? 'Succès' : 'Échec',
                l.adresse_ip || '—',
                l.created_at ? new Date(l.created_at).toLocaleString('fr-FR') : '—'
            ])];
        const csv  = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `journal_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    });

    main.querySelector('#btn-refresh').addEventListener('click', () => charger(1));
    main.querySelector('#btn-filter').addEventListener('click', () => charger(1));
    main.querySelectorAll('.audit-filter-input, .audit-filter-select').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') charger(1); });
    });

    charger(1);
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};