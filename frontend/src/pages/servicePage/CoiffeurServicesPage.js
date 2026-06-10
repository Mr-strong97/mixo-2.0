// ============================================================
//  CoiffeurServicesPage.js — Espace Coiffeur : Gestion services
//  Route : /coiffeur/services
//  Mixo · Module Services v2 (Refonte complète)
// ============================================================

import { NavbarCoiffeur }  from '../../components/navbars/NavbarCoiffeur.js';
import { Footer }          from '../../components/Footer.js';
import { checkUserStatus } from '../../utils/AuthGuard.js';
import { showToast }       from '../../utils/toast.js';
import { ServiceAPI }      from '../../api/ServiceAPI.js';


// ── Constantes ────────────────────────────────────────────────
const CATEGORIES = [
  { value: '',            label: 'Toutes catégories' },
  { value: 'Coupe',       label: 'Coupe Homme' },
  { value: 'CoupeFemme',  label: 'Coupe Femme' },
  { value: 'Tresse',      label: 'Tresses' },
  { value: 'Coloration',  label: 'Coloration' },
  { value: 'Lissage',     label: 'Lissage' },
  { value: 'Soin',        label: 'Soins' },
  { value: 'Barbe',       label: 'Barbe' },
];

// ══════════════════════════════════════════════════════════════
export function CoiffeurServicesPage() {
  
  checkUserStatus();

const role = localStorage.getItem('user_role');

console.log('Role stocké :', role);

if (role !== 'coiffeur') {
  window.navigate('/home');
  return document.createElement('div');
}

  // ── Root element ─────────────────────────────────────────
  const page = document.createElement('div');
  page.className = 'coiffeur-services-root';

  page.appendChild(NavbarCoiffeur());

  const main = document.createElement('main');
  main.className = 'cs-main';
  main.innerHTML = `
    <!-- ── EN-TÊTE ─────────────────────────────────────── -->
    <div class="cs-header">
      <div class="cs-header__left">
        <div class="cs-header__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
            <path d="M6 3L6 21M6 12H18M18 3L18 12"/>
            <circle cx="18" cy="17" r="4"/>
          </svg>
        </div>
        <div>
          <h1 class="cs-header__title">Mes services</h1>
          <p class="cs-header__sub">Gérez votre catalogue de prestations et tarifs.</p>
        </div>
      </div>
      <button class="cs-btn-primary" id="csBtnAdd">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter un service
      </button>
    </div>

    <!-- ── STATISTIQUES ────────────────────────────────── -->
    <div class="cs-stats-grid" id="csStatsGrid">
      <div class="cs-stat cs-stat--blue">
        <div class="cs-stat__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div class="cs-stat__body">
          <span class="cs-stat__value" id="statTotal">—</span>
          <span class="cs-stat__label">TOTAL SERVICES</span>
        </div>
      </div>
      <div class="cs-stat cs-stat--green">
        <div class="cs-stat__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="cs-stat__body">
          <span class="cs-stat__value" id="statActif">—</span>
          <span class="cs-stat__label">ACTIFS</span>
        </div>
      </div>
      <div class="cs-stat cs-stat--amber">
        <div class="cs-stat__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
        </div>
        <div class="cs-stat__body">
          <span class="cs-stat__value" id="statInactif">—</span>
          <span class="cs-stat__label">DÉSACTIVÉS</span>
        </div>
      </div>
      <div class="cs-stat cs-stat--purple">
        <div class="cs-stat__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="cs-stat__body">
          <span class="cs-stat__value" id="statRdv">—</span>
          <span class="cs-stat__label">RENDEZ-VOUS LIÉS</span>
        </div>
      </div>
    </div>

    <!-- ── TOP PRESTATIONS ─────────────────────────────── -->
    <div class="cs-top-section" id="csTopSection" style="display:none">
      <div class="cs-top-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        Top Prestations
      </div>
      <div class="cs-top-list" id="csTopList"></div>
    </div>

    <!-- ── TOOLBAR ──────────────────────────────────────── -->
    <div class="cs-toolbar">
      <div class="cs-search-wrap">
        <svg class="cs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="csSearch" class="cs-search-input" placeholder="Rechercher un service…" />
      </div>
      <div class="cs-toolbar__filters">
        <select id="csCatFilter" class="cs-filter-select">
          ${CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
        </select>
        <select id="csStatusFilter" class="cs-filter-select">
          <option value="">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Désactivés</option>
        </select>
      </div>
    </div>

    <!-- ── TABLE DES SERVICES ──────────────────────────── -->
    <div class="cs-table-wrap">
      <table class="cs-table" id="csTable">
        <thead>
          <tr>
            <th>SERVICE</th>
            <th>CATÉGORIE</th>
            <th>PRIX</th>
            <th>DURÉE</th>
            <th>RÉSERVATIONS</th>
            <th>STATUT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody id="csTableBody">
          <tr><td colspan="7" class="cs-table__loading">
            <div class="cs-spinner"></div>Chargement…
          </td></tr>
        </tbody>
      </table>
    </div>

    <!-- ── PAGINATION ────────────────────────────────── -->
    <div class="cs-pagination" id="csPagination" style="display:none"></div>

    <!-- ── ÉTAT VIDE ──────────────────────────────────── -->
    <div class="cs-empty" id="csEmpty" style="display:none">
      <div class="cs-empty__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M6 3L6 21M6 12H18M18 3L18 12"/><circle cx="18" cy="17" r="4"/><line x1="15" y1="17" x2="21" y2="17"/><line x1="18" y1="14" x2="18" y2="20"/></svg>
      </div>
      <h3 class="cs-empty__title">Aucun service pour le moment</h3>
      <p class="cs-empty__sub">Ajoutez votre premier service pour qu'il apparaisse aux clients.</p>
      <button class="cs-btn-primary" id="csBtnAddEmpty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Créer mon premier service
      </button>
    </div>

    <!-- ── MODAL SUPPRESSION ──────────────────────────── -->
    <div class="cs-overlay" id="csDeleteOverlay" style="display:none">
      <div class="cs-modal cs-modal--sm">
        <div class="cs-modal__icon cs-modal__icon--danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <h3>Supprimer ce service ?</h3>
        <p>Cette action est irréversible. Les rendez-vous existants ne seront pas affectés.</p>
        <div class="cs-modal__actions">
          <button class="cs-btn-ghost" id="csCancelDelete">Annuler</button>
          <button class="cs-btn-danger" id="csConfirmDelete">Supprimer définitivement</button>
        </div>
      </div>
    </div>

    <!-- ── MODAL DÉTAIL SERVICE ─────────────────────────── -->
    <div class="cs-overlay" id="csDetailOverlay" style="display:none">
      <div class="cs-modal cs-modal--detail" id="csDetailModal">
        <button class="cs-modal__close" id="csDetailClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div id="csDetailContent"></div>
      </div>
    </div>
  `;

  page.appendChild(main);
  page.appendChild(Footer());
  _injectCSS();

  // ── État ────────────────────────────────────────────────────
  let allServices = [];
  let filtered    = [];
  let deleteId    = null;
  let currentPage = 1;
  const PER_PAGE  = 10;

  // ── DOM refs ─────────────────────────────────────────────────
  const tbody       = main.querySelector('#csTableBody');
  const emptyEl     = main.querySelector('#csEmpty');
  const topSection  = main.querySelector('#csTopSection');
  const topList     = main.querySelector('#csTopList');
  const pagEl       = main.querySelector('#csPagination');
  const searchInput = main.querySelector('#csSearch');
  const catFilter   = main.querySelector('#csCatFilter');
  const statusFilter = main.querySelector('#csStatusFilter');

  // ── Init ────────────────────────────────────────────────────
  async function init() {
    await _loadServices();
    _renderStats();
    _renderTopServices();
    _applyFilters();
    _bindGlobalEvents();
  }

  // ── Chargement ───────────────────────────────────────────────
  async function _loadServices() {
    try {
      const res = await ServiceAPI.getMesServices();
      allServices = Array.isArray(res.data)
        ? res.data
        : (res.data?.results || []);
      // Normalise statut → actif booléen
      allServices.forEach(s => {
        s.actif = s.statut === 'actif';
        s.nb_reservations = s.nb_reservations || 0;
      });
    } catch {
      allServices = _demoData();
    }
  }

  // ── Stats ────────────────────────────────────────────────────
  function _renderStats() {
    const actifs   = allServices.filter(s => s.actif).length;
    const inactifs = allServices.filter(s => !s.actif).length;
    const rdv      = allServices.reduce((a, s) => a + s.nb_reservations, 0);
    main.querySelector('#statTotal').textContent  = allServices.length;
    main.querySelector('#statActif').textContent  = actifs;
    main.querySelector('#statInactif').textContent = inactifs;
    main.querySelector('#statRdv').textContent    = rdv.toLocaleString('fr-FR');
  }

  // ── Top 3 ────────────────────────────────────────────────────
  function _renderTopServices() {
    const top3 = [...allServices]
      .sort((a, b) => b.nb_reservations - a.nb_reservations)
      .slice(0, 3)
      .filter(s => s.nb_reservations > 0);

    if (top3.length === 0) {
      topSection.style.display = 'none';
      return;
    }
    topSection.style.display = '';

    const medals = ['🥇', '🥈', '🥉'];
    topList.innerHTML = top3.map((s, i) => `
      <div class="cs-top-item">
        <span class="cs-top-medal">${medals[i]}</span>
        <div class="cs-top-info">
          <strong>${_esc(s.nom_prestation)}</strong>
          <span>${s.nb_reservations} réservations</span>
        </div>
        <span class="cs-top-price">${_price(s.prix)}</span>
      </div>
    `).join('');
  }

  // ── Filtrage ─────────────────────────────────────────────────
  function _applyFilters() {
    const q      = searchInput.value.toLowerCase().trim();
    const cat    = catFilter.value;
    const status = statusFilter.value;

    filtered = allServices.filter(s => {
      const matchQ = !q
        || s.nom_prestation.toLowerCase().includes(q)
        || (s.categorie_nom || s.categorie || '').toLowerCase().includes(q)
        || (s.description || '').toLowerCase().includes(q);
      const matchCat    = !cat    || (s.categorie_nom || s.categorie || '') === cat;
      const matchStatus = !status || (status === 'actif' ? s.actif : !s.actif);
      return matchQ && matchCat && matchStatus;
    });

    currentPage = 1;
    _renderTable();
    _renderPagination();
  }

  // ── Rendu table ───────────────────────────────────────────────
  function _renderTable() {
    const tableEl = main.querySelector('#csTable');
    const total   = filtered.length;

    if (total === 0) {
      tableEl.style.display = 'none';
      emptyEl.style.display = '';
      pagEl.style.display   = 'none';
      return;
    }

    tableEl.style.display = '';
    emptyEl.style.display = 'none';

    const start = (currentPage - 1) * PER_PAGE;
    const slice = filtered.slice(start, start + PER_PAGE);

    tbody.innerHTML = slice.map(s => `
      <tr data-id="${s.id}">
        <td>
          <div class="cs-service-cell">
            ${s.image
              ? `<img class="cs-service-img" src="${s.image}" alt="${_esc(s.nom_prestation)}">`
              : `<div class="cs-service-img cs-service-img--placeholder">${_catEmoji(s.categorie_nom || s.categorie)}</div>`}
            <div class="cs-service-info">
              <span class="cs-service-name">${_esc(s.nom_prestation)}</span>
              ${s.description ? `<span class="cs-service-desc">${_esc(s.description.slice(0, 50))}${s.description.length > 50 ? '…' : ''}</span>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="cs-badge cs-badge--cat">${_esc(s.categorie_nom || s.categorie || '—')}</span>
        </td>
        <td class="cs-cell-price">${_price(s.prix)}</td>
        <td class="cs-cell-muted">${_dur(s.duree_minutes)}</td>
        <td class="cs-cell-muted">${s.nb_reservations.toLocaleString('fr-FR')}</td>
        <td>
          <label class="cs-toggle-wrap" title="${s.actif ? 'Désactiver' : 'Activer'}">
            <div class="cs-toggle">
              <input type="checkbox" class="cs-toggle__input toggle-status"
                     data-id="${s.id}" ${s.actif ? 'checked' : ''}>
              <span class="cs-toggle__slider"></span>
            </div>
            <span class="cs-status-lbl ${s.actif ? 'cs-status-lbl--active' : 'cs-status-lbl--inactive'}">
              ${s.actif ? 'Actif' : 'Inactif'}
            </span>
          </label>
        </td>
        <td>
          <div class="cs-actions">
            <button class="cs-action cs-action--view" data-view="${s.id}" title="Voir le détail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="cs-action cs-action--edit" data-edit="${s.id}" title="Modifier">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="cs-action cs-action--delete" data-delete="${s.id}" title="Supprimer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Bind actions
    tbody.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => _openDetail(btn.dataset.view));
    });
    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => window.navigate(`/coiffeur/services/${btn.dataset.edit}/edit`));
    });
    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => _askDelete(btn.dataset.delete));
    });
    tbody.querySelectorAll('.toggle-status').forEach(toggle => {
      toggle.addEventListener('change', () => _toggleStatus(toggle.dataset.id, toggle.checked));
    });
  }

  // ── Pagination ────────────────────────────────────────────────
  function _renderPagination() {
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    if (totalPages <= 1) { pagEl.style.display = 'none'; return; }

    pagEl.style.display = 'flex';
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }

    pagEl.innerHTML = `
      <button class="cs-pag-btn ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
        ‹ Précédent
      </button>
      ${pages.map(p => p === '…'
        ? `<span class="cs-pag-ellipsis">…</span>`
        : `<button class="cs-pag-btn ${p === currentPage ? 'cs-pag-btn--active' : ''}" data-page="${p}">${p}</button>`
      ).join('')}
      <button class="cs-pag-btn ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
        Suivant ›
      </button>
    `;

    pagEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (p >= 1 && p <= totalPages && p !== currentPage) {
          currentPage = p;
          _renderTable();
          _renderPagination();
          main.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Détail service ────────────────────────────────────────────
  async function _openDetail(id) {
    const s = allServices.find(x => String(x.id) === String(id));
    if (!s) return;

    const overlay = main.querySelector('#csDetailOverlay');
    const content = main.querySelector('#csDetailContent');

    content.innerHTML = `
      <div class="cs-detail">
        ${s.image ? `<div class="cs-detail__img-wrap"><img src="${s.image}" alt="${_esc(s.nom_prestation)}" class="cs-detail__img"></div>` : ''}
        <div class="cs-detail__body">
          <div class="cs-detail__badges">
            <span class="cs-badge cs-badge--cat">${_esc(s.categorie_nom || s.categorie || 'Non catégorisé')}</span>
            <span class="cs-badge ${s.actif ? 'cs-badge--active' : 'cs-badge--inactive'}">${s.actif ? '● Actif' : '● Inactif'}</span>
          </div>
          <h2 class="cs-detail__title">${_esc(s.nom_prestation)}</h2>
          ${s.description ? `<p class="cs-detail__desc">${_esc(s.description)}</p>` : ''}
          <div class="cs-detail__meta-grid">
            <div class="cs-detail__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${_dur(s.duree_minutes)}</span>
            </div>
            <div class="cs-detail__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span class="cs-detail__price">${_price(s.prix)}</span>
            </div>
            ${s.ville ? `<div class="cs-detail__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${_esc(s.ville)}</span>
            </div>` : ''}
            <div class="cs-detail__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div class="cs-detail__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/></svg>
              <span>${s.nb_reservations} réservation${s.nb_reservations !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="cs-detail__footer-btns">
            <button class="cs-btn-ghost" id="csDetailEdit" data-id="${s.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier ce service
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('cs-overlay--visible'), 10);

    content.querySelector('#csDetailEdit').addEventListener('click', (e) => {
      window.navigate(`/coiffeur/services/${e.currentTarget.dataset.id}/edit`);
    });
  }

  // ── Toggle statut ────────────────────────────────────────────
  async function _toggleStatus(id, actif) {
    const actionUrl = actif
      ? `/api/services/${id}/activer/`
      : `/api/services/${id}/desactiver/`;

    try {
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!res.ok) throw new Error();
    } catch {
      // Mode optimiste, on continue
    }

    const s = allServices.find(x => String(x.id) === String(id));
    if (s) { s.actif = actif; s.statut = actif ? 'actif' : 'inactif'; }

    _renderStats();
    _applyFilters();
    showToast(actif ? 'Service activé ✓' : 'Service désactivé', actif ? 'success' : 'warning');
  }

  // ── Suppression ───────────────────────────────────────────────
  function _askDelete(id) {
    deleteId = id;
    const overlay = main.querySelector('#csDeleteOverlay');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('cs-overlay--visible'), 10);
  }

  async function _doDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/services/${deleteId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
    } catch { /* optimiste */ }
    allServices = allServices.filter(s => String(s.id) !== String(deleteId));
    deleteId = null;
    _renderStats();
    _renderTopServices();
    _applyFilters();
    showToast('Service supprimé', 'success');
  }

  // ── Events globaux ────────────────────────────────────────────
  function _bindGlobalEvents() {
    main.querySelector('#csBtnAdd').addEventListener('click', () => window.navigate('/coiffeur/services/new'));
    console.log('Ajouter cliqué');
    main.querySelector('#csBtnAddEmpty')?.addEventListener('click', () => window.navigate('/coiffeur/services/new'));
    searchInput.addEventListener('input', _applyFilters);
    catFilter.addEventListener('change', _applyFilters);
    statusFilter.addEventListener('change', _applyFilters);

    // Suppression
    main.querySelector('#csCancelDelete').addEventListener('click', () => {
      _closeOverlay(main.querySelector('#csDeleteOverlay'));
    });
    main.querySelector('#csConfirmDelete').addEventListener('click', async () => {
      _closeOverlay(main.querySelector('#csDeleteOverlay'));
      await _doDelete();
    });
    main.querySelector('#csDeleteOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) _closeOverlay(e.currentTarget);
    });

    // Fermer détail
    main.querySelector('#csDetailClose').addEventListener('click', () => {
      _closeOverlay(main.querySelector('#csDetailOverlay'));
    });
    main.querySelector('#csDetailOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) _closeOverlay(e.currentTarget);
    });
  }

  function _closeOverlay(el) {
    el.classList.remove('cs-overlay--visible');
    setTimeout(() => el.style.display = 'none', 250);
  }

  // ── Start ────────────────────────────────────────────────────
  init();

  return page;
}

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════
function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _price(p) {
  return parseFloat(p || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function _dur(min) {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function _catEmoji(cat) {
  const map = {
    Coupe: '✂️', CoupeFemme: '💇', Coloration: '🎨', Soin: '💆',
    Tresse: '🪢', Lissage: '✨', Barbe: '🧔', Brushing: '💨',
  };
  return map[cat] || '💈';
}

function _demoData() {
  return [
    { id: 1, nom_prestation: 'Coupe Dégradée', categorie: 'Coupe', categorie_nom: 'Coupe', prix: '35.00', duree_minutes: 45, actif: true, statut: 'actif', nb_reservations: 850, description: 'Finition précise aux ciseaux', created_at: new Date().toISOString() },
    { id: 2, nom_prestation: 'Coloration Complète', categorie: 'Coloration', categorie_nom: 'Coloration', prix: '85.00', duree_minutes: 120, actif: true, statut: 'actif', nb_reservations: 420, description: 'Produits organiques uniquement', created_at: new Date().toISOString() },
    { id: 3, nom_prestation: 'Rasage Traditionnel', categorie: 'Barbe', categorie_nom: 'Barbe', prix: '25.00', duree_minutes: 30, actif: true, statut: 'actif', nb_reservations: 1240, description: 'Serviette chaude & massage', created_at: new Date().toISOString() },
    { id: 4, nom_prestation: 'Lissage Brésilien', categorie: 'Lissage', categorie_nom: 'Lissage', prix: '120.00', duree_minutes: 120, actif: false, statut: 'inactif', nb_reservations: 180, description: 'Traitement longue durée', created_at: new Date().toISOString() },
    { id: 5, nom_prestation: 'Tresse Africaine', categorie: 'Tresse', categorie_nom: 'Tresse', prix: '80.00', duree_minutes: 180, actif: true, statut: 'actif', nb_reservations: 340, description: 'Plusieurs styles disponibles', created_at: new Date().toISOString() },
    { id: 6, nom_prestation: 'Soin Kératine', categorie: 'Soin', categorie_nom: 'Soin', prix: '95.00', duree_minutes: 90, actif: false, statut: 'inactif', nb_reservations: 95, description: 'Soin restructurant profond', created_at: new Date().toISOString() },
  ];
}

// ══════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════
function _injectCSS() {
  if (document.getElementById('cs-page-styles')) return;
  const s = document.createElement('style');
  s.id = 'cs-page-styles';
  s.textContent = `
/* ── Layout ──────────────────────────────────────────────── */
.coiffeur-services-root { min-height: 100vh; background: var(--bg-page); font-family: var(--font-main); display: flex; flex-direction: column; }
.cs-main { flex: 1; max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; width: 100%; box-sizing: border-box; }

/* ── Header ──────────────────────────────────────────────── */
.cs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
.cs-header__left { display: flex; align-items: center; gap: 16px; }
.cs-header__icon { width: 56px; height: 56px; background: var(--blue-dim); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: var(--blue); flex-shrink: 0; }
.cs-header__title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text-dark); margin: 0 0 4px; }
.cs-header__sub { font-size: 14px; color: var(--text-muted); margin: 0; }

