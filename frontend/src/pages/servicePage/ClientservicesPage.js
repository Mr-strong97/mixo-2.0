// ============================================================
//  ClientServicesPage.js — Espace Client : Catalogue services
//  Route : /services
//  Mixo · Module Services v2
// ============================================================

import { NavbarClient }    from '../../components/navbars/NavbarClient.js';
import { Footer }          from '../../components/Footer.js';
import { checkUserStatus } from '../../utils/AuthGuard.js';
import { showToast }       from '../../utils/toast.js';

const QUICK_CATS = ['Coupe Homme', 'Coupe Femme', 'Coloration', 'Brushing', 'Soin Capillaire', 'Tresse', 'Barbe'];

// ══════════════════════════════════════════════════════════════
export function ClientServicesPage() {
  checkUserStatus();

  const page = document.createElement('div');
  page.className = 'cl-root';
  page.appendChild(NavbarClient());

  const main = document.createElement('main');
  main.className = 'cl-main';
  page.appendChild(main);
  page.appendChild(Footer());

  _injectCSS();

  // ── State ─────────────────────────────────────────────────
  let allServices  = [];
  let filtered     = [];
  let activeCat    = '';
  let currentPage  = 1;
  let sidebarOpen  = false;
  const PER_PAGE   = 9;

  const filters = { search: '', category: '', minPrice: '', maxPrice: '', ville: '', disponible: false };

  // ── Shell ─────────────────────────────────────────────────
  main.innerHTML = `
    <!-- En-tête -->
    <div class="cl-header">
      <h1 class="cl-title">Services disponibles</h1>
      <p class="cl-subtitle">Explorez les prestations de nos coiffeurs et réservez votre prochain moment de bien-être.</p>
    </div>

    <!-- Barre de recherche + filtres rapides -->
    <div class="cl-search-bar">
      <div class="cl-search-wrap">
        <svg class="cl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="clSearch" class="cl-search-input" type="text" placeholder="Rechercher une prestation, un coiffeur…">
      </div>
      <button class="cl-filter-btn" id="clFilterBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
        Filtres
        <span class="cl-filter-badge" id="clFilterBadge" style="display:none">0</span>
      </button>
      <div class="cl-quick-cats" id="clQuickCats">
        ${QUICK_CATS.map(c => `<button class="cl-quick-cat" data-cat="${c}">${c}</button>`).join('')}
      </div>
    </div>

    <!-- Layout principal -->
    <div class="cl-layout" id="clLayout">
      <!-- Sidebar filtres (masquée par défaut) -->
      <aside class="cl-sidebar" id="clSidebar">
        <div class="cl-sidebar-inner" id="clSidebarInner"></div>
      </aside>

      <!-- Grille -->
      <div class="cl-content" id="clContent">
        <div class="cl-results-bar" id="clResultsBar"></div>
        <div class="cl-grid" id="clGrid">
          <div class="cl-loading">
            <div class="cl-spinner"></div>
            <span>Chargement des services…</span>
          </div>
        </div>
        <div class="cl-pagination" id="clPagination"></div>
      </div>
    </div>

    <!-- Overlay sidebar mobile -->
    <div class="cl-sidebar-backdrop" id="clSidebarBackdrop"></div>

    <!-- Modal détail service -->
    <div class="cl-detail-overlay" id="clDetailOverlay" style="display:none">
      <div class="cl-detail-modal" id="clDetailModal">
        <button class="cl-detail-close" id="clDetailClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div id="clDetailContent"></div>
      </div>
    </div>
  `;

  // ── DOM refs ──────────────────────────────────────────────
  const grid     = main.querySelector('#clGrid');
  const sidebar  = main.querySelector('#clSidebar');
  const pagEl    = main.querySelector('#clPagination');
  const resBar   = main.querySelector('#clResultsBar');
  const backdrop = main.querySelector('#clSidebarBackdrop');

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    _renderSidebar();
    await _loadServices();
    _applyFilters();
    _bindGlobalEvents();
  }

  // ── Chargement ────────────────────────────────────────────
  async function _loadServices() {
    try {
      const params = new URLSearchParams({ page_size: 100 });
      const res = await fetch(`/api/services/?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      allServices = Array.isArray(data) ? data : (data.results || []);
    } catch {
      allServices = _demoData();
    }
  }

  // ── Sidebar filtres ───────────────────────────────────────
  function _renderSidebar() {
    const inner = main.querySelector('#clSidebarInner');
    inner.innerHTML = `
      <div class="cl-sidebar-header">
        <strong>Filtres</strong>
        <button class="cl-sidebar-reset" id="clResetFilters">Réinitialiser</button>
      </div>

      <!-- Catégorie -->
      <div class="cl-filter-section">
        <div class="cl-filter-title">Catégorie</div>
        <div class="cl-filter-radios" id="clSideCats">
          ${['Coupe Homme','Coupe Femme','Coloration','Tresse','Lissage','Barbe','Brushing','Soin'].map(c => `
            <label class="cl-radio-label">
              <input type="radio" name="sideCat" value="${c}">
              <span class="cl-radio-box"></span>
              <span>${c}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Prix -->
      <div class="cl-filter-section">
        <div class="cl-filter-title">Prix (€)</div>
        <div class="cl-price-inputs">
          <div class="cl-price-input-wrap">
            <span>Min</span>
            <input type="number" id="clMinPrice" class="cl-mini-input" placeholder="0" min="0" step="5">
          </div>
          <span class="cl-price-sep">—</span>
          <div class="cl-price-input-wrap">
            <span>Max</span>
            <input type="number" id="clMaxPrice" class="cl-mini-input" placeholder="500" min="0" step="5">
          </div>
        </div>
        <input type="range" id="clMaxRange" class="cl-range" min="0" max="500" value="500" step="5">
      </div>

      <!-- Ville -->
      <div class="cl-filter-section">
        <div class="cl-filter-title">Ville</div>
        <div class="cl-input-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <input type="text" id="clVille" class="cl-mini-input cl-mini-input--icon" placeholder="Paris, Lyon…">
        </div>
      </div>

      <!-- Disponibilité -->
      <div class="cl-filter-section">
        <div class="cl-filter-title">Disponibilité</div>
        <label class="cl-toggle-label">
          <div class="cl-toggle">
            <input type="checkbox" id="clDispo" class="cl-toggle__input">
            <span class="cl-toggle__slider"></span>
          </div>
          <span>Disponibles maintenant</span>
        </label>
      </div>

      <button class="cl-apply-btn" id="clApplyFilters">Appliquer les filtres</button>
    `;

    // Sync range ↔ max input
    inner.querySelector('#clMaxRange').addEventListener('input', (e) => {
      inner.querySelector('#clMaxPrice').value = e.target.value;
    });
    inner.querySelector('#clMaxPrice').addEventListener('input', (e) => {
      inner.querySelector('#clMaxRange').value = e.target.value;
    });

    inner.querySelector('#clApplyFilters').addEventListener('click', () => {
      const catEl = inner.querySelector('input[name="sideCat"]:checked');
      filters.category  = catEl ? catEl.value : '';
      filters.minPrice  = inner.querySelector('#clMinPrice').value;
      filters.maxPrice  = inner.querySelector('#clMaxPrice').value;
      filters.ville     = inner.querySelector('#clVille').value.trim();
      filters.disponible = inner.querySelector('#clDispo').checked;
      activeCat = filters.category;
      _syncQuickCats();
      _applyFilters();
      _updateBadge();
      if (window.innerWidth < 768) _closeSidebar();
    });

    inner.querySelector('#clResetFilters').addEventListener('click', () => {
      Object.assign(filters, { category: '', minPrice: '', maxPrice: '', ville: '', disponible: false });
      activeCat = '';
      inner.querySelector('input[name="sideCat"]:checked') && (inner.querySelector('input[name="sideCat"]:checked').checked = false);
      inner.querySelector('#clMinPrice').value = '';
      inner.querySelector('#clMaxPrice').value = '';
      inner.querySelector('#clMaxRange').value = 500;
      inner.querySelector('#clVille').value = '';
      inner.querySelector('#clDispo').checked = false;
      _syncQuickCats();
      _applyFilters();
      _updateBadge();
    });
  }

  // ── Filtrage ──────────────────────────────────────────────
  function _applyFilters() {
    const q   = main.querySelector('#clSearch').value.toLowerCase().trim();
    const cat = activeCat;

    filtered = allServices.filter(s => {
      const catName = s.categorie_nom || s.categorie || '';
      const matchQ    = !q || s.nom_prestation.toLowerCase().includes(q)
                          || (s.coiffeur_username || '').toLowerCase().includes(q)
                          || catName.toLowerCase().includes(q);
      const matchCat  = !cat  || catName === cat;
      const matchMin  = !filters.minPrice || parseFloat(s.prix) >= parseFloat(filters.minPrice);
      const matchMax  = !filters.maxPrice || parseFloat(s.prix) <= parseFloat(filters.maxPrice);
      const matchCity = !filters.ville    || (s.ville || '').toLowerCase().includes(filters.ville.toLowerCase());
      return matchQ && matchCat && matchMin && matchMax && matchCity;
    });

    currentPage = 1;
    _renderGrid();
    _renderPagination();
    _renderResultsBar();
  }

  // ── Grille de services ────────────────────────────────────
  function _renderGrid() {
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="cl-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3>Aucun service trouvé</h3>
          <p>Essayez de modifier vos critères de recherche.</p>
        </div>
      `;
      return;
    }

    const start = (currentPage - 1) * PER_PAGE;
    const slice = filtered.slice(start, start + PER_PAGE);

    grid.innerHTML = slice.map(s => _cardHtml(s)).join('');

    // Bind cards
    grid.querySelectorAll('[data-detail]').forEach(btn => {
      btn.addEventListener('click', () => _openDetail(btn.dataset.detail));
    });
    grid.querySelectorAll('[data-book]').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('Module Réservations — bientôt disponible', 'info');
      });
    });
    grid.querySelectorAll('.cl-wishlist').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('cl-wishlist--active');
      });
    });
  }

  // ── Card HTML ─────────────────────────────────────────────
  function _cardHtml(s) {
    const prix  = parseFloat(s.prix || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    const dur   = _dur(s.duree_minutes);
    const note  = parseFloat(s.note_moyenne || 0);
    const stars = _stars(note);
    const catName = s.categorie_nom || s.categorie || '';
    const isPopular = (s.nb_reservations || 0) > 100;

    return `
      <article class="cl-card">
        <div class="cl-card__img">
          ${s.image
            ? `<img src="${_esc(s.image)}" alt="${_esc(s.nom_prestation)}" loading="lazy">`
            : `<div class="cl-card__img-ph" style="background:${_catColor(catName)}">
                 <span class="cl-card__cat-emoji">${_catEmoji(catName)}</span>
               </div>`
          }
          ${isPopular ? '<span class="cl-card__badge cl-card__badge--popular">POPULAIRE</span>' : ''}
          ${catName && !isPopular ? `<span class="cl-card__badge cl-card__badge--cat">${_esc(catName.toUpperCase())}</span>` : ''}
          <button class="cl-wishlist" title="Sauvegarder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>

        <div class="cl-card__body">
          <div class="cl-card__title-row">
            <h3 class="cl-card__name">${_esc(s.nom_prestation)}</h3>
            <span class="cl-card__price">${prix}</span>
          </div>

          <div class="cl-card__rating">
            <div class="cl-stars">${stars}</div>
            <span class="cl-rating-val">${note.toFixed(1)}</span>
            <span class="cl-rating-cnt">(${s.nb_avis || 0} avis)</span>
          </div>

          <div class="cl-card__coiffeur">
            <div class="cl-avatar">
              ${s.coiffeur_photo
                ? `<img src="${_esc(s.coiffeur_photo)}" alt="${_esc(s.coiffeur_username || '')}">`
                : `<span>${(s.coiffeur_username || '?').charAt(0).toUpperCase()}</span>`}
            </div>
            <span>Par ${_esc(s.coiffeur_username || 'Coiffeur')}</span>
          </div>

          <div class="cl-card__meta">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${dur}
            </span>
            ${s.ville ? `<span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${_esc(s.ville)}
            </span>` : ''}
          </div>
        </div>

        <div class="cl-card__footer">
          <button class="cl-btn-ghost" data-detail="${s.id}">Voir</button>
          <button class="cl-btn-primary" data-book="${s.id}">Réserver</button>
        </div>
      </article>
    `;
  }

  // ── Détail service ────────────────────────────────────────
  async function _openDetail(id) {
    let s = allServices.find(x => String(x.id) === String(id));

    // Fetch détail enrichi si possible
    try {
      const res = await fetch(`/api/services/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (res.ok) s = await res.json();
    } catch { /* utilise données locales */ }

    if (!s) return;

    const overlay = main.querySelector('#clDetailOverlay');
    const content = main.querySelector('#clDetailContent');
    const galerie = s.galerie || [];

    content.innerHTML = `
      <!-- Galerie -->
      <div class="cl-dg-gallery">
        ${s.image
          ? `<div class="cl-dg-cover">
               <img src="${_esc(s.image)}" alt="${_esc(s.nom_prestation)}">
             </div>`
          : ''
        }
        ${galerie.length > 0 ? `
        <div class="cl-dg-thumbs">
          ${galerie.slice(0, 3).map(img => `<img src="${_esc(img.image || img.url)}" alt="">`).join('')}
          ${galerie.length > 3 ? `<div class="cl-dg-more">+${galerie.length - 3} photos</div>` : ''}
        </div>` : ''}
      </div>

      <!-- Corps -->
      <div class="cl-dg-body">
        <div class="cl-dg-left">
          <h2 class="cl-dg-title">${_esc(s.nom_prestation)}</h2>
          <div class="cl-dg-meta">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${_dur(s.duree_minutes)}
            </span>
            <span class="cl-dg-price">${parseFloat(s.prix||0).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</span>
          </div>
          ${s.description ? `<p class="cl-dg-desc">${_esc(s.description)}</p>` : ''}
          <div class="cl-dg-actions">
            <button class="cl-btn-primary cl-btn-lg" data-book="${s.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Réserver maintenant
            </button>
            <button class="cl-btn-ghost" id="clDetailBack">Retour au catalogue</button>
          </div>
        </div>

        <div class="cl-dg-right">
          ${s.coiffeur_username ? `
          <div class="cl-dg-coiffeur-card">
            <div class="cl-dg-coiffeur-label">VOTRE BARBIER</div>
            <div class="cl-dg-coiffeur-info">
              <div class="cl-dg-avatar">
                ${s.coiffeur_photo
                  ? `<img src="${_esc(s.coiffeur_photo)}" alt="">`
                  : `<span>${(s.coiffeur_username||'?').charAt(0).toUpperCase()}</span>`}
              </div>
              <div>
                <strong>${_esc(s.coiffeur_username)}</strong>
                ${s.note_moyenne ? `<div class="cl-dg-note">
                  <svg viewBox="0 0 24 24" fill="#F59E0B" stroke="none" width="12" height="12"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ${parseFloat(s.note_moyenne).toFixed(1)} (${s.nb_avis||0} avis)
                </div>` : ''}
              </div>
            </div>
            <a href="#" class="cl-dg-profil-link" data-user="${_esc(s.coiffeur_username)}">Voir le profil complet</a>
          </div>` : ''}

          <div class="cl-dg-secure-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <strong>Réservation Sécurisée</strong>
              <span>Annulation gratuite jusqu'à 24h avant.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('cl-detail-overlay--visible'), 10);

    content.querySelector('[data-book]')?.addEventListener('click', () => {
      showToast('Module Réservations — bientôt disponible', 'info');
    });
    content.querySelector('#clDetailBack')?.addEventListener('click', () => _closeDetail());
    content.querySelector('[data-user]')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigate(`/${e.currentTarget.dataset.user}/profil`);
    });
  }

  function _closeDetail() {
    const overlay = main.querySelector('#clDetailOverlay');
    overlay.classList.remove('cl-detail-overlay--visible');
    setTimeout(() => overlay.style.display = 'none', 300);
  }

  // ── Pagination ────────────────────────────────────────────
  function _renderPagination() {
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    if (totalPages <= 1) { pagEl.innerHTML = ''; return; }

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '…') pages.push('…');
    }

    pagEl.innerHTML = `
      <button class="cl-pag-btn ${currentPage === 1 ? 'cl-pag-btn--disabled' : ''}" data-page="${currentPage-1}" ${currentPage===1?'disabled':''}>‹ Précédent</button>
      ${pages.map(p => p === '…'
        ? `<span class="cl-pag-ellipsis">…</span>`
        : `<button class="cl-pag-btn ${p===currentPage?'cl-pag-btn--active':''}" data-page="${p}">${p}</button>`
      ).join('')}
      <button class="cl-pag-btn ${currentPage===totalPages?'cl-pag-btn--disabled':''}" data-page="${currentPage+1}" ${currentPage===totalPages?'disabled':''}>Suivant ›</button>
    `;

    pagEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (p >= 1 && p <= totalPages && p !== currentPage) {
          currentPage = p;
          _renderGrid();
          _renderPagination();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── Barre de résultats ────────────────────────────────────
  function _renderResultsBar() {
    resBar.textContent = filtered.length === 0
      ? ''
      : `${filtered.length} service${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`;
  }

  // ── Quick cats ────────────────────────────────────────────
  function _syncQuickCats() {
    main.querySelectorAll('.cl-quick-cat').forEach(btn => {
      btn.classList.toggle('cl-quick-cat--active', btn.dataset.cat === activeCat);
    });
  }

  function _updateBadge() {
    const count = [filters.category, filters.minPrice, filters.maxPrice, filters.ville]
      .filter(Boolean).length + (filters.disponible ? 1 : 0);
    const badge = main.querySelector('#clFilterBadge');
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  }

  // ── Sidebar toggle ────────────────────────────────────────
  function _openSidebar() {
    sidebarOpen = true;
    sidebar.classList.add('cl-sidebar--open');
    backdrop.classList.add('cl-sidebar-backdrop--visible');
    main.querySelector('#clLayout').classList.add('cl-layout--sidebar');
  }
  function _closeSidebar() {
    sidebarOpen = false;
    sidebar.classList.remove('cl-sidebar--open');
    backdrop.classList.remove('cl-sidebar-backdrop--visible');
    main.querySelector('#clLayout').classList.remove('cl-layout--sidebar');
  }

  // ── Events globaux ────────────────────────────────────────
  function _bindGlobalEvents() {
    main.querySelector('#clSearch').addEventListener('input', () => {
      filters.search = main.querySelector('#clSearch').value;
      _applyFilters();
    });

    main.querySelector('#clFilterBtn').addEventListener('click', () => {
      sidebarOpen ? _closeSidebar() : _openSidebar();
    });

    backdrop.addEventListener('click', _closeSidebar);

    main.querySelectorAll('.cl-quick-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = activeCat === btn.dataset.cat ? '' : btn.dataset.cat;
        filters.category = activeCat;
        _syncQuickCats();
        _applyFilters();
        _updateBadge();
      });
    });

    main.querySelector('#clDetailClose').addEventListener('click', _closeDetail);
    main.querySelector('#clDetailOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) _closeDetail();
    });
  }

  init();
  return page;
}

// ── Helpers ────────────────────────────────────────────────────
function _esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _dur(min) {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min/60), m = min%60;
  return m ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`;
}
function _stars(note) {
  let html = '';
  for (let i = 0; i < 5; i++) {
    const fill = i < Math.floor(note) ? '#F59E0B' : '#E5E7EB';
    html += `<svg viewBox="0 0 24 24" fill="${fill}" stroke="none" width="12" height="12"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  return html;
}
function _catEmoji(cat) {
  const m = { 'Coupe Homme':'✂️','Coupe Femme':'💇','Coloration':'🎨','Soin':'💆','Tresse':'🪢','Lissage':'✨','Barbe':'🧔','Brushing':'💨' };
  return m[cat] || '💈';
}
function _catColor(cat) {
  const m = { 'Coupe Homme':'#dbeafe','Coupe Femme':'#fce7f3','Coloration':'#fef3c7','Soin':'#d1fae5','Tresse':'#ede9fe','Lissage':'#e0f2fe','Barbe':'#fee2e2','Brushing':'#f0fdf4' };
  return m[cat] || '#f1f5f9';
}
function _demoData() {
  return [
    { id:1, nom_prestation:'Coupe Signature',     categorie:'Coupe Homme', categorie_nom:'Coupe Homme', prix:'45.00', duree_minutes:45, note_moyenne:4.9, nb_avis:124, nb_reservations:850, coiffeur_username:'Julien M.', ville:'Paris 08', actif:true },
    { id:2, nom_prestation:'Brushing & Style',    categorie:'Brushing',    categorie_nom:'Brushing',    prix:'35.00', duree_minutes:40, note_moyenne:4.8, nb_avis:92,  nb_reservations:320, coiffeur_username:'Sarah L.',  ville:'Boulogne',  actif:true },
    { id:3, nom_prestation:'Coloration & Soin',   categorie:'Coloration',  categorie_nom:'Coloration',  prix:'85.00', duree_minutes:120,note_moyenne:4.7, nb_avis:42,  nb_reservations:180, coiffeur_username:'Thomas R.', ville:'Paris 16',  actif:true },
    { id:4, nom_prestation:'Soin Kératine',       categorie:'Soin',        categorie_nom:'Soin',        prix:'120.00',duree_minutes:90, note_moyenne:5.0, nb_avis:31,  nb_reservations:95,  coiffeur_username:'Amélie D.', ville:'Levallois', actif:true },
    { id:5, nom_prestation:'Tresse Africaine',    categorie:'Tresse',      categorie_nom:'Tresse',      prix:'80.00', duree_minutes:180,note_moyenne:4.9, nb_avis:58,  nb_reservations:210, coiffeur_username:'Fatou K.',  ville:'Paris 18',  actif:true },
    { id:6, nom_prestation:'Rasage Traditionnel', categorie:'Barbe',       categorie_nom:'Barbe',       prix:'25.00', duree_minutes:30, note_moyenne:4.8, nb_avis:76,  nb_reservations:640, coiffeur_username:'Marco B.',  ville:'Paris 11',  actif:true },
  ];
}

// ── CSS ────────────────────────────────────────────────────────
function _injectCSS() {
  if (document.getElementById('cl-styles')) return;
  const s = document.createElement('style');
  s.id = 'cl-styles';
  s.textContent = `
.cl-root { min-height:100vh; background:var(--bg-page); font-family:var(--font-main); display:flex; flex-direction:column; }
.cl-main { flex:1; max-width:1200px; margin:0 auto; padding:40px 24px 80px; width:100%; box-sizing:border-box; }

/* Header */
.cl-header { margin-bottom:28px; }
.cl-title { font-family:var(--font-display); font-size:32px; font-weight:800; color:var(--text-dark); margin:0 0 6px; }
.cl-subtitle { font-size:15px; color:var(--text-muted); margin:0; }

/* Search bar */
.cl-search-bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:28px; }
.cl-search-wrap { position:relative; min-width:260px; flex:1; max-width:400px; }
.cl-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-tertiary); pointer-events:none; }
.cl-search-input { width:100%; padding:10px 14px 10px 38px; background:var(--bg-surface); border:1.5px solid var(--border-md); border-radius:var(--radius-pill); font-family:var(--font-main); font-size:14px; color:var(--text-dark); box-sizing:border-box; }
.cl-search-input:focus { outline:none; border-color:var(--blue); box-shadow:var(--focus-ring); }
.cl-filter-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 16px; background:var(--blue); color:white; border:none; border-radius:var(--radius-pill); font-family:var(--font-main); font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition-fast); white-space:nowrap; position:relative; }
.cl-filter-btn:hover { background:var(--blue-dark); }
.cl-filter-badge { background:white; color:var(--blue); border-radius:50%; width:18px; height:18px; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }
.cl-quick-cats { display:flex; gap:8px; flex-wrap:wrap; }
.cl-quick-cat { padding:8px 16px; border:1.5px solid var(--border-md); border-radius:var(--radius-pill); background:var(--bg-surface); font-family:var(--font-main); font-size:13px; font-weight:500; cursor:pointer; transition:var(--transition-fast); color:var(--text-dark); white-space:nowrap; }
.cl-quick-cat:hover { border-color:var(--blue); color:var(--blue); background:var(--blue-dim); }
.cl-quick-cat--active { background:var(--blue); border-color:var(--blue); color:white; font-weight:600; }

/* Layout */
.cl-layout { display:flex; gap:24px; align-items:flex-start; }
.cl-sidebar { width:0; overflow:hidden; flex-shrink:0; transition:width 0.3s var(--ease-expo); }
.cl-sidebar--open { width:260px; }
.cl-layout--sidebar .cl-sidebar { width:260px; }
.cl-sidebar-inner { width:260px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm); }
.cl-sidebar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.cl-sidebar-header strong { font-size:16px; font-weight:700; color:var(--text-dark); }
.cl-sidebar-reset { background:none; border:none; font-size:13px; color:var(--blue); cursor:pointer; }
.cl-sidebar-reset:hover { text-decoration:underline; }
.cl-sidebar-backdrop { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.3); z-index:500; }
.cl-sidebar-backdrop--visible { display:block; }
.cl-content { flex:1; min-width:0; }
.cl-results-bar { font-size:13px; color:var(--text-muted); margin-bottom:12px; height:20px; }

