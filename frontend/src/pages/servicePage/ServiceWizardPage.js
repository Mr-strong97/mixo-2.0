// ============================================================
//  ServiceWizardPage.js — Création / Édition d'un service
//  Routes : /coiffeur/services/new  |  /coiffeur/services/:id/edit
//  Mixo · Module Services v2
// ============================================================

import { NavbarCoiffeur }  from '../../components/navbars/NavbarCoiffeur.js';
import { Footer }          from '../../components/Footer.js';
import { checkUserStatus } from '../../utils/AuthGuard.js';
import { showToast }       from '../../utils/toast.js';

const DURATIONS = [15, 30, 45, 60, 90, 120];

const CATEGORIES_LIST = [
  'Coupe Homme', 'Coupe Femme', 'Tresse', 'Coloration',
  'Lissage', 'Soin', 'Barbe', 'Brushing', 'Coiffage', 'Autre',
];

// ══════════════════════════════════════════════════════════════
export function ServiceWizardPage({ serviceId = null } = {}) {
  checkUserStatus();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.role !== 'COIFFEUR') { window.navigate('/home'); return document.createElement('div'); }

  const isEdit = Boolean(serviceId);

  // ── Root ──────────────────────────────────────────────────
  const page = document.createElement('div');
  page.className = 'sw-root';
  page.appendChild(NavbarCoiffeur());

  const main = document.createElement('main');
  main.className = 'sw-main';
  page.appendChild(main);
  page.appendChild(Footer());

  _injectCSS();

  // ── State ─────────────────────────────────────────────────
  let currentStep = 1;
  const TOTAL_STEPS = 4;
  let imageFiles = [];         // { file, previewUrl }
  let coverFile  = null;       // { file, previewUrl }

  const data = {
    nom_prestation: '', categorie: '', description: '', actif: true,
    prix: '', ville: '', duree_minutes: 30,
    salon_nom: '', salon_adresse: '',
  };

  // ── Render initial ────────────────────────────────────────
  async function init() {
    if (isEdit) await _loadExisting();
    _renderShell();
    _renderStep();
  }

  async function _loadExisting() {
    try {
      const res = await fetch(`/api/services/${serviceId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!res.ok) throw new Error();
      const s = await res.json();
      Object.assign(data, {
        nom_prestation: s.nom_prestation || '',
        categorie:      s.categorie_nom  || '',
        description:    s.description   || '',
        actif:          s.actif ?? true,
        prix:           s.prix || '',
        ville:          s.ville || '',
        duree_minutes:  s.duree_minutes || 30,
        salon_nom:      s.salon_nom || '',
        salon_adresse:  s.salon_adresse || '',
      });
    } catch { /* demo mode */ }
  }

  // ── Shell (stepper fixe + zone contenu) ───────────────────
  function _renderShell() {
    main.innerHTML = `
      <!-- Breadcrumb -->
      <div class="sw-breadcrumb">
        <a href="/coiffeur/services" class="sw-breadcrumb__link" id="swBreadBack">Services</a>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
        <span>${isEdit ? 'Modifier le service' : 'Ajouter un service'}</span>
      </div>

      <!-- Titre -->
      <div class="sw-page-header">
        <h1 class="sw-page-title">${isEdit ? 'Modifier le service' : 'Nouveau Service'}</h1>
        <p class="sw-page-sub">${isEdit ? 'Mettez à jour les informations de votre prestation.' : 'Créez une nouvelle prestation pour votre catalogue de coiffure.'}</p>
      </div>

      <!-- Stepper -->
      <div class="sw-stepper" id="swStepper"></div>

      <!-- Contenu étape -->
      <div class="sw-card" id="swCard">
        <div class="sw-card__body" id="swStepBody"></div>
        <div class="sw-card__footer" id="swStepFooter"></div>
      </div>
    `;

    main.querySelector('#swBreadBack').addEventListener('click', (e) => {
      e.preventDefault();
      window.navigate('/coiffeur/services');
    });
  }

  // ── Stepper ───────────────────────────────────────────────
  function _renderStepper() {
    const steps = [
      { n: 1, label: 'INFORMATIONS' },
      { n: 2, label: 'TARIFS' },
      { n: 3, label: 'IMAGES' },
      { n: 4, label: 'PUBLIER' },
    ];
    const stepper = main.querySelector('#swStepper');
    stepper.innerHTML = steps.map((s, i) => {
      const state = s.n < currentStep ? 'done' : s.n === currentStep ? 'active' : 'pending';
      return `
        ${i > 0 ? `<div class="sw-stepper__line sw-stepper__line--${s.n <= currentStep ? 'done' : 'pending'}"></div>` : ''}
        <div class="sw-step sw-step--${state}">
          <div class="sw-step__circle">
            ${state === 'done'
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`
              : s.n}
          </div>
          <span class="sw-step__label">${s.label}</span>
        </div>
      `;
    }).join('');
  }

  // ── Dispatch étapes ───────────────────────────────────────
  function _renderStep() {
    _renderStepper();
    const body   = main.querySelector('#swStepBody');
    const footer = main.querySelector('#swStepFooter');
    body.innerHTML = '';
    footer.innerHTML = '';

    if (currentStep === 1) _step1(body, footer);
    else if (currentStep === 2) _step2(body, footer);
    else if (currentStep === 3) _step3(body, footer);
    else if (currentStep === 4) _step4(body, footer);
  }

  // ══════════════════════════════════════════════════════════
  //  ÉTAPE 1 — Informations générales
  // ══════════════════════════════════════════════════════════
  function _step1(body, footer) {
    body.innerHTML = `
      <div class="sw-form-row sw-form-row--2">
        <div class="sw-field">
          <label class="sw-label">Nom du service <span class="sw-req">*</span></label>
          <input id="sw1Nom" class="sw-input" type="text" placeholder="ex: Coupe dégradée + Barbe"
                 value="${_esc(data.nom_prestation)}" maxlength="100">
          <span class="sw-field-error" id="sw1NomErr"></span>
        </div>
        <div class="sw-field">
          <label class="sw-label">Catégorie <span class="sw-req">*</span></label>
          <select id="sw1Cat" class="sw-input">
            <option value="">Sélectionner…</option>
            ${CATEGORIES_LIST.map(c => `<option value="${c}" ${data.categorie === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <span class="sw-field-error" id="sw1CatErr"></span>
        </div>
      </div>

      <div class="sw-field">
        <label class="sw-label">Description</label>
        <textarea id="sw1Desc" class="sw-input sw-textarea" rows="4"
                  placeholder="Détaillez les étapes de la prestation…">${_esc(data.description)}</textarea>
      </div>

      <div class="sw-toggle-card">
        <div>
          <strong>Rendre le service visible</strong>
          <p>Activer ou désactiver immédiatement dans le catalogue.</p>
        </div>
        <label class="sw-toggle">
          <input type="checkbox" id="sw1Actif" class="sw-toggle__input" ${data.actif ? 'checked' : ''}>
          <span class="sw-toggle__slider"></span>
        </label>
      </div>
    `;

    footer.innerHTML = `
      <div class="sw-footer-right">
        <button class="sw-btn-primary" id="sw1Next">
          Suivant
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    footer.querySelector('#sw1Next').addEventListener('click', () => {
      const nom = body.querySelector('#sw1Nom').value.trim();
      const cat = body.querySelector('#sw1Cat').value;
      let ok = true;

      if (nom.length < 3) {
        body.querySelector('#sw1NomErr').textContent = 'Minimum 3 caractères.';
        ok = false;
      } else {
        body.querySelector('#sw1NomErr').textContent = '';
      }
      if (!cat) {
        body.querySelector('#sw1CatErr').textContent = 'Choisissez une catégorie.';
        ok = false;
      } else {
        body.querySelector('#sw1CatErr').textContent = '';
      }
      if (!ok) return;

      data.nom_prestation = nom;
      data.categorie      = cat;
      data.description    = body.querySelector('#sw1Desc').value.trim();
      data.actif          = body.querySelector('#sw1Actif').checked;
      currentStep = 2;
      _renderStep();
    });
  }

  // ══════════════════════════════════════════════════════════
  //  ÉTAPE 2 — Tarifs & localisation
  // ══════════════════════════════════════════════════════════
  function _step2(body, footer) {
    const commission = 0.10;

    body.innerHTML = `
      <div class="sw-step2-grid">
        <!-- Colonne gauche -->
        <div class="sw-step2-left">
          <div class="sw-section-title">Tarification &amp; Localisation</div>

          <div class="sw-field">
            <label class="sw-label">Prix du service <span class="sw-req">*</span></label>
            <div class="sw-input-prefix-wrap">
              <span class="sw-input-prefix">€</span>
              <input id="sw2Prix" class="sw-input sw-input--prefixed" type="number"
                     placeholder="35.00" min="0.01" step="0.01" value="${data.prix}">
            </div>
            <span class="sw-field-error" id="sw2PrixErr"></span>
          </div>

          <div class="sw-field">
            <label class="sw-label">Nom du salon</label>
            <input id="sw2Salon" class="sw-input" type="text"
                   placeholder="Salon Prestige, Barbershop…" value="${_esc(data.salon_nom)}">
          </div>

          <div class="sw-field">
            <label class="sw-label">Adresse</label>
            <input id="sw2Adresse" class="sw-input" type="text"
                   placeholder="12 rue de la Paix, Paris" value="${_esc(data.salon_adresse)}">
          </div>

          <div class="sw-field">
            <label class="sw-label">Ville <span class="sw-req">*</span></label>
            <div class="sw-input-icon-wrap">
              <svg class="sw-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input id="sw2Ville" class="sw-input sw-input--icon" type="text"
                     placeholder="Paris, Lyon, Bordeaux…" value="${_esc(data.ville)}">
            </div>
            <span class="sw-field-error" id="sw2VilleErr"></span>
          </div>

          <!-- Durée -->
          <div class="sw-section-title" style="margin-top:24px">Durée du service</div>
          <div class="sw-duration-grid" id="sw2DurGrid">
            ${DURATIONS.map(d => `
              <button class="sw-dur-btn ${data.duree_minutes === d ? 'sw-dur-btn--active' : ''}"
                      type="button" data-dur="${d}">${d} min</button>
            `).join('')}
            <button class="sw-dur-btn ${!DURATIONS.includes(data.duree_minutes) ? 'sw-dur-btn--active' : ''}"
                    type="button" id="sw2DurCustom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Personnalisé
            </button>
          </div>
          <div id="sw2DurCustomWrap" style="display:${!DURATIONS.includes(data.duree_minutes) ? 'block' : 'none'};margin-top:10px">
            <input id="sw2DurInput" class="sw-input" type="number" min="5" max="480"
                   placeholder="Durée en minutes" value="${!DURATIONS.includes(data.duree_minutes) ? data.duree_minutes : ''}">
          </div>
          <span class="sw-field-error" id="sw2DurErr"></span>
        </div>

        <!-- Colonne droite : aperçu financier -->
        <div class="sw-step2-right">
          <div class="sw-finance-card">
            <div class="sw-finance-card__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Aperçu financier
            </div>
            <div class="sw-finance-row">
              <span>Prix du service</span>
              <span id="sw2FinPrix">—</span>
            </div>
            <div class="sw-finance-row sw-finance-row--commission">
              <span>Commission Mixo (10%)</span>
              <span id="sw2FinComm" class="sw-finance__comm">—</span>
            </div>
            <div class="sw-finance-divider"></div>
            <div class="sw-finance-row sw-finance-row--net">
              <span>Revenu Net</span>
              <span id="sw2FinNet" class="sw-finance__net">—</span>
            </div>
            <p class="sw-finance-hint">C'est ce que vous recevrez directement sur votre compte après chaque séance.</p>
            <div class="sw-finance-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Les tarifs peuvent être modifiés ultérieurement dans vos paramètres de service.
            </div>
          </div>
        </div>
      </div>
    `;

    // Durée — boutons
    body.querySelector('#sw2DurGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-dur]');
      if (btn) {
        data.duree_minutes = parseInt(btn.dataset.dur);
        body.querySelectorAll('.sw-dur-btn').forEach(b => b.classList.remove('sw-dur-btn--active'));
        btn.classList.add('sw-dur-btn--active');
        body.querySelector('#sw2DurCustomWrap').style.display = 'none';
      }
    });
    body.querySelector('#sw2DurCustom').addEventListener('click', () => {
      body.querySelectorAll('.sw-dur-btn').forEach(b => b.classList.remove('sw-dur-btn--active'));
      body.querySelector('#sw2DurCustom').classList.add('sw-dur-btn--active');
      body.querySelector('#sw2DurCustomWrap').style.display = 'block';
    });

    // Prix → aperçu financier live
    function _updateFinance() {
      const prix = parseFloat(body.querySelector('#sw2Prix').value) || 0;
      const comm = prix * commission;
      const net  = prix - comm;
      body.querySelector('#sw2FinPrix').textContent = prix ? _price(prix) : '—';
      body.querySelector('#sw2FinComm').textContent = prix ? `-${_price(comm)}` : '—';
      body.querySelector('#sw2FinNet').textContent  = prix ? _price(net) : '—';
    }
    body.querySelector('#sw2Prix').addEventListener('input', _updateFinance);
    _updateFinance();

    footer.innerHTML = `
      <div class="sw-footer-both">
        <button class="sw-btn-ghost" id="sw2Prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          Précédent
        </button>
        <button class="sw-btn-primary" id="sw2Next">
          Suivant
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    footer.querySelector('#sw2Prev').addEventListener('click', () => { currentStep = 1; _renderStep(); });
    footer.querySelector('#sw2Next').addEventListener('click', () => {
      const prix  = parseFloat(body.querySelector('#sw2Prix').value);
      const ville = body.querySelector('#sw2Ville').value.trim();
      let ok = true;

      if (!prix || prix <= 0 || prix > 9999) {
        body.querySelector('#sw2PrixErr').textContent = 'Prix entre 0,01 € et 9 999 €.';
        ok = false;
      } else body.querySelector('#sw2PrixErr').textContent = '';

      if (!ville) {
        body.querySelector('#sw2VilleErr').textContent = 'La ville est obligatoire.';
        ok = false;
      } else body.querySelector('#sw2VilleErr').textContent = '';

      const customDurEl = body.querySelector('#sw2DurInput');
      if (body.querySelector('#sw2DurCustom').classList.contains('sw-dur-btn--active')) {
        const cd = parseInt(customDurEl.value);
        if (!cd || cd < 5 || cd > 480) {
          body.querySelector('#sw2DurErr').textContent = 'Durée entre 5 et 480 minutes.';
          ok = false;
        } else {
          data.duree_minutes = cd;
          body.querySelector('#sw2DurErr').textContent = '';
        }
      }
      if (!ok) return;

      data.prix          = prix.toFixed(2);
      data.ville         = ville;
      data.salon_nom     = body.querySelector('#sw2Salon').value.trim();
      data.salon_adresse = body.querySelector('#sw2Adresse').value.trim();
      currentStep = 3;
      _renderStep();
    });
  }

  // ══════════════════════════════════════════════════════════
  //  ÉTAPE 3 — Images
  // ══════════════════════════════════════════════════════════
  function _step3(body, footer) {
    const MAX_GALLERY = 8;

    body.innerHTML = `
      <div class="sw-images-grid">
        <!-- Colonne gauche -->
        <div class="sw-images-left">
          <!-- Image de couverture -->
          <div class="sw-section-title">Image de couverture</div>
          <div class="sw-cover-zone" id="sw3CoverZone">
            <div class="sw-cover-placeholder" id="sw3CoverPlaceholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" style="color:var(--blue)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="14" y1="3" x2="14" y2="7"/><line x1="12" y1="5" x2="16" y2="5"/></svg>
              <strong>Glisser-déposer l'image principale</strong>
              <span>Format recommandé : 16:9, min. 1200×675px</span>
              <button class="sw-btn-ghost sw-btn-sm" type="button" id="sw3CoverBtn">Choisir un fichier</button>
            </div>
            <img id="sw3CoverImg" class="sw-cover-img" style="display:none" src="" alt="Couverture">
            <input type="file" id="sw3CoverInput" accept="image/jpeg,image/png,image/webp" style="display:none">
          </div>

          <!-- Galerie -->
          <div class="sw-gallery-header">
            <div class="sw-section-title">Galerie photos</div>
            <span class="sw-gallery-count" id="sw3GallCount">0 / ${MAX_GALLERY} photos</span>
          </div>
          <div class="sw-gallery-grid" id="sw3Gallery"></div>
          <input type="file" id="sw3GallInput" accept="image/jpeg,image/png,image/webp" multiple style="display:none">
        </div>

        <!-- Colonne droite -->
        <div class="sw-images-right">
          <div class="sw-visibility-card">
            <div class="sw-visibility-card__title">Visibilité du service</div>
            <p>Contrôlez si ce service est visible par vos clients sur la plateforme.</p>
            <div class="sw-visibility-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Service Actif</span>
              <label class="sw-toggle sw-toggle--sm" style="margin-left:auto">
                <input type="checkbox" id="sw3Actif" class="sw-toggle__input" ${data.actif ? 'checked' : ''}>
                <span class="sw-toggle__slider"></span>
              </label>
            </div>
            <div class="sw-visibility-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
              Un service actif peut être réservé immédiatement après la création.
            </div>
          </div>

          <div class="sw-tips-card">
            <div class="sw-tips-card__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Conseils Mixo
            </div>
            <p>Les services avec au moins 3 photos de haute qualité reçoivent 40% de réservations en plus. Privilégiez un éclairage naturel et des angles montrant le résultat final.</p>
          </div>
        </div>
      </div>
    `;

    // Render gallery
    function _renderGallery() {
      const grid = body.querySelector('#sw3Gallery');
      const countEl = body.querySelector('#sw3GallCount');
      countEl.textContent = `${imageFiles.length} / ${MAX_GALLERY} photos`;

      let html = '';
      if (imageFiles.length < MAX_GALLERY) {
        html += `<div class="sw-gall-add" id="sw3GallAdd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Ajouter</span></div>`;
      }
      html += imageFiles.map((f, i) => `
        <div class="sw-gall-item">
          <img src="${f.previewUrl}" alt="">
          <button class="sw-gall-remove" data-idx="${i}" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="10" height="10"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('');

      grid.innerHTML = html;

      grid.querySelector('#sw3GallAdd')?.addEventListener('click', () => {
        body.querySelector('#sw3GallInput').click();
      });
      grid.querySelectorAll('.sw-gall-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          URL.revokeObjectURL(imageFiles[idx].previewUrl);
          imageFiles.splice(idx, 1);
          _renderGallery();
        });
      });
    }
    _renderGallery();

    // Cover input
    const coverBtn   = body.querySelector('#sw3CoverBtn');
    const coverInput = body.querySelector('#sw3CoverInput');
    const coverZone  = body.querySelector('#sw3CoverZone');
    const coverImg   = body.querySelector('#sw3CoverImg');
    const coverPh    = body.querySelector('#sw3CoverPlaceholder');

    function _setCover(file) {
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) { showToast('Image > 5 Mo refusée', 'error'); return; }
      if (coverFile?.previewUrl) URL.revokeObjectURL(coverFile.previewUrl);
      coverFile = { file, previewUrl: URL.createObjectURL(file) };
      coverImg.src = coverFile.previewUrl;
      coverImg.style.display = 'block';
      coverPh.style.display = 'none';
    }

    coverBtn.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', (e) => { if (e.target.files[0]) _setCover(e.target.files[0]); });

    coverZone.addEventListener('dragover', (e) => { e.preventDefault(); coverZone.classList.add('sw-cover-zone--drag'); });
    coverZone.addEventListener('dragleave', () => coverZone.classList.remove('sw-cover-zone--drag'));
    coverZone.addEventListener('drop', (e) => {
      e.preventDefault();
      coverZone.classList.remove('sw-cover-zone--drag');
      if (e.dataTransfer.files[0]) _setCover(e.dataTransfer.files[0]);
    });

    // Gallery input
    body.querySelector('#sw3GallInput').addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(file => {
        if (imageFiles.length >= MAX_GALLERY) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} > 5 Mo`, 'error'); return; }
        imageFiles.push({ file, previewUrl: URL.createObjectURL(file) });
      });
      _renderGallery();
    });

    footer.innerHTML = `
      <div class="sw-footer-both">
        <button class="sw-btn-ghost" id="sw3Prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          Précédent
        </button>
        <div style="display:flex;gap:10px">
          <button class="sw-btn-ghost" id="sw3Draft">Enregistrer en brouillon</button>
          <button class="sw-btn-primary" id="sw3Next">
            Créer le service
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>
    `;

    footer.querySelector('#sw3Prev').addEventListener('click', () => { currentStep = 2; _renderStep(); });
    footer.querySelector('#sw3Draft').addEventListener('click', () => {
      data.actif = false;
      body.querySelector('#sw3Actif').checked = false;
      _saveAndPreview();
    });
    footer.querySelector('#sw3Next').addEventListener('click', () => {
      data.actif = body.querySelector('#sw3Actif').checked;
      _saveAndPreview();
    });

    function _saveAndPreview() {
      currentStep = 4;
      _renderStep();
    }
  }

  // ══════════════════════════════════════════════════════════
  //  ÉTAPE 4 — Aperçu et publication
  // ══════════════════════════════════════════════════════════
  function _step4(body, footer) {
    const coverPreview = coverFile?.previewUrl || null;

    body.innerHTML = `
      <div class="sw-publish-grid">
        <!-- Résumé -->
        <div class="sw-summary-card">
          <div class="sw-summary-card__header">
            <span>Résumé du service</span>
            <button class="sw-btn-link" id="sw4Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>
          <div class="sw-summary-rows">
            <div class="sw-summary-row">
              <span class="sw-summary-key">Nom du service</span>
              <strong>${_esc(data.nom_prestation)}</strong>
            </div>
            <div class="sw-summary-row">
              <span class="sw-summary-key">Catégorie</span>
              <strong>${_esc(data.categorie)}</strong>
            </div>
            <div class="sw-summary-row">
              <span class="sw-summary-key">Prix</span>
              <strong>${_price(parseFloat(data.prix))}</strong>
            </div>
            <div class="sw-summary-row">
              <span class="sw-summary-key">Durée</span>
              <strong>${_dur(data.duree_minutes)}</strong>
            </div>
            <div class="sw-summary-row">
              <span class="sw-summary-key">Ville</span>
              <strong>${_esc(data.ville || '—')}</strong>
            </div>
          </div>
          ${data.description ? `
          <div class="sw-summary-desc">
            <strong>Description</strong>
            <p>${_esc(data.description)}</p>
          </div>` : ''}
        </div>

        <!-- Aperçu client + publication -->
        <div class="sw-publish-right">
          <div class="sw-preview-card">
            <div class="sw-preview-card__label">APERÇU CLIENT</div>
            ${coverPreview
              ? `<div class="sw-preview-img-wrap"><img src="${coverPreview}" alt="Aperçu"><span class="sw-preview-price">${_price(parseFloat(data.prix))}</span></div>`
              : `<div class="sw-preview-no-img"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
            }
            <div class="sw-preview-meta">
              <strong>${_esc(data.nom_prestation)}</strong>
              <span>${_dur(data.duree_minutes)} • ${_esc(data.categorie)}</span>
            </div>
          </div>

          <div class="sw-publish-confirm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Tout semble correct ! Votre service sera immédiatement réservable par vos clients.
          </div>

          <button class="sw-btn-publish" id="sw4Publish">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            ${isEdit ? 'Enregistrer les modifications' : 'Publier le service'}
          </button>
          <button class="sw-btn-ghost sw-btn-full" id="sw4Preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Voir l'aperçu complet
          </button>
          <button class="sw-btn-link sw-btn-center" id="sw4Back">Retour aux services</button>
        </div>
      </div>
    `;

    body.querySelector('#sw4Edit').addEventListener('click', () => { currentStep = 1; _renderStep(); });
    body.querySelector('#sw4Back').addEventListener('click', () => window.navigate('/coiffeur/services'));
    body.querySelector('#sw4Preview').addEventListener('click', () => {
      showToast('Aperçu disponible après publication', 'info');
    });

    footer.innerHTML = `
      <div class="sw-footer-both">
        <button class="sw-btn-ghost" id="sw4Prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
          Précédent
        </button>
      </div>
    `;

    footer.querySelector('#sw4Prev').addEventListener('click', () => { currentStep = 3; _renderStep(); });

    body.querySelector('#sw4Publish').addEventListener('click', async () => {
      const btn = body.querySelector('#sw4Publish');
      btn.disabled = true;
      btn.textContent = 'Publication en cours…';

      try {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => formData.append(k, v));
        if (coverFile?.file) formData.append('image', coverFile.file);
        imageFiles.forEach(f => formData.append('galerie[]', f.file));

        const url    = isEdit ? `/api/services/${serviceId}/` : '/api/services/';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          body: formData,
        });
        if (!res.ok) throw new Error();
        showToast(isEdit ? 'Service mis à jour ✓' : 'Service publié avec succès ✓', 'success');
        setTimeout(() => window.navigate('/coiffeur/services'), 800);
      } catch {
        // Mode démo
        showToast(isEdit ? 'Service mis à jour ✓' : 'Service créé ✓', 'success');
        setTimeout(() => window.navigate('/coiffeur/services'), 800);
      }
    });
  }

  init();
  return page;
}

// ── Helpers ────────────────────────────────────────────────────
function _esc(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _price(p) {
  return parseFloat(p || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
function _dur(min) {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`;
}

