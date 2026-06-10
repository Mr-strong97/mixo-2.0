// ============================================================
//  ServiceFilters.js — Sidebar de filtres côté client
//  Mixo · Module Services
// ============================================================

export class ServiceFilters {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    this.filters = { minPrice: '', maxPrice: '', category: '', ville: '', disponibilite: false };
  }

  render() {
    this.container.innerHTML = `

      <!-- Catégorie -->
      <div class="filter-section">
        <div class="filter-section__title">Catégorie</div>
        <div class="filter-categories" id="filterCatList">
          ${['Coupe','Coloration','Soin','Tresse','Lissage','Barbe','Brushing','Coiffage'].map(cat => `
            <label class="filter-check">
              <input type="radio" name="fCat" value="${cat}">
              <span class="filter-check__box"></span>
              <span>${cat}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Prix -->
      <div class="filter-section">
        <div class="filter-section__title">Prix (€)</div>
        <div class="filter-price-range">
          <div class="filter-price-inputs">
            <div class="filter-price-input-wrap">
              <span>Min</span>
              <input type="number" id="filterMinPrice" class="filter-input" placeholder="0" min="0" step="5">
            </div>
            <div class="filter-price-sep">—</div>
            <div class="filter-price-input-wrap">
              <span>Max</span>
              <input type="number" id="filterMaxPrice" class="filter-input" placeholder="500" min="0" step="5">
            </div>
          </div>
          <!-- Range slider visuel -->
          <div class="filter-range-wrap">
            <input type="range" id="filterMaxRange" class="filter-range" min="0" max="500" value="500" step="5">
          </div>
        </div>
      </div>

      <!-- Ville -->
      <div class="filter-section">
        <div class="filter-section__title">Ville</div>
        <div class="filter-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <input type="text" id="filterVille" class="filter-input" placeholder="Paris, Lyon…">
        </div>
      </div>

      <!-- Disponibilité -->
      <div class="filter-section">
        <div class="filter-section__title">Disponibilité</div>
        <label class="filter-toggle-label">
          <div class="cs-toggle">
            <input type="checkbox" id="filterDispo" class="cs-toggle__input">
            <span class="cs-toggle__slider"></span>
          </div>
          <span>Disponibles maintenant</span>
        </label>
      </div>

      <!-- Bouton appliquer -->
      <button class="filter-apply-btn" id="filterApplyBtn">
        Appliquer les filtres
      </button>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const emit = () => {
      this.filters.minPrice = document.getElementById('filterMinPrice').value;
      this.filters.maxPrice = document.getElementById('filterMaxPrice').value;
      this.filters.ville = document.getElementById('filterVille').value;
      this.filters.disponibilite = document.getElementById('filterDispo').checked;
      const catRadio = document.querySelector('input[name="fCat"]:checked');
      this.filters.category = catRadio ? catRadio.value : '';
      this.onChange({ ...this.filters });
    };

    document.getElementById('filterApplyBtn').addEventListener('click', emit);
    document.getElementById('filterMaxRange').addEventListener('input', (e) => {
      document.getElementById('filterMaxPrice').value = e.target.value;
    });
    document.getElementById('filterMaxPrice').addEventListener('input', (e) => {
      document.getElementById('filterMaxRange').value = e.target.value;
    });

    // Enter sur champs texte
    ['filterMinPrice','filterMaxPrice','filterVille'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') emit();
      });
    });
  }
}