/* Sidebar filters */
.cl-filter-section { margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--border); }
.cl-filter-section:last-of-type { border-bottom:none; }
.cl-filter-title { font-size:13px; font-weight:600; color:var(--text-dark); margin-bottom:10px; }
.cl-filter-radios { display:flex; flex-direction:column; gap:7px; }
.cl-radio-label { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-dark); cursor:pointer; }
.cl-radio-label input { display:none; }
.cl-radio-box { width:16px; height:16px; border:2px solid var(--border-md); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:var(--transition-fast); }
.cl-radio-label input:checked ~ .cl-radio-box { border-color:var(--blue); background:var(--blue); }
.cl-radio-label input:checked ~ .cl-radio-box::after { content:''; width:6px; height:6px; background:white; border-radius:50%; display:block; }
.cl-price-inputs { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.cl-price-input-wrap { display:flex; flex-direction:column; gap:3px; flex:1; }
.cl-price-input-wrap span { font-size:11px; color:var(--text-tertiary); }
.cl-price-sep { color:var(--text-muted); margin-top:12px; }
.cl-mini-input { padding:7px 10px; background:var(--bg-input); border:1.5px solid var(--border-md); border-radius:var(--radius-sm); font-family:var(--font-main); font-size:13px; color:var(--text-dark); width:100%; box-sizing:border-box; }
.cl-mini-input:focus { outline:none; border-color:var(--blue); box-shadow:var(--focus-ring); }
.cl-input-icon-wrap { position:relative; }
.cl-mini-input--icon { padding-left:30px; }
.cl-range { width:100%; accent-color:var(--blue); }
.cl-toggle-label { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-dark); cursor:pointer; }
.cl-toggle { position:relative; width:36px; height:20px; flex-shrink:0; }
.cl-toggle__input { opacity:0; width:0; height:0; position:absolute; }
.cl-toggle__slider { position:absolute; inset:0; background:#d1d5db; border-radius:var(--radius-pill); cursor:pointer; transition:0.25s; }
.cl-toggle__slider::before { content:''; position:absolute; width:14px; height:14px; left:3px; bottom:3px; background:white; border-radius:50%; transition:0.25s; }
.cl-toggle__input:checked + .cl-toggle__slider { background:var(--blue); }
.cl-toggle__input:checked + .cl-toggle__slider::before { transform:translateX(16px); }
.cl-apply-btn { width:100%; padding:10px; background:var(--blue); color:white; border:none; border-radius:var(--radius-md); font-family:var(--font-main); font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition-fast); margin-top:8px; }
.cl-apply-btn:hover { background:var(--blue-dark); }

