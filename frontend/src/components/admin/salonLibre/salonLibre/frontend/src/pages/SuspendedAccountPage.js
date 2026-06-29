/**
 * SuspendedAccountPage.js
 * ========================
 * Page affichée automatiquement quand un utilisateur suspendu
 * tente de se connecter.
 * URL : /compte-suspendu
 */
import api from '../api/axiosConfig.js';
import { showToast } from '../utils/toast.js';

export const SuspendedAccountPage = () => {
    const page = document.createElement('div');
    page.className = 'suspended-page';

    page.innerHTML = `
        <div class="suspended-card">

            <div class="suspended-icon">
                <i data-lucide="pause-circle"></i>
            </div>

            <h1 class="suspended-title">Compte suspendu</h1>

            <p class="suspended-desc">
                Votre compte a été temporairement suspendu par l'équipe Mixo.
                Vous avez reçu un email contenant le motif de cette décision.
            </p>

            <!-- Formulaire de demande de réactivation -->
            <div class="suspended-form-wrap" id="form-wrap">
                <h2 class="suspended-form-title">Demander une réactivation</h2>
                <p class="suspended-form-hint">
                    Expliquez pourquoi vous pensez que cette suspension est injustifiée.
                    Notre équipe examinera votre demande.
                </p>
                <textarea
                    id="reactivation-message"
                    class="suspended-textarea"
                    placeholder="Votre message à l'équipe Mixo…"
                    rows="5"
                    maxlength="1000"
                ></textarea>
                <div class="suspended-char-count">
                    <span id="char-count">0</span>/1000 caractères
                </div>
                <button id="send-request" class="suspended-btn">
                    <i data-lucide="send"></i>
                    Envoyer la demande
                </button>
            </div>

            <!-- Confirmation -->
            <div class="suspended-success" id="success-wrap" style="display:none;">
                <i data-lucide="check-circle" style="color:var(--success);width:40px;height:40px;"></i>
                <p>
                    Votre demande a été envoyée.<br>
                    <strong>L'équipe Mixo vous répondra sous 24-48h.</strong>
                </p>
            </div>

            <!-- Déconnexion -->
            <button class="suspended-logout" id="btn-logout">
                <i data-lucide="log-out"></i>
                Se déconnecter
            </button>
        </div>
    `;

    // Compteur de caractères
    const textarea  = page.querySelector('#reactivation-message');
    const charCount = page.querySelector('#char-count');
    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });

    // Envoi de la demande
    page.querySelector('#send-request').addEventListener('click', async (e) => {
        e.preventDefault();
        const message = textarea.value.trim();
        if (!message) { showToast("Veuillez écrire un message."); return; }
        if (message.length < 20) { showToast("Votre message doit contenir au moins 20 caractères."); return; }

        const btn = page.querySelector('#send-request');
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Envoi…`;

        try {
            await api.post('auth/reactivation/demander/', { message });
            page.querySelector('#form-wrap').style.display    = 'none';
            page.querySelector('#success-wrap').style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } catch (err) {
            showToast(err.response?.data?.detail || "Erreur lors de l'envoi.");
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="send"></i> Envoyer la demande`;
            if (window.lucide) window.lucide.createIcons();
        }
    });

    // Déconnexion
    page.querySelector('#btn-logout').addEventListener('click', () => {
        ['access_token','refresh_token','user_id','user_role','username']
            .forEach(k => localStorage.removeItem(k));
        if (window.navigate) window.navigate('/login');
        else window.location.href = '/login';
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};