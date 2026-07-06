/**
 * RegisterPage.js — MIXO
 * Design : split screen, fond blanc, "Déjà un compte ?"
 */
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { showToast } from '../../utils/toast.js';
import { requireGuest } from '../../utils/AuthGuard.js';
import { AvatarPicker } from '../../components/settings/AvatarPicker.js';

export const RegisterPage = () => {
    if (!requireGuest()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'auth-page';
    const recaptchaSiteKey = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();
    const useRecaptcha = Boolean(recaptchaSiteKey) && !import.meta.env.DEV;

    page.innerHTML = `
        <!-- Colonne gauche -->
        <div class="auth-left" style="background:url('/public/images/mixo2.png') center/cover no-repeat;">
            <div class="auth-glass-card" style="margin-top:20px;">
                <h2>Rejoignez<br><span>l'aventure.</span></h2>
            </div>
        </div>

        <!-- Colonne droite -->
        <div class="auth-right">
            <div class="auth-form-wrapper">
                <h1 class="auth-title" style="text-align:center;margin-bottom:22px;">Inscription</h1>

                <!-- Username -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="user" class="auth-field-icon"></i>
                        <input id="reg-username" type="text" class="auth-input" placeholder="Nom d'utilisateur" autocomplete="username"/>
                    </div>
                </div>

                <!-- Email -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="mail" class="auth-field-icon"></i>
                        <input id="reg-email" type="email" class="auth-input" placeholder="Email" autocomplete="email"/>
                    </div>
                </div>

                <!-- Password -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="lock" class="auth-field-icon"></i>
                        <input id="reg-password" type="password" class="auth-input" placeholder="Mot de passe"/>
                        <button class="auth-eye-btn" id="eye-pass" type="button">
                            <i data-lucide="eye" id="icon-pass"></i>
                        </button>
                    </div>
                </div>

                <!-- Confirm password -->
                <div class="auth-field">
                    <div class="auth-field-icon-wrap">
                        <i data-lucide="shield-check" class="auth-field-icon"></i>
                        <input id="reg-confirm" type="password" class="auth-input" placeholder="Confirmer le mot de passe"/>
                        <button class="auth-eye-btn" id="eye-confirm" type="button">
                            <i data-lucide="eye" id="icon-confirm"></i>
                        </button>
                    </div>
                </div>

                <!-- Règles mot de passe -->
                <p class="auth-rules-box">
                    Le mot de passe doit contenir : 8 à 128 caractères, au moins une majuscule, une minuscule, un chiffre et un symbole (@$!%*?&-_#).
                </p>

                <!-- Rôle -->
                <select id="reg-role" class="auth-select">
                    <option value="" disabled selected>VOUS ÊTES ?</option>
                    <option value="CLIENT">Un client</option>
                    <option value="COIFFEUR">Un coiffeur</option>
                </select>

                <!-- Info coiffeur (masquée) -->
                <div id="coiffeur-info" class="auth-info-box" style="display:none;">
                    <i data-lucide="info"></i>
                    <span>Les comptes coiffeurs sont vérifiés par notre équipe avant activation (24-48h).</span>
                </div>

                <!-- Avatar -->
                <section class="auth-avatar-card">
                    <div class="auth-avatar-card__head">
                        <div>
                            <p class="auth-avatar-card__kicker">Avatar de départ</p>
                            <h2 class="auth-avatar-card__title">Choisissez votre style</h2>
                        </div>
                        <p class="auth-avatar-card__hint">Vous pourrez le modifier plus tard dans vos paramètres.</p>
                    </div>
                    <div id="register-avatar-mount"></div>
                </section>

                <!-- reCAPTCHA (désactivé en local pour éviter le blocage si la clé n'est pas autorisée) -->
                <div id="recaptcha-container" style="margin: 16px 0; display: flex; justify-content: center;"></div>
                ${useRecaptcha ? '' : `
                    <p class="auth-rules-box" style="margin-top:-4px;">
                        reCAPTCHA désactivé en local. Active-le en production avec une clé Google valide pour ton domaine.
                    </p>
                `}

                <!-- Boutons -->
                <button class="auth-btn-primary" id="btn-register">
                    <i data-lucide="user-plus"></i>
                    Créer mon compte
                </button>
                <button class="auth-btn-secondary" id="btn-back">
                    <i data-lucide="arrow-left"></i>
                    Retour à l'accueil
                </button>

                <!-- Déjà un compte -->
                <p class="auth-switch">
                    Déjà un compte ?
                    <button id="lnk-login">Se connecter</button>
                </p>
            </div>
        </div>
    `;

    // ── Eye toggles ────────────────────────────────────────
    const toggleEye = (inputId, btnId, iconId) => {
        const inp = page.querySelector(`#${inputId}`);
        const icon = page.querySelector(`#${iconId}`);
        page.querySelector(`#${btnId}`).addEventListener('click', () => {
            const hidden = inp.type === 'password';
            inp.type = hidden ? 'text' : 'password';
            icon.setAttribute('data-lucide', hidden ? 'eye-off' : 'eye');
            icon.style.color = hidden ? '#0A66C2' : '';
            if (window.lucide) window.lucide.createIcons();
        });
    };
    toggleEye('reg-password', 'eye-pass', 'icon-pass');
    toggleEye('reg-confirm', 'eye-confirm', 'icon-confirm');

    // ── Info coiffeur ──────────────────────────────────────
    page.querySelector('#reg-role').addEventListener('change', e => {
        const box = page.querySelector('#coiffeur-info');
        box.style.display = e.target.value === 'COIFFEUR' ? 'flex' : 'none';
        if (window.lucide) window.lucide.createIcons();
    });

    const avatarMount = page.querySelector('#register-avatar-mount');
    let selectedAvatarChoice = 'initials';
    const getRegisterUsername = () => page.querySelector('#reg-username')?.value.trim() || 'MX';
    const avatarPicker = AvatarPicker(getRegisterUsername, selectedAvatarChoice, (choice) => {
        selectedAvatarChoice = choice;
    });
    avatarMount.appendChild(avatarPicker);
    page.querySelector('#reg-username').addEventListener('input', () => {
        if (typeof avatarPicker.refreshAvatarPreview === 'function') {
            avatarPicker.refreshAvatarPreview();
        }
    });

    // ── reCAPTCHA : rendu explicite AU MONTAGE de la page ──
    // (et non au clic — sinon l'utilisateur ne voit jamais le widget)
    let recaptchaWidgetId = null;

    const renderRecaptcha = () => {
        if (!useRecaptcha) return;
        const container = page.querySelector('#recaptcha-container');
        if (!container || !window.grecaptcha || !window.grecaptcha.render) return;
        if (recaptchaWidgetId !== null) return; // déjà rendu, ne pas doubler

        recaptchaWidgetId = window.grecaptcha.render(container, {
            sitekey: recaptchaSiteKey,
        });
    };

    if (useRecaptcha && window.grecaptcha && window.grecaptcha.render) {
        // L'API Google est déjà chargée (navigation SPA, page déjà visitée avant)
        renderRecaptcha();
    } else {
        // L'API n'est pas encore chargée : on attend le callback global
        // Doit correspondre au paramètre ?onload=onRecaptchaApiLoad du <script> dans index.html
        window.onRecaptchaApiLoad = () => {
            renderRecaptcha();
        };
    }

    // ── Inscription ────────────────────────────────────────
    page.querySelector('#btn-register').addEventListener('click', async (e) => {
        e.preventDefault();
        const username = page.querySelector('#reg-username').value.trim();
        const email = page.querySelector('#reg-email').value.trim();
        const password = page.querySelector('#reg-password').value;
        const confirm = page.querySelector('#reg-confirm').value;
        const role = page.querySelector('#reg-role').value;

        if (!username || !email || !password || !role) { showToast("Remplissez tous les champs."); return; }
        if (password !== confirm) { showToast("Les mots de passe ne correspondent pas."); return; }
        if (password.length < 8) { showToast("Au moins 8 caractères."); return; }

        const recaptchaToken = useRecaptcha && window.grecaptcha
            ? window.grecaptcha.getResponse(recaptchaWidgetId)
            : null;
        if (useRecaptcha && !recaptchaToken) {
            showToast("Merci de valider le reCAPTCHA avant de continuer.");
            return;
        }

        const btn = page.querySelector('#btn-register');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Création…`;

        try {
            await AuthentificationUtilisateurs.register({
                username,
                email,
                password,
                role,
                avatar_choice: selectedAvatarChoice || 'initials',
                recaptcha_token: recaptchaToken,
            });
            showToast(role === 'COIFFEUR'
                ? "Compte créé ! Notre équipe vérifie votre profil (24-48h)."
                : "Bienvenue sur Mixo ! Votre compte est prêt.");
            setTimeout(() => { if (window.navigate) window.navigate('/login'); }, 2200);
        } catch (err) {
            btn.disabled = false; btn.innerHTML = orig;
            if (window.grecaptcha && recaptchaWidgetId !== null) window.grecaptcha.reset(recaptchaWidgetId);
            let msg = "Erreur lors de l'inscription.";
            if (typeof err === 'object' && err !== null) msg = Object.values(err).flat()[0] || msg;
            else if (typeof err === 'string') msg = err;
            showToast(msg);
        }
    });

    page.querySelector('#btn-back').addEventListener('click', () => { if (window.navigate) window.navigate('/'); });
    page.querySelector('#lnk-login').addEventListener('click', () => { if (window.navigate) window.navigate('/login'); });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};
