/**
 * ForgotPasswordPage.js
 * =======================
 * Page "Mot de passe oublié" — demande un lien de réinitialisation.
 * Code JavaScript épuré de ses styles en ligne.
 */
import { ButtonPrimary } from '../components/ButtonPrimary.js';
import { InputGroup }    from '../components/InputGroup.js';
import { showToast }     from '../utils/toast.js';
import api               from '../api/axiosConfig.js';

export const ForgotPasswordPage = () => {
    const container = document.createElement('div');
    container.className = 'container-fluid vh-100 p-0 d-flex align-items-center';

    container.innerHTML = `
        <div class="row w-100 m-0 h-100">
            <div class="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-image-section-login">
                <div class="glass-overlay">
                    <h2>Mot de passe<br><span>oublié ?</span></h2>
                </div>
            </div>
            
            <div class="col-md-6 col-12 login-form-section d-flex flex-column align-items-center justify-content-center p-4 p-md-5">
                
                <div class="login-wrapper w-100 d-flex flex-column" style="max-width: 420px;">
                    
                    <h2 class="login-title">Réinitialiser</h2>
                    
                    <p class="password-rules-text mb-4">
                        Entrez votre adresse email. Vous recevrez un lien unique pour choisir un nouveau mot de passe sécurisé.
                    </p>

                    <form id="login-form" class="w-100 d-flex flex-column align-items-stretch">
                        <div id="email-wrap" class="w-100 d-flex flex-column"></div>
                        <div id="btn-wrap" class="w-100 mt-2"></div>
                    </form>

                    <div id="success-msg" class="success-box-message" style="display:none;">
                        <i data-lucide="mail-check" style="color: var(--linkedin-blue); width: 44px; height: 44px; margin-bottom: 16px;"></i>
                        <p style="color: var(--black); font-size: 0.95rem; font-weight: 500; margin-bottom: 12px; line-height: 1.6;">
                            Si cet email existe dans notre système,<br>
                            <span>un lien de réinitialisation a été envoyé.</span>
                        </p>
                        <p class="password-rules-text" style="font-size: 0.85rem; margin-bottom: 24px;">
                            Pensez à vérifier votre boîte de réception ainsi que vos spams d'ici quelques instants.
                        </p>
                    </div>

                    <button id="btn-back" class="btn-back-login-container">
                        <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
                        Retour à la connexion
                    </button>

                </div>
            </div>
        </div>
    `;

    // ---- Génération et Injection du Champ Email ----
    const emailGroup = InputGroup('email', 'Votre adresse email', 'mail');
    emailGroup.querySelector('input').id = 'reset-email';
    container.querySelector('#email-wrap').appendChild(emailGroup);

    // ---- Injection du Bouton Principal ----
    const sendBtn = ButtonPrimary("Envoyer le lien", "solid", "send");
    sendBtn.classList.add('btn-submit-forgot');
    container.querySelector('#btn-wrap').appendChild(sendBtn);

    // ---- Logique d'Envoi du Formulaire ----
    sendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = container.querySelector('#reset-email').value.trim();
        if (!email) { showToast("Veuillez entrer votre adresse email."); return; }

        const orig = sendBtn.innerHTML;
        sendBtn.disabled = true;
        sendBtn.innerHTML = `<span class="aus-spinner-sm"></span> Envoi…`;

        try {
            await api.post('auth/password/demander-reset/', { email });
            // Transition d'affichage vers l'état succès (sécurité)
            container.querySelector('#login-form').style.display = 'none';
            container.querySelector('.password-rules-text').style.display = 'none';
            container.querySelector('#success-msg').style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } catch {
            // Toujours afficher le même écran pour éviter l'énumération d'emails valides
            container.querySelector('#login-form').style.display = 'none';
            container.querySelector('.password-rules-text').style.display = 'none';
            container.querySelector('#success-msg').style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = orig;
        }
    });

    // ---- Navigation de retour ----
    container.querySelector('#btn-back').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigate) window.navigate('/login');
        else window.location.href = '/login';
    });

    // Initialisation des icônes Lucide
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return container;
};