/* Grid */
.cl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }

/* Card */
.cl-card { background:var(--bg-surface); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; display:flex; flex-direction:column; transition:box-shadow 0.2s ease, transform 0.2s ease; }
.cl-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
.cl-card__img { position:relative; height:180px; overflow:hidden; }
.cl-card__img img { width:100%; height:100%; object-fit:cover; }
.cl-card__img-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
.cl-card__cat-emoji { font-size:40px; }
.cl-card__badge { position:absolute; top:10px; left:10px; padding:3px 10px; border-radius:var(--radius-pill); font-size:11px; font-weight:700; }
.cl-card__badge--popular { background:var(--warning); color:white; }
.cl-card__badge--cat { background:rgba(0,0,0,0.55); color:white; }
.cl-wishlist { position:absolute; top:10px; right:10px; width:30px; height:30px; border-radius:50%; background:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-muted); box-shadow:var(--shadow-xs); transition:var(--transition-fast); }
.cl-wishlist:hover, .cl-wishlist--active { color:var(--danger); }
.cl-wishlist--active svg { fill:var(--danger); stroke:var(--danger); }
.cl-card__body { padding:14px 16px; flex:1; }
.cl-card__title-row { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px; }
.cl-card__name { font-size:15px; font-weight:700; color:var(--text-dark); margin:0; flex:1; }
.cl-card__price { font-size:16px; font-weight:800; color:var(--blue); white-space:nowrap; }
.cl-card__rating { display:flex; align-items:center; gap:4px; margin-bottom:8px; }
.cl-stars { display:flex; gap:1px; }
.cl-rating-val { font-size:13px; font-weight:600; color:var(--text-dark); }
.cl-rating-cnt { font-size:12px; color:var(--text-muted); }
.cl-card__coiffeur { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-muted); margin-bottom:8px; }
.cl-avatar { width:24px; height:24px; border-radius:50%; background:var(--blue-dim); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; overflow:hidden; flex-shrink:0; }
.cl-avatar img { width:100%; height:100%; object-fit:cover; }
.cl-card__meta { display:flex; gap:12px; font-size:12px; color:var(--text-muted); }
.cl-card__meta span { display:flex; align-items:center; gap:4px; }
.cl-card__footer { display:flex; gap:8px; padding:12px 16px; border-top:1px solid var(--border); }

