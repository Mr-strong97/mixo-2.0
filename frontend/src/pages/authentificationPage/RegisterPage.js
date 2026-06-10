/**
 * RegisterPage.js — MIXO
 * Design : split screen, fond blanc, "Déjà un compte ?"
 */
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { showToast }   from '../../utils/toast.js';
import { requireGuest } from '../../utils/AuthGuard.js';

export const RegisterPage = () => {
    if (!requireGuest()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'auth-page';

    page.innerHTML = `
        <!-- Colonne gauche -->
        <div class="auth-left" style="background:url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000') center/cover no-repeat;">
            <div class="auth-glass-card">
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
        const inp  = page.querySelector(`#${inputId}`);
        const icon = page.querySelector(`#${iconId}`);
        page.querySelector(`#${btnId}`).addEventListener('click', () => {
            const hidden = inp.type === 'password';
            inp.type = hidden ? 'text' : 'password';
            icon.setAttribute('data-lucide', hidden ? 'eye-off' : 'eye');
            icon.style.color = hidden ? '#0A66C2' : '';
            if (window.lucide) window.lucide.createIcons();
        });
    };
    toggleEye('reg-password', 'eye-pass',    'icon-pass');
    toggleEye('reg-confirm',  'eye-confirm', 'icon-confirm');

    // ── Info coiffeur ──────────────────────────────────────
    page.querySelector('#reg-role').addEventListener('change', e => {
        const box = page.querySelector('#coiffeur-info');
        box.style.display = e.target.value === 'COIFFEUR' ? 'flex' : 'none';
        if (window.lucide) window.lucide.createIcons();
    });

    // ── Inscription ────────────────────────────────────────
    page.querySelector('#btn-register').addEventListener('click', async (e) => {
        e.preventDefault();
        const username = page.querySelector('#reg-username').value.trim();
        const email    = page.querySelector('#reg-email').value.trim();
        const password = page.querySelector('#reg-password').value;
        const confirm  = page.querySelector('#reg-confirm').value;
        const role     = page.querySelector('#reg-role').value;

        if (!username || !email || !password || !role) { showToast("Remplissez tous les champs."); return; }
        if (password !== confirm)  { showToast("Les mots de passe ne correspondent pas."); return; }
        if (password.length < 8)   { showToast("Au moins 8 caractères."); return; }

        const btn  = page.querySelector('#btn-register');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Création…`;

        try {
            await AuthentificationUtilisateurs.register({ username, email, password, role });
            showToast(role === 'COIFFEUR'
                ? "Compte créé ! Notre équipe vérifie votre profil (24-48h)."
                : "Bienvenue sur Mixo ! Votre compte est prêt.");
            setTimeout(() => { if (window.navigate) window.navigate('/login'); }, 2200);
        } catch (err) {
            btn.disabled = false; btn.innerHTML = orig;
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