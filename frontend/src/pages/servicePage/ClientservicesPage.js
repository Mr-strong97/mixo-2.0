/**
 * ClientServicesPage.js — MIXO
 * Espace Client — Services disponibles (Image 3)
 * URL : /services
 *
 * CORRECTIFS APPLIQUÉS :
 *   ✅ Bug #2 — ServiceApi (non importé) → ServiceAPI
 *   ✅ Bug #3 — recherche → search (nom attendu par le backend)
 *   ✅ Bug #4 — categorie → categorie_id (nom attendu par le backend)
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { ServiceCard }       from '../../components/servicesComponents/ServiceCard.js';
import { CategoryFilterBar } from '../../components/servicesComponents/CategoryFilterBar.js';
import { ServiceAPI }        from '../../api/ServiceAPI.js';
import { FavorisAPI }        from '../../api/FavorisAPI.js';
import { requireAuth }       from '../../utils/AuthGuard.js';
import { showToast }         from '../../utils/toast.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/serviceStyles/ClientServices.css';

const PER_PAGE = 12;

export const ClientServicesPage = () => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'csp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'csp-main';

    main.innerHTML = `
        <div class="csp-header">
            <h1 class="csp-title">Services disponibles</h1>
            <p class="csp-subtitle">Explorez les prestations de nos coiffeurs et réservez votre prochain moment de bien-être.</p>
        </div>

        <div class="csp-toolbar">
            <div class="csp-search-wrap">
                <i data-lucide="search" class="csp-search-ico"></i>
                <input type="text" id="csp-search" class="csp-search" placeholder="Rechercher une prestation, un coiffeur…"/>
            </div>
            <button class="csp-filters-btn" id="csp-filters-btn" type="button">
                <i data-lucide="sliders-horizontal"></i> Filtres
            </button>
        </div>

        <div class="csp-categories" id="csp-categories"></div>

        <!-- Panneau filtres avancés (masqué par défaut) -->
        <div class="csp-filters-panel" id="csp-filters-panel" style="display:none;">
            <div class="csp-filter-group">
                <label>Prix max (€)</label>
                <input type="number" id="f-prix-max" min="0" placeholder="ex : 100"/>
            </div>
            <div class="csp-filter-group">
                <label>Ville</label>
                <input type="text" id="f-ville" placeholder="ex : Paris"/>
            </div>
            <button class="csp-filter-apply" id="f-apply" type="button">Appliquer</button>
            <button class="csp-filter-reset" id="f-reset" type="button">Réinitialiser</button>
        </div>

        <div class="csp-grid" id="csp-grid">
            <div class="csp-loader"><div class="mxo-spinner"></div></div>
        </div>

        <div class="csp-pagination" id="csp-pagination"></div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    const grid = main.querySelector('#csp-grid');
    let activeCateg   = null;
    let currentPage   = 1;
    let searchTimeout = null;

    // ── Charger catégories ────────────────────────────────────
    ServiceAPI.getCategories().then(categories => {
        main.querySelector('#csp-categories').appendChild(
            CategoryFilterBar(categories, activeCateg, (id) => {
                activeCateg = id;
                currentPage = 1;
                chargerServices();
            })
        );
    }).catch(() => {});

    // ── Charger services ──────────────────────────────────────
    const chargerServices = async () => {
        grid.innerHTML = `<div class="csp-loader"><div class="mxo-spinner"></div></div>`;

        // ✅ CORRIGÉ : search (pas recherche) + categorie_id (pas categorie)
        const filtres = {
            page:         currentPage,
            par_page:     PER_PAGE,
            search:       main.querySelector('#csp-search').value.trim(),
            categorie_id: activeCateg || '',
            prix_max:     main.querySelector('#f-prix-max')?.value || '',
            ville:        main.querySelector('#f-ville')?.value.trim() || '',
        };

        try {
            // ✅ CORRIGÉ : ServiceAPI (pas ServiceApi, qui n'était pas importé)
            const data = await ServiceAPI.getServices(filtres);

            if (!data.resultats?.length) {
                grid.innerHTML = `
                    <div class="csp-empty">
                        <i data-lucide="search-x"></i>
                        <p>Aucun service ne correspond à votre recherche.</p>
                    </div>`;
                main.querySelector('#csp-pagination').innerHTML = '';
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            grid.innerHTML = '';
            data.resultats.forEach(s => grid.appendChild(ServiceCard(s, async (serviceId, isFav) => {
                const res = await FavorisAPI.toggle(serviceId);
                showToast(isFav ? 'Service ajouté aux favoris.' : 'Service retiré des favoris.', 'success');
                window.dispatchEvent(new CustomEvent('mixo:favorites-updated', { detail: { count: res.count ?? 0 } }));
                return res;
            })));
            buildPagination(data.pages, data.page);

        } catch (err) {
            console.error('[ClientServicesPage] Erreur de chargement :', err);
            grid.innerHTML = `
                <div class="csp-empty">
                    <i data-lucide="alert-triangle"></i>
                    <p>${err.message || 'Erreur de chargement des services.'}</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    // ── Pagination ───────────────────────────────────────────
    const buildPagination = (pages, page) => {
        const el = main.querySelector('#csp-pagination');
        el.innerHTML = '';
        if (pages <= 1) return;

        const addBtn = (label, p, disabled = false, active = false) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `csp-page-btn ${active ? 'active' : ''}`;
            btn.textContent = label;
            btn.disabled = disabled;
            btn.addEventListener('click', () => { currentPage = p; chargerServices(); });
            el.appendChild(btn);
        };

        addBtn('‹ Précédent', page - 1, page <= 1);
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
                addBtn(i, i, false, i === page);
            } else if (i === 2 || i === pages - 1) {
                const sep = document.createElement('span');
                sep.className = 'csp-page-sep';
                sep.textContent = '…';
                el.appendChild(sep);
            }
        }
        addBtn('Suivant ›', page + 1, page >= pages);
    };

    // ── Recherche & filtres ────────────────────────────────────
    main.querySelector('#csp-search').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => { currentPage = 1; chargerServices(); }, 350);
    });

    main.querySelector('#csp-filters-btn').addEventListener('click', () => {
        const panel = main.querySelector('#csp-filters-panel');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    main.querySelector('#f-apply').addEventListener('click', () => { currentPage = 1; chargerServices(); });
    main.querySelector('#f-reset').addEventListener('click', () => {
        main.querySelector('#f-prix-max').value = '';
        main.querySelector('#f-ville').value    = '';
        currentPage = 1;
        chargerServices();
    });

    chargerServices();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};
