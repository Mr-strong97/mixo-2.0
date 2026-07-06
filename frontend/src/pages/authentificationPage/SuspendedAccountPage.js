/**
 * SuspendedAccountPage.js
 * ========================
 * Page affichée quand un utilisateur est suspendu ou banni.
 * URL : /compte-suspendu
 */
import api, { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { showToast } from '../../utils/toast.js';

export const SuspendedAccountPage = () => {
    const page = document.createElement('div');
    page.className = 'suspended-page';

    page.innerHTML = `
        <div class="suspended-card">
            <div class="suspended-icon">
                <i data-lucide="pause-circle"></i>
            </div>

            <h1 class="suspended-title">Compte en attente de réactivation</h1>

            <div class="suspended-status-box" id="status-box">
                <p class="suspended-desc" id="status-desc">
                    Chargement du statut de votre compte…
                </p>
                <div class="suspended-meta" id="status-meta"></div>
            </div>

            <div class="suspended-form-wrap" id="form-wrap">
                <h2 class="suspended-form-title">Demander la réactivation de mon compte</h2>
                <p class="suspended-form-hint">
                    Expliquez votre situation et ce que vous souhaitez que l'équipe examine.
                </p>
                <textarea
                    id="reactivation-message"
                    class="suspended-textarea"
                    placeholder="Décrivez votre situation…"
                    rows="5"
                    maxlength="1000"
                ></textarea>
                <div class="suspended-char-count">
                    <span id="char-count">0</span>/1000 caractères
                </div>
                <button id="send-request" class="suspended-btn">
                    <i data-lucide="send"></i>
                    Demander la réactivation de mon compte
                </button>
            </div>

            <div class="suspended-success" id="success-wrap" style="display:none;">
                <i data-lucide="check-circle" style="color:var(--success);width:40px;height:40px;"></i>
                <p>
                    Votre demande a été envoyée.<br>
                    <strong>L'équipe Mixo vous répondra dans les meilleurs délais.</strong>
                </p>
            </div>

            <button class="suspended-logout" id="btn-logout">
                <i data-lucide="log-out"></i>
                Se déconnecter
            </button>
        </div>
    `;

    const textarea = page.querySelector('#reactivation-message');
    const charCount = page.querySelector('#char-count');
    const statusDesc = page.querySelector('#status-desc');
    const statusMeta = page.querySelector('#status-meta');

    const formatDate = (value) => value
        ? new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    const renderStatus = (status) => {
        const labels = {
            INACTIF: 'Suspendu',
            BANNI: 'Banni',
        };
        const badgeColors = {
            INACTIF: '#D97706',
            BANNI: '#DC2626',
        };
        const title = labels[status.statut] || 'Compte bloqué';
        statusDesc.textContent = `Votre compte est actuellement ${title.toLowerCase()}.`;
        statusMeta.innerHTML = `
            <div class="suspended-meta-item"><strong>Statut</strong><span style="color:${badgeColors[status.statut] || '#0A66C2'}">${title}</span></div>
            <div class="suspended-meta-item"><strong>Motif</strong><span>${escapeHtml(status.motif_sanction || 'Aucun motif enregistré')}</span></div>
            <div class="suspended-meta-item"><strong>Date</strong><span>${formatDate(status.date_sanction)}</span></div>
            <div class="suspended-meta-item"><strong>Conditions</strong><span>${escapeHtml(status.conditions_reactivation || 'Aucune condition particulière')}</span></div>
        `;

        const canRequest = status.statut === 'INACTIF' || status.statut === 'BANNI';
        page.querySelector('#form-wrap').style.display = canRequest ? 'block' : 'none';
    };

    charCount.textContent = textarea.value.length;
    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });

    page.querySelector('#send-request').addEventListener('click', async (e) => {
        e.preventDefault();
        const message = textarea.value.trim();
        if (!message) {
            showToast("Veuillez écrire un message.");
            return;
        }
        if (message.length < 20) {
            showToast("Votre message doit contenir au moins 20 caractères.");
            return;
        }

        const btn = page.querySelector('#send-request');
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Envoi…`;

        try {
            await api.post('auth/reactivation/demander/', { message });
            page.querySelector('#form-wrap').style.display = 'none';
            page.querySelector('#success-wrap').style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } catch (err) {
            showToast(err.response?.data?.detail || "Erreur lors de l'envoi.");
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="send"></i> Demander la réactivation de mon compte`;
            if (window.lucide) window.lucide.createIcons();
        }
    });

    page.querySelector('#btn-logout').addEventListener('click', () => {
        AuthentificationUtilisateurs.logout();
    });

    const cached = localStorage.getItem('mixo_account_status');
    if (cached) {
        try {
            renderStatus(JSON.parse(cached));
        } catch {
            // Cache illisible, on attend l'API.
        }
    }

    api.get('auth/moi/statut/')
        .then(({ data }) => {
            renderStatus(data);
            localStorage.setItem('mixo_account_status', JSON.stringify(data));
        })
        .catch(() => {
            if (!cached) {
                statusDesc.textContent = "Impossible de charger le détail du statut pour le moment.";
                statusMeta.innerHTML = '';
            }
        });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
