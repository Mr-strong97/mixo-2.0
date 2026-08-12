/**
 * AdminSettingsPage.js — MIXO
 * Paramètres administrateur avancés.
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import AdminService from '../../api/AdminService.js';
import api from '../../api/axiosConfig.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';

import '../../styles/adminStyles/AdminSettingsPage.css';

const TABS = [
    { id: 'profil', label: 'Mon profil', icon: 'user' },
    { id: 'securite', label: 'Sécurité', icon: 'shield-check' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'preferences', label: 'Préférences', icon: 'sliders-horizontal' },
];

export const AdminSettingsPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'adm-sett-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'adm-sett-main';
    main.innerHTML = `
        <section class="adm-sett-hero">
            <div>
                <h1>Paramètres administrateur</h1>
                <p>Profil, sécurité, notifications et préférences du tableau de bord.</p>
            </div>
            <div class="adm-sett-hero-actions">
                <button class="adm-btn adm-btn-primary" id="adm-sett-save-global" type="button"><i data-lucide="save"></i> Enregistrer</button>
                <button class="adm-btn adm-btn-ghost" id="adm-sett-reload" type="button"><i data-lucide="refresh-cw"></i> Recharger</button>
            </div>
        </section>

        <section class="adm-sett-layout">
            <aside class="adm-sett-nav" id="adm-sett-nav"></aside>
            <div class="adm-sett-panel" id="adm-sett-panel">
                <div class="adm-dash-loader"><div class="adm-spinner"></div></div>
            </div>
        </section>
    `;

    page.appendChild(main);
    page.appendChild(Footer());

    const state = {
        active: 'profil',
        profile: null,
        security: null,
        notifications: loadJson('mixo_admin_notifications', {
            system: true,
            suspicious_login: true,
            new_user_alerts: true,
            payment_alerts: true,
        }),
        preferences: loadJson('mixo_admin_preferences', {
            language: 'fr',
            dateFormat: 'dd/mm/yyyy',
            dashboardDensity: 'comfortable',
            reducedMotion: false,
        }),
        photoFile: null,
    };

    const nav = main.querySelector('#adm-sett-nav');
    const panel = main.querySelector('#adm-sett-panel');

    const renderNav = () => {
        nav.innerHTML = TABS.map(tab => `
            <button class="adm-sett-tab ${state.active === tab.id ? 'is-active' : ''}" data-tab="${tab.id}">
                <i data-lucide="${tab.icon}"></i>
                <span>${tab.label}</span>
            </button>
        `).join('');
        nav.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.active = btn.dataset.tab;
                render();
            });
        });
    };

    const loadProfile = async () => {
        const userId = localStorage.getItem('user_id');
        const { data } = await api.get(`auth/profil/${userId}/`);
        state.profile = data;
        if (!state.profile.telephone) state.profile.telephone = '';
        render();
    };

    const loadSecurity = async () => {
        const { data } = await AdminService.getSecurityOverview();
        state.security = data;
        render();
    };

    const render = () => {
        renderNav();
        if (!state.profile) {
            panel.innerHTML = `<div class="adm-dash-loader"><div class="adm-spinner"></div></div>`;
            return;
        }

        if (state.active === 'profil') renderProfil();
        if (state.active === 'securite') renderSecurite();
        if (state.active === 'notifications') renderNotifications();
        if (state.active === 'preferences') renderPreferences();
        if (window.lucide) window.lucide.createIcons();
    };

    const renderProfil = () => {
        const user = state.profile;
        const initials = (user.username || 'AD').substring(0, 2).toUpperCase();
        const photo = user.photo || '';
        panel.innerHTML = `
            <section class="adm-sett-card">
                <div class="adm-sett-card-head">
                    <div>
                        <h2>Informations personnelles</h2>
                    </div>
                    <span class="adm-pill">Compte admin</span>
                </div>

                <div class="adm-profile-hero">
                    <div class="adm-profile-avatar" id="adm-profile-avatar">
                        ${photo ? `<img src="${photo}" alt="Photo de profil">` : `<span>${escapeHtml(initials)}</span>`}
                    </div>
                    <div class="adm-profile-actions">
                        <label class="adm-btn adm-btn-ghost" for="adm-photo-input">
                            <i data-lucide="camera"></i> Changer la photo
                        </label>
                        <input id="adm-photo-input" type="file" accept="image/*" hidden>
                        <button class="adm-btn adm-btn-ghost" id="adm-photo-remove" type="button"><i data-lucide="trash-2"></i> Retirer</button>
                    </div>
                </div>

                <div class="adm-form-grid">
                    ${field('adm-username', 'user', 'Nom d’utilisateur', user.username || '')}
                    ${field('adm-email', 'mail', 'Adresse email', user.email || '', 'email')}
                    ${field('adm-first', 'badge', 'Prénom', user.first_name || '')}
                    ${field('adm-last', 'badge', 'Nom', user.last_name || '')}
                    ${field('adm-phone', 'phone', 'Téléphone', user.telephone || '', 'tel')}
                </div>

                <div class="adm-sett-actions">
                    <button class="adm-btn adm-btn-primary" id="adm-save-profile" type="button"><i data-lucide="save"></i> Enregistrer le profil</button>
                </div>
            </section>
        `;

        panel.querySelector('#adm-photo-input').addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            state.photoFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                panel.querySelector('#adm-profile-avatar').innerHTML = `<img src="${reader.result}" alt="Photo de profil">`;
            };
            reader.readAsDataURL(file);
        });

        panel.querySelector('#adm-photo-remove').addEventListener('click', () => {
            state.photoFile = null;
            const avatar = panel.querySelector('#adm-profile-avatar');
            avatar.innerHTML = `<span>${escapeHtml(initials)}</span>`;
            const input = panel.querySelector('#adm-photo-input');
            if (input) input.value = '';
        });

        panel.querySelector('#adm-save-profile').addEventListener('click', async () => {
            const userId = user.id;
            const formData = new FormData();
            formData.append('username', panel.querySelector('#adm-username').value.trim());
            formData.append('email', panel.querySelector('#adm-email').value.trim());
            formData.append('first_name', panel.querySelector('#adm-first').value.trim());
            formData.append('last_name', panel.querySelector('#adm-last').value.trim());
            formData.append('telephone', panel.querySelector('#adm-phone').value.trim());
            if (state.photoFile) formData.append('photo', state.photoFile);

            try {
                await api.patch(`auth/profil/${userId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                localStorage.setItem('username', panel.querySelector('#adm-username').value.trim());
                showToast('✅ Profil administrateur mis à jour.');
                await loadProfile();
            } catch (error) {
                showToast(error.response?.data?.detail || 'Impossible de mettre à jour le profil.', 'error');
            }
        });
    };

    const renderSecurite = () => {
        const sec = state.security || { sessions_actives: [], connexions_recentes: [] };
        panel.innerHTML = `
            <section class="adm-sett-card">
                <div class="adm-sett-card-head">
                    <div>
                        <h2>Sessions et accès</h2>
                    </div>
                    <button class="adm-btn adm-btn-ghost" id="adm-revoke-others" type="button"><i data-lucide="shield-off"></i> Déconnecter les autres appareils</button>
                </div>

                <div class="adm-security-grid">
                    <article class="adm-security-box">
                        <span class="adm-security-label">Dernière connexion</span>
                        <strong>${formatDate(sec.profil?.last_login)}</strong>
                        <p>${sec.profil?.email || 'Aucune donnée'}</p>
                    </article>
                    <article class="adm-security-box">
                        <span class="adm-security-label">Sessions actives</span>
                        <strong>${(sec.sessions_actives || []).length}</strong>
                        <p>Refresh tokens actuellement connus</p>
                    </article>
                </div>

                <div class="adm-security-block">
                    <h3>Sessions actives</h3>
                    ${(sec.sessions_actives || []).length
                        ? sec.sessions_actives.map(s => `
                            <div class="adm-session-row">
                                <div>
                                    <strong>${escapeHtml(s.jti.slice(0, 10))}…</strong>
                                    <p>Expire le ${formatDate(s.expires_at)}</p>
                                </div>
                                <span class="adm-session-pill ${s.blacklisted ? 'is-danger' : ''}">${s.blacklisted ? 'Révoquée' : 'Active'}</span>
                            </div>
                        `).join('')
                        : `<p class="adm-empty">Aucune session détectée.</p>`
                    }
                </div>

                <div class="adm-security-block">
                    <h3>Dernières connexions</h3>
                    ${(sec.connexions_recentes || []).length
                        ? sec.connexions_recentes.map(log => `
                            <div class="adm-session-row">
                                <div>
                                    <strong>${escapeHtml(log.action)}</strong>
                                    <p>${formatDate(log.created_at)} · ${escapeHtml(log.ip_adresse || '—')}</p>
                                </div>
                                <span class="adm-session-pill">${log.succes ? 'OK' : 'Erreur'}</span>
                            </div>
                        `).join('')
                        : `<p class="adm-empty">Aucune entrée.</p>`
                    }
                </div>

                <div class="adm-security-block">
                    <h3>Changer le mot de passe</h3>
                    <div class="adm-form-grid">
                        ${field('adm-current-pass', 'lock', 'Mot de passe actuel', '', 'password')}
                        ${field('adm-pass', 'lock', 'Nouveau mot de passe', '', 'password')}
                        ${field('adm-pass-confirm', 'lock', 'Confirmer', '', 'password')}
                    </div>
                    <div class="adm-sett-actions">
                        <button class="adm-btn adm-btn-primary" id="adm-pass-btn" type="button"><i data-lucide="key-round"></i> Modifier le mot de passe</button>
                    </div>
                </div>
            </section>
        `;

        panel.querySelector('#adm-revoke-others').addEventListener('click', async () => {
            try {
                const res = await AdminService.revokeSessions('others');
                showToast(`✅ ${res.revoked} session(s) révoquée(s).`);
                await loadSecurity();
            } catch (error) {
                showToast(error.message || 'Impossible de révoquer les sessions.', 'error');
            }
        });

        panel.querySelector('#adm-pass-btn').addEventListener('click', async () => {
            const ancien = panel.querySelector('#adm-current-pass').value.trim();
            const nouveau = panel.querySelector('#adm-pass').value.trim();
            const confirmation = panel.querySelector('#adm-pass-confirm').value.trim();
            if (!ancien || !nouveau || !confirmation) {
                showToast('Tous les champs sont requis.', 'error');
                return;
            }
            if (nouveau !== confirmation) {
                showToast('Les mots de passe ne correspondent pas.', 'error');
                return;
            }
            try {
                await api.post('auth/password/modifier/', {
                    ancien_mot_de_passe: ancien,
                    nouveau_mot_de_passe: nouveau,
                });
                panel.querySelector('#adm-current-pass').value = '';
                panel.querySelector('#adm-pass').value = '';
                panel.querySelector('#adm-pass-confirm').value = '';
                showToast('✅ Mot de passe modifié.');
            } catch (error) {
                showToast(error.response?.data?.detail || 'Impossible de modifier le mot de passe.', 'error');
            }
        });
    };

    const renderNotifications = () => {
        panel.innerHTML = `
            <section class="adm-sett-card">
                <div class="adm-sett-card-head">
                    <div>
                        <h2>Alertes système</h2>
                    </div>
                </div>

                <div class="adm-toggle-list">
                    ${toggle('system', 'Alerte système', 'Maintenance, erreurs critiques et indisponibilités', state.notifications.system)}
                    ${toggle('suspicious_login', 'Connexions suspectes', 'Tentatives de connexion inhabituelles', state.notifications.suspicious_login)}
                    ${toggle('new_user_alerts', 'Nouveaux utilisateurs', 'Alerte pour les nouvelles inscriptions', state.notifications.new_user_alerts)}
                    ${toggle('payment_alerts', 'Transactions importantes', 'Paiements validés, échoués ou remboursés', state.notifications.payment_alerts)}
                </div>
            </section>
        `;

        panel.querySelectorAll('input[type="checkbox"][data-key]').forEach(input => {
            input.addEventListener('change', () => {
                state.notifications[input.dataset.key] = input.checked;
            });
        });
    };

    const renderPreferences = () => {
        panel.innerHTML = `
            <section class="adm-sett-card">
                <div class="adm-sett-card-head">
                    <div>
                        <h2>Affichage et ergonomie</h2>
                    </div>
                </div>

                <div class="adm-form-grid">
                    ${select('pref-language', 'Langue', [['fr', 'Français'], ['en', 'English']], state.preferences.language)}
                    ${select('pref-date', 'Format de date', [['dd/mm/yyyy', 'Jour/Mois/Année'], ['yyyy-mm-dd', 'ISO']], state.preferences.dateFormat)}
                    ${select('pref-density', 'Densité du dashboard', [['comfortable', 'Confortable'], ['compact', 'Compact']], state.preferences.dashboardDensity)}
                </div>

                <div class="adm-toggle-list">
                    ${toggle('reducedMotion', 'Réduire les animations', 'Limiter les effets visuels', state.preferences.reducedMotion)}
                </div>
            </section>
        `;

        panel.querySelectorAll('input[type="checkbox"][data-key]').forEach(input => {
            input.addEventListener('change', () => {
                state.preferences[input.dataset.key] = input.checked;
            });
        });
        panel.querySelectorAll('select[data-key]').forEach(selectEl => {
            selectEl.addEventListener('change', () => {
                state.preferences[selectEl.dataset.key] = selectEl.value;
            });
        });
    };

    main.querySelector('#adm-sett-save-global').addEventListener('click', async () => {
        if (state.active === 'notifications') {
            saveJson('mixo_admin_notifications', state.notifications);
            showToast('✅ Notifications enregistrées.');
        } else if (state.active === 'preferences') {
            saveJson('mixo_admin_preferences', state.preferences);
            showToast('✅ Préférences enregistrées.');
        } else if (state.active === 'profil') {
            showToast('Utilisez le bouton "Enregistrer le profil" dans cette section.');
        } else {
            showToast('Les actions de sécurité sont exécutées via les boutons dédiés.');
        }
    });
    main.querySelector('#adm-sett-reload').addEventListener('click', () => window.location.reload());

    const loadAll = async () => {
        await Promise.allSettled([loadProfile(), loadSecurity()]);
    };

    loadAll();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

function field(id, icon, label, value = '', type = 'text') {
    return `
        <label class="adm-field">
            <span class="adm-field-label">${label}</span>
            <div class="adm-input-wrap">
                <i data-lucide="${icon}"></i>
                <input id="${id}" type="${type}" value="${escapeHtmlAttr(value)}" />
            </div>
        </label>
    `;
}

function select(id, label, options = [], value = '') {
    return `
        <label class="adm-field">
            <span class="adm-field-label">${label}</span>
            <div class="adm-input-wrap">
                <i data-lucide="chevron-down"></i>
                <select id="${id}" data-key="${id}">
                    ${options.map(([val, txt]) => `<option value="${val}" ${val === value ? 'selected' : ''}>${txt}</option>`).join('')}
                </select>
            </div>
        </label>
    `;
}

function toggle(key, label, hint, checked = false) {
    return `
        <label class="adm-toggle">
            <div>
                <strong>${label}</strong>
                <p>${hint}</p>
            </div>
            <input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''}>
            <span></span>
        </label>
    `;
}

function loadJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlAttr(str = '') {
    return escapeHtml(str).replace(/"/g, '&quot;');
}

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
}
