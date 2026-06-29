/**
 * LoginPage.js — Version Épurée & Lumineuse Alignée sur l'Inscription
 */
import { InputGroup }    from '../components/InputGroup.js';
import { ButtonPrimary } from '../components/ButtonPrimary.js';
import { AuthentificationUtilisateurs } from '../api/axiosConfig.js';
import { showToast }     from '../utils/toast.js';

export const LoginPage = () => {
    const container = document.createElement('div');
    container.className = 'container-fluid vh-100 p-0 d-flex align-items-center';

    container.innerHTML = `
        <div class="row w-100 m-0 h-100">
            <div class="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-image-section-login">
                <div class="glass-overlay">
                    <h2>Ravi de vous<br><span>revoir</span></h2>
                </div>
            </div>
            
            <div class="col-md-6 col-12 login-form-section d-flex flex-column align-items-center justify-content-center p-5">
                <h2 class="login-title">
                    Connexion
                </h2>

                <div id="pending-banner" style="display:none;">
                    <i data-lucide="clock" style="width:16px;height:16px;vertical-align:middle;"></i>
                    <span id="pending-msg" style="font-size:0.85rem;margin-left:6px;font-weight:500;"></span>
                </div>

                <div id="locked-banner" style="display:none;">
                    <i data-lucide="lock" style="width:16px;height:16px;vertical-align:middle;"></i>
                    <span id="locked-msg" style="font-size:0.85rem;margin-left:6px;font-weight:500;"></span>
                </div>

                <form id="login-form" class="w-100 d-flex flex-column align-items-center">
                    <div id="login-inputs" class="w-100 d-flex flex-column"></div>

                    <a href="#" id="forgot-link">
                        Mot de passe oublié ?
                    </a>

                    <div id="login-btn-container" class="w-100"></div>
                </form>

                <div class="w-100 mt-3" style="max-width:420px;">
                    <button id="btn-back-home">
                        <i data-lucide="arrow-left" style="width:16px;height:16px;margin-right:4px;"></i>
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    `;

    // ---- Configuration des Champs ----
    const inputsBox     = container.querySelector('#login-inputs');
    
    const usernameGroup = InputGroup('text', "Nom d'utilisateur", 'user');
    usernameGroup.querySelector('input').id = 'login-username';
    
    const passwordGroup = InputGroup('password', 'Mot de passe', 'lock');
    passwordGroup.querySelector('input').id = 'login-password';
    
    inputsBox.append(usernameGroup, passwordGroup);
    
    // ---- Bouton principal ----
    const loginBtn = ButtonPrimary("Se connecter", "solid", "log-in");
    container.querySelector('#login-btn-container').appendChild(loginBtn);

    // ---- Gestion de l'affichage du mot de passe (Eye Icon) ----
    const passwordInput = passwordGroup.querySelector('input');
    const eyeBtn = document.createElement('button');
    eyeBtn.type = 'button';
    eyeBtn.className = 'password-toggle-btn';
    eyeBtn.innerHTML = `<i data-lucide="eye" class="eye-icon"></i>`;

    passwordGroup.style.position = 'relative';

    eyeBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeBtn.innerHTML = `
            <i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="eye-icon"></i>
        `;
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    passwordGroup.appendChild(eyeBtn);

    // ---- Bandeaux de notifications ----
    const pendingBanner = container.querySelector('#pending-banner');
    const pendingMsg    = container.querySelector('#pending-msg');
    const lockedBanner  = container.querySelector('#locked-banner');
    const lockedMsg     = container.querySelector('#locked-msg');

    const hideBanners = () => {
        pendingBanner.style.display = 'none';
        lockedBanner.style.display  = 'none';
    };

    // ---- Traitement de la connexion ----
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        hideBanners();

        const usernameVal = container.querySelector('#login-username').value.trim();
        const passwordVal = container.querySelector('#login-password').value;

        if (!usernameVal || !passwordVal) {
            showToast("Veuillez remplir tous les champs."); 
            return;
        }

        const orig = loginBtn.innerHTML;
        loginBtn.disabled = true;
        loginBtn.innerHTML = `<span class="aus-spinner-sm"></span> Vérification…`;

        try {
            await AuthentificationUtilisateurs.login({ username: usernameVal, password: passwordVal });
            showToast(`Bienvenue, ${localStorage.getItem('username')} !`);
            setTimeout(() => {
                if (window.navigate) window.navigate('/home');
                else window.location.href = '/home';
            }, 1000);
        } catch (error) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = orig;

            const msg = error.message || "Identifiants incorrects.";

            if (msg.toLowerCase().includes('attente') || msg.toLowerCase().includes('validation')) {
                pendingMsg.textContent = msg;
                pendingBanner.style.display = 'block';
                if (window.lucide) window.lucide.createIcons();
            } else if (msg.toLowerCase().includes('verrouillé')) {
                lockedMsg.textContent = msg;
                lockedBanner.style.display = 'block';
                if (window.lucide) window.lucide.createIcons();
            } else {
                showToast(msg);
            }
        }
    });

    // ---- Navigation & Redirections ----
    container.querySelector('#forgot-link').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigate) window.navigate('/forgot-password');
        else window.location.href = '/forgot-password';
    });

    container.querySelector('#btn-back-home').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigate) window.navigate('/welcome');
        else window.location.href = '/welcome';
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return container;
};