/**
 * CoiffeurServicesPage.js — MIXO
 * Espace Coiffeur — Mes services (Image 8)
 * URL : /coiffeur/services
 */
import { Navbar }               from '../../components/navbars/Navbar.js';
import { Footer }                from '../../components/Footer.js';
import { ServiceStatsCards }     from '../../components/servicesComponents/ServiceStatsCards.js';
import { TopPrestationsSection } from '../../components/servicesComponents/TopPrestationsSection.js';
import { ServiceTableRow }       from '../../components/servicesComponents/ServiceTableRow.js';
import { ServiceAPI }            from '../../api/ServiceAPI.js';
import { requireRole }           from '../../utils/AuthGuard.js';
import { showToast }             from '../../utils/toast.js';
import { confirmDialog }         from '../../utils/confirmDialog.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/serviceStyles/CoiffeurServices.css';

const PER_PAGE = 10;

export const CoiffeurServicesPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'csv-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'csv-main';

    main.innerHTML = `
        <!-- Bannière -->
        <div class="csv-header">
            <div class="csv-header-title">
                <div class="csv-header-icon"><i data-lucide="scissors"></i></div>
                <div>
                    <h1>Mes services</h1>
                    <p>Gérez votre catalogue de prestations et tarifs.</p>
                </div>
            </div>
            <button class="csv-btn-add" id="csv-add" type="button">
                <i data-lucide="plus"></i> Ajouter un service
            </button>
        </div>

        <div id="csv-stats"></div>
        <div id="csv-top"></div>

        <!-- Outils -->
        <div class="csv-toolbar">
            <div class="csv-search-wrap">
                <i data-lucide="search" class="csv-search-ico"></i>
                <input type="text" id="csv-search" class="csv-search" placeholder="Rechercher un service…"/>
            </div>
            <select id="csv-categorie" class="csv-select">
                <option value="">Toutes les catégories</option>
            </select>
            <select id="csv-statut" class="csv-select">
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Désactivé</option>
                <option value="en_attente">En attente</option>
            </select>
        </div>

        <!-- Table -->
        <div class="csv-table-wrap">
            <table class="csv-table">
                <thead><tr>
                    <th>SERVICE</th><th>CATÉGORIE</th><th>PRIX</th><th>DURÉE</th>
                    <th>RÉSERVATIONS</th><th>STATUT</th><th>ACTIONS</th>
                </tr></thead>
                <tbody id="csv-tbody">
                    <tr><td colspan="7"><div class="csv-loader"><div class="mxo-spinner"></div></div></td></tr>
                </tbody>
            </table>
        </div>

        <div class="csv-pagination" id="csv-pagination"></div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    let currentPage   = 1;
    let searchTimeout = null;

    // ── Stats + Top prestations ───────────────────────────────
    ServiceAPI.getStats().then(stats => {
        main.querySelector('#csv-stats').appendChild(ServiceStatsCards(stats));
        main.querySelector('#csv-top').appendChild(TopPrestationsSection(stats.top_prestations));
    }).catch(() => {
        main.querySelector('#csv-stats').appendChild(ServiceStatsCards({}));
    });

    // ── Catégories pour le filtre ─────────────────────────────
    ServiceAPI.getCategories().then(cats => {
        const sel = main.querySelector('#csv-categorie');
        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.icone || ''} ${c.nom}`.trim();
            sel.appendChild(opt);
        });
    }).catch(() => {});

    // ── Charger la liste des services ──────────────────────────
    const tbody = main.querySelector('#csv-tbody');

    const charger = async () => {
        tbody.innerHTML = `<tr><td colspan="7"><div class="csv-loader"><div class="mxo-spinner"></div></div></td></tr>`;

        const filtres = {
            page: currentPage,
            par_page: PER_PAGE,
            search: main.querySelector('#csv-search').value.trim(),
            categorie_id: main.querySelector('#csv-categorie').value,
            statut: main.querySelector('#csv-statut').value,
        };

        try {
            const data = await ServiceAPI.getMesServices(filtres);

            if (!data.resultats?.length) {
                tbody.innerHTML = `
                    <tr><td colspan="7">
                        <div class="csv-empty">
                            <i data-lucide="inbox"></i>
                            <p>Aucun service trouvé.</p>
                            <button class="csv-btn-add" id="csv-empty-add" type="button">
                                <i data-lucide="plus"></i> Ajouter un service
                            </button>
                        </div>
                    </td></tr>`;
                tbody.querySelector('#csv-empty-add')?.addEventListener('click', goToWizard);
                main.querySelector('#csv-pagination').innerHTML = '';
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            tbody.innerHTML = '';
            data.resultats.forEach(s => {
                tbody.appendChild(ServiceTableRow(s, {
                    onView:   (svc) => window.navigate?.(`/coiffeur/services/${svc.id}`),
                    onEdit:   (svc) => window.navigate?.(`/coiffeur/services/${svc.id}/edit`),
                    onDelete: (svc) => confirmerSuppression(svc),
                    onToggle: (svc, actif) => toggleStatut(svc, actif),
                }));
            });

            buildPagination(data.pages, data.page, data.total);
            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            tbody.innerHTML = `
                <tr><td colspan="7">
                    <div class="csv-empty">
                        <i data-lucide="alert-triangle"></i>
                        <p>${err.message || 'Erreur de chargement des services.'}</p>
                    </div>
                </td></tr>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    const toggleStatut = async (service, actif) => {
        try {
            if (actif) await ServiceAPI.activerService(service.id);
            else       await ServiceAPI.desactiverService(service.id);
            showToast(actif ? '✅ Service activé.' : '⏸ Service désactivé.');
            charger();
        } catch (e) {
            showToast(`❌ ${e.message || 'Erreur lors de la mise à jour.'}`);
            charger();
        }
    };

    const confirmerSuppression = (service) => {
        confirmDialog('Supprimer le service ?', `Le service « ${service.nom_prestation} » sera supprimé définitivement.`)
            .then((ok) => {
                if (!ok) return;
                ServiceAPI.supprimerService(service.id)
                    .then(() => { showToast('🗑 Service supprimé.'); charger(); })
                    .catch(e => showToast(`❌ ${e.message || 'Erreur de suppression.'}`));
            });
    };

    const goToWizard = () => window.navigate?.('/coiffeur/services/new');

    // ── Pagination ───────────────────────────────────────────
    const buildPagination = (pages, page, total) => {
        const el = main.querySelector('#csv-pagination');
        el.innerHTML = '';
        if (pages <= 1) return;

        const start = (page - 1) * PER_PAGE + 1;
        const end   = Math.min(page * PER_PAGE, total);

        const info = document.createElement('span');
        info.className = 'csv-page-info';
        info.textContent = `Affichage de ${start} à ${end} sur ${total} services`;
        el.appendChild(info);

        const nav = document.createElement('div');
        nav.className = 'csv-page-nav';
        el.appendChild(nav);

        const addBtn = (label, p, disabled = false, active = false) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `csv-page-btn ${active ? 'active' : ''}`;
            btn.textContent = label;
            btn.disabled = disabled;
            btn.addEventListener('click', () => { currentPage = p; charger(); });
            nav.appendChild(btn);
        };

        addBtn('‹', page - 1, page <= 1);
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || Math.abs(i - page) <= 1) addBtn(i, i, false, i === page);
        }
        addBtn('›', page + 1, page >= pages);
    };

    // ── Évènements ──────────────────────────────────────────────
    main.querySelector('#csv-add').addEventListener('click', goToWizard);
    main.querySelector('#csv-search').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => { currentPage = 1; charger(); }, 350);
    });
    main.querySelector('#csv-categorie').addEventListener('change', () => { currentPage = 1; charger(); });
    main.querySelector('#csv-statut').addEventListener('change', () => { currentPage = 1; charger(); });

    charger();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};
