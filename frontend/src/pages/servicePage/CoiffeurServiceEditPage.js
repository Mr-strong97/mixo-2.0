/**
 * CoiffeurServiceEditPage.js — MIXO
 * Espace Coiffeur — Modification d'un service (Image 4)
 * URL : /coiffeur/services/:id/edit
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { ImageDropzone }     from '../../components/servicesComponents/ImageDropzone.js';
import { ImageGalleryGrid }  from '../../components/servicesComponents/ImageGalleryGrid.js';
import { ServiceAPI }        from '../../api/ServiceAPI.js';
import { requireRole }       from '../../utils/AuthGuard.js';
import { showToast }         from '../../utils/toast.js';

import '../../styles/serviceStyles/ServiceComponents.css';
import '../../styles/serviceStyles/ServiceEdit.css';

const DUREES = [15, 30, 45, 60, 90];
const GALERIE_MAX = 5;

const STATUT_INFO = {
    actif:      { label: 'En Ligne',   color: '#16A34A' },
    inactif:    { label: 'Désactivé',  color: '#D97706' },
    en_attente: { label: 'En attente', color: '#0A66C2' },
};

export const CoiffeurServiceEditPage = ({ id } = {}) => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'cse-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'cse-main';
    main.innerHTML = `<div class="cse-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let dropzone, galleryGrid, service, categories = [];
    let imagesToDelete = [];

    // ── Chargement initial ────────────────────────────────────
    const charger = async () => {
        try {
            [service, categories] = await Promise.all([
                ServiceAPI.getServiceDetail(id),
                ServiceAPI.getCategories(),
            ]);
            render();
        } catch {
            main.innerHTML = `
                <div class="cse-error">
                    <i data-lucide="alert-triangle"></i>
                    <p>Ce service est introuvable.</p>
                    <button class="cse-btn-cancel" id="cse-error-back" type="button">Retour à mes services</button>
                </div>`;
            main.querySelector('#cse-error-back').addEventListener('click', () => window.navigate?.('/coiffeur/services'));
            if (window.lucide) window.lucide.createIcons();
        }
    };

    // ── Rendu principal ────────────────────────────────────────
    const render = () => {
        const statutInfo = STATUT_INFO[service.statut] || STATUT_INFO.actif;
        const estDomicile = service.ville === 'À domicile';

        main.innerHTML = `
            <div class="cse-header">
                <button class="cse-back" id="cse-back" type="button" title="Retour" aria-label="Retour à mes services">
                    <i data-lucide="arrow-left"></i>
                </button>
                <h1>Modifier le service <i data-lucide="pencil" class="cse-header-pencil"></i></h1>
                <span class="cse-status" style="background:${statutInfo.color}15;color:${statutInfo.color};">
                    <span class="cse-status-dot" style="background:${statutInfo.color};"></span>
                    Statut : ${statutInfo.label}
                </span>
            </div>

            <div class="cse-layout">

                <!-- Colonne gauche -->
                <div class="cse-col-main">

                    <!-- Informations générales -->
                    <div class="cse-card">
                        <h2 class="cse-card-title"><i data-lucide="info"></i> Informations Générales</h2>

                        <div class="cse-field">
                            <label>Nom du service</label>
                            <input id="f-nom" type="text" class="cse-input" value="${escapeAttr(service.nom_prestation)}"/>
                        </div>

                        <div class="cse-row">
                            <div class="cse-field">
                                <label>Catégorie</label>
                                <select id="f-categorie" class="cse-input">
                                    ${categories.map(c => `<option value="${c.id}" ${c.id === service.categorie ? 'selected' : ''}>${c.icone || ''} ${escapeHtml(c.nom)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="cse-field">
                                <label>Prix (FC)</label>
                                <input id="f-prix" type="number" min="0.01" step="0.01" class="cse-input" value="${service.prix}"/>
                            </div>
                        </div>

                        <div class="cse-field">
                            <label>Description</label>
                            <textarea id="f-description" rows="4" class="cse-textarea">${escapeHtml(service.description || '')}</textarea>
                        </div>
                    </div>

                    <!-- Médias -->
                    <div class="cse-card">
                        <h2 class="cse-card-title"><i data-lucide="image"></i> Médias</h2>

                        <label class="cse-sublabel">Image de couverture</label>
                        <div id="cse-dropzone"></div>

                        <label class="cse-sublabel" style="margin-top:18px;">
                            Galerie (<span id="cse-gal-count">0</span>/${GALERIE_MAX})
                        </label>
                        <div id="cse-gallery"></div>
                    </div>
                </div>

                <!-- Colonne droite -->
                <div class="cse-col-side">

                    <!-- Durée -->
                    <div class="cse-card">
                        <h2 class="cse-card-title"><i data-lucide="clock"></i> Durée</h2>
                        <div class="cse-chips" id="cse-durees">
                            ${DUREES.map(d => `<button type="button" class="cse-chip ${d === service.duree_minutes ? 'cse-chip-active' : ''}" data-val="${d}">${d} min</button>`).join('')}
                        </div>
                    </div>

                    <!-- Visibilité -->
                    <div class="cse-card">
                        <h2 class="cse-card-title"><i data-lucide="eye"></i> Visibilité</h2>
                        <div class="cse-toggle-row">
                            <div>
                                <span class="cse-toggle-label">Service publié</span>
                                <span class="cse-toggle-hint">Visible par tous les clients</span>
                            </div>
                            <label class="cse-toggle">
                                <input type="checkbox" id="f-actif" ${service.statut === 'actif' && service.actif ? 'checked' : ''}/>
                                <span class="cse-toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Localisation -->
                    <div class="cse-card">
                        <h2 class="cse-card-title"><i data-lucide="map-pin"></i> Localisation</h2>

                        <label class="cse-radio-row ${!estDomicile ? 'cse-radio-active' : ''}">
                            <input type="radio" name="localisation" value="salon" ${!estDomicile ? 'checked' : ''}/>
                            <i data-lucide="building-2"></i>
                            <div>
                                <span class="cse-radio-title">Salon Principal</span>
                                <span class="cse-radio-hint">${escapeHtml(service.ville || 'Adresse non renseignée')}</span>
                            </div>
                        </label>

                        <label class="cse-radio-row ${estDomicile ? 'cse-radio-active' : ''}">
                            <input type="radio" name="localisation" value="domicile" ${estDomicile ? 'checked' : ''}/>
                            <i data-lucide="home"></i>
                            <div>
                                <span class="cse-radio-title">À domicile</span>
                                <span class="cse-radio-hint">Zone : 15km</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Footer sticky -->
            <div class="cse-footer-sticky">
                <button class="cse-btn-cancel" id="cse-cancel" type="button">Annuler</button>
                <button class="cse-btn-save" id="cse-save" type="button">
                    <i data-lucide="check"></i> Enregistrer les modifications
                </button>
            </div>
        `;

        // ── Dropzone image de couverture ──────────────────────
        dropzone = ImageDropzone(service.image);
        main.querySelector('#cse-dropzone').appendChild(dropzone.element);

        // ── Galerie ──────────────────────────────────────────
        const existing = (service.galerie || []).map(g => ({ id: g.id, url: g.image }));
        imagesToDelete = [];
        galleryGrid = ImageGalleryGrid(existing, GALERIE_MAX, (deletedId) => {
            imagesToDelete.push(deletedId);
            main.querySelector('#cse-gal-count').textContent = existing.length - imagesToDelete.length;
        });
        main.querySelector('#cse-gallery').appendChild(galleryGrid.element);
        main.querySelector('#cse-gal-count').textContent = existing.length;

        // ── Chips durée ─────────────────────────────────────────
        main.querySelectorAll('#cse-durees .cse-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                main.querySelectorAll('#cse-durees .cse-chip').forEach(c => c.classList.remove('cse-chip-active'));
                chip.classList.add('cse-chip-active');
            });
        });

        // ── Radios localisation ─────────────────────────────────
        main.querySelectorAll('.cse-radio-row').forEach(row => {
            row.addEventListener('click', () => {
                main.querySelectorAll('.cse-radio-row').forEach(r => r.classList.remove('cse-radio-active'));
                row.classList.add('cse-radio-active');
                row.querySelector('input').checked = true;
            });
        });

        // ── Actions ──────────────────────────────────────────────
        main.querySelector('#cse-back').addEventListener('click', () => window.navigate?.('/coiffeur/services'));
        main.querySelector('#cse-cancel').addEventListener('click', () => window.navigate?.('/coiffeur/services'));
        main.querySelector('#cse-save').addEventListener('click', enregistrer);

        if (window.lucide) window.lucide.createIcons();
    };

    // ── Validation ────────────────────────────────────────────
    const valider = () => {
        const nom  = main.querySelector('#f-nom').value.trim();
        const prix = parseFloat(main.querySelector('#f-prix').value);

        if (nom.length < 3) { showToast('Le nom du service doit contenir au moins 3 caractères.'); return false; }
        if (!prix || prix <= 0) { showToast('Veuillez indiquer un prix valide.'); return false; }
        if (prix > 9999) { showToast('Le prix ne peut pas dépasser 9 999 FC.'); return false; }
        return true;
    };

    // ── Enregistrement ──────────────────────────────────────────
    const enregistrer = async () => {
        if (!valider()) return;

        const btn  = main.querySelector('#cse-save');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="cse-spinner"></span> Enregistrement…`;

        try {
            const dureeBtn     = main.querySelector('#cse-durees .cse-chip-active');
            const localisation = main.querySelector('input[name="localisation"]:checked')?.value;
            const actif        = main.querySelector('#f-actif').checked;

            const payload = {
                nom_prestation: main.querySelector('#f-nom').value.trim(),
                categorie:      main.querySelector('#f-categorie').value,
                prix:           main.querySelector('#f-prix').value,
                description:    main.querySelector('#f-description').value.trim(),
                duree_minutes:  dureeBtn ? dureeBtn.dataset.val : service.duree_minutes,
                actif:          actif,
                statut:         actif ? 'actif' : 'inactif',
                ville:          localisation === 'domicile' ? 'À domicile' : (service.ville && service.ville !== 'À domicile' ? service.ville : ''),
            };

            const coverFile = dropzone.getFile();
            if (coverFile) payload.image = coverFile;

            await ServiceAPI.modifierService(id, payload);

            // Suppressions de galerie
            for (const imgId of imagesToDelete) {
                await ServiceAPI.supprimerImageGalerie(id, imgId).catch(() => {});
            }

            // Ajouts de galerie
            const newFiles = galleryGrid.getNewFiles();
            if (newFiles.length) {
                await ServiceAPI.uploadGalerie(id, newFiles);
            }

            showToast('✅ Service mis à jour avec succès !');
            window.navigate?.('/coiffeur/services');

        } catch (e) {
            const detail = e.response?.data;
            const msg = detail && typeof detail === 'object'
                ? Object.values(detail).flat().join(' ')
                : (e.message || 'Erreur lors de la mise à jour.');
            showToast(`❌ ${msg}`);
            btn.disabled  = false;
            btn.innerHTML = orig;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    charger();
    return page;
};

// ── Helpers ─────────────────────────────────────────────────
function escapeAttr(str = '') {
    return String(str).replace(/"/g, '&quot;');
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
