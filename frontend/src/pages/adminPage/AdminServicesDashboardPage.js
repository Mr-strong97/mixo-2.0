/**
 * AdminServicesDashboardPage.js — MIXO
 * Espace Admin — Dashboard Administration Services (page hôte)
 * URL : /admin/services
 *
 * Affiche le menu interne (Services / Abonnements / Horaires / Portfolios)
 * et délègue le rendu de chaque section à sa page dédiée.
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { AdminSidebarMenu }  from '../../components/adminComponents/AdminSidebarMenu.js';
import { AdminServicesTable } from '../../components/adminComponents/AdminServicesTable.js';
import { AdminServicesAPI }  from '../../api/AdminServicesAPI.js';
import { confirmDialog }     from '../../utils/confirmDialog.js';
import { requireRole }       from '../../utils/AuthGuard.js';
import { showToast }         from '../../utils/toast.js';

import { renderAdminAbonnementsSection } from './AdminAbonnementsPage.js';
import { renderAdminHorairesSection }    from './AdminHorairesPage.js';
import { renderAdminPortfolioSection }   from './AdminPortfolioPage.js';

import '../../styles/adminStyles/AdminDashboard.css';

export const AdminServicesDashboardPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adb-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'adb-main';
    main.innerHTML = `
        <div class="adb-header">
            <div class="adb-header-icon"><i data-lucide="layout-dashboard"></i></div>
            <div>
                <h1>Dashboard Administration Services</h1>
                <p>Supervisez services, abonnements, horaires et portfolios de la plateforme.</p>
            </div>
        </div>
        <div class="adb-layout">
            <aside id="adb-sidebar"></aside>
            <section id="adb-content"></section>
        </div>
    `;
    page.appendChild(main);
    page.appendChild(Footer());

    let activeSection = 'services';
    const content = main.querySelector('#adb-content');

    const renderSidebar = () => {
        const sidebar = main.querySelector('#adb-sidebar');
        sidebar.innerHTML = '';
        sidebar.appendChild(AdminSidebarMenu(activeSection, (section) => {
            activeSection = section;
            renderSidebar();
            renderContent();
        }));
    };

    const renderContent = () => {
        content.innerHTML = `<div class="adb-loader"><div class="mxo-spinner"></div></div>`;

        if (activeSection === 'services')    return renderServicesSection();
        if (activeSection === 'abonnements') return renderAdminAbonnementsSection(content);
        if (activeSection === 'horaires')    return renderAdminHorairesSection(content);
        if (activeSection === 'portfolio')   return renderAdminPortfolioSection(content);
    };

    // ── Section Services (rendue directement ici) ───────────────
    const renderServicesSection = async () => {
        try {
            const data = await AdminServicesAPI.getServices();
            content.innerHTML = `
                <div class="adb-section-header">
                    <h2>Tous les services</h2>
                    <input type="text" id="adb-search" class="adb-search" placeholder="Rechercher…"/>
                </div>
                <div id="adb-table"></div>
            `;
            const tableWrap = content.querySelector('#adb-table');
            tableWrap.appendChild(AdminServicesTable(data.results || data.resultats || [], {
                onView:    (s) => showToast(`📋 ${s.nom_prestation}`),
                onSuspend: (s) => suspendreService(s),
                onDelete:  (s) => supprimerService(s),
            }));

            content.querySelector('#adb-search').addEventListener('input', async (e) => {
                const result = await AdminServicesAPI.getServices({ search: e.target.value });
                tableWrap.innerHTML = '';
                tableWrap.appendChild(AdminServicesTable(result.results || result.resultats || [], {
                    onView:    (s) => showToast(`📋 ${s.nom_prestation}`),
                    onSuspend: (s) => suspendreService(s),
                    onDelete:  (s) => supprimerService(s),
                }));
            });

            if (window.lucide) window.lucide.createIcons();
        } catch {
            content.innerHTML = `<p class="adb-error">Erreur de chargement des services.</p>`;
        }
    };

    const suspendreService = (s) => {
        AdminServicesAPI.suspendreService(s.id)
            .then(() => { showToast('⏸ Service suspendu.'); renderServicesSection(); })
            .catch(() => showToast('❌ Erreur.'));
    };

    const supprimerService = (s) => {
        confirmDialog('Supprimer le service ?', `Le service « ${s.nom_prestation} » sera supprimé définitivement.`)
            .then((ok) => {
                if (!ok) return;
                AdminServicesAPI.supprimerService(s.id)
                    .then(() => { showToast('🗑 Service supprimé.'); renderServicesSection(); })
                    .catch(() => showToast('❌ Erreur.'));
            });
    };

    renderSidebar();
    renderContent();
    if (window.lucide) window.lucide.createIcons();
    return page;
};
