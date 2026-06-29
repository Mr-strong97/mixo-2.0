/**
 * AdminUsersPage.js — MIXO
 * Espace Admin — Gestion des utilisateurs
 * URL : /admin/users
 *
 * Page complète qui encapsule AdminUserSection.js dans le shell
 * Navbar + Footer + cartes KPI en haut de page.
 */
import { Navbar }             from '../../components/navbars/Navbar.js';
import { Footer }             from '../../components/Footer.js';
import { AdminUserSection }   from '../../components/admin/AdminUserSection.js';
import AdminService            from '../../api/AdminService.js';
import { requireRole }         from '../../utils/AuthGuard.js';

export const AdminUsersPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-users-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'adm-users-main';

    // ── En-tête ────────────────────────────────────────────
    main.innerHTML = `
        <div class="adm-users-topbar">
            <div class="adm-users-heading">
                <div class="adm-users-heading-icon">
                    <i data-lucide="users"></i>
                </div>
                <div>
                    <h1>Gestion des Utilisateurs</h1>
                    <p>Supervisez, validez et modérez les comptes de la plateforme.</p>
                </div>
            </div>
        </div>

        <!-- Cartes KPI -->
        <div class="adm-users-kpi" id="adm-kpi">
            <div class="adm-kpi-card adm-kpi-skeleton"><div class="mxo-spinner"></div></div>
            <div class="adm-kpi-card adm-kpi-skeleton"><div class="mxo-spinner"></div></div>
            <div class="adm-kpi-card adm-kpi-skeleton"><div class="mxo-spinner"></div></div>
            <div class="adm-kpi-card adm-kpi-skeleton"><div class="mxo-spinner"></div></div>
        </div>

        <!-- Section principale -->
        <div id="adm-users-section"></div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    // ── KPI ────────────────────────────────────────────────
    const loadKpi = async () => {
        try {
            const [pending, hairdressers, clients] = await Promise.all([
                AdminService.getPendingUsers().catch(() => ({ resultats: [] })),
                AdminService.getActiveHairdressers().catch(() => ({ resultats: [] })),
                AdminService.getClients('ACTIF').catch(() => ({ resultats: [] })),
            ]);

            const nbPending     = (pending?.resultats     || pending     || []).length;
            const nbCoiffeurs   = (hairdressers?.resultats || hairdressers || []).length;
            const nbClients     = (clients?.resultats      || clients      || []).length;
            const nbTotal       = nbPending + nbCoiffeurs + nbClients;

            const kpiEl = main.querySelector('#adm-kpi');
            kpiEl.innerHTML = [
                { icon: 'users',        label: 'Total utilisateurs', value: nbTotal,     color: '#0A66C2' },
                { icon: 'clock',        label: 'En attente',          value: nbPending,   color: '#D97706' },
                { icon: 'scissors',     label: 'Coiffeurs actifs',    value: nbCoiffeurs, color: '#16A34A' },
                { icon: 'user',         label: 'Clients actifs',      value: nbClients,   color: '#7C3AED' },
            ].map(k => `
                <div class="adm-kpi-card">
                    <div class="adm-kpi-icon" style="background:${k.color}15;color:${k.color};">
                        <i data-lucide="${k.icon}"></i>
                    </div>
                    <div class="adm-kpi-body">
                        <span class="adm-kpi-value">${k.value}</span>
                        <span class="adm-kpi-label">${k.label}</span>
                    </div>
                </div>
            `).join('');

            if (window.lucide) window.lucide.createIcons();
        } catch {
            main.querySelector('#adm-kpi').innerHTML = '';
        }
    };

    // ── Section utilisateurs ───────────────────────────────
    main.querySelector('#adm-users-section').appendChild(AdminUserSection());

    loadKpi();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};