/* ── Stats ───────────────────────────────────────────────── */
.cs-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.cs-stat { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
.cs-stat__icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cs-stat--blue  .cs-stat__icon { background: var(--blue-dim); color: var(--blue); }
.cs-stat--green .cs-stat__icon { background: rgba(34,197,94,0.08); color: var(--success); }
.cs-stat--amber .cs-stat__icon { background: rgba(245,158,11,0.08); color: var(--warning); }
.cs-stat--purple .cs-stat__icon { background: rgba(139,92,246,0.08); color: #8b5cf6; }
.cs-stat__value { display: block; font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text-dark); line-height: 1; }
.cs-stat__label { display: block; font-size: 11px; font-weight: 600; color: var(--text-tertiary); letter-spacing: 0.06em; margin-top: 4px; }

/* ── Top services ────────────────────────────────────────── */
.cs-top-section { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 28px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
.cs-top-header { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 16px; }
.cs-top-list { display: flex; gap: 12px; flex-wrap: wrap; }
.cs-top-item { flex: 1; min-width: 180px; display: flex; align-items: center; gap: 10px; background: var(--bg-page); border-radius: var(--radius-md); padding: 12px 16px; }
.cs-top-medal { font-size: 20px; flex-shrink: 0; }
.cs-top-info { flex: 1; min-width: 0; }
.cs-top-info strong { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cs-top-info span { font-size: 12px; color: var(--text-muted); }
.cs-top-price { font-size: 14px; font-weight: 700; color: var(--blue); white-space: nowrap; }

/* ── Toolbar ─────────────────────────────────────────────── */
.cs-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.cs-search-wrap { position: relative; flex: 1; min-width: 240px; }
.cs-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); pointer-events: none; }
.cs-search-input { width: 100%; padding: 10px 14px 10px 40px; background: var(--bg-surface); border: 1.5px solid var(--border-md); border-radius: var(--radius-md); font-family: var(--font-main); font-size: 14px; color: var(--text-dark); transition: var(--transition-fast); box-sizing: border-box; }
.cs-search-input:focus { outline: none; border-color: var(--blue); background: var(--bg-input-focus); box-shadow: var(--focus-ring); }
.cs-toolbar__filters { display: flex; gap: 8px; }
.cs-filter-select { padding: 10px 14px; background: var(--bg-surface); border: 1.5px solid var(--border-md); border-radius: var(--radius-md); font-family: var(--font-main); font-size: 14px; color: var(--text-dark); cursor: pointer; }
.cs-filter-select:focus { outline: none; border-color: var(--blue); box-shadow: var(--focus-ring); }

/* ── Table ───────────────────────────────────────────────── */
.cs-table-wrap { background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; }
.cs-table { width: 100%; border-collapse: collapse; }
.cs-table thead tr { border-bottom: 1.5px solid var(--border); }
.cs-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-tertiary); letter-spacing: 0.08em; white-space: nowrap; }
.cs-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; font-size: 14px; color: var(--text-dark); }
.cs-table tbody tr:last-child td { border-bottom: none; }
.cs-table tbody tr:hover td { background: var(--bg-page); }
.cs-table__loading { text-align: center; padding: 40px 0 !important; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 10px; }

