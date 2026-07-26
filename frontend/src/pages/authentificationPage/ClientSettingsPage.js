/**
 * ClientSettingsPage.js — MIXO
 * Paramètres Client : Mon compte · Sécurité · Notifications · Préférences
 * URL : /parametres/client
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { SettingsLayout }    from '../../components/SettingsLayout.js';
import { AvatarPicker }      from '../../components/settings/AvatarPicker.js';
import { ProfilUtilisateur } from '../../api/axiosConfig.js';
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { requireAuth }       from '../../utils/AuthGuard.js';
import { showToast }         from '../../utils/toast.js';
import { renderAvatarMarkup } from '../../utils/avatar.js';
import api                   from '../../api/axiosConfig.js';

export const ClientSettingsPage = () => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'sett-pg';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'sett-main';

    // Données utilisateur (chargées une seule fois)
    let userData = {};
    const username = localStorage.getItem('username') || 'Utilisateur';
    const initials = username.substring(0, 2).toUpperCase();
    let selectedAvatarChoice = localStorage.getItem('avatar_choice') || '';
    const getProfileUser = () => userData?.utilisateur || userData || {};
    const hydrateCompteFields = () => {
        const profile = getProfileUser();
        const setValue = (id, value) => {
            const input = main.querySelector(`#${id}`);
            if (input && value !== undefined && value !== null && input.value !== String(value)) {
                input.value = String(value);
            }
        };

        setValue('f-username', profile.username || username);
        setValue('f-firstname', profile.first_name || '');
        setValue('f-lastname', profile.last_name || '');
        setValue('f-email', profile.email || '');
        setValue('f-phone', profile.telephone || profile.phone || '');
        setValue('f-address', profile.adresse || '');
        setValue('f-city', profile.ville || '');
    };

    // ── SECTIONS ───────────────────────────────────────────
    const sections = [
        { id: 'compte',        icon: 'user',        label: 'Mon compte',    render: renderCompte },
        { id: 'securite',      icon: 'shield-check', label: 'Sécurité',     render: renderSecurite },
        { id: 'notifications', icon: 'bell',        label: 'Notifications', render: renderNotifs },
        { id: 'preferences',   icon: 'sliders',     label: 'Préférences',   render: renderPrefs },
    ];

    main.appendChild(SettingsLayout(sections, 'Paramètres Client', '#0A66C2', [
        { icon: 'heart', label: 'Favoris', route: '/favoris' },
        { icon: 'clock-3', label: 'Historique', route: '/historique' },
        { icon: 'messages-square', label: 'Discussion', route: '/discussion' },
        { icon: 'palette', label: 'Catalogue d’avatars', route: '/avatars' },
    ]));
    page.appendChild(main);
    page.appendChild(Footer());

    // Chargement profil
    ProfilUtilisateur.getUserProfile('client', ProfilUtilisateur.getCurrentUser().id)
        .then(d => {
            userData = d.utilisateur || d;
            hydrateCompteFields();
        })
        .catch(() => {});

    // ── 1. MON COMPTE ──────────────────────────────────────
    function renderCompte() {
        const profile = getProfileUser();
        const accountUsername = profile.username || username;
        const accountFirstname = profile.first_name || '';
        const accountLastname = profile.last_name || '';
        const accountEmail = profile.email || '';
        const accountPhone = profile.telephone || profile.phone || '';
        const accountAddress = profile.adresse || '';
        const accountCity = profile.ville || '';
        const currentAvatarChoice = profile.avatar_choice || selectedAvatarChoice || '';

        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Mon compte</h2>
                <p class="sett-section-sub">Gérez vos informations personnelles</p>
            </div>

            <!-- Avatar -->
            <div class="sett-avatar-card">
                <div class="sett-avatar-wrap">
                    <div class="sett-avatar" id="sett-avatar-preview"></div>
                    <button class="sett-avatar-cam" title="Changer la photo">
                        <i data-lucide="camera"></i>
                    </button>
                </div>
                <div>
                    <div style="font-weight:600;font-size:0.95rem;color:#1A1D20;">${accountUsername}</div>
                    <span class="sett-badge-role">CLIENT</span>
                </div>
            </div>

            <div class="sett-card" style="margin-bottom:18px;">
                <div id="avatar-picker-mount"></div>
            </div>

            <!-- Formulaire -->
            <div class="sett-card">
                <div class="sett-fields-grid">
                    ${field('f-username',  'at-sign',    "Nom d'utilisateur", 'text',  accountUsername)}
                    ${field('f-firstname', 'user',       'Prénom',            'text',  accountFirstname)}
                    ${field('f-lastname',  'user',       'Nom',               'text',  accountLastname)}
                    ${field('f-email',     'mail',       'Adresse email',     'email', accountEmail, true)}
                    ${field('f-phone',     'phone',      'Téléphone',         'tel',   accountPhone)}
                    ${field('f-address',   'map-pin',    'Adresse',           'text',  accountAddress)}
                    ${field('f-city',      'building',   'Ville',             'text',  accountCity)}
                </div>
                <button class="sett-btn-save" id="save-compte">
                    <i data-lucide="save"></i> Enregistrer les modifications
                </button>
            </div>
        `;

        const avatarPreview = el.querySelector('#sett-avatar-preview');
        if (avatarPreview) {
            avatarPreview.innerHTML = renderAvatarMarkup({
                username: accountUsername || initials,
                avatar_choice: currentAvatarChoice,
            }, { size: 'lg' });
        }

        const pickerMount = el.querySelector('#avatar-picker-mount');
        if (pickerMount) {
            pickerMount.appendChild(AvatarPicker(accountUsername || initials, currentAvatarChoice, (choice) => {
                selectedAvatarChoice = choice;
                if (avatarPreview) {
                    avatarPreview.innerHTML = renderAvatarMarkup({
                        username: accountUsername || initials,
                        avatar_choice: choice,
                    }, { size: 'lg' });
                }
            }));
        }

        el.querySelector('#save-compte').addEventListener('click', async () => {
            const btn  = el.querySelector('#save-compte');
            const orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<span class="sett-spinner"></span> Enregistrement…`;
            try {
                const { id } = ProfilUtilisateur.getCurrentUser();
                const profile = getProfileUser();
                const nextUsername = el.querySelector('#f-username').value.trim() || profile.username || username;
                const nextFirstName = el.querySelector('#f-firstname').value.trim() || profile.first_name || '';
                const nextLastName = el.querySelector('#f-lastname').value.trim() || profile.last_name || '';
                await ProfilUtilisateur.updateUserFields(id, {
                    username:   nextUsername,
                    first_name: nextFirstName,
                    last_name:  nextLastName,
                    avatar_choice: selectedAvatarChoice || '',
                });
                localStorage.setItem('username', nextUsername.toLowerCase());
                localStorage.setItem('avatar_choice', selectedAvatarChoice || '');
                window.dispatchEvent(new CustomEvent('mixo:profile-updated', {
                    detail: { role: 'client', id, username: nextUsername, avatar_choice: selectedAvatarChoice || '' },
                }));
                showToast('✅ Profil mis à jour !');
            } catch (e) { showToast(`❌ ${e.message}`); }
            finally { btn.disabled = false; btn.innerHTML = orig; if (window.lucide) window.lucide.createIcons(); }
        });

        return el;
    }

    // ── 2. SÉCURITÉ ────────────────────────────────────────
    function renderSecurite() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Sécurité</h2>
                <p class="sett-section-sub">Protégez votre compte</p>
            </div>

            <div class="sett-card">
                <!-- Mot de passe -->
                <div class="sett-sec-item">
                    <div class="sett-sec-ico"><i data-lucide="key-round"></i></div>
                    <div class="sett-sec-info">
                        <span class="sett-sec-label">Mot de passe</span>
                        <span class="sett-sec-hint">Mis à jour récemment</span>
                    </div>
                    <button class="sett-sec-btn" id="btn-pass">Modifier</button>
                </div>

                <!-- Zone MDP -->
                <div id="pass-zone" style="display:none;" class="sett-pass-zone">
                    ${field('f-newpass', 'lock', 'Nouveau mot de passe', 'password', '')}
                    ${field('f-confirm', 'lock', 'Confirmer le mot de passe', 'password', '')}
                    <button class="sett-btn-save" id="save-pass">
                        <i data-lucide="save"></i> Mettre à jour
                    </button>
                </div>

                <!-- Historique connexions -->
                <div class="sett-sec-item" style="margin-top:12px;">
                    <div class="sett-sec-ico"><i data-lucide="monitor"></i></div>
                    <div class="sett-sec-info">
                        <span class="sett-sec-label">Sessions actives</span>
                        <span class="sett-sec-hint">1 session active · Ce navigateur</span>
                    </div>
                    <button class="sett-sec-btn sett-sec-btn-danger" id="btn-deconnect">Déconnecter tout</button>
                </div>

                <!-- Historique -->
                <div class="sett-sec-item" style="margin-top:12px;">
                    <div class="sett-sec-ico"><i data-lucide="list"></i></div>
                    <div class="sett-sec-info">
                        <span class="sett-sec-label">Historique des connexions</span>
                        <span class="sett-sec-hint">Dernière connexion : Aujourd'hui</span>
                    </div>
                    <button class="sett-sec-btn" onclick="window.navigate('/admin/journal')">Voir</button>
                </div>
            </div>
        `;

        el.querySelector('#btn-pass').addEventListener('click', () => {
            const z = el.querySelector('#pass-zone');
            z.style.display = z.style.display === 'none' ? 'block' : 'none';
            if (window.lucide) window.lucide.createIcons();
        });

        el.querySelector('#save-pass').addEventListener('click', async () => {
            const pw  = el.querySelector('#f-newpass').value;
            const cfg = el.querySelector('#f-confirm').value;
            if (!pw || pw.length < 8) { showToast("Min. 8 caractères."); return; }
            if (pw !== cfg) { showToast("Les mots de passe ne correspondent pas."); return; }
            try {
                const email = userData.email || '';
                await AuthentificationUtilisateurs.forgotPassword(email);
                showToast("📧 Lien de réinitialisation Firebase envoyé.");
                el.querySelector('#pass-zone').style.display = 'none';
            } catch { showToast("Erreur."); }
        });

        el.querySelector('#btn-deconnect').addEventListener('click', () => {
            AuthentificationUtilisateurs.logout();
        });

        return el;
    }

    // ── 3. NOTIFICATIONS ───────────────────────────────────
    function renderNotifs() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Notifications</h2>
                <p class="sett-section-sub">Choisissez ce que vous souhaitez recevoir</p>
            </div>
            <div class="sett-card">
                <p class="sett-group-label">RENDEZ-VOUS</p>
                ${toggle('n-rdv-confirm',  'Confirmation de rendez-vous',   'Alerte à chaque réservation confirmée', true)}
                ${toggle('n-rdv-annul',    'Annulation de rendez-vous',     'Notifié si un RDV est annulé', true)}
                ${toggle('n-rdv-rappel',   'Rappels de rendez-vous',        '24h avant votre prochain RDV', true)}

                <p class="sett-group-label" style="margin-top:20px;">SYSTÈME</p>
                ${toggle('n-sys-compte',   'Activité du compte',            'Connexions et modifications', true)}
                ${toggle('n-sys-secu',     'Alertes de sécurité',           'Tentatives suspectes', true)}

                <p class="sett-group-label" style="margin-top:20px;">PROMOTIONS</p>
                ${toggle('n-promo-offres', 'Offres spéciales',              'Promotions personnalisées', false)}
                ${toggle('n-promo-news',   'Nouveautés Mixo',               'Fonctionnalités et mises à jour', false)}

                <button class="sett-btn-save" style="margin-top:20px;" id="save-notifs">
                    <i data-lucide="save"></i> Sauvegarder
                </button>
            </div>
        `;
        el.querySelector('#save-notifs').addEventListener('click', () => showToast('✅ Préférences de notifications sauvegardées.'));
        return el;
    }

    // ── 4. PRÉFÉRENCES ─────────────────────────────────────
    function renderPrefs() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Préférences</h2>
                <p class="sett-section-sub">Personnalisez votre expérience</p>
            </div>
            <div class="sett-card">
                ${select('pref-langue',   'Langue',                   [['fr','Français'],['en','English'],['ar','العربية']])}
                ${select('pref-theme',    'Thème',                    [['light','Clair'],['dark','Sombre']])}
                ${select('pref-currency', "Format d'affichage",       [['fr-FR','Français (FR)'],['en-US','English (US)']])}
                ${toggle('pref-compact',  'Mode compact',             'Réduire les espaces entre les éléments', false)}
                ${toggle('pref-anim',     'Animations',               'Transitions et effets visuels', true)}
                <button class="sett-btn-save" style="margin-top:20px;" id="save-prefs">
                    <i data-lucide="save"></i> Appliquer
                </button>
            </div>
        `;
        el.querySelector('#save-prefs').addEventListener('click', () => showToast('✅ Préférences appliquées.'));
        return el;
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

// ── Helpers ─────────────────────────────────────────────────
function field(id, icon, label, type, value = '', disabled = false) {
    return `
        <div class="sett-field">
            <label class="sett-label">${label.toUpperCase()}</label>
            <div class="sett-input-wrap">
                <i data-lucide="${icon}" class="sett-ico"></i>
                <input id="${id}" type="${type}" class="sett-input ${disabled ? 'sett-input-disabled' : ''}"
                       value="${value}" placeholder="${label}" ${disabled ? 'disabled' : ''}/>
            </div>
        </div>`;
}

function toggle(id, label, hint, checked = false) {
    return `
        <div class="sett-toggle-row">
            <div>
                <span class="sett-toggle-label">${label}</span>
                <span class="sett-toggle-hint">${hint}</span>
            </div>
            <label class="sett-toggle">
                <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}/>
                <span class="sett-toggle-slider"></span>
            </label>
        </div>`;
}

function select(id, label, options) {
    return `
        <div class="sett-select-row">
            <label class="sett-toggle-label">${label}</label>
            <select id="${id}" class="sett-select">
                ${options.map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
            </select>
        </div>`;
}
