/**
 * ResetPasswordPage.js
 * ======================
 * Page de confirmation de réinitialisation de mot de passe.
 * URL : /reset-password?token=xxxxx
 * Emplacement : src/pages/ResetPasswordPage.js
 */
import { InputGroup }    from '../components/InputGroup.js';
import { ButtonPrimary } from '../components/ButtonPrimary.js';
import { showToast }     from '../utils/toast.js';
import api               from '../api/axiosConfig.js';

export const ResetPasswordPage = () => {
    const container = document.createElement('div');
    container.className = 'container-fluid vh-100 p-0 d-flex align-items-center';

    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token) {
        container.innerHTML = `
            <div style="width:100%;text-align:center;color:rgba(255,255,255,0.6);padding:60px 20px;">
                <p>Lien invalide. <a href="/forgot-password" style="color:#C4A66A;">Demandez un nouveau lien</a>.</p>
            </div>`;
        return container;
    }

    container.innerHTML = `
        <div class="row w-100 m-0 h-100">
            <div class="col-md-6 d-none d-md-flex align-items-center justify-content-center"
                 style="background:url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000') center/cover;">
                <div class="glass-overlay" style="backdrop-filter:blur(10px);background:rgba(0,0,0,0.4);padding:40px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);">
                    <h2 class="h3 text-center fw-light text-white">NOUVEAU<br>
                    <span class="fw-bold" style="color:#C4A66A;">MOT DE PASSE</span></h2>
                </div>
            </div>
            <div class="col-md-6 col-12 d-flex flex-column align-items-center justify-content-center p-5"
                 style="background-color:#0a0a0a;">
                <h2 class="display-6 fw-bold mb-4 text-uppercase text-white" style="letter-spacing:5px;">
                    Nouveau mot de passe
                </h2>
                <p class="mb-4 text-center" style="color:rgba(255,255,255,0.4);font-size:0.78rem;max-width:360px;">
                    8 à 128 caractères · majuscule · minuscule · chiffre · symbole (@$!%*?&-_#)
                </p>
                <div id="fields-wrap" class="w-100 d-flex flex-column align-items-center" style="max-width:400px;gap:12px;"></div>
                <div id="btn-wrap" class="w-100 d-flex justify-content-center mt-3" style="max-width:400px;"></div>
                <div id="success-msg" style="display:none;text-align:center;padding:20px;">
                    <i data-lucide="check-circle" style="color:#27ae60;width:40px;height:40px;margin-bottom:12px;"></i>
                    <p style="color:rgba(255,255,255,0.7);font-size:0.88rem;">
                        Mot de passe réinitialisé !<br>
                        <strong style="color:#C4A66A;">Vous pouvez vous connecter.</strong>
                    </p>
                    <button id="goto-login" style="margin-top:16px;background:rgba(196,166,106,0.12);border:1px solid rgba(196,166,106,0.35);color:#C4A66A;padding:10px 24px;border-radius:12px;cursor:pointer;font-family:'Montserrat',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:2px;">
                        SE CONNECTER
                    </button>
                </div>
            </div>
        </div>
    `;

    const fieldsWrap = container.querySelector('#fields-wrap');

    const passGroup    = InputGroup('password', 'Nouveau mot de passe', 'lock');
    passGroup.querySelector('input').id = 'new-password';

    const confirmGroup = InputGroup('password', 'Confirmer le mot de passe', 'check-circle');
    confirmGroup.querySelector('input').id = 'confirm-password';

    fieldsWrap.append(passGroup, confirmGroup);

    const saveBtn = ButtonPrimary("Réinitialiser", "solid", "save");
    container.querySelector('#btn-wrap').appendChild(saveBtn);

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const mdp     = container.querySelector('#new-password').value;
        const confirm = container.querySelector('#confirm-password').value;

        if (!mdp || !confirm) { showToast("Remplissez les deux champs."); return; }
        if (mdp !== confirm)  { showToast("Les mots de passe ne correspondent pas."); return; }
        if (mdp.length < 8)   { showToast("Minimum 8 caractères."); return; }

        const orig = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="aus-spinner-sm"></span> Sauvegarde…`;

        try {
            await api.post('auth/password/confirmer-reset/', {
                token: token,
                nouveau_mot_de_passe: mdp,
            });
            container.querySelector('#fields-wrap').style.display = 'none';
            container.querySelector('#btn-wrap').style.display    = 'none';
            container.querySelector('#success-msg').style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } catch (err) {
            const msg = err.response?.data?.detail || "Lien expiré. Demandez un nouveau lien.";
            showToast(`❌ ${msg}`);
            saveBtn.disabled = false;
            saveBtn.innerHTML = orig;
        }
    });

    container.querySelector('#success-msg')?.querySelector('#goto-login')
        ?.addEventListener('click', () => {
            if (window.navigate) window.navigate('/login');
            else window.location.href = '/login';
        });

    // Bouton œil sur les champs password
    [passGroup, confirmGroup].forEach(group => {
        const wrapper = group.querySelector('.input-wrapper') || group;
        wrapper.style.position = 'relative';
        const eye = document.createElement('i');
        eye.className = 'fa-solid fa-eye';
        eye.style.cssText = 'position:absolute;right:15px;top:50%;transform:translateY(-50%);cursor:pointer;color:rgba(255,255,255,0.4);z-index:10;';
        eye.addEventListener('click', () => {
            const input = group.querySelector('input');
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            eye.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            eye.style.color = isPass ? '#c4a66a' : 'rgba(255,255,255,0.4)';
        });
        wrapper.appendChild(eye);
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return container;
};