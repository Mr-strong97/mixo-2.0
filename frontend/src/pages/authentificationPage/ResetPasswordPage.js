/**
 * ResetPasswordPage.js — MIXO
 * Design : split screen, salon sombre, formulaire épuré
 * URL : /reset-password?token=xxxxx
 */
import { showToast } from '../../utils/toast.js';
import api from '../../api/axiosConfig.js';

export const ResetPasswordPage = () => {
    const page = document.createElement('div');
    page.className = 'auth-page';

    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token) {
        page.innerHTML = `
            <div class="auth-right" style="flex:1;text-align:center;padding:60px 20px;">
                <i data-lucide="alert-triangle" style="color:#EF4444;width:48px;height:48px;"></i>
                <h2 style="color:#1A1D20;margin:16px 0 8px;">Lien invalide</h2>
                <p style="color:#62676B;">Ce lien de réinitialisation est invalide ou a expiré.</p>
                <button class="auth-btn-primary" id="btn-retry" style="max-width:260px;margin:20px auto 0;">
                    <i data-lucide="refresh-cw"></i> Demander un nouveau lien
                </button>
            </div>`;
        page.querySelector('#btn-retry')?.addEventListener('click', () => { if (window.navigate) window.navigate('/forgot-password'); });
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
        return page;
    }

    page.innerHTML = `
        <!-- Colonne gauche -->
        <div class="auth-left" style="background:url('/public/images/mixo4.png') center/cover no-repeat;">
            <div class="auth-glass-card" style="background:rgba(0,0,0,0.45);border-color:rgba(255,255,255,0.1);margin-top:20px;">
                <h2 style="color:#fff;">Nouveau<br><span style="color:#0A66C2;">Mot de passe</span></h2>
            </div>
        </div>

        <!-- Colonne droite -->
        <div class="auth-right">
            <div class="auth-form-wrapper">

                <!-- Zone formulaire -->
                <div id="form-zone">
                    <p class="auth-brand-small">Mixo</p>
                    <h1 class="auth-title" style="margin-bottom:6px;">Nouveau mot de passe</h1>
                    <p class="auth-subtitle" style="text-align:left;margin-bottom:18px;">
                        Veuillez saisir votre nouveau mot de passe sécurisé.
                    </p>

                    <!-- Règles -->
                    <div class="auth-rules-box">
                        8 à 128 caractères · majuscule · minuscule · chiffre · symbole (@$!%*?&-_#)
                    </div>

                    <!-- Nouveau MDP -->
                    <div class="auth-field">
                        <label for="inp-new">
                            <i data-lucide="lock" style="width:14px;height:14px;vertical-align:middle;color:#0A66C2;"></i>
                            Nouveau mot de passe
                        </label>
                        <div class="auth-field-icon-wrap">
                            <input id="inp-new" type="password" class="auth-input"
                                   placeholder="••••••••••••" style="padding-left:14px;"/>
                            <button class="auth-eye-btn" id="eye-new" type="button">
                                <i data-lucide="eye" id="icon-new"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Confirmer MDP -->
                    <div class="auth-field">
                        <label for="inp-confirm">
                            <i data-lucide="shield-check" style="width:14px;height:14px;vertical-align:middle;color:#0A66C2;"></i>
                            Confirmer le mot de passe
                        </label>
                        <div class="auth-field-icon-wrap">
                            <input id="inp-confirm" type="password" class="auth-input"
                                   placeholder="••••••••••••" style="padding-left:14px;"/>
                        </div>
                    </div>

                    <button class="auth-btn-primary" id="btn-reset">
                        <i data-lucide="refresh-cw"></i>
                        Réinitialiser
                    </button>

                    <button class="auth-btn-link" id="btn-back" style="margin-top:16px;display:flex;align-items:center;gap:6px;">
                        <i data-lucide="arrow-left" style="width:15px;height:15px;"></i>
                        Retour à la connexion
                    </button>
                </div>

                <!-- Succès -->
                <div id="success-zone" style="display:none;">
                    <div class="auth-success-box">
                        <i data-lucide="check-circle" style="color:#10B981;width:48px;height:48px;"></i>
                        <p>Mot de passe réinitialisé avec succès !</p>
                        <p class="auth-hint">Vous pouvez maintenant vous connecter.</p>
                        <button class="auth-btn-primary" id="btn-login" style="max-width:260px;margin-top:8px;">
                            <i data-lucide="log-in"></i> Se connecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Eye toggle
    const newInp = page.querySelector('#inp-new');
    page.querySelector('#eye-new').addEventListener('click', () => {
        const h = newInp.type === 'password';
        newInp.type = h ? 'text' : 'password';
        page.querySelector('#icon-new').setAttribute('data-lucide', h ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
    });

    // Réinitialiser
    page.querySelector('#btn-reset').addEventListener('click', async (e) => {
        e.preventDefault();
        const mdp     = page.querySelector('#inp-new').value;
        const confirm = page.querySelector('#inp-confirm').value;
        if (!mdp || !confirm)   { showToast("Remplissez les deux champs."); return; }
        if (mdp !== confirm)    { showToast("Les mots de passe ne correspondent pas."); return; }
        if (mdp.length < 8)    { showToast("Minimum 8 caractères requis."); return; }

        const btn = page.querySelector('#btn-reset');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Enregistrement…`;

        try {
            await api.post('auth/password/confirmer-reset/', { token, nouveau_mot_de_passe: mdp });
            page.querySelector('#form-zone').style.display    = 'none';
            page.querySelector('#success-zone').style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } catch (err) {
            showToast(err.response?.data?.detail || "Lien expiré. Demandez un nouveau lien.");
            btn.disabled = false; btn.innerHTML = orig;
        }
    });

    page.querySelector('#btn-back').addEventListener('click', () => { if (window.navigate) window.navigate('/login'); });
    page.querySelector('#success-zone').addEventListener('click', e => {
        if (e.target.closest('#btn-login')) { if (window.navigate) window.navigate('/login'); }
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};