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
        <div class="auth-left" style="background:url('/images/mixo6.png') center/cover no-repeat;">
            <div class="auth-glass-card" style="margin-top:300px;">
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
                <div id="banner-email" class="auth-banner auth-banner-warning" style="display:none;">
                    <i data-lucide="mail-check"></i>
                    <span id="msg-email"></span>
                    <button id="btn-resend-verification" class="auth-btn-resend" type="button">Renvoyer</button>
                </div>

                <!-- Email -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="mail" class="auth-field-icon"></i>
                        <input id="inp-email" type="email" class="auth-input"
                               placeholder="Adresse email" autocomplete="email"/>
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

                <button class="auth-btn-install" id="btn-install-app" type="button">
                    <i data-lucide="download"></i>
                    Installer l'application
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
    const bannerEmail   = page.querySelector('#banner-email');
    const hideBanners   = () => { bannerPending.style.display = 'none'; bannerLocked.style.display = 'none'; bannerEmail.style.display = 'none'; };

    // ── Connexion ──────────────────────────────────────────
    const doLogin = async () => {
        hideBanners();
        const email = page.querySelector('#inp-email').value.trim();
        const password = passInp.value;

        if (!email || !password) { showToast("Veuillez remplir tous les champs."); return; }

        const btn  = page.querySelector('#btn-login');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Vérification…`;

        try {
            await AuthentificationUtilisateurs.login({ email, password });
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
            } else if (msg.toLowerCase().includes('vérifi') && msg.toLowerCase().includes('email')) {
                page.querySelector('#msg-email').textContent = msg;
                bannerEmail.style.display = 'flex';
            } else {
                showToast(msg);
            }
            if (window.lucide) window.lucide.createIcons();
        }
    };

    page.querySelector('#btn-resend-verification').addEventListener('click', async () => {
        const resendBtn = page.querySelector('#btn-resend-verification');
        resendBtn.disabled = true;
        try {
            await AuthentificationUtilisateurs.resendVerificationEmail({
                email: page.querySelector('#inp-email').value,
                password: passInp.value,
            });
            showToast('Email de vérification renvoyé. Vérifiez aussi vos spams.');
        } catch (err) {
            showToast(err.message || 'Impossible de renvoyer l’email.');
        } finally {
            resendBtn.disabled = false;
        }
    });

    page.querySelector('#btn-login').addEventListener('click', doLogin);
    page.querySelector('#inp-password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    page.querySelector('#inp-email').addEventListener('keydown', e => { if (e.key === 'Enter') page.querySelector('#inp-password').focus(); });

    page.querySelector('#lnk-forgot').addEventListener('click', e => { e.preventDefault(); if (window.navigate) window.navigate('/forgot-password'); });
    page.querySelector('#btn-back').addEventListener('click', () => { if (window.navigate) window.navigate('/'); else window.location.href = '/'; });

    // Installation Android/Chrome via le prompt natif, avec aide pour iOS.
    const installBtn = page.querySelector('#btn-install-app');
    installBtn.addEventListener('click', async () => {
        const installPrompt = window.__mixoInstallPrompt;
        if (installPrompt) {
            installBtn.disabled = true;
            installPrompt.prompt();
            const choice = await installPrompt.userChoice;
            if (choice.outcome === 'accepted') showToast("Mixo a été ajouté à votre téléphone.");
            window.__mixoInstallPrompt = null;
            installBtn.disabled = false;
            return;
        }
        showToast("Sur iPhone : appuyez sur Partager, puis « Sur l'écran d'accueil ».");
    });

    const updateInstallButton = () => {
        installBtn.classList.toggle('is-ready', Boolean(window.__mixoInstallPrompt));
    };
    window.addEventListener('mixo:pwa-install-available', updateInstallButton, { once: true });
    updateInstallButton();

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};
