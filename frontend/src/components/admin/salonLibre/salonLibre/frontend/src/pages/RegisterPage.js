/**
 * RegisterPage.js
 * ================
 * CHANGEMENTS :
 * - Intégration de l'icône de bascule d'œil avec Lucide (Bleu & Épuré)
 * - Résolution des problèmes de débordement sur Mobile pour le bouton Retour
 * - requireGuest() : redirige /home si déjà connecté.
 * - Hint règles mot de passe visible sous les champs.
 * - Message post-inscription différent selon le rôle :
 * CLIENT   → compte activé, redirection vers /login.
 * COIFFEUR → compte EN_ATTENTE, message d'attente explicite.
 * - Gestion d'erreurs champ par champ (retournées par Django).
 */

import { InputGroup }    from '../components/InputGroup.js';
import { ButtonPrimary } from '../components/ButtonPrimary.js';
import { AuthentificationUtilisateurs } from '../api/axiosConfig.js';
import { showToast }     from '../utils/toast.js';
import { requireGuest }  from '../utils/AuthGuard.js';

export const RegisterPage = () => {

    // Déjà connecté → retour à l'accueil
    if (!requireGuest()) return document.createElement('div');

    const container = document.createElement('div');
    container.className = 'container-fluid vh-100 p-0 d-flex align-items-center';

    container.innerHTML = `
    <div class="d-flex flex-wrap flex-md-nowrap w-100 m-0 h-100 welcome-container">
        
        <div class="col-md-6 col-12 d-none d-md-flex align-items-center justify-content-center bg-image-section-register">
            <div class="glass-overlay-register">
                <h2 class="register-tagline">
                    Rejoignez <br>
                    <span class="highlight-brand">l'aventure.</span>
                </h2>
            </div>
        </div>

        <div class="col-md-6 col-12 d-flex flex-column align-items-center justify-content-center p-5 bg-form-section">
            <div class="form-content-wrapper text-center">
                
                <h2 class="register-title">Inscription</h2>

                <form id="register-form" class="w-100 d-flex flex-column align-items-center">
                    <div id="inputs-container" class="w-100 d-flex flex-column align-items-center"></div>

                    <div class="w-100 mb-3 px-1 text-start password-rules-container">
                        <p class="password-rules-text">
                            Le mot de passe doit contenir : 8 à 128 caractères, au moins une majuscule, une minuscule, un chiffre et un symbole (@$!%*?&-_#).
                        </p>
                    </div>

                    <div class="input-group-custom mb-4 w-100 p-0">
                        <select id="role-select" class="register-select w-100">
                            <option value="" disabled selected>VOUS ÊTES ?</option>
                            <option value="CLIENT">UN CLIENT</option>
                            <option value="COIFFEUR">UN COIFFEUR</option>
                        </select>
                    </div>

                    <div id="submit-btn-container" class="w-100 d-flex justify-content-center"></div>
                </form>

                <div id="coiffeur-info" class="d-none mt-3 p-3 info-box">
                    <i data-lucide="info" class="info-icon"></i>
                    <span class="info-text">
                        Les comptes coiffeurs sont vérifiés par notre équipe avant activation.
                    </span>
                </div>

                <a href="/" id="btn-back-home" class="btn-back-link mt-4">
                    <i data-lucide="arrow-left" style="width: 18px; height: 18px; margin-right: 10px; display: inline-block; vertical-align: middle;"></i>
                    <span>Retour à l'accueil</span>
                </a>
                
            </div>
        </div>
    </div>
`;

    // ---------------------------------------------------------------- //
    // INJECTION DES CHAMPS (INPUTS)
    // ---------------------------------------------------------------- //
    const inputsBox = container.querySelector('#inputs-container');

    const nameGroup = InputGroup('text', "Nom d'utilisateur", 'user');
    nameGroup.querySelector('input').id = 'reg-username';

    const emailGroup = InputGroup('email', 'Email', 'mail');
    emailGroup.querySelector('input').id = 'reg-email';

    const passGroup = InputGroup('password', 'Mot de passe', 'lock');
    const passInput = passGroup.querySelector('input');
    passInput.id = 'reg-password';
    passInput.classList.add('password-field'); // Classe CSS pour le padding-right de l'œil

    const confirmGroup = InputGroup('password', 'Confirmer le mot de passe', 'check-circle');
    const confirmInput = confirmGroup.querySelector('input');
    confirmInput.id = 'reg-confirm';
    confirmInput.classList.add('password-field'); // Classe CSS pour le padding-right de l'œil

    // Algorithme et Bouton œil (Lucide Épuré)
    [passGroup, confirmGroup].forEach(group => {
        const wrapper = group.querySelector('.input-wrapper') || group;
        wrapper.style.position = 'relative';
        
        // Création du bouton conteneur pour l'œil
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn-toggle-password';
        
        // Injection de la balise Lucide de base
        toggleBtn.innerHTML = `<i data-lucide="eye" class="eye-icon"></i>`;
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = group.querySelector('input');
            const icon = toggleBtn.querySelector('i');
            const isPass = input.type === 'password';
            
            input.type = isPass ? 'text' : 'password';
            icon.setAttribute('data-lucide', 'eye');
            
            // Changement d'état dynamique de l'icône
            if (isPass) {
                icon.setAttribute('data-lucide', 'eye-off');
                icon.style.color = '#0A66C2'; // Devient bleu quand le texte est visible
            } else {
                icon.setAttribute('data-lucide', 'eye');
                icon.style.color = '#A0A5A8'; // Reprend sa couleur neutre grise
            }
            
            // Rafraîchir Lucide uniquement pour ce bouton réinterprété
            if (window.lucide) window.lucide.createIcons();
        });
        
        wrapper.appendChild(toggleBtn);
    });

    inputsBox.append(nameGroup, emailGroup, passGroup, confirmGroup);

    const submitBtn = ButtonPrimary("Créer mon compte", "solid", "user-plus");
    container.querySelector('#submit-btn-container').appendChild(submitBtn);

    // Initialisation globale de Lucide au chargement initial
    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
    }, 0);

    // ---------------------------------------------------------------- //
    // Info coiffeur visible dès que le rôle est sélectionné
    // ---------------------------------------------------------------- //
    const roleSelect   = container.querySelector('#role-select');
    const coiffeurInfo = container.querySelector('#coiffeur-info');

    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'COIFFEUR') {
            coiffeurInfo.classList.remove('d-none');
            if (window.lucide) window.lucide.createIcons();
        } else {
            coiffeurInfo.classList.add('d-none');
        }
    });

    // ---------------------------------------------------------------- //
    // SOUMISSION
    // ---------------------------------------------------------------- //
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const username = container.querySelector('#reg-username').value.trim();
        const email    = container.querySelector('#reg-email').value.trim();
        const password = container.querySelector('#reg-password').value;
        const confirm  = container.querySelector('#reg-confirm').value;
        const role     = container.querySelector('#role-select').value;

        // Validations front
        if (!username || !email || !password || !role) {
            showToast("Veuillez remplir tous les champs obligatoires."); return;
        }
        if (password !== confirm) {
            showToast("Les mots de passe ne correspondent pas !"); return;
        }
        if (password.length < 8) {
            showToast("Le mot de passe doit contenir au moins 8 caractères."); return;
        }

        const originalHTML = submitBtn.innerHTML;

        try {
            submitBtn.disabled      = true;
            submitBtn.style.opacity = "0.7";
            submitBtn.innerHTML     = `
                <span class="spinner-border spinner-border-sm me-2"></span>
                Création du compte...
            `;

            await AuthentificationUtilisateurs.register({ username, email, password, role });

            if (role === 'COIFFEUR') {
                showToast(
                    "Compte créé ! Notre équipe va vérifier votre profil (24-48h)."
                );
            } else {
                showToast("Bienvenue chez Mixo ! Votre compte est prêt.");
            }

            setTimeout(() => {
                if (window.navigate) window.navigate('/login');
                else window.location.href = '/login';
            }, 2500);

        } catch (error) {
            console.error("ERREUR INSCRIPTION :", error);

            let message = "Erreur lors de l'inscription.";
            if (typeof error === 'object' && error !== null) {
                message = Object.values(error).flat()[0] || message;
            } else if (typeof error === 'string') {
                message = error;
            }

            showToast(message);
            submitBtn.disabled      = false;
            submitBtn.style.opacity = "1";
            submitBtn.innerHTML     = originalHTML;
        }
    });

    container.querySelector('#btn-back-home').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigate) window.navigate('/welcome');
        else window.location.href = '/welcome';
    });

    return container;
};