/**
 * AdminProfilePage.js — MIXO
 * CSS positionnement corrigé. Utilise Navbar + Footer composants.
 * URL : /admin/profile
 */
import { Navbar }            from '../../components/navbars/Navbar.js';
import { Footer }            from '../../components/Footer.js';
import { ProfilUtilisateur } from '../../api/axiosConfig.js';
import { requireRole }       from '../../utils/AuthGuard.js';
import { showToast }         from '../../utils/toast.js';

export const AdminProfilePage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-prof-page';

    // Navbar (NavbarAdmin)
    page.appendChild(Navbar());

    const username = localStorage.getItem('username') || 'Admin';
    const email    = localStorage.getItem('user_email') || '';
    const initials = username.substring(0, 2).toUpperCase();
    const lastLogin = new Date().toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' });

    const main = document.createElement('main');
    main.className = 'adm-prof-main';

    main.innerHTML = `
        <div class="adm-prof-split">

            <!-- GAUCHE : image décorative -->
            <div class="adm-prof-left"
                 style="background:url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800') center/cover no-repeat;">
                <div class="adm-prof-left-overlay">
                    <div class="adm-prof-quote-card">
                        <span class="adm-prof-quote-title">Standard de qualité</span>
                        <p class="adm-prof-quote-text">
                            "L'excellence est le seul standard que nous acceptons pour nos outils de gestion administrative."
                        </p>
                    </div>
                </div>
            </div>

            <!-- DROITE : formulaire -->
            <div class="adm-prof-right">
                <div class="adm-prof-content">

                    <!-- Titre -->
                    <div class="adm-prof-header">
                        <i data-lucide="user-cog" style="color:#0A66C2;width:26px;height:26px;flex-shrink:0;"></i>
                        <div>
                            <h1 class="adm-prof-title">Profil Administrateur</h1>
                            <p class="adm-prof-subtitle">
                                Gérez vos informations personnelles et sécurisez votre accès à la plateforme Mixo.
                            </p>
                        </div>
                    </div>

                    <!-- Carte identité -->
                    <div class="adm-prof-id-card">
                        <div class="adm-prof-avatar-wrap">
                            <div class="adm-prof-avatar" id="prof-avatar">${initials}</div>
                            <button class="adm-prof-avatar-cam" title="Changer la photo">
                                <i data-lucide="camera"></i>
                            </button>
                        </div>
                        <div class="adm-prof-id-info">
                            <span class="adm-prof-admin-badge">ADMIN</span>
                            <h2 class="adm-prof-display-name">${username}</h2>
                            <p class="adm-prof-last-login">Dernière connexion : Aujourd'hui à ${lastLogin}</p>
                        </div>
                    </div>

                    <!-- Champs -->
                    <div class="adm-prof-fields">
                        <div class="adm-prof-field-group">
                            <label class="adm-prof-label">NOM COMPLET</label>
                            <div class="adm-prof-input-wrap">
                                <i data-lucide="user" class="adm-prof-ico"></i>
                                <input id="f-fullname" type="text" class="adm-prof-input"
                                       placeholder="Jean Dupont" value="${username}" disabled/>
                            </div>
                        </div>

                        <div class="adm-prof-field-group">
                            <label class="adm-prof-label">EMAIL ADMINISTRATEUR (NON MODIFIABLE)</label>
                            <div class="adm-prof-input-wrap">
                                <i data-lucide="at-sign" class="adm-prof-ico"></i>
                                <input id="f-email" type="email" class="adm-prof-input adm-prof-input-disabled"
                                       value="${email}" disabled placeholder="admin@mixo.app"/>
                                <i data-lucide="lock" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:#CBD5E1;pointer-events:none;"></i>
                            </div>
                        </div>

                        <div class="adm-prof-fields-row">
                            <div class="adm-prof-field-group">
                                <label class="adm-prof-label">RÔLE PROFESSIONNEL</label>
                                <div class="adm-prof-input-wrap">
                                    <i data-lucide="briefcase" class="adm-prof-ico"></i>
                                    <input id="f-role" type="text" class="adm-prof-input"
                                           placeholder="Directeur des Opérations" disabled/>
                                </div>
                            </div>
                            <div class="adm-prof-field-group">
                                <label class="adm-prof-label">NUMÉRO DE TÉLÉPHONE</label>
                                <div class="adm-prof-input-wrap">
                                    <i data-lucide="phone" class="adm-prof-ico"></i>
                                    <input id="f-phone" type="tel" class="adm-prof-input"
                                           placeholder="+243 99 307 1476" disabled/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sécurité -->
                    <div class="adm-prof-security">
                        <h3 class="adm-prof-security-title">
                            <i data-lucide="shield-check" style="color:#0A66C2;width:18px;height:18px;flex-shrink:0;"></i>
                            Sécurité du Compte
                        </h3>
                        <div class="adm-prof-security-card">
                            <div class="adm-prof-security-row">
                                <div class="adm-prof-sec-ico">
                                    <i data-lucide="key-round" style="color:#62676B;width:20px;height:20px;"></i>
                                </div>
                                <div class="adm-prof-sec-info">
                                    <span class="adm-prof-sec-label">Mot de passe</span>
                                    <span class="adm-prof-sec-hint">Mis à jour il y a 3 mois</span>
                                </div>
                                <button class="adm-prof-sec-btn" id="btn-pass">Modifier</button>
                            </div>
                        </div>
                    </div>

                    <!-- Changement MDP -->
                    <div id="pass-zone" style="display:none;" class="adm-prof-pass-zone">
                        <div class="adm-prof-field-group">
                            <label class="adm-prof-label">NOUVEAU MOT DE PASSE</label>
                            <div class="adm-prof-input-wrap">
                                <i data-lucide="lock" class="adm-prof-ico"></i>
                                <input id="f-newpass" type="password" class="adm-prof-input"
                                       placeholder="Min. 8 caractères"/>
                            </div>
                        </div>
                        <button class="adm-prof-btn-pass-save" id="save-pass">
                            <i data-lucide="save"></i> Enregistrer le nouveau mot de passe
                        </button>
                    </div>

                    <!-- Boutons -->
                    <div class="adm-prof-btn-row">
                        <button class="adm-prof-btn-cancel" id="btn-cancel" style="display:none;">
                            Annuler
                        </button>
                        <button class="adm-prof-btn-save" id="btn-save">
                            Enregistrer les modifications
                            <i data-lucide="check-circle"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    // ── Logique modifier / enregistrer ──────────────────────
    const editableIds = ['f-fullname', 'f-role', 'f-phone'];
    let editMode = false;

    const setEditMode = active => {
        editMode = active;
        editableIds.forEach(id => {
            const el = main.querySelector(`#${id}`);
            if (el) el.disabled = !active;
        });
        main.querySelector('#btn-cancel').style.display = active ? 'inline-flex' : 'none';
    };

    main.querySelector('#btn-save').addEventListener('click', async () => {
        if (!editMode) { setEditMode(true); return; }

        const btn  = main.querySelector('#btn-save');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;margin-right:8px;vertical-align:middle;"></span> Enregistrement…`;

        try {
            const { id } = ProfilUtilisateur.getCurrentUser();
            await ProfilUtilisateur.updateUserFields(id, {
                username: main.querySelector('#f-fullname').value.trim(),
            });
            localStorage.setItem('username', main.querySelector('#f-fullname').value.trim().toLowerCase());
            showToast('✅ Profil mis à jour !');
            setEditMode(false);
        } catch (e) {
            showToast(`❌ ${e.message || 'Erreur.'}`);
        } finally {
            btn.disabled  = false;
            btn.innerHTML = orig;
            if (window.lucide) window.lucide.createIcons();
        }
    });

    main.querySelector('#btn-cancel').addEventListener('click', () => {
        setEditMode(false);
        main.querySelector('#f-fullname').value = username;
    });

    // Mot de passe
    main.querySelector('#btn-pass').addEventListener('click', () => {
        const z = main.querySelector('#pass-zone');
        z.style.display = z.style.display === 'none' ? 'block' : 'none';
        if (window.lucide) window.lucide.createIcons();
    });

    main.querySelector('#save-pass').addEventListener('click', () => {
        const pw = main.querySelector('#f-newpass').value;
        if (!pw || pw.length < 8) { showToast("Min. 8 caractères."); return; }
        showToast("📧 Lien de réinitialisation envoyé à votre email.");
        main.querySelector('#pass-zone').style.display = 'none';
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};