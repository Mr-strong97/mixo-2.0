/**
 * AdminProfilePage.js
 * =====================
 * Page de paramètres personnels de l'administrateur.
 * Inspirée du design "MON COMPTE" de la capture d'écran.
 * Emplacement : src/pages/AdminProfilePage.js
 */
import { Navbar }             from '../components/Navbar.js';
import { Footer }             from '../components/Footer.js';
import { ProfilUtilisateur }  from '../api/axiosConfig.js';
import { requireRole }        from '../utils/AuthGuard.js';
import { showToast }          from '../utils/toast.js';

export const AdminProfilePage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-profile-page';

    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'adm-profile-main';
    main.innerHTML = `
        <div class="adm-profile-loader" id="profile-loader">
            <div class="aus-spinner"></div>
        </div>
        <div id="profile-content" class="d-none"></div>
    `;
    page.appendChild(main);
    page.appendChild(Footer());

    // ---------------------------------------------------------------- //
    // CHARGEMENT
    // ---------------------------------------------------------------- //
    const loadProfile = async () => {
        const { id } = ProfilUtilisateur.getCurrentUser();
        if (!id) { window.navigate('/login'); return; }

        try {
            // L'admin est un Utilisateur pur (pas de profil Coiffeur/Client)
            // On utilise l'endpoint profil général
            const apiData = await ProfilUtilisateur.updateUserFields(id, {}); // GET simulé via PATCH vide
        } catch { /* continue avec les données localStorage */ }

        const username  = localStorage.getItem('username') || 'admin';
        const initiales = username.substring(0, 2).toUpperCase();

        main.querySelector('#profile-loader').remove();
        const content = main.querySelector('#profile-content');
        content.classList.remove('d-none');

        content.innerHTML = `
            <!-- EN-TÊTE -->
            <div class="adm-prof-header">
                <h1 class="adm-prof-title">
                    <i data-lucide="user-cog"></i>
                    Mon Compte
                </h1>
                <p class="adm-prof-subtitle">Gérez vos informations personnelles</p>
            </div>

            <!-- CARTE FORMULAIRE -->
            <div class="adm-prof-card">
                <div class="adm-prof-grid">

                    <!-- COLONNE GAUCHE : Avatar + infos -->
                    <div class="adm-prof-left">
                        <div class="adm-prof-avatar-wrap">
                            <div class="adm-prof-avatar" id="prof-avatar">${initiales}</div>
                            <span class="adm-prof-role-badge">ADMIN</span>
                        </div>

                        <div class="adm-prof-field-group">
                            <div class="adm-prof-field">
                                <i data-lucide="mail"></i>
                                <div>
                                    <span class="adm-field-label">EMAIL UNIQUE</span>
                                    <span class="adm-field-value" id="display-email">—</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- COLONNE DROITE : Champs modifiables -->
                    <div class="adm-prof-right">
                        ${buildField('field-username', 'at-sign',  "Nom d'utilisateur", 'text')}
                        ${buildField('field-firstname','user',      'Prénom',            'text')}
                        ${buildField('field-lastname', 'user',      'Nom',               'text')}
                    </div>
                </div>

                <!-- MOT DE PASSE (lecture seule) -->
                <div class="adm-prof-password-row">
                    ${buildField('field-password', 'lock', 'Mot de passe', 'password', '••••••••', true)}
                </div>

                <!-- BOUTON MODIFIER / VALIDER -->
                <div class="adm-prof-btn-row">
                    <button id="prof-btn" class="adm-prof-btn">
                        <i data-lucide="edit-3" id="prof-btn-icon"></i>
                        <span id="prof-btn-text">Modifier</span>
                    </button>
                </div>
            </div>
        `;

        // ---- Pré-remplissage ----
        content.querySelector('#display-email').textContent =
            localStorage.getItem('user_email') || '(non renseigné)';
        content.querySelector('#field-username').value = username;

 // ---- Logique Modifier / Valider ----
        let editMode = false;
        const editableIds = ['field-username', 'field-firstname', 'field-lastname'];

        const setEditMode = (active) => {
            editMode = active;
            editableIds.forEach(id => {
                const el = content.querySelector(`#${id}`);
                if (el) el.disabled = !active;
            });

            const btn     = content.querySelector('#prof-btn');
            const btnIcon = content.querySelector('#prof-btn-icon');
            const btnText = content.querySelector('#prof-btn-text');
            
            if (btn) {
                if (active) {
                    // Sécurisation : on vérifie que l'icône et le texte existent avant de modifier
                    if (btnIcon) btnIcon.setAttribute('data-lucide', 'check');
                    if (btnText) btnText.textContent = 'Valider';
                    btn.classList.add('active');
                } else {
                    if (btnIcon) btnIcon.setAttribute('data-lucide', 'edit-3');
                    if (btnText) btnText.textContent = 'Modifier';
                    btn.classList.remove('active');
                }
            }
            if (window.lucide) window.lucide.createIcons();
        };

        const handleSave = async () => {
            const { id } = ProfilUtilisateur.getCurrentUser();
            const btn = content.querySelector('#prof-btn');
            const orig = btn ? btn.innerHTML : 'Modifier';
            
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span class="aus-spinner-sm"></span> Sauvegarde…`;
            }

            try {
                await ProfilUtilisateur.updateUserFields(id, {
                    username:   content.querySelector('#field-username').value.trim(),
                    first_name: content.querySelector('#field-firstname').value.trim(),
                    last_name:  content.querySelector('#field-lastname').value.trim(),
                });
                
                const newUsername = content.querySelector('#field-username').value.trim();
                localStorage.setItem('username', newUsername.toLowerCase());
                
                showToast('Profil mis à jour !');
                
                // Repasse le bouton à l'état initial "Modifier"
                setEditMode(false);

                // Attente d'1 seconde pour laisser lire le Toast, puis actualisation de la page
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (err) {
                showToast(`${err.message || 'Erreur lors de la mise à jour.'}`);
                if (btn) btn.innerHTML = orig;
                setEditMode(true); // En cas d'échec, on reste en mode édition
            } finally {
                if (btn) btn.disabled = false;
            }
        };

        const profBtn = content.querySelector('#prof-btn');
        if (profBtn) {
            profBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!editMode) setEditMode(true);
                else handleSave();
            });
        }

        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    };

    loadProfile();
    return page;
};

// ---- Helper : construit un champ input avec label flottant ----
function buildField(id, icon, label, type = 'text', value = '', disabled = true) {
    return `
        <div class="adm-input-wrap">
            <div class="adm-input-inner">
                <i data-lucide="${icon}" class="adm-input-icon"></i>
                <input id="${id}" type="${type}" class="adm-input"
                       placeholder=" " value="${value}"
                       ${disabled ? 'disabled' : ''}/>
                <label for="${id}" class="adm-input-label">${label}</label>
            </div>
        </div>
    `;
}