/* ── Service cell ────────────────────────────────────────── */
.cs-service-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.cs-service-img { width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; }
.cs-service-img--placeholder { display: flex; align-items: center; justify-content: center; background: var(--blue-dim); font-size: 18px; }
.cs-service-info { min-width: 0; }
.cs-service-name { display: block; font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.cs-service-desc { display: block; font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.cs-cell-price { font-weight: 700; color: var(--blue); }
.cs-cell-muted { color: var(--text-muted); }

/* ── Badges ──────────────────────────────────────────────── */
.cs-badge { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 600; }
.cs-badge--cat { background: var(--blue-dim); color: var(--blue); }
.cs-badge--active { background: rgba(34,197,94,0.1); color: #16a34a; }
.cs-badge--inactive { background: rgba(245,158,11,0.1); color: #b45309; }

/* ── Toggle ──────────────────────────────────────────────── */
.cs-toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.cs-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.cs-toggle__input { opacity: 0; width: 0; height: 0; position: absolute; }
.cs-toggle__slider { position: absolute; inset: 0; background: #d1d5db; border-radius: var(--radius-pill); transition: 0.25s var(--ease-spring); cursor: pointer; }
.cs-toggle__slider::before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.25s var(--ease-spring); }
.cs-toggle__input:checked + .cs-toggle__slider { background: var(--success); }
.cs-toggle__input:checked + .cs-toggle__slider::before { transform: translateX(16px); }
.cs-status-lbl { font-size: 12px; font-weight: 600; }
.cs-status-lbl--active { color: var(--success); }
.cs-status-lbl--inactive { color: var(--text-tertiary); }

/* ── Action buttons ──────────────────────────────────────── */
.cs-actions { display: flex; gap: 4px; }
.cs-action { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--border-md); border-radius: var(--radius-sm); background: transparent; cursor: pointer; color: var(--text-muted); transition: var(--transition-fast); }
.cs-action:hover { background: var(--bg-input); color: var(--text-dark); border-color: var(--border-md); }
.cs-action--edit:hover { color: var(--blue); border-color: var(--blue-border-md); background: var(--blue-dim); }
.cs-action--delete:hover { color: var(--danger); border-color: var(--danger-border); background: var(--danger-dim); }

/* ── Pagination ──────────────────────────────────────────── */
.cs-pagination { display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
.cs-pag-btn { padding: 8px 14px; border: 1.5px solid var(--border-md); border-radius: var(--radius-sm); background: var(--bg-surface); font-family: var(--font-main); font-size: 14px; color: var(--text-dark); cursor: pointer; transition: var(--transition-fast); }
.cs-pag-btn:hover:not(.disabled) { background: var(--bg-input); }
.cs-pag-btn--active { background: var(--blue); color: var(--white); border-color: var(--blue); font-weight: 600; }
.cs-pag-btn.disabled { opacity: 0.4; cursor: not-allowed; }
.cs-pag-ellipsis { padding: 8px 6px; color: var(--text-muted); }

/* ── Empty ───────────────────────────────────────────────── */
.cs-empty { text-align: center; padding: 64px 24px; }
.cs-empty__icon { width: 80px; height: 80px; background: var(--blue-dim); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--blue); }
.cs-empty__title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-dark); margin: 0 0 8px; }
.cs-empty__sub { font-size: 14px; color: var(--text-muted); margin: 0 0 24px; }

/* ── Spinner ─────────────────────────────────────────────── */
.cs-spinner { width: 20px; height: 20px; border: 2.5px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: csSpinAnim 0.7s linear infinite; flex-shrink: 0; }
@keyframes csSpinAnim { to { transform: rotate(360deg); } }

/* ── Overlay / Modal ─────────────────────────────────────── */
.cs-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 9000; padding: 24px; opacity: 0; transition: opacity 0.25s ease; }
.cs-overlay--visible { opacity: 1; }
.cs-modal { background: var(--bg-surface); border-radius: var(--radius-xl); padding: 32px; max-width: 480px; width: 100%; box-shadow: var(--shadow-lg); transform: translateY(16px); transition: transform 0.25s var(--ease-expo); position: relative; }
.cs-overlay--visible .cs-modal { transform: translateY(0); }
.cs-modal--sm { max-width: 400px; text-align: center; }
.cs-modal--sm h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-dark); margin: 12px 0 8px; }
.cs-modal--sm p { font-size: 14px; color: var(--text-muted); margin: 0 0 24px; line-height: 1.6; }
.cs-modal__icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
.cs-modal__icon--danger { background: var(--danger-dim); color: var(--danger); }
.cs-modal__actions { display: flex; gap: 10px; justify-content: center; }
.cs-modal__close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: var(--bg-input); border-radius: var(--radius-sm); cursor: pointer; color: var(--text-muted); transition: var(--transition-fast); }
.cs-modal__close:hover { background: var(--border-md); color: var(--text-dark); }
.cs-modal--detail { max-width: 560px; padding: 0; overflow: hidden; }