/* Buttons */
.cl-btn-primary { flex:1; padding:9px 14px; background:var(--blue); color:white; border:none; border-radius:var(--radius-md); font-family:var(--font-main); font-size:13px; font-weight:600; cursor:pointer; transition:var(--transition-fast); }
.cl-btn-primary:hover { background:var(--blue-dark); }
.cl-btn-ghost { flex:1; padding:9px 14px; background:transparent; color:var(--text-dark); border:1.5px solid var(--border-md); border-radius:var(--radius-md); font-family:var(--font-main); font-size:13px; cursor:pointer; transition:var(--transition-fast); }
.cl-btn-ghost:hover { background:var(--bg-input); }
.cl-btn-lg { padding:12px 20px; font-size:15px; display:inline-flex; align-items:center; gap:8px; flex:unset; border-radius:var(--radius-md); }

/* Pagination */
.cl-pagination { display:flex; align-items:center; gap:6px; justify-content:center; margin-top:32px; flex-wrap:wrap; }
.cl-pag-btn { padding:8px 14px; border:1.5px solid var(--border-md); border-radius:var(--radius-sm); background:var(--bg-surface); font-family:var(--font-main); font-size:14px; cursor:pointer; transition:var(--transition-fast); }
.cl-pag-btn:hover:not(.cl-pag-btn--disabled) { background:var(--bg-input); }
.cl-pag-btn--active { background:var(--blue); color:white; border-color:var(--blue); font-weight:600; }
.cl-pag-btn--disabled { opacity:0.4; cursor:not-allowed; }
.cl-pag-ellipsis { padding:8px 4px; color:var(--text-muted); }

