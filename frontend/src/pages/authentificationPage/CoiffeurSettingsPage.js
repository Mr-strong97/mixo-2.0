/**
 * CoiffeurSettingsPage.js — MIXO
 * Paramètres Coiffeur : Mon compte · Infos pro · Horaires · Sécurité · Notifications · Préférences
 * URL : /parametres/coiffeur
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

export const CoiffeurSettingsPage = () => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'sett-pg';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'sett-main';

    let userData = {};
    const username = localStorage.getItem('username') || 'Coiffeur';
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
    };

    const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

    const sections = [
        { id: 'compte',        icon: 'user',             label: 'Mon compte',           render: renderCompte },
        { id: 'pro',           icon: 'briefcase',        label: 'Infos professionnelles',render: renderPro },
        { id: 'horaires',      icon: 'clock',            label: 'Horaires',             render: renderHoraires },
        { id: 'securite',      icon: 'shield-check',     label: 'Sécurité',             render: renderSecurite },
        { id: 'notifications', icon: 'bell',             label: 'Notifications',        render: renderNotifs },
        { id: 'preferences',   icon: 'sliders',          label: 'Préférences',          render: renderPrefs },
    ];

    main.appendChild(SettingsLayout(sections, 'Paramètres Coiffeur', '#0A66C2', [
        { icon: 'log-out', label: 'Déconnexion', danger: true, action: () => AuthentificationUtilisateurs.logout() },
        { icon: 'scissors', label: 'Mes services', route: '/coiffeur/services' },
        { icon: 'image', label: 'Portfolio', route: '/coiffeur/portfolio' },
        { icon: 'star', label: 'Avis clients', route: '/coiffeur/avis' },
        { icon: 'palette', label: 'Catalogue d’avatars', route: '/avatars' },
    ]));
    page.appendChild(main);
    page.appendChild(Footer());

    api.get(`auth/profil/${ProfilUtilisateur.getCurrentUser().id}/`)
        .then(({ data }) => {
            userData = data;
            hydrateCompteFields();
        })
        .catch(() => {});

    // ── 1. MON COMPTE ──────────────────────────────────────
    function renderCompte() {
        const profile = getProfileUser();
        const compteUsername = profile.username || username;
        const compteFirstname = profile.first_name || '';
        const compteLastname = profile.last_name || '';
        const compteEmail = profile.email || '';
        const comptePhone = profile.telephone || profile.phone || '';
        const currentAvatarChoice = profile.avatar_choice || selectedAvatarChoice || '';

        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Mon compte</h2>
                <p class="sett-section-sub">Vos informations personnelles et votre photo professionnelle</p>
            </div>

            <div class="sett-avatar-card">
                <div class="sett-avatar-wrap">
                    <div class="sett-avatar" id="sett-avatar-preview"></div>
                    <button class="sett-avatar-cam" title="Changer la photo professionnelle">
                        <i data-lucide="camera"></i>
                    </button>
                </div>
                <div>
                    <div style="font-weight:600;font-size:0.95rem;color:#1A1D20;">${compteUsername}</div>
                    <span class="sett-badge-role" style="background:rgba(22, 92, 163, 0.1);color:#2275B8;border-color:rgba(22, 92, 163, 0.1)">COIFFEUR</span>
                </div>
            </div>

            <div class="sett-card" style="margin-bottom:18px;">
                <div id="avatar-picker-mount"></div>
            </div>

            <div class="sett-card">
                <div class="sett-fields-grid">
                    ${field('f-username',  'at-sign', "Nom d'utilisateur", 'text', compteUsername)}
                    ${field('f-firstname', 'user',    'Prénom',            'text', compteFirstname)}
                    ${field('f-lastname',  'user',    'Nom',               'text', compteLastname)}
                    ${field('f-email',     'mail',    'Email',             'email', compteEmail, true)}
                    ${field('f-phone',     'phone',   'Téléphone',         'tel',  comptePhone)}
                </div>
                <button class="sett-btn-save" id="save-compte">
                    <i data-lucide="save"></i> Enregistrer les modifications
                </button>
            </div>
        `;

        const avatarPreview = el.querySelector('#sett-avatar-preview');
        if (avatarPreview) {
            avatarPreview.innerHTML = renderAvatarMarkup({
                username: compteUsername || initials,
                avatar_choice: currentAvatarChoice,
            }, { size: 'lg' });
        }

        const pickerMount = el.querySelector('#avatar-picker-mount');
        if (pickerMount) {
            pickerMount.appendChild(AvatarPicker(compteUsername || initials, currentAvatarChoice, (choice) => {
                selectedAvatarChoice = choice;
                if (avatarPreview) {
                    avatarPreview.innerHTML = renderAvatarMarkup({
                        username: compteUsername || initials,
                        avatar_choice: choice,
                    }, { size: 'lg' });
                }
            }));
        }

        el.querySelector('#save-compte').addEventListener('click', async () => {
            const btn = el.querySelector('#save-compte');
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
                    detail: { role: 'coiffeur', id, username: nextUsername, avatar_choice: selectedAvatarChoice || '' },
                }));
                showToast('✅ Profil mis à jour !');
            } catch (e) { showToast(`❌ ${e.message}`); }
            finally { btn.disabled = false; btn.innerHTML = orig; if (window.lucide) window.lucide.createIcons(); }
        });
        return el;
    }

    // ── 2. INFOS PROFESSIONNELLES ──────────────────────────
    function renderPro() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Informations professionnelles</h2>
                <p class="sett-section-sub">Décrivez votre salon et vos spécialités</p>
            </div>
            <div class="sett-card">
                <div class="sett-fields-grid">
                    ${field('f-salon',       'scissors',  'Nom du salon',           'text', '')}
                    ${field('f-addr-salon',  'map-pin',   'Adresse du salon',       'text', '')}
                    ${field('f-city-salon',  'building',  'Ville',                  'text', '')}
                    ${field('f-specialite',  'star',      'Spécialités (ex: Coupe, Couleur)', 'text', '')}
                </div>
                <div class="sett-field sett-field-full">
                    <label class="sett-label">DESCRIPTION PROFESSIONNELLE</label>
                    <textarea id="f-description" rows="4" class="sett-textarea"
                        placeholder="Décrivez votre expérience, votre style et vos services…"></textarea>
                </div>
                <button class="sett-btn-save" id="save-pro">
                    <i data-lucide="save"></i> Enregistrer
                </button>
            </div>
        `;
        el.querySelector('#save-pro').addEventListener('click', () => showToast('✅ Informations professionnelles mises à jour.'));
        return el;
    }

    // ── 3. HORAIRES ────────────────────────────────────────
    function renderHoraires() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Horaires & Disponibilités</h2>
                <p class="sett-section-sub">Définissez vos jours et heures de travail</p>
            </div>
            <div class="sett-card">
                <p class="sett-group-label">JOURS DE TRAVAIL</p>
                <div class="sett-days-grid">
                    ${JOURS.map((j,i) => `
                        <label class="sett-day-chip ${i < 5 ? 'checked' : ''}">
                            <input type="checkbox" ${i < 5 ? 'checked' : ''}/>
                            <span>${j.substring(0,3)}</span>
                        </label>`).join('')}
                </div>

                <p class="sett-group-label" style="margin-top:20px;">HEURES D'OUVERTURE</p>
                <div class="sett-hours-row">
                    <div class="sett-field" style="flex:1;">
                        <label class="sett-label">OUVERTURE</label>
                        <div class="sett-input-wrap">
                            <i data-lucide="clock" class="sett-ico"></i>
                            <input id="f-open" type="time" class="sett-input" value="09:00"/>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;padding-top:22px;color:#94A3B8;font-size:0.9rem;">→</div>
                    <div class="sett-field" style="flex:1;">
                        <label class="sett-label">FERMETURE</label>
                        <div class="sett-input-wrap">
                            <i data-lucide="clock" class="sett-ico"></i>
                            <input id="f-close" type="time" class="sett-input" value="19:00"/>
                        </div>
                    </div>
                </div>

                <p class="sett-group-label" style="margin-top:20px;">PAUSE DÉJEUNER</p>
                <div class="sett-hours-row">
                    <div class="sett-field" style="flex:1;">
                        <label class="sett-label">DÉBUT</label>
                        <div class="sett-input-wrap">
                            <i data-lucide="coffee" class="sett-ico"></i>
                            <input id="f-pause-start" type="time" class="sett-input" value="12:30"/>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;padding-top:22px;color:#94A3B8;font-size:0.9rem;">→</div>
                    <div class="sett-field" style="flex:1;">
                        <label class="sett-label">FIN</label>
                        <div class="sett-input-wrap">
                            <i data-lucide="coffee" class="sett-ico"></i>
                            <input id="f-pause-end" type="time" class="sett-input" value="14:00"/>
                        </div>
                    </div>
                </div>

                ${toggle('h-dispo-online', 'Disponible en ligne', 'Accepter les réservations en ligne', true)}

                <button class="sett-btn-save" style="margin-top:20px;" id="save-horaires">
                    <i data-lucide="save"></i> Enregistrer les horaires
                </button>
            </div>
        `;

        // Jours chips toggle
        el.querySelectorAll('.sett-day-chip').forEach(chip => {
            chip.addEventListener('click', () => chip.classList.toggle('checked'));
        });

        el.querySelector('#save-horaires').addEventListener('click', () => showToast('✅ Horaires enregistrés.'));
        return el;
    }

    // ── 4. SÉCURITÉ ────────────────────────────────────────
    function renderSecurite() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Sécurité</h2>
                <p class="sett-section-sub">Protégez votre compte professionnel</p>
            </div>
            <div class="sett-card">
                <div class="sett-sec-item">
                    <div class="sett-sec-ico"><i data-lucide="key-round"></i></div>
                    <div class="sett-sec-info">
                        <span class="sett-sec-label">Mot de passe</span>
                        <span class="sett-sec-hint">Modifiez votre mot de passe régulièrement</span>
                    </div>
                    <button class="sett-sec-btn" id="btn-pass">Modifier</button>
                </div>
                <div id="pass-zone" style="display:none;" class="sett-pass-zone">
                    ${field('f-newpass', 'lock', 'Nouveau mot de passe', 'password', '')}
                    ${field('f-confirm', 'lock', 'Confirmer', 'password', '')}
                    <button class="sett-btn-save" id="save-pass">
                        <i data-lucide="save"></i> Mettre à jour
                    </button>
                </div>
                <div class="sett-sec-item" style="margin-top:12px;">
                    <div class="sett-sec-ico"><i data-lucide="monitor"></i></div>
                    <div class="sett-sec-info">
                        <span class="sett-sec-label">Sessions actives</span>
                        <span class="sett-sec-hint">1 session active</span>
                    </div>
                    <button class="sett-sec-btn sett-sec-btn-danger" id="btn-deconnect">Déconnecter tout</button>
                </div>
            </div>
        `;
        el.querySelector('#btn-pass').addEventListener('click', () => {
            const z = el.querySelector('#pass-zone');
            z.style.display = z.style.display === 'none' ? 'block' : 'none';
            if (window.lucide) window.lucide.createIcons();
        });
        el.querySelector('#save-pass').addEventListener('click', () => {
            const pw = el.querySelector('#f-newpass').value;
            const cf = el.querySelector('#f-confirm').value;
            if (!pw || pw.length < 8) { showToast("Min. 8 caractères."); return; }
            if (pw !== cf) { showToast("Les mots de passe ne correspondent pas."); return; }
            AuthentificationUtilisateurs.forgotPassword(userData.email || '')
                .then(() => showToast("📧 Lien de réinitialisation Firebase envoyé."))
                .catch(() => showToast("Erreur."));
            el.querySelector('#pass-zone').style.display = 'none';
        });
        el.querySelector('#btn-deconnect').addEventListener('click', () => {
            AuthentificationUtilisateurs.logout();
        });
        return el;
    }

    // ── 5. NOTIFICATIONS ───────────────────────────────────
    function renderNotifs() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Notifications</h2>
                <p class="sett-section-sub">Gérez vos alertes professionnelles</p>
            </div>
            <div class="sett-card">
                <p class="sett-group-label">RENDEZ-VOUS</p>
                ${toggle('n-new-rdv',   'Nouveau rendez-vous',          'Client réserve un créneau', true)}
                ${toggle('n-rdv-annul', 'Annulation de rendez-vous',    'Un client annule', true)}
                ${toggle('n-rdv-modif', 'Modification de rendez-vous',  'Changement d\'horaire', true)}
                ${toggle('n-rdv-rap',   'Rappel avant rendez-vous',     '30 min avant le prochain RDV', true)}

                <p class="sett-group-label" style="margin-top:20px;">CLIENTS</p>
                ${toggle('n-new-client','Nouveau client',               'Premier RDV avec un client', true)}
                ${toggle('n-avis',      'Avis et commentaires',         'Un client laisse un avis', true)}

                <p class="sett-group-label" style="margin-top:20px;">ALERTES SYSTÈME</p>
                ${toggle('n-sys-compte','Activité du compte',           'Connexions et modifications', true)}
                ${toggle('n-sys-alert', 'Alertes de sécurité',          'Activité suspecte', true)}
                ${toggle('n-sys-stats', 'Statistiques hebdomadaires',   'Résumé d\'activité chaque lundi', false)}

                <button class="sett-btn-save" style="margin-top:20px;" id="save-notifs">
                    <i data-lucide="save"></i> Sauvegarder
                </button>
            </div>
        `;
        el.querySelector('#save-notifs').addEventListener('click', () => showToast('✅ Notifications sauvegardées.'));
        return el;
    }

    // ── 6. PRÉFÉRENCES ─────────────────────────────────────
    function renderPrefs() {
        const el = document.createElement('div');
        el.className = 'sett-section';
        el.innerHTML = `
            <div class="sett-section-header">
                <h2 class="sett-section-title">Préférences</h2>
                <p class="sett-section-sub">Personnalisez votre espace de travail</p>
            </div>
            <div class="sett-card">
                ${select('pref-langue',    'Langue',                     [['fr','Français'],['en','English']])}
                ${select('pref-theme',     'Thème',                      [['light','Clair'],['dark','Sombre']])}
                ${select('pref-rdv-duree', 'Durée par défaut des RDV',   [['30','30 minutes'],['45','45 minutes'],['60','1 heure']])}
                ${toggle('pref-calendar',  'Vue calendrier par défaut',  'Afficher les RDV en vue semaine', true)}
                ${toggle('pref-sms',       'Rappels SMS automatiques',   'Envoyer un SMS aux clients 24h avant', false)}
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
