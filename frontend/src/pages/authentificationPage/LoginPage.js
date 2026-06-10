/**
 * LoginPage.js — MIXO
 * Design : split screen, fond blanc, inputs épurés
 */
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { showToast } from '../../utils/toast.js';
import { requireGuest } from '../../utils/AuthGuard.js';

export const LoginPage = () => {
    if (!requireGuest()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'auth-page';

    page.innerHTML = `
        <!-- Colonne gauche : image -->
        <div class="auth-left" style="background:url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000') center/cover no-repeat;">
            <div class="auth-glass-card">
                <h2>Ravi de vous<br><span>revoir</span></h2>
            </div>
        </div>

        <!-- Colonne droite : formulaire -->
        <div class="auth-right">
            <div class="auth-form-wrapper">
                <h1 class="auth-title" style="text-align:center;margin-bottom:8px;">Connexion</h1>

                <!-- Bandeaux d'erreur (masqués par défaut) -->
                <div id="banner-pending" class="auth-banner auth-banner-warning" style="display:none;">
                    <i data-lucide="clock"></i>
                    <span id="msg-pending"></span>
                </div>
                <div id="banner-locked" class="auth-banner auth-banner-danger" style="display:none;">
                    <i data-lucide="lock"></i>
                    <span id="msg-locked"></span>
                </div>

                <!-- Username -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="user" class="auth-field-icon"></i>
                        <input id="inp-username" type="text" class="auth-input"
                               placeholder="Nom d'utilisateur" autocomplete="username"/>
                    </div>
                </div>

                <!-- Password -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="lock" class="auth-field-icon"></i>
                        <input id="inp-password" type="password" class="auth-input"
                               placeholder="Mot de passe" autocomplete="current-password"/>
                        <button class="auth-eye-btn" id="eye-btn" type="button" title="Afficher/masquer">
                            <i data-lucide="eye" id="eye-icon"></i>
                        </button>
                    </div>
                </div>

                <!-- Mot de passe oublié -->
                <div class="auth-forgot">
                    <a href="#" id="lnk-forgot">Mot de passe oublié ?</a>
                </div>

                <!-- Boutons -->
                <button class="auth-btn-primary" id="btn-login">
                    <i data-lucide="log-in"></i>
                    Se connecter
                </button>
                <button class="auth-btn-secondary" id="btn-back">
                    <i data-lucide="arrow-left"></i>
                    Retour à l'accueil
                </button>

                <!-- Copyright -->
                <p class="auth-footer-text">© 2026 Mixo Professional Services. All rights reserved.</p>
            </div>
        </div>
    `;

    // ── Afficher/masquer mot de passe ──────────────────────
    const eyeBtn  = page.querySelector('#eye-btn');
    const eyeIcon = page.querySelector('#eye-icon');
    const passInp = page.querySelector('#inp-password');

    eyeBtn.addEventListener('click', () => {
        const hidden = passInp.type === 'password';
        passInp.type = hidden ? 'text' : 'password';
        eyeIcon.setAttribute('data-lucide', hidden ? 'eye-off' : 'eye');
        eyeIcon.style.color = hidden ? '#0A66C2' : '';
        if (window.lucide) window.lucide.createIcons();
    });

    // ── Bandeaux ───────────────────────────────────────────
    const bannerPending = page.querySelector('#banner-pending');
    const bannerLocked  = page.querySelector('#banner-locked');
    const hideBanners   = () => { bannerPending.style.display = 'none'; bannerLocked.style.display = 'none'; };

    // ── Connexion ──────────────────────────────────────────
    const doLogin = async () => {
        hideBanners();
        const username = page.querySelector('#inp-username').value.trim();
        const password = passInp.value;

        if (!username || !password) { showToast("Veuillez remplir tous les champs."); return; }

        const btn  = page.querySelector('#btn-login');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Vérification…`;

        try {
            await AuthentificationUtilisateurs.login({ username, password });
            showToast(`Bienvenue, ${localStorage.getItem('username')} !`);
            setTimeout(() => { if (window.navigate) window.navigate('/home'); else window.location.href = '/home'; }, 900);
        } catch (err) {
            btn.disabled = false; btn.innerHTML = orig;
            const msg = err.message || "Identifiants incorrects.";
            if (msg.toLowerCase().includes('attente') || msg.toLowerCase().includes('validation')) {
                page.querySelector('#msg-pending').textContent = msg;
                bannerPending.style.display = 'flex';
            } else if (msg.toLowerCase().includes('verrouillé')) {
                page.querySelector('#msg-locked').textContent = msg;
                bannerLocked.style.display = 'flex';
            } else {
                showToast(msg);
            }
            if (window.lucide) window.lucide.createIcons();
        }
    };

    page.querySelector('#btn-login').addEventListener('click', doLogin);
    page.querySelector('#inp-password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    page.querySelector('#inp-username').addEventListener('keydown', e => { if (e.key === 'Enter') page.querySelector('#inp-password').focus(); });

    page.querySelector('#lnk-forgot').addEventListener('click', e => { e.preventDefault(); if (window.navigate) window.navigate('/forgot-password'); });
    page.querySelector('#btn-back').addEventListener('click', () => { if (window.navigate) window.navigate('/'); else window.location.href = '/'; });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};