// ============================================================
//  ServiceFormModal.js — Formulaire création/édition service
//  Mixo · Module Services
//  Modal 3 étapes : Infos → Tarifs → Images
// ============================================================

const CATEGORIES = [
    'Coupe', 'Coloration', 'Soin', 'Tresse',
    'Lissage', 'Barbe', 'Brushing', 'Coiffage', 'Autre',
];
const DUREES_PRESET = [15, 30, 45, 60, 90, 120, 180];

function _fmtDuration(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export class ServiceFormModal {
    /**
     * @param {HTMLElement} container  - Élément hôte du modal
     * @param {Function}    onSubmit   - Callback(serviceData, isEdit) après soumission
     */
    constructor(container, onSubmit) {
        this.container  = container;
        this.onSubmit   = onSubmit;
        this._service   = null;      // service en cours d'édition
        this._step      = 1;
        this._mainFile  = null;      // File image principale
        this._galFiles  = [];        // Files galerie
        this._rendered  = false;
    }

    // ── Rendu initial ─────────────────────────────────────────
    render() {
        if (this._rendered) return;
        this._rendered = true;

        this.container.innerHTML = `
<div class="modal-overlay sfm-overlay" id="sfmOverlay" style="display:none" role="dialog" aria-modal="true" aria-labelledby="sfmTitle">
  <div class="modal-card modal-card--lg sfm-modal">

    <!-- Header -->
    <div class="modal-header">
      <div class="modal-header-left">
        <div class="modal-icon">
          <i data-lucide="scissors"></i>
        </div>
        <div>
          <h2 class="modal-title" id="sfmTitle">Nouveau service</h2>
          <p class="modal-subtitle" id="sfmSubtitle">Remplissez les informations de votre prestation</p>
        </div>
      </div>
      <button class="modal-close" id="sfmClose" aria-label="Fermer">
        <i data-lucide="x"></i>
      </button>
    </div>

    <!-- Étapes -->
    <div class="form-steps" id="sfmSteps">
      <div class="form-step active" data-step="1">
        <span class="form-step__num">1</span>
        <span class="form-step__label">Informations</span>
      </div>
      <div class="form-step__line"></div>
      <div class="form-step" data-step="2">
        <span class="form-step__num">2</span>
        <span class="form-step__label">Tarifs & durée</span>
      </div>
      <div class="form-step__line"></div>
      <div class="form-step" data-step="3">
        <span class="form-step__num">3</span>
        <span class="form-step__label">Images</span>
      </div>
    </div>

    <!-- Body -->
    <div class="modal-body">

      <!-- ÉTAPE 1 : Infos générales -->
      <div class="sfm-panel" id="sfmPanel1">
        <div class="form-group">
          <label class="form-label" for="sfmNom">
            Nom de la prestation <span class="form-required">*</span>
          </label>
          <input type="text" id="sfmNom" class="form-input"
            placeholder="Ex : Coupe Femme Moderne" maxlength="100" autocomplete="off">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="form-error" id="sfmNomError"></span>
            <span class="form-char-count" id="sfmNomCount">0 / 100</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="sfmCategorie">
            Catégorie <span class="form-required">*</span>
          </label>
          <select id="sfmCategorie" class="form-input" required>
            <option value="">Choisir une catégorie</option>
            ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <span class="form-error" id="sfmCatError"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="sfmDescription">Description</label>
          <textarea id="sfmDescription" class="form-input form-textarea"
            rows="4" maxlength="500"
            placeholder="Techniques, avantages, recommandations…"></textarea>
          <div style="display:flex;justify-content:space-between">
            <span class="form-hint">Optionnelle mais recommandée pour attirer les clients.</span>
            <span class="form-char-count" id="sfmDescCount">0 / 500</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Statut</label>
          <div class="status-cards">
            <label class="status-card status-card--active">
              <input type="radio" name="sfmStatut" value="actif" checked>
              <i data-lucide="check-circle-2" class="status-card__icon"></i>
              <div class="status-card__body">
                <span class="status-card__title">Actif</span>
                <span class="status-card__sub">Visible par les clients</span>
              </div>
            </label>
            <label class="status-card status-card--inactive">
              <input type="radio" name="sfmStatut" value="inactif">
              <i data-lucide="pause-circle" class="status-card__icon"></i>
              <div class="status-card__body">
                <span class="status-card__title">Inactif</span>
                <span class="status-card__sub">Masqué aux clients</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 2 : Tarifs & durée -->
      <div class="sfm-panel" id="sfmPanel2" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="sfmPrix">
              Prix (€) <span class="form-required">*</span>
            </label>
            <div class="input-icon-wrap">
              <span class="input-icon">€</span>
              <input type="number" id="sfmPrix" class="form-input"
                placeholder="0.00" min="0.01" max="9999" step="0.50">
            </div>
            <span class="form-error" id="sfmPrixError"></span>
          </div>

          <div class="form-group">
            <label class="form-label">Ville (optionnel)</label>
            <input type="text" id="sfmVille" class="form-input"
              placeholder="Paris, Lyon…" maxlength="100">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Durée <span class="form-required">*</span></label>
          <div class="duree-pills" id="sfmDureePills">
            ${DUREES_PRESET.map(d => `
              <button type="button" class="duree-pill" data-min="${d}">
                ${_fmtDuration(d)}
              </button>
            `).join('')}
            <button type="button" class="duree-pill" data-min="custom">Autre…</button>
          </div>
          <div id="sfmCustomWrap" style="display:none;margin-top:8px">
            <input type="number" id="sfmCustomMin" class="form-input"
              placeholder="Ex : 150" min="5" max="480" step="5"
              style="max-width:140px">
          </div>
          <input type="hidden" id="sfmDureeVal">
          <span class="form-error" id="sfmDureeError"></span>
        </div>

        <!-- Aperçu financier -->
        <div class="price-preview" id="sfmPricePreview" style="display:none">
          <div class="price-preview__row">
            <span>Prix prestation</span>
            <strong id="ppPrix">—</strong>
          </div>
          <div class="price-preview__row">
            <span>Commission plateforme (10 %)</span>
            <strong id="ppComm">—</strong>
          </div>
          <div class="price-preview__row price-preview__row--total">
            <span>Vous recevez</span>
            <strong id="ppNet">—</strong>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 3 : Images -->
      <div class="sfm-panel" id="sfmPanel3" style="display:none">
        <div class="form-group">
          <label class="form-label">Image principale <span class="form-hint">(JPG, PNG, WEBP — max 5 Mo)</span></label>
          <div class="upload-zone" id="sfmMainZone">
            <input type="file" id="sfmMainFile" accept="image/*" style="display:none">
            <div id="sfmMainPlaceholder">
              <i data-lucide="image-plus" class="upload-zone__icon"></i>
              <p class="upload-zone__text">Cliquez ou glissez une image ici</p>
              <span class="upload-zone__hint">Recommandé : 800 × 600 px minimum</span>
            </div>
            <img id="sfmMainPreview" class="upload-preview" alt="Prévisualisation">
            <button type="button" class="upload-remove" id="sfmMainRemove" title="Supprimer">
              <i data-lucide="x"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Galerie <span class="form-hint">(optionnel, max 8 photos)</span></label>
          <div class="gallery-grid" id="sfmGallery">
            <div class="gallery-add" id="sfmGalleryAdd" title="Ajouter une photo">
              <input type="file" id="sfmGalleryInput" accept="image/*" multiple style="display:none">
              <i data-lucide="plus"></i>
              <span>Ajouter</span>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /modal-body -->

    <!-- Footer navigation -->
    <div class="modal-footer">
      <button type="button" class="btn-ghost" id="sfmPrev" style="display:none">
        <i data-lucide="chevron-left"></i> Précédent
      </button>
      <span class="modal-footer__spacer"></span>
      <button type="button" class="btn-ghost sfm-cancel" id="sfmCancel">Annuler</button>
      <button type="button" class="btn-primary" id="sfmNext">
        Suivant <i data-lucide="chevron-right"></i>
      </button>
      <button type="button" class="btn-primary" id="sfmSubmit" style="display:none">
        <i data-lucide="check"></i>
        <span id="sfmSubmitLabel">Créer le service</span>
      </button>
    </div>

  </div>
</div>`;

        if (window.lucide) window.lucide.createIcons();
        this._bindEvents();
    }

    // ── Open / Close ──────────────────────────────────────────
    open(service = null) {
        this._service   = service;
        this._step      = 1;
        this._mainFile  = null;
        this._galFiles  = [];

        this._reset();

        if (service) {
            this._populate(service);
            document.getElementById('sfmTitle').textContent      = 'Modifier le service';
            document.getElementById('sfmSubtitle').textContent   = 'Modifiez les informations de votre prestation';
            document.getElementById('sfmSubmitLabel').textContent = 'Enregistrer';
        } else {
            document.getElementById('sfmTitle').textContent      = 'Nouveau service';
            document.getElementById('sfmSubtitle').textContent   = 'Remplissez les informations de votre prestation';
            document.getElementById('sfmSubmitLabel').textContent = 'Créer le service';
        }

        this._goTo(1);
        const overlay = document.getElementById('sfmOverlay');
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('visible'));
        document.body.style.overflow = 'hidden';
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => document.getElementById('sfmNom')?.focus(), 120);
    }

    close() {
        const overlay = document.getElementById('sfmOverlay');
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 260);
    }

    // ── Navigation entre étapes ───────────────────────────────
    _goTo(n) {
        this._step = n;
        for (let i = 1; i <= 3; i++) {
            const panel = document.getElementById(`sfmPanel${i}`);
            const step  = document.querySelector(`.form-step[data-step="${i}"]`);
            if (panel) panel.style.display = (i === n) ? 'block' : 'none';
            if (step)  {
                step.classList.toggle('active', i === n);
                step.classList.toggle('done', i < n);
            }
        }
        const prev   = document.getElementById('sfmPrev');
        const next   = document.getElementById('sfmNext');
        const submit = document.getElementById('sfmSubmit');
        prev.style.display   = n > 1 ? 'flex' : 'none';
        next.style.display   = n < 3 ? 'flex' : 'none';
        submit.style.display = n === 3 ? 'flex' : 'none';
        if (window.lucide) window.lucide.createIcons();
    }

    // ── Validation par étape ──────────────────────────────────
    _validate(n) {
        let ok = true;
        if (n === 1) {
            const nom = document.getElementById('sfmNom').value.trim();
            const cat = document.getElementById('sfmCategorie').value;
            this._setError('sfmNomError', nom.length < 3 ? 'Le nom doit contenir au moins 3 caractères.' : '');
            this._setError('sfmCatError', !cat ? 'Sélectionnez une catégorie.' : '');
            if (nom.length < 3 || !cat) ok = false;
        }
        if (n === 2) {
            const prix = parseFloat(document.getElementById('sfmPrix').value);
            const dur  = document.getElementById('sfmDureeVal').value;
            this._setError('sfmPrixError', (!prix || prix <= 0) ? 'Le prix doit être supérieur à 0 €.' : '');
            this._setError('sfmDureeError', !dur ? 'Sélectionnez une durée.' : '');
            if (!prix || prix <= 0 || !dur) ok = false;
        }
        return ok;
    }

    _setError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    }

    // ── Lecture des données du formulaire ─────────────────────
    getData() {
        const statut = document.querySelector('input[name="sfmStatut"]:checked')?.value || 'actif';
        return {
            id:             this._service?.id,
            nom_prestation: document.getElementById('sfmNom').value.trim(),
            categorie:      document.getElementById('sfmCategorie').value,
            description:    document.getElementById('sfmDescription').value.trim(),
            prix:           parseFloat(document.getElementById('sfmPrix').value),
            duree_minutes:  parseInt(document.getElementById('sfmDureeVal').value),
            ville:          document.getElementById('sfmVille').value.trim(),
            statut,
            actif:          statut === 'actif',
            _mainFile:      this._mainFile,
            _galFiles:      [...this._galFiles],
        };
    }

    // ── Remplissage en édition ────────────────────────────────
    _populate(s) {
        document.getElementById('sfmNom').value = s.nom_prestation || '';
        document.getElementById('sfmCategorie').value = s.categorie_nom || s.categorie || '';
        document.getElementById('sfmDescription').value = s.description || '';
        document.getElementById('sfmPrix').value = s.prix || '';
        document.getElementById('sfmVille').value = s.ville || '';
        document.getElementById('sfmDureeVal').value = s.duree_minutes || '';

        // Durée : sélectionner la pill correspondante si preset
        const dur = parseInt(s.duree_minutes);
        document.querySelectorAll('.duree-pill').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.min) === dur);
        });

        // Statut
        document.querySelectorAll('input[name="sfmStatut"]').forEach(r => {
            r.checked = r.value === (s.actif !== false ? 'actif' : 'inactif');
        });

        this._updateCharCounts();
        this._updatePricePreview();
    }

    // ── Réinitialisation ──────────────────────────────────────
    _reset() {
        ['sfmNom','sfmCategorie','sfmDescription','sfmPrix','sfmVille','sfmDureeVal','sfmCustomMin']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

        document.querySelectorAll('.duree-pill').forEach(b => b.classList.remove('active'));
        document.getElementById('sfmCustomWrap').style.display  = 'none';
        document.getElementById('sfmPricePreview').style.display = 'none';
        document.getElementById('sfmMainPreview').style.display  = 'none';
        document.getElementById('sfmMainPreview').src            = '';
        document.getElementById('sfmMainPlaceholder').style.display = 'block';
        document.getElementById('sfmMainRemove').style.display  = 'none';
        document.querySelectorAll('.form-error').forEach(e => e.textContent = '');

        // Réinitialiser galerie
        const gallery = document.getElementById('sfmGallery');
        const addBtn  = document.getElementById('sfmGalleryAdd');
        gallery.querySelectorAll('.gallery-item').forEach(el => el.remove());
        gallery.appendChild(addBtn); // s'assure qu'il est toujours là

        // Statut par défaut
        const actifRadio = document.querySelector('input[name="sfmStatut"][value="actif"]');
        if (actifRadio) actifRadio.checked = true;

        this._updateCharCounts();
    }

    // ── Compteurs caractères ──────────────────────────────────
    _updateCharCounts() {
        const nom  = document.getElementById('sfmNom')?.value.length || 0;
        const desc = document.getElementById('sfmDescription')?.value.length || 0;
        const nomEl  = document.getElementById('sfmNomCount');
        const descEl = document.getElementById('sfmDescCount');
        if (nomEl)  nomEl.textContent  = `${nom} / 100`;
        if (descEl) descEl.textContent = `${desc} / 500`;
    }

    // ── Aperçu financier ──────────────────────────────────────
    _updatePricePreview() {
        const prix    = parseFloat(document.getElementById('sfmPrix')?.value);
        const preview = document.getElementById('sfmPricePreview');
        if (!preview) return;
        if (!prix || prix <= 0) { preview.style.display = 'none'; return; }
        const fmt = (v) => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
        const commission = prix * 0.10;
        const net        = prix - commission;
        document.getElementById('ppPrix').textContent = fmt(prix);
        document.getElementById('ppComm').textContent = fmt(commission);
        document.getElementById('ppNet').textContent  = fmt(net);
        preview.style.display = 'block';
    }

    // ── Image principale ──────────────────────────────────────
    _handleMainImg(file) {
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) {
            if (window.showToast) showToast('Image trop lourde (max 5 Mo).', 'error');
            return;
        }
        this._mainFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('sfmMainPreview').src     = e.target.result;
            document.getElementById('sfmMainPreview').style.display = 'block';
            document.getElementById('sfmMainPlaceholder').style.display = 'none';
            document.getElementById('sfmMainRemove').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    // ── Galerie ───────────────────────────────────────────────
    _addGalleryImage(file) {
        const gallery = document.getElementById('sfmGallery');
        if (gallery.querySelectorAll('.gallery-item').length >= 8) {
            if (window.showToast) showToast('Maximum 8 photos dans la galerie.', 'warning');
            return;
        }
        this._galFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${e.target.result}" alt="Photo galerie">
                <button type="button" class="gallery-item__remove" title="Supprimer">
                    <i data-lucide="x"></i>
                </button>`;
            item.querySelector('.gallery-item__remove').addEventListener('click', () => {
                const idx = [...gallery.querySelectorAll('.gallery-item')].indexOf(item);
                this._galFiles.splice(idx, 1);
                item.remove();
            });
            gallery.insertBefore(item, document.getElementById('sfmGalleryAdd'));
            if (window.lucide) window.lucide.createIcons();
        };
        reader.readAsDataURL(file);
    }

    // ── Bind des événements ───────────────────────────────────
    _bindEvents() {
        const $  = (id) => document.getElementById(id);

        // Fermeture
        $('sfmClose').addEventListener('click', () => this.close());
        $('sfmCancel').addEventListener('click', () => this.close());
        $('sfmOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && $('sfmOverlay').style.display !== 'none') this.close();
        });

        // Navigation
        $('sfmNext').addEventListener('click', () => {
            if (this._validate(this._step)) this._goTo(this._step + 1);
        });
        $('sfmPrev').addEventListener('click', () => this._goTo(this._step - 1));

        // Soumission
        $('sfmSubmit').addEventListener('click', () => {
            if (!this._validate(this._step)) return;
            const data = this.getData();
            this.onSubmit(data, !!this._service);
            this.close();
        });

        // Compteurs
        $('sfmNom').addEventListener('input', () => this._updateCharCounts());
        $('sfmDescription').addEventListener('input', () => this._updateCharCounts());

        // Prix → aperçu
        $('sfmPrix').addEventListener('input', () => this._updatePricePreview());

        // Durées
        document.querySelectorAll('.duree-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.duree-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.min === 'custom') {
                    $('sfmCustomWrap').style.display = 'flex';
                    $('sfmDureeVal').value = '';
                } else {
                    $('sfmCustomWrap').style.display = 'none';
                    $('sfmDureeVal').value = btn.dataset.min;
                }
            });
        });

        $('sfmCustomMin').addEventListener('input', (e) => {
            $('sfmDureeVal').value = e.target.value;
        });

        // Statut cards
        document.querySelectorAll('.status-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.status-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Upload image principale
        const mainZone = $('sfmMainZone');
        $('sfmMainFile').addEventListener('change', (e) => this._handleMainImg(e.target.files[0]));
        mainZone.addEventListener('click', () => $('sfmMainFile').click());
        mainZone.addEventListener('dragover', (e) => {
            e.preventDefault(); mainZone.classList.add('drag-over');
        });
        mainZone.addEventListener('dragleave', () => mainZone.classList.remove('drag-over'));
        mainZone.addEventListener('drop', (e) => {
            e.preventDefault();
            mainZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith('image/')) this._handleMainImg(file);
        });
        $('sfmMainRemove').addEventListener('click', (e) => {
            e.stopPropagation();
            this._mainFile = null;
            $('sfmMainPreview').style.display  = 'none';
            $('sfmMainPreview').src            = '';
            $('sfmMainPlaceholder').style.display = 'block';
            $('sfmMainRemove').style.display   = 'none';
            $('sfmMainFile').value             = '';
        });

        // Galerie
        $('sfmGalleryAdd').addEventListener('click', () => $('sfmGalleryInput').click());
        $('sfmGalleryInput').addEventListener('change', (e) => {
            Array.from(e.target.files).forEach(f => this._addGalleryImage(f));
            e.target.value = ''; // reset pour permettre un rechargement du même fichier
        });
    }
}