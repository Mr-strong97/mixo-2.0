/**
 * ForgotPasswordPage.js — MIXO
 * Design : split screen, image cheveux, formulaire épuré
 */
import { showToast } from '../../utils/toast.js';
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';

export const ForgotPasswordPage = () => {
    const page = document.createElement('div');
    page.className = 'auth-page';

    page.innerHTML = `
        <!-- Colonne gauche -->
        <div class="auth-left" style="background:url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000') center/cover no-repeat;">
            <div class="auth-brand-badge">Mixo</div>
            <div class="auth-glass-card">
                <h2>Mot de passe<br><span>Oublié ?</span></h2>
            </div>
        </div>

        <!-- Colonne droite -->
        <div class="auth-right">
            <div class="auth-form-wrapper">

                <!-- Formulaire (masqué après envoi) -->
                <div id="form-zone">
                    <h1 class="auth-title" style="text-align:center;margin-bottom:10px;">Réinitialiser</h1>
                    <p class="auth-subtitle">
                        Entrez votre adresse email. Vous recevrez un lien unique
                        pour choisir un nouveau mot de passe sécurisé.
                    </p>

                    <div class="auth-field">
                        <div class="auth-field-icon-wrap">
                            <i data-lucide="mail" class="auth-field-icon"></i>
                            <input id="inp-email" type="email" class="auth-input"
                                   placeholder="Votre adresse email" autocomplete="email"/>
                        </div>
                    </div>

                    <button class="auth-btn-primary" id="btn-send">
                        <i data-lucide="send"></i>
                        Envoyer le lien
                    </button>
                    <button class="auth-btn-secondary" id="btn-back">
                        <i data-lucide="arrow-left"></i>
                        Retour à la connexion
                    </button>
                </div>

                <!-- Succès (masqué par défaut) -->
                <div id="success-zone" style="display:none;">
                    <div class="auth-success-box">
                        <i data-lucide="mail-check"></i>
                        <p>
                            Si cet email existe dans notre système,<br>
                            <span>un lien de réinitialisation a été envoyé.</span>
                        </p>
                        <p class="auth-hint">
                            Pensez à vérifier votre boîte de réception ainsi que vos spams.
                        </p>
                        <button class="auth-btn-secondary" id="btn-back-2" style="max-width:280px;">
                            <i data-lucide="arrow-left"></i>
                            Retour à la connexion
                        </button>
                    </div>
                </div>

                <p class="auth-footer-text">© 2026 Mixo Professional Services. All rights reserved.</p>
            </div>
        </div>
    `;

    const showSuccess = () => {
        page.querySelector('#form-zone').style.display    = 'none';
        page.querySelector('#success-zone').style.display = 'block';
        if (window.lucide) window.lucide.createIcons();
    };

    page.querySelector('#btn-send').addEventListener('click', async (e) => {
        e.preventDefault();
        const email = page.querySelector('#inp-email').value.trim();
        if (!email) { showToast("Entrez votre adresse email."); return; }

        const btn = page.querySelector('#btn-send');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Envoi…`;

        try {
            await AuthentificationUtilisateurs.forgotPassword(email);
            showSuccess();
        } catch (error) {
            showToast(
                error?.message
                    || error?.response?.data?.detail
                    || "Impossible d'envoyer le lien de réinitialisation pour le moment."
            );
        } finally {
            btn.disabled = false;
            btn.innerHTML = orig;
        }
    });

    const goLogin = () => { if (window.navigate) window.navigate('/login'); else window.location.href = '/login'; };
    page.querySelector('#btn-back').addEventListener('click', goLogin);
    page.querySelector('#inp-email').addEventListener('keydown', e => { if (e.key === 'Enter') page.querySelector('#btn-send').click(); });

    // Bouton retour dans la zone succès (créé dynamiquement)
    page.querySelector('#success-zone').addEventListener('click', e => {
        if (e.target.closest('#btn-back-2')) goLogin();
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};