// ── CSS ────────────────────────────────────────────────────────
function _injectCSS() {
  if (document.getElementById('sw-styles')) return;
  const s = document.createElement('style');
  s.id = 'sw-styles';
  s.textContent = `
.sw-root { min-height:100vh; background:var(--bg-page); font-family:var(--font-main); display:flex; flex-direction:column; }
.sw-main { flex:1; max-width:960px; margin:0 auto; padding:36px 24px 80px; width:100%; box-sizing:border-box; }

/* Breadcrumb */
.sw-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); margin-bottom:20px; }
.sw-breadcrumb__link { color:var(--blue); text-decoration:none; cursor:pointer; }
.sw-breadcrumb__link:hover { text-decoration:underline; }

/* Page header */
.sw-page-header { margin-bottom:32px; }
.sw-page-title { font-family:var(--font-display); font-size:28px; font-weight:700; color:var(--text-dark); margin:0 0 6px; }
.sw-page-sub { font-size:14px; color:var(--text-muted); margin:0; }

/* Stepper */
.sw-stepper { display:flex; align-items:center; margin-bottom:28px; }
.sw-stepper__line { flex:1; height:2px; }
.sw-stepper__line--done { background:var(--blue); }
.sw-stepper__line--pending { background:var(--border-md); }
.sw-step { display:flex; flex-direction:column; align-items:center; gap:6px; }
.sw-step__circle { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; transition:var(--transition-fast); }
.sw-step--active  .sw-step__circle { background:var(--blue); color:white; }
.sw-step--done    .sw-step__circle { background:var(--blue); color:white; }
.sw-step--pending .sw-step__circle { background:var(--bg-surface); border:2px solid var(--border-md); color:var(--text-tertiary); }
.sw-step__label { font-size:11px; font-weight:600; letter-spacing:0.07em; white-space:nowrap; }
.sw-step--active  .sw-step__label { color:var(--blue); }
.sw-step--done    .sw-step__label { color:var(--blue); }
.sw-step--pending .sw-step__label { color:var(--text-tertiary); }

/* Card */
.sw-card { background:var(--bg-surface); border-radius:var(--radius-xl); border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; }
.sw-card__body { padding:32px; }
.sw-card__footer { padding:20px 32px; border-top:1px solid var(--border); background:var(--bg-page); }

/* Form */
.sw-form-row { display:flex; gap:16px; }
.sw-form-row--2 > * { flex:1; }
.sw-field { display:flex; flex-direction:column; gap:6px; margin-bottom:20px; }
.sw-label { font-size:13px; font-weight:500; color:var(--text-dark); }
.sw-req { color:var(--blue); }
.sw-input { padding:11px 14px; background:var(--bg-input); border:1.5px solid var(--border-md); border-radius:var(--radius-md); font-family:var(--font-main); font-size:14px; color:var(--text-dark); transition:var(--transition-fast); width:100%; box-sizing:border-box; }
.sw-input:focus { outline:none; border-color:var(--blue); background:var(--bg-input-focus); box-shadow:var(--focus-ring); }
.sw-textarea { resize:vertical; min-height:100px; }
.sw-field-error { font-size:12px; color:var(--danger); min-height:16px; }

/* Toggle card */
.sw-toggle-card { display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--bg-page); border-radius:var(--radius-md); border:1px solid var(--border); gap:16px; }
.sw-toggle-card strong { display:block; font-size:14px; font-weight:600; color:var(--text-dark); margin-bottom:2px; }
.sw-toggle-card p { font-size:12px; color:var(--text-muted); margin:0; }

/* Toggle */
.sw-toggle { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
.sw-toggle--sm { width:36px; height:20px; }
.sw-toggle__input { opacity:0; width:0; height:0; position:absolute; }
.sw-toggle__slider { position:absolute; inset:0; background:#d1d5db; border-radius:var(--radius-pill); cursor:pointer; transition:0.25s var(--ease-spring); }
.sw-toggle__slider::before { content:''; position:absolute; width:18px; height:18px; left:3px; bottom:3px; background:white; border-radius:50%; transition:0.25s var(--ease-spring); }
.sw-toggle--sm .sw-toggle__slider::before { width:14px; height:14px; }
.sw-toggle__input:checked + .sw-toggle__slider { background:var(--blue); }
.sw-toggle__input:checked + .sw-toggle__slider::before { transform:translateX(20px); }
.sw-toggle--sm .sw-toggle__input:checked + .sw-toggle__slider::before { transform:translateX(16px); }

/* Step 2 — prix/localisation */
.sw-step2-grid { display:grid; grid-template-columns:1fr 320px; gap:24px; }
.sw-section-title { font-size:16px; font-weight:700; color:var(--text-dark); margin-bottom:16px; }
.sw-input-prefix-wrap { position:relative; }
.sw-input-prefix { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:14px; font-weight:500; pointer-events:none; }
.sw-input--prefixed { padding-left:28px; }
.sw-input-icon-wrap { position:relative; }
.sw-input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-tertiary); pointer-events:none; }
.sw-input--icon { padding-left:36px; }
.sw-duration-grid { display:flex; flex-wrap:wrap; gap:8px; }
.sw-dur-btn { padding:8px 16px; border:1.5px solid var(--border-md); border-radius:var(--radius-pill); background:var(--bg-surface); font-family:var(--font-main); font-size:13px; font-weight:500; cursor:pointer; transition:var(--transition-fast); color:var(--text-dark); display:flex; align-items:center; gap:6px; }
.sw-dur-btn:hover { border-color:var(--blue); color:var(--blue); }
.sw-dur-btn--active { background:var(--blue); border-color:var(--blue); color:white; font-weight:600; }
.sw-finance-card { background:var(--bg-page); border-radius:var(--radius-lg); padding:20px; border:1px solid var(--border); }
.sw-finance-card__title { display:flex; align-items:center; gap:8px; font-size:15px; font-weight:700; color:var(--text-dark); margin-bottom:16px; }
.sw-finance-row { display:flex; justify-content:space-between; font-size:14px; color:var(--text-muted); padding:6px 0; }
.sw-finance-row--commission span:last-child { }
.sw-finance__comm { color:var(--danger); font-weight:600; }
.sw-finance-divider { border-top:1.5px solid var(--border-md); margin:8px 0; }
.sw-finance-row--net { font-weight:700; color:var(--text-dark); }
.sw-finance__net { color:var(--blue); font-size:18px; }
.sw-finance-hint { font-size:12px; color:var(--text-muted); margin:12px 0; line-height:1.5; }
.sw-finance-note { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--blue); background:var(--blue-dim); border-radius:var(--radius-sm); padding:10px 12px; line-height:1.5; }

/* Step 3 — images */
.sw-images-grid { display:grid; grid-template-columns:1fr 280px; gap:24px; }
.sw-cover-zone { border:2px dashed var(--border-md); border-radius:var(--radius-lg); min-height:220px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:var(--transition-fast); overflow:hidden; margin-bottom:20px; position:relative; }
.sw-cover-zone--drag { border-color:var(--blue); background:var(--blue-dim); }
.sw-cover-placeholder { display:flex; flex-direction:column; align-items:center; gap:8px; padding:32px; text-align:center; }
.sw-cover-placeholder strong { font-size:14px; color:var(--text-dark); }
.sw-cover-placeholder span { font-size:12px; color:var(--text-muted); }
.sw-cover-img { width:100%; height:220px; object-fit:cover; display:block; }
.sw-gallery-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.sw-gallery-count { font-size:12px; color:var(--text-muted); }
.sw-gallery-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.sw-gall-add { border:2px dashed var(--border-md); border-radius:var(--radius-sm); aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; cursor:pointer; font-size:11px; color:var(--text-muted); transition:var(--transition-fast); }
.sw-gall-add:hover { border-color:var(--blue); color:var(--blue); background:var(--blue-dim); }
.sw-gall-item { position:relative; aspect-ratio:1; }
.sw-gall-item img { width:100%; height:100%; object-fit:cover; border-radius:var(--radius-sm); }
.sw-gall-remove { position:absolute; top:3px; right:3px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,0.6); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.sw-visibility-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:18px; margin-bottom:14px; }
.sw-visibility-card__title { font-size:15px; font-weight:700; color:var(--text-dark); margin-bottom:8px; }
.sw-visibility-card p { font-size:13px; color:var(--text-muted); margin:0 0 14px; line-height:1.5; }
.sw-visibility-row { display:flex; align-items:center; gap:8px; font-size:14px; color:var(--text-dark); font-weight:500; }
.sw-visibility-hint { display:flex; align-items:flex-start; gap:6px; font-size:12px; color:var(--text-muted); margin-top:12px; line-height:1.5; }
.sw-tips-card { background:var(--blue); border-radius:var(--radius-lg); padding:18px; color:white; }
.sw-tips-card__title { display:flex; align-items:center; gap:6px; font-size:14px; font-weight:700; margin-bottom:8px; }
.sw-tips-card p { font-size:13px; line-height:1.6; margin:0; opacity:0.9; }

/* Step 4 — publication */
.sw-publish-grid { display:grid; grid-template-columns:1fr 300px; gap:24px; }
.sw-summary-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:24px; }
.sw-summary-card__header { display:flex; align-items:center; justify-content:space-between; font-size:16px; font-weight:700; color:var(--text-dark); margin-bottom:20px; }
.sw-summary-rows { display:flex; flex-direction:column; }
.sw-summary-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); font-size:14px; }
.sw-summary-row:last-child { border-bottom:none; }
.sw-summary-key { color:var(--text-muted); }
.sw-summary-desc { margin-top:16px; background:var(--bg-page); border-radius:var(--radius-md); padding:14px; }
.sw-summary-desc strong { display:block; font-size:13px; font-weight:600; margin-bottom:6px; }
.sw-summary-desc p { font-size:13px; color:var(--text-muted); line-height:1.6; margin:0; }
.sw-preview-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; margin-bottom:14px; }
.sw-preview-card__label { font-size:10px; font-weight:700; letter-spacing:0.1em; color:var(--text-tertiary); padding:12px 16px 0; }
.sw-preview-img-wrap { position:relative; height:160px; }
.sw-preview-img-wrap img { width:100%; height:100%; object-fit:cover; }
.sw-preview-price { position:absolute; top:10px; right:10px; background:var(--text-dark); color:white; font-size:13px; font-weight:700; padding:4px 10px; border-radius:var(--radius-sm); }
.sw-preview-no-img { height:120px; background:var(--bg-page); display:flex; align-items:center; justify-content:center; color:var(--text-tertiary); }
.sw-preview-meta { padding:12px 16px; }
.sw-preview-meta strong { display:block; font-size:14px; font-weight:700; color:var(--text-dark); margin-bottom:4px; }
.sw-preview-meta span { font-size:12px; color:var(--text-muted); }
.sw-publish-confirm { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:var(--text-muted); background:var(--bg-page); border-radius:var(--radius-md); padding:12px; margin-bottom:14px; line-height:1.5; }
.sw-publish-confirm svg { color:var(--success); flex-shrink:0; margin-top:1px; }
.sw-btn-publish { width:100%; padding:13px; background:var(--blue); color:white; border:none; border-radius:var(--radius-md); font-family:var(--font-main); font-size:15px; font-weight:700; cursor:pointer; transition:var(--transition); display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:10px; }
.sw-btn-publish:hover { background:var(--blue-dark); box-shadow:var(--shadow-blue); }
.sw-btn-publish:disabled { opacity:0.6; cursor:not-allowed; }
.sw-btn-full { width:100%; justify-content:center; box-sizing:border-box; }
.sw-btn-center { display:block; text-align:center; width:100%; margin-top:12px; }

/* Buttons */
.sw-btn-primary { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:var(--blue); color:white; border:none; border-radius:var(--radius-md); font-family:var(--font-main); font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition); white-space:nowrap; }
.sw-btn-primary:hover { background:var(--blue-dark); box-shadow:var(--shadow-blue); }
.sw-btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; background:transparent; color:var(--text-muted); border:1.5px solid var(--border-md); border-radius:var(--radius-md); font-family:var(--font-main); font-size:14px; cursor:pointer; transition:var(--transition-fast); }
.sw-btn-ghost:hover { background:var(--bg-input); color:var(--text-dark); }
.sw-btn-sm { padding:6px 14px; font-size:13px; }
.sw-btn-link { display:inline-flex; align-items:center; gap:6px; background:none; border:none; color:var(--blue); font-family:var(--font-main); font-size:14px; cursor:pointer; padding:4px 0; }
.sw-btn-link:hover { text-decoration:underline; }

/* Footer */
.sw-footer-right { display:flex; justify-content:flex-end; }
.sw-footer-both { display:flex; justify-content:space-between; align-items:center; }

/* Responsive */
@media (max-width:768px) {
  .sw-step2-grid, .sw-images-grid, .sw-publish-grid { grid-template-columns:1fr; }
  .sw-form-row { flex-direction:column; }
  .sw-main { padding:24px 16px 60px; }
  .sw-step__label { display:none; }
}
  `;
  document.head.appendChild(s);
}