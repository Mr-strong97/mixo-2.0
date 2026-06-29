/**
 * VerifyEmailPage.js
 * ====================
 * Page appelée quand l'utilisateur clique sur le lien dans son email.
 * URL : /verify-email?token=xxxxx
 * Emplacement : src/pages/VerifyEmailPage.js
 */
import api from '../api/axiosConfig.js';

export const VerifyEmailPage = () => {
    const page = document.createElement('div');
    page.className = 'verify-page';

    page.innerHTML = `
        <div class="verify-card" id="verify-card">
            <div class="verify-spinner">
                <div class="aus-spinner"></div>
            </div>
            <p class="verify-text">Vérification en cours…</p>
        </div>
    `;

    const card = page.querySelector('#verify-card');

    const showResult = (success, message) => {
        card.innerHTML = `
            <div class="verify-icon ${success ? 'verify-success' : 'verify-error'}">
                <i data-lucide="${success ? 'check-circle' : 'x-circle'}"></i>
            </div>
            <h2 class="verify-title">${success ? 'Email vérifié !' : 'Lien invalide'}</h2>
            <p class="verify-msg">${message}</p>
            <button class="verify-btn" id="verify-goto">
                ${success ? 'Se connecter' : 'Retour à l\'accueil'}
            </button>
        `;
        page.querySelector('#verify-goto').addEventListener('click', () => {
            if (window.navigate) window.navigate(success ? '/login' : '/');
            else window.location.href = success ? '/login' : '/';
        });
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    };

    // Récupère le token depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token) {
        showResult(false, "Aucun token trouvé dans le lien. Demandez un nouveau lien de vérification.");
        return page;
    }

    // Appel API
    api.post('auth/email/verifier/', { token })
        .then(res => {
            showResult(true, `Votre email est maintenant vérifié, @${res.data.username} ! Vous pouvez vous connecter.`);
        })
        .catch(err => {
            const msg = err.response?.data?.detail || "Lien expiré ou déjà utilisé. Reconnectez-vous pour recevoir un nouveau lien.";
            showResult(false, msg);
        });

    return page;
};