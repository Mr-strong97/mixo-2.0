/**
 * ServiceWizardPage.js — MIXO
 * Espace Coiffeur — Assistant de création de service (4 étapes)
 * Étape 1 : Détails   → Étape 2 : Tarifs & Lieu
 * Étape 3 : Images    → Étape 4 : Publier
 *
 * URL : /coiffeur/services/new
 */
import { Navbar }           from '../../components/navbars/Navbar.js';
import { Footer }           from '../../components/Footer.js';
import { WizardStepper }    from '../../components/servicesComponents/WizardStepper.js';
import { ImageDropzone }    from '../../components/servicesComponents/ImageDropzone.js';
import { ImageGalleryGrid } from '../../components/servicesComponents/ImageGalleryGrid.js';
import { ServiceAPI }       from '../../api/ServiceAPI.js';
import { requireRole }      from '../../utils/AuthGuard.js';
import { showToast }        from '../../utils/toast.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/serviceStyles/ServiceWizard.css';

// ── Configuration ──────────────────────────────────────────
const STEPS = [
    { label: 'Détails' },
    { label: 'Tarifs & Lieu' },
    { label: 'Images' },
    { label: 'Publier' },
];
const DUREES      = [15, 30, 45, 60, 90, 120];
const GALERIE_MAX = 8;

