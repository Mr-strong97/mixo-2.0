/**
 * AdminPage.js — MIXO
 * Utilise le composant Navbar (NavbarAdmin) et Footer.
 * Pas de sidebar interne, pas d'onglet Journal (page dédiée /admin/journal).
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { AdminUserSection }  from '../../components/admin/AdminUserSection.js';
import { AdminPlaceholder }  from '../../components/admin/AdminPlaceholder.js';
import { AdminStatsSection } from '../../components/admin/AdminStatsSection.js';
import AdminService          from '../../api/AdminService.js';
import { requireRole }       from '../../utils/AuthGuard.js';

export const AdminPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-page';

    // ── Navbar (NavbarAdmin via Navbar.js) ──────────────────
    page.appendChild(Navbar());

    // ── Main ────────────────────────────────────────────────
    const main = document.createElement('main');
    main.className = 'adm-main';

    main.innerHTML = `
        <!-- KPI Cards -->
        <div class="adm-kpi-row" id="adm-kpi">
            ${[
                { id:'kpi-total',   icon:'users',        label:'TOTAL'      },
                { id:'kpi-actifs',  icon:'check-circle', label:'ACTIFS'     },
                { id:'kpi-attente', icon:'clock',        label:'EN ATTENTE' },
                { id:'kpi-bannis',  icon:'ban',          label:'BANNIS'     },
            ].map(k => `
                <div class="adm-kpi-card">
                    <i data-lucide="${k.icon}" style="color:#0A66C2;width:32px;height:32px;"></i>
                    <span class="adm-kpi-val" id="${k.id}">…</span>
                    <span class="adm-kpi-label">${k.label}</span>
                </div>
            `).join('')}
        </div>

        <!-- Zone dynamique -->
        <div id="adm-content" class="adm-content"></div>
    `;

    page.appendChild(main);

    // ── Footer ──────────────────────────────────────────────
    page.appendChild(Footer());

    // ── KPI ─────────────────────────────────────────────────
    AdminService.getDashboardStats().then(d => {
        main.querySelector('#kpi-total').textContent   = d.total_utilisateurs ?? 0;
        main.querySelector('#kpi-actifs').textContent  = d.total_actifs ?? d.coiffeurs_actifs ?? 0;
        main.querySelector('#kpi-attente').textContent = d.coiffeurs_en_attente ?? 0;
        main.querySelector('#kpi-bannis').textContent  = d.comptes_bannis ?? 0;
    }).catch(() => {});

    // ── Rendu initial ────────────────────────────────────────
    const contentEl = main.querySelector('#adm-content');
    contentEl.appendChild(AdminUserSection());
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);

    return page;
};