/* Empty */
.cl-empty { grid-column:1/-1; text-align:center; padding:60px 24px; }
.cl-empty svg { color:var(--text-tertiary); margin-bottom:16px; }
.cl-empty h3 { font-size:18px; font-weight:700; color:var(--text-dark); margin:0 0 8px; }
.cl-empty p { font-size:14px; color:var(--text-muted); }

/* Loading */
.cl-loading { grid-column:1/-1; display:flex; align-items:center; justify-content:center; gap:10px; padding:60px 0; color:var(--text-muted); }
.cl-spinner { width:20px; height:20px; border:2.5px solid var(--border); border-top-color:var(--blue); border-radius:50%; animation:clSpin 0.7s linear infinite; }
@keyframes clSpin { to { transform:rotate(360deg); } }

/* Detail overlay */
.cl-detail-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9000; padding:24px; opacity:0; transition:opacity 0.3s ease; }
.cl-detail-overlay--visible { opacity:1; }
.cl-detail-modal { background:var(--bg-surface); border-radius:var(--radius-xl); max-width:800px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:var(--shadow-lg); position:relative; transform:translateY(20px); transition:transform 0.3s var(--ease-expo); }
.cl-detail-overlay--visible .cl-detail-modal { transform:translateY(0); }
.cl-detail-close { position:absolute; top:12px; right:12px; width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,0.5); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:2; }
.cl-dg-gallery { }
.cl-dg-cover { height:260px; overflow:hidden; }
.cl-dg-cover img { width:100%; height:100%; object-fit:cover; }
.cl-dg-thumbs { display:flex; gap:4px; padding:4px; background:var(--bg-page); }
.cl-dg-thumbs img { width:100px; height:70px; object-fit:cover; border-radius:var(--radius-xs); }
.cl-dg-more { width:100px; height:70px; background:var(--text-dark); border-radius:var(--radius-xs); display:flex; align-items:center; justify-content:center; color:white; font-size:13px; font-weight:700; }
.cl-dg-body { display:grid; grid-template-columns:1fr 260px; gap:24px; padding:24px; }
.cl-dg-title { font-family:var(--font-display); font-size:24px; font-weight:800; color:var(--text-dark); margin:0 0 10px; }
.cl-dg-meta { display:flex; align-items:center; gap:12px; font-size:14px; color:var(--text-muted); margin-bottom:16px; }
.cl-dg-price { font-size:18px; font-weight:800; color:var(--blue); }
.cl-dg-desc { font-size:14px; color:var(--text-muted); line-height:1.7; margin:0 0 20px; }
.cl-dg-actions { display:flex; gap:10px; align-items:center; }
.cl-dg-coiffeur-card { background:var(--bg-page); border:1px solid var(--border); border-radius:var(--radius-lg); padding:16px; margin-bottom:12px; }
.cl-dg-coiffeur-label { font-size:10px; font-weight:700; letter-spacing:0.1em; color:var(--text-tertiary); margin-bottom:10px; }
.cl-dg-coiffeur-info { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.cl-dg-avatar { width:40px; height:40px; border-radius:50%; background:var(--blue-dim); color:var(--blue); display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; overflow:hidden; flex-shrink:0; }
.cl-dg-avatar img { width:100%; height:100%; object-fit:cover; }
.cl-dg-coiffeur-info strong { display:block; font-size:14px; font-weight:700; color:var(--text-dark); }
.cl-dg-note { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--text-muted); }
.cl-dg-profil-link { font-size:13px; color:var(--blue); text-decoration:none; display:block; text-align:center; }
.cl-dg-profil-link:hover { text-decoration:underline; }
.cl-dg-secure-badge { display:flex; align-items:flex-start; gap:10px; background:var(--bg-page); border-radius:var(--radius-md); padding:12px; border:1px solid var(--border); }
.cl-dg-secure-badge svg { color:var(--blue); flex-shrink:0; margin-top:2px; }
.cl-dg-secure-badge strong { display:block; font-size:13px; font-weight:700; color:var(--text-dark); margin-bottom:2px; }
.cl-dg-secure-badge span { font-size:12px; color:var(--text-muted); }

/* Responsive */
@media (max-width:960px) { .cl-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px) {
  .cl-main { padding:24px 16px 60px; }
  .cl-grid { grid-template-columns:1fr; }
  .cl-title { font-size:24px; }
  .cl-quick-cats { overflow-x:auto; flex-wrap:nowrap; }
  .cl-dg-body { grid-template-columns:1fr; }
  .cl-sidebar { position:fixed; left:0; top:0; bottom:0; z-index:600; width:0 !important; }
  .cl-sidebar--open { width:280px !important; }
  .cl-sidebar-inner { height:100%; overflow-y:auto; border-radius:0; }
}
  `;
  document.head.appendChild(s);
}