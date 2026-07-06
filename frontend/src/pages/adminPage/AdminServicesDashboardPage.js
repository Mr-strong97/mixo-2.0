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
                <div class="adb-services-layout">
                    <div id="adb-table"></div>
                    <aside id="adb-service-detail" class="adb-detail-card">
                        <div class="adb-detail-empty">
                            <i data-lucide="eye"></i>
                            <p>Sélectionnez un service pour voir son détail.</p>
                        </div>
                    </aside>
                </div>
            `;
            const tableWrap = content.querySelector('#adb-table');
            const detailWrap = content.querySelector('#adb-service-detail');

            const renderDetailPlaceholder = () => {
                detailWrap.innerHTML = `
                    <div class="adb-detail-empty">
                        <i data-lucide="eye"></i>
                        <p>Sélectionnez un service pour voir son détail.</p>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
            };

            const renderDetailLoading = () => {
                detailWrap.innerHTML = `
                    <div class="adb-detail-loading">
                        <div class="mxo-spinner"></div>
                    </div>
                `;
            };

            const renderDetail = (detail) => {
                const statut = String(detail.statut || 'inactif').toLowerCase();
                const statusColors = { actif: '#16A34A', inactif: '#D97706', en_attente: '#0A66C2' };
                const color = statusColors[statut] || '#64748B';
                const galerie = Array.isArray(detail.galerie) ? detail.galerie : [];
                const cover = detail.image || galerie[0]?.image || '';

                detailWrap.innerHTML = `
                    <div class="adb-detail-head">
                        <div>
                            <p class="adb-detail-kicker">Service sélectionné</p>
                            <h3>${escapeHtml(detail.nom_prestation || 'Service')}</h3>
                        </div>
                        <span class="adb-detail-badge" style="background:${color}15;color:${color};">
                            ${escapeHtml(statut)}
                        </span>
                    </div>

                    ${cover ? `<img class="adb-detail-cover" src="${escapeAttr(cover)}" alt="${escapeAttr(detail.nom_prestation || 'Service')}" />` : ''}

                    <div class="adb-detail-grid">
                        <div><span>Coiffeur</span><strong>${escapeHtml(detail.coiffeur_username || '—')}</strong></div>
                        <div><span>Catégorie</span><strong>${escapeHtml(detail.categorie_nom || '—')}</strong></div>
                        <div><span>Prix</span><strong>${formatPrix(detail.prix)} €</strong></div>
                        <div><span>Durée</span><strong>${escapeHtml(String(detail.duree_minutes ?? '—'))} min</strong></div>
                        <div><span>Ville</span><strong>${escapeHtml(detail.ville || '—')}</strong></div>
                        <div><span>Réservations</span><strong>${escapeHtml(String(detail.nb_reservations ?? 0))}</strong></div>
                    </div>

                    <div class="adb-detail-desc">
                        <span>Description</span>
                        <p>${escapeHtml(detail.description || 'Aucune description disponible pour ce service.')}</p>
                    </div>

                    <div class="adb-detail-actions">
                        <button class="adb-detail-btn adb-detail-btn-primary" id="adb-view-public" type="button">
                            <i data-lucide="external-link"></i> Ouvrir la fiche
                        </button>
                    </div>
                `;

                detailWrap.querySelector('#adb-view-public')?.addEventListener('click', () => {
                    window.navigate?.(`/services/${detail.id}`);
                });
                if (window.lucide) window.lucide.createIcons();
            };

            const openServiceDetail = async (service) => {
                renderDetailLoading();
                try {
                    const detail = await AdminServicesAPI.getServiceDetail(service.id);
                    renderDetail(detail);
                } catch {
                    detailWrap.innerHTML = `<p class="adb-error">Impossible de charger le détail du service.</p>`;
                }
            };

            tableWrap.appendChild(AdminServicesTable(data.results || data.resultats || [], {
                onView:    (s) => openServiceDetail(s),
                onSuspend: (s) => suspendreService(s),
                onDelete:  (s) => supprimerService(s),
            }));

            content.querySelector('#adb-search').addEventListener('input', async (e) => {
                const result = await AdminServicesAPI.getServices({ search: e.target.value });
                tableWrap.innerHTML = '';
                tableWrap.appendChild(AdminServicesTable(result.results || result.resultats || [], {
                    onView:    (s) => openServiceDetail(s),
                    onSuspend: (s) => suspendreService(s),
                    onDelete:  (s) => supprimerService(s),
                }));
                renderDetailPlaceholder();
            });

            renderDetailPlaceholder();
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

function formatPrix(prix) {
    const n = parseFloat(prix);
    if (Number.isNaN(n)) return '0';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str = '') {
    return escapeHtml(str).replace(/"/g, '&quot;');
}
