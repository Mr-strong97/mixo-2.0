/**
 * AdminSettingsPage.js — MIXO
 * Page Paramètres administrateur
 * URL : /admin/parametres
 */
import { Navbar }    from '../../components/navbars/Navbar.js';
import { Footer }    from '../../components/Footer.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';
import api           from '../../api/axiosConfig.js';

export const AdminSettingsPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-sett-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'adm-sett-main';

    main.innerHTML = `
        <div class="adm-sett-header">
            <i data-lucide="settings" style="color:#0A66C2;width:28px;height:28px;flex-shrink:0;"></i>
            <div>
                <h1 class="adm-sett-title">Paramètres</h1>
                <p class="adm-sett-subtitle">Configurez votre compte et vos préférences.</p>
            </div>
        </div>

        <!-- Sections -->
        <div class="adm-sett-grid">

            <!-- Informations du compte -->
            <div class="adm-sett-card">
                <div class="adm-sett-card-header">
                    <i data-lucide="user" style="color:#0A66C2;width:18px;height:18px;"></i>
                    <h2>Informations du compte</h2>
                </div>
                <div class="adm-sett-fields">
                    ${buildField('s-name',  'user',  'Nom complet',          'text',  localStorage.getItem('username') || '')}
                    ${buildField('s-email', 'mail',  'Email (non modifiable)','email', '', true)}
                    ${buildField('s-phone', 'phone', 'Téléphone',            'tel',   '')}
                    ${buildField('s-role',  'briefcase','Rôle professionnel', 'text',  'Administrateur')}
                </div>
                <button class="adm-sett-save" id="save-account">
                    <i data-lucide="save"></i> Enregistrer
                </button>
            </div>

            <!-- Sécurité -->
            <div class="adm-sett-card">
                <div class="adm-sett-card-header">
                    <i data-lucide="shield-check" style="color:#0A66C2;width:18px;height:18px;"></i>
                    <h2>Sécurité du compte</h2>
                </div>
                <div class="adm-sett-security-item">
                    <div class="adm-sett-security-icon">
                        <i data-lucide="key-round" style="color:#62676B;width:20px;height:20px;"></i>
                    </div>
                    <div class="adm-sett-security-info">
                        <span class="adm-sett-sec-label">Mot de passe</span>
                        <span class="adm-sett-sec-hint">Mis à jour il y a 3 mois</span>
                    </div>
                    <button class="adm-sett-sec-btn" id="btn-pass">Modifier</button>
                </div>
                <div id="pass-zone" style="display:none;margin-top:16px;">
                    ${buildField('s-newpass', 'lock', 'Nouveau mot de passe', 'password', '')}
                    <button class="adm-sett-save" id="save-pass" style="margin-top:10px;">
                        <i data-lucide="save"></i> Mettre à jour
                    </button>
                </div>
                <div class="adm-sett-security-item" style="margin-top:10px;">
                    <div class="adm-sett-security-icon">
                        <i data-lucide="smartphone" style="color:#62676B;width:20px;height:20px;"></i>
                    </div>
                    <div class="adm-sett-security-info">
                        <span class="adm-sett-sec-label">Double authentification</span>
                        <span class="adm-sett-sec-hint">Non configurée</span>
                    </div>
                    <button class="adm-sett-sec-btn">Configurer</button>
                </div>
            </div>

            <!-- Notifications -->
            <div class="adm-sett-card">
                <div class="adm-sett-card-header">
                    <i data-lucide="bell" style="color:#0A66C2;width:18px;height:18px;"></i>
                    <h2>Notifications</h2>
                </div>
                ${[
                    { id:'notif-new-users',   label:'Nouveaux utilisateurs',     hint:'Alerte à chaque inscription', checked:true },
                    { id:'notif-suspensions', label:'Suspensions & bannissements',hint:'Résumé des actions', checked:true },
                    { id:'notif-connexions',  label:'Connexions suspectes',       hint:'Tentatives échouées', checked:true },
                    { id:'notif-system',      label:'Alertes système',            hint:'Erreurs et maintenance', checked:false },
                ].map(n => `
                    <div class="adm-sett-toggle-row">
                        <div>
                            <span class="adm-sett-toggle-label">${n.label}</span>
                            <span class="adm-sett-toggle-hint">${n.hint}</span>
                        </div>
                        <label class="adm-sett-toggle">
                            <input type="checkbox" id="${n.id}" ${n.checked ? 'checked' : ''}/>
                            <span class="adm-sett-toggle-slider"></span>
                        </label>
                    </div>
                `).join('')}
            </div>

            <!-- Préférences -->
            <div class="adm-sett-card">
                <div class="adm-sett-card-header">
                    <i data-lucide="sliders" style="color:#0A66C2;width:18px;height:18px;"></i>
                    <h2>Préférences d'affichage</h2>
                </div>
                <div class="adm-sett-pref-row">
                    <label class="adm-sett-pref-label">Langue</label>
                    <select class="adm-sett-select" id="pref-langue">
                        <option value="fr" selected>Français</option>
                        <option value="en">English</option>
                    </select>
                </div>
                <div class="adm-sett-pref-row">
                    <label class="adm-sett-pref-label">Thème</label>
                    <select class="adm-sett-select" id="pref-theme">
                        <option value="light" selected>Clair</option>
                        <option value="dark">Sombre</option>
                    </select>
                </div>
                <div class="adm-sett-pref-row">
                    <label class="adm-sett-pref-label">Éléments par page</label>
                    <select class="adm-sett-select">
                        <option value="10" selected>10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <button class="adm-sett-save" style="margin-top:16px;" id="save-prefs">
                    <i data-lucide="save"></i> Sauvegarder les préférences
                </button>
            </div>

        </div>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    // Mot de passe toggle
    main.querySelector('#btn-pass').addEventListener('click', () => {
        const z = main.querySelector('#pass-zone');
        z.style.display = z.style.display === 'none' ? 'block' : 'none';
    });

    // Sauvegarder compte
    main.querySelector('#save-account').addEventListener('click', () => showToast('✅ Informations enregistrées.'));
    main.querySelector('#save-pass')?.addEventListener('click', () => {
        const pw = main.querySelector('#s-newpass').value;
        if (!pw || pw.length < 8) { showToast("Min. 8 caractères."); return; }
        showToast("📧 Lien de réinitialisation envoyé.");
    });
    main.querySelector('#save-prefs').addEventListener('click', () => showToast('✅ Préférences sauvegardées.'));

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

function buildField(id, icon, label, type, value = '', disabled = false) {
    return `
        <div class="adm-sett-field">
            <label class="adm-sett-field-label">${label.toUpperCase()}</label>
            <div class="adm-sett-input-wrap">
                <i data-lucide="${icon}" class="adm-sett-ico"></i>
                <input id="${id}" type="${type}" class="adm-sett-input" value="${value}"
                       placeholder="${label}" ${disabled ? 'disabled' : ''}/>
            </div>
        </div>`;
}