// ══════════════════════════════════════════════════════════
export const ServiceWizardPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'swz-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'swz-main';
    main.innerHTML = `<div class="swz-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    // ── État partagé entre les étapes ──────────────────────
    const state = {
        nom_prestation: '',
        categorie:      '',
        description:    '',
        visible:        true,
        prix:           '',
        duree_minutes:  45,
        nom_salon:      '',
        adresse:        '',
        ville:          '',
        commune:        '',
        infos_complementaires: '',
    };

    let categories  = [];
    let currentStep = 0;
    let dropzone, galleryGrid;

    // Charger les catégories puis afficher l'étape 1
    ServiceAPI.getCategories()
        .then(c  => { categories = Array.isArray(c) ? c : (c.resultats || []); })
        .catch(() => { categories = []; })
        .finally(() => renderStep());

    // ════════════════════════════════════════════════════
    //  RENDU PRINCIPAL
    // ════════════════════════════════════════════════════
    function renderStep() {
        main.innerHTML = `
            <div class="swz-topbar">
                <div class="swz-breadcrumb">Services / Ajouter un service</div>
                <h1 class="swz-title">Nouveau Service</h1>
                <p class="swz-subtitle">Créez une nouvelle prestation pour votre catalogue de coiffure.</p>
            </div>
            <div id="swz-stepper"></div>
            <div class="swz-body"  id="swz-body"></div>
            <div class="swz-footer" id="swz-footer"></div>
        `;

        main.querySelector('#swz-stepper').appendChild(WizardStepper(STEPS, currentStep));

        const body = main.querySelector('#swz-body');
        if (currentStep === 0) renderDetails(body);
        if (currentStep === 1) renderTarifs(body);
        if (currentStep === 2) renderImages(body);
        if (currentStep === 3) renderPublier(body);

        renderFooter();
        if (window.lucide) window.lucide.createIcons();
    }

    // ════════════════════════════════════════════════════
    //  ÉTAPE 1 — DÉTAILS (Image 6)
    // ════════════════════════════════════════════════════
    function renderDetails(body) {
        body.innerHTML = `
            <div class="swz-card">
                <div class="swz-row">
                    <div class="swz-field swz-field-grow">
                        <label>Nom du service</label>
                        <input id="f-nom" type="text" class="swz-input"
                               placeholder="ex : Coupe dégradée + Barbe"
                               value="${escapeAttr(state.nom_prestation)}"/>
                    </div>
                    <div class="swz-field">
                        <label>Catégorie</label>
                        <select id="f-categorie" class="swz-input">
                            <option value="">-- Choisir --</option>
                            ${categories.map(c =>
                                `<option value="${c.id}"
                                    ${c.id === state.categorie ? 'selected' : ''}>
                                    ${c.icone || ''} ${escapeHtml(c.nom)}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>

                <div class="swz-field">
                    <label>Description</label>
                    <textarea id="f-description" rows="5" class="swz-textarea"
                        placeholder="Détaillez les étapes de la prestation…">${escapeHtml(state.description)}</textarea>
                </div>

                <div class="swz-toggle-row">
                    <div>
                        <span class="swz-toggle-label">Rendre le service visible</span>
                        <span class="swz-toggle-hint">Activer ou désactiver immédiatement dans le catalogue.</span>
                    </div>
                    <label class="swz-toggle">
                        <input type="checkbox" id="f-visible" ${state.visible ? 'checked' : ''}/>
                        <span class="swz-toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;
    }

    // ════════════════════════════════════════════════════
    //  ÉTAPE 2 — TARIFS & LIEU
    // ════════════════════════════════════════════════════
    function renderTarifs(body) {
        body.innerHTML = `
            <div class="swz-card">
                <div class="swz-row">
                    <div class="swz-field">
                        <label>Prix (FC)</label>
                        <input id="f-prix" type="number" min="0.01" step="0.01"
                               class="swz-input" placeholder="ex : 35.00"
                               value="${state.prix}"/>
                    </div>
                    <div class="swz-field swz-field-grow">
                        <label>Durée estimée</label>
                        <div class="swz-chips" id="swz-durees">
                            ${DUREES.map(d => `
                                <button type="button"
                                        class="swz-chip ${d === state.duree_minutes ? 'swz-chip-active' : ''}"
                                        data-val="${d}">${d} min</button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="swz-row">
                    <div class="swz-field swz-field-grow">
                        <label>Nom du salon</label>
                        <input id="f-salon" type="text" class="swz-input"
                               placeholder="ex : Mixo Barber Shop"
                               value="${escapeAttr(state.nom_salon)}"/>
                    </div>
                </div>

                <div class="swz-row">
                    <div class="swz-field swz-field-grow">
                        <label>Adresse</label>
                        <input id="f-adresse" type="text" class="swz-input"
                               placeholder="ex : 12 rue de la Paix"
                               value="${escapeAttr(state.adresse)}"/>
                    </div>
                    <div class="swz-field">
                        <label>Ville</label>
                        <input id="f-ville" type="text" class="swz-input"
                               placeholder="ex : Paris"
                               value="${escapeAttr(state.ville)}"/>
                    </div>
                    <div class="swz-field">
                        <label>Commune / Arrondissement</label>
                        <input id="f-commune" type="text" class="swz-input"
                               placeholder="ex : Paris 08"
                               value="${escapeAttr(state.commune)}"/>
                    </div>
                </div>

                <div class="swz-field">
                    <label>Informations complémentaires</label>
                    <textarea id="f-infos" rows="3" class="swz-textarea"
                        placeholder="Précisions sur le lieu, parking, accès…">${escapeHtml(state.infos_complementaires)}</textarea>
                </div>
            </div>
        `;

        body.querySelectorAll('#swz-durees .swz-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                body.querySelectorAll('#swz-durees .swz-chip')
                    .forEach(c => c.classList.remove('swz-chip-active'));
                chip.classList.add('swz-chip-active');
            });
        });
    }

    // ════════════════════════════════════════════════════
    //  ÉTAPE 3 — IMAGES (Images 2, 7)
    // ════════════════════════════════════════════════════
    function renderImages(body) {
        body.innerHTML = `
            <div class="swz-images-layout">
                <div class="swz-images-main">
                    <label class="swz-sublabel">Image de couverture</label>
                    <div id="swz-dropzone"></div>
                    <div id="swz-gallery" style="margin-top:24px;"></div>
                </div>

                <div class="swz-images-side">
                    <div class="swz-card">
                        <h3 class="swz-card-title">Visibilité du service</h3>
                        <p class="swz-card-text">Contrôlez si ce service est visible par vos clients.</p>
                        <div class="swz-toggle-row">
                            <div class="swz-toggle-label-row">
                                <i data-lucide="eye"></i>
                                <span>Service Actif</span>
                            </div>
                            <label class="swz-toggle">
                                <input type="checkbox" id="f-visible-img" ${state.visible ? 'checked' : ''}/>
                                <span class="swz-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="swz-info-box">
                            <i data-lucide="info"></i>
                            <span>Un service actif peut être réservé immédiatement après la création.</span>
                        </div>
                    </div>

                    <div class="swz-tip-card">
                        <h3><i data-lucide="lightbulb"></i> Conseils Mixo</h3>
                        <p>Les services avec au moins 3 photos de haute qualité reçoivent 40% de réservations en plus. Privilégiez un éclairage naturel et des angles montrant le résultat final.</p>
                    </div>
                </div>
            </div>
        `;

        dropzone    = ImageDropzone(null);
        galleryGrid = ImageGalleryGrid([], GALERIE_MAX, null);

        body.querySelector('#swz-dropzone').appendChild(dropzone.element);
        body.querySelector('#swz-gallery').appendChild(galleryGrid.element);

        body.querySelector('#f-visible-img')
            .addEventListener('change', e => { state.visible = e.target.checked; });
    }

    // ════════════════════════════════════════════════════
    //  ÉTAPE 4 — PUBLIER (Image 5)
    // ════════════════════════════════════════════════════
    function renderPublier(body) {
        const categorie = categories.find(c => c.id === state.categorie);
        const coverFile = dropzone?.getFile();
        const coverUrl  = coverFile ? URL.createObjectURL(coverFile) : null;
        const username  = localStorage.getItem('username') || '—';

        body.innerHTML = `
            <div class="swz-publish-layout">

                <!-- Résumé -->
                <div class="swz-card">
                    <div class="swz-publish-header">
                        <h2>Résumé du service</h2>
                        <button class="swz-edit-link" id="swz-edit-step1" type="button">
                            <i data-lucide="pencil"></i> Modifier
                        </button>
                    </div>
                    ${publishRow('Nom du service', escapeHtml(state.nom_prestation) || '—')}
                    ${publishRow('Catégorie',      categorie ? `${categorie.icone || ''} ${escapeHtml(categorie.nom)}` : '—')}
                    ${publishRow('Prix',           state.prix ? `${state.prix} FC` : '—')}
                    ${publishRow('Durée',          `${state.duree_minutes} minutes`)}
                    ${publishRow('Salon',          escapeHtml(state.nom_salon) || '—')}
                    ${publishRow('Ville',          escapeHtml(state.ville) || '—')}
                    ${publishRow('Barbier',        escapeHtml(username))}
                    <div class="swz-publish-desc">
                        <span class="swz-desc-label">Description</span>
                        <p>${escapeHtml(state.description) || 'Aucune description fournie.'}</p>
                    </div>
                </div>

                <!-- Aperçu + Actions -->
                <div class="swz-publish-side">
                    <div class="swz-card">
                        <span class="swz-apercu-label">APERÇU CLIENT</span>
                        <div class="swz-apercu-img">
                            ${coverUrl
                                ? `<img src="${coverUrl}" alt=""/>`
                                : `<div class="swz-apercu-placeholder"><i data-lucide="image"></i></div>`
                            }
                            <span class="swz-apercu-price">${state.prix || '0'} FC</span>
                        </div>
                        <div class="swz-apercu-info">
                            <strong>${escapeHtml(state.nom_prestation) || 'Nom du service'}</strong>
                            <span>${state.duree_minutes} min · ${categorie ? escapeHtml(categorie.nom) : 'Catégorie'}</span>
                        </div>
                    </div>

                    <div class="swz-success-box">
                        <i data-lucide="shield-check"></i>
                        <span>Tout semble correct ! Votre service sera
                        ${state.visible ? 'immédiatement réservable' : 'enregistré en brouillon'}
                        par vos clients.</span>
                    </div>

                    <button class="swz-btn-publish" id="swz-publish" type="button">
                        <i data-lucide="rocket"></i>
                        ${state.visible ? 'Publier le service' : 'Enregistrer le service'}
                    </button>
                    <button class="swz-btn-preview" id="swz-preview" type="button">
                        <i data-lucide="eye"></i> Voir l'aperçu complet
                    </button>
                    <a href="#" class="swz-link-back" id="swz-back-link">Retour aux services</a>
                </div>
            </div>
        `;

        body.querySelector('#swz-edit-step1').addEventListener('click', () => {
            currentStep = 0; renderStep();
        });
        body.querySelector('#swz-preview').addEventListener('click', () =>
            showToast('👁 Aperçu disponible après publication.'));
        body.querySelector('#swz-back-link').addEventListener('click', e => {
            e.preventDefault();
            window.navigate?.('/coiffeur/services');
        });
        body.querySelector('#swz-publish').addEventListener('click', () => publier(false));
    }

    function publishRow(label, value) {
        return `
            <div class="swz-publish-row">
                <span>${label}</span>
                <strong>${value}</strong>
            </div>`;
    }

    // ════════════════════════════════════════════════════
    //  NAVIGATION & FOOTER
    // ════════════════════════════════════════════════════
    function renderFooter() {
        const footer = main.querySelector('#swz-footer');

        if (currentStep === 0) {
            footer.innerHTML = `
                <div class="swz-footer-right">
                    <button class="swz-btn-primary" id="swz-next" type="button">
                        Suivant <i data-lucide="chevron-right"></i>
                    </button>
                </div>`;
            footer.querySelector('#swz-next').addEventListener('click', goNext);

        } else if (currentStep === 1) {
            footer.innerHTML = `
                <button class="swz-btn-secondary" id="swz-prev" type="button">
                    <i data-lucide="chevron-left"></i> Précédent
                </button>
                <div class="swz-footer-right">
                    <button class="swz-btn-primary" id="swz-next" type="button">
                        Suivant <i data-lucide="chevron-right"></i>
                    </button>
                </div>`;
            footer.querySelector('#swz-prev').addEventListener('click', goPrev);
            footer.querySelector('#swz-next').addEventListener('click', goNext);

        } else if (currentStep === 2) {
            footer.innerHTML = `
                <button class="swz-btn-secondary" id="swz-prev" type="button">
                    <i data-lucide="chevron-left"></i> Précédent
                </button>
                <div class="swz-footer-right">
                    <button class="swz-btn-draft" id="swz-draft" type="button">
                        Enregistrer en brouillon
                    </button>
                    <button class="swz-btn-primary" id="swz-next" type="button">
                        Continuer <i data-lucide="chevron-right"></i>
                    </button>
                </div>`;
            footer.querySelector('#swz-prev').addEventListener('click', goPrev);
            footer.querySelector('#swz-next').addEventListener('click', goNext);
            footer.querySelector('#swz-draft').addEventListener('click', () => publier(true));

        } else {
            footer.innerHTML = `
                <button class="swz-btn-secondary" id="swz-prev" type="button">
                    <i data-lucide="chevron-left"></i> Précédent
                </button>`;
            footer.querySelector('#swz-prev').addEventListener('click', goPrev);
        }

        if (window.lucide) window.lucide.createIcons();
    }

    function goPrev() {
        saveCurrentStep();
        currentStep = Math.max(0, currentStep - 1);
        renderStep();
    }

    function goNext() {
        if (!validateCurrentStep()) return;
        saveCurrentStep();
        currentStep = Math.min(STEPS.length - 1, currentStep + 1);
        renderStep();
    }

    // ── Validation par étape ────────────────────────────
    function validateCurrentStep() {
        const body = main.querySelector('#swz-body');

        if (currentStep === 0) {
            const nom = body.querySelector('#f-nom')?.value.trim();
            if (!nom || nom.length < 3) {
                showToast('Le nom du service doit contenir au moins 3 caractères.');
                return false;
            }
            if (!body.querySelector('#f-categorie')?.value) {
                showToast('Veuillez sélectionner une catégorie.');
                return false;
            }
        }

        if (currentStep === 1) {
            const prix = parseFloat(body.querySelector('#f-prix')?.value);
            if (!prix || prix <= 0) {
                showToast('Veuillez indiquer un prix valide.');
                return false;
            }
            if (prix > 9999) {
                showToast('Le prix ne peut pas dépasser 9 9999 FC.');
                return false;
            }
        }

        return true;
    }

    // ── Sauvegarde de l'étape courante dans `state` ─────
    function saveCurrentStep() {
        const body = main.querySelector('#swz-body');
        if (!body) return;

        if (currentStep === 0) {
            state.nom_prestation = body.querySelector('#f-nom')?.value.trim()      || '';
            state.categorie      = body.querySelector('#f-categorie')?.value        || '';
            state.description    = body.querySelector('#f-description')?.value.trim() || '';
            state.visible        = body.querySelector('#f-visible')?.checked ?? state.visible;
        }

        if (currentStep === 1) {
            state.prix    = body.querySelector('#f-prix')?.value || '';
            const chip    = body.querySelector('#swz-durees .swz-chip-active');
            state.duree_minutes = chip ? parseInt(chip.dataset.val, 10) : state.duree_minutes;
            state.nom_salon     = body.querySelector('#f-salon')?.value.trim()   || '';
            state.adresse       = body.querySelector('#f-adresse')?.value.trim() || '';
            state.ville         = body.querySelector('#f-ville')?.value.trim()   || '';
            state.commune       = body.querySelector('#f-commune')?.value.trim() || '';
            state.infos_complementaires = body.querySelector('#f-infos')?.value.trim() || '';
        }
        // Étape 2 : dropzone et galleryGrid conservent leur propre état en mémoire
    }

    // ════════════════════════════════════════════════════
    //  PUBLICATION
    // ════════════════════════════════════════════════════
    async function publier(brouillon) {
        saveCurrentStep();

        const btn  = main.querySelector('#swz-publish') || main.querySelector('#swz-draft');
        const orig = btn?.innerHTML;
        if (btn) {
            btn.disabled   = true;
            btn.innerHTML  = `<span class="swz-spinner"></span> Enregistrement…`;
        }

        try {
            const villeComplete = [state.ville, state.commune].filter(Boolean).join(' ').trim();

            const descParts = [
                state.description,
                state.nom_salon ? `Salon : ${state.nom_salon}` : '',
                state.adresse   ? `Adresse : ${state.adresse}` : '',
                state.infos_complementaires,
            ].filter(Boolean);

            const fd = new FormData();
            fd.append('nom_prestation', state.nom_prestation);
            fd.append('categorie',      state.categorie);
            fd.append('description',    descParts.join('\n'));
            fd.append('prix',           state.prix);
            fd.append('duree_minutes',  state.duree_minutes);
            fd.append('ville',          villeComplete);
            fd.append('actif',          brouillon ? 'false' : String(state.visible));
            fd.append('statut',         brouillon ? 'inactif' : (state.visible ? 'actif' : 'inactif'));

            const coverFile = dropzone?.getFile();
            if (coverFile) fd.append('image', coverFile);

            const created = await ServiceAPI.createService(fd);

            const newFiles = galleryGrid?.getNewFiles() || [];
            if (newFiles.length && created?.id) {
                await ServiceAPI.uploadGalerie(created.id, newFiles);
            }

            showToast(brouillon
                ? '💾 Service enregistré en brouillon.'
                : '🚀 Service publié avec succès !');
            window.navigate?.('/coiffeur/services');

        } catch (e) {
            const detail = e.response?.data;
            const msg = detail && typeof detail === 'object'
                ? Object.values(detail).flat().join(' ')
                : (e.message || 'Erreur lors de la création.');
            showToast(`❌ ${msg}`);
            if (btn) {
                btn.disabled  = false;
                btn.innerHTML = orig;
                if (window.lucide) window.lucide.createIcons();
            }
        }
    }

    return page;
};

// ── Helpers ───────────────────────────────────────────────
function escapeAttr(str = '') {
    return String(str).replace(/"/g, '&quot;');
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