/* ── Detail view ─────────────────────────────────────────── */
.cs-detail { }
.cs-detail__img-wrap { width: 100%; height: 220px; overflow: hidden; }
.cs-detail__img { width: 100%; height: 100%; object-fit: cover; }
.cs-detail__body { padding: 24px 28px; }
.cs-detail__badges { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.cs-detail__title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-dark); margin: 0 0 10px; }
.cs-detail__desc { font-size: 14px; color: var(--text-muted); line-height: 1.65; margin: 0 0 20px; }
.cs-detail__meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.cs-detail__meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
.cs-detail__price { font-weight: 700; color: var(--blue); font-size: 16px; }
.cs-detail__footer-btns { display: flex; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--border); }

/* ── Buttons ─────────────────────────────────────────────── */
.cs-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--blue); color: var(--white); border: none; border-radius: var(--radius-md); font-family: var(--font-main); font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition); white-space: nowrap; }
.cs-btn-primary:hover { background: var(--blue-dark); box-shadow: var(--shadow-blue); transform: translateY(-1px); }
.cs-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; background: transparent; color: var(--text-muted); border: 1.5px solid var(--border-md); border-radius: var(--radius-md); font-family: var(--font-main); font-size: 14px; cursor: pointer; transition: var(--transition-fast); }
.cs-btn-ghost:hover { background: var(--bg-input); color: var(--text-dark); }
.cs-btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--danger); color: var(--white); border: none; border-radius: var(--radius-md); font-family: var(--font-main); font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition-fast); }
.cs-btn-danger:hover { background: #dc2626; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .cs-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .cs-table th:nth-child(5), .cs-table td:nth-child(5) { display: none; }
}
@media (max-width: 640px) {
  .cs-main { padding: 24px 16px 60px; }
  .cs-stats-grid { grid-template-columns: 1fr 1fr; }
  .cs-header { flex-direction: column; align-items: flex-start; }
  .cs-header__left { flex-direction: column; align-items: flex-start; }
  .cs-toolbar { flex-direction: column; }
  .cs-search-wrap { min-width: 0; width: 100%; }
  .cs-toolbar__filters { width: 100%; }
  .cs-filter-select { flex: 1; }
  .cs-table th:nth-child(3), .cs-table td:nth-child(3),
  .cs-table th:nth-child(4), .cs-table td:nth-child(4) { display: none; }
}
  `;
  document.head.appendChild(s);
}