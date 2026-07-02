/**
 * LaisserAvisPage.js — MIXO
 * Page dédiée d'avis après rendez-vous terminé.
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { RendezVousAPI } from '../../api/RendezVousAPI.js';
import { AvisAPI } from '../../api/AvisAPI.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';

import '../../styles/avisStyles/LaisserAvisPage.css';

export const LaisserAvisPage = ({ id } = {}) => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'lap-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'lap-main';
    main.innerHTML = `<div class="lap-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let note = 5;
    let existingAvis = null;

    const render = (rdv) => {
        const isEditing = !!existingAvis;

        if (rdv.a_un_avis && !isEditing) {
            main.innerHTML = `
                <div class="lap-empty">
                    <i data-lucide="star"></i>
                    <h2>Avis déjà publié</h2>
                    <p>Ce rendez-vous a déjà reçu votre avis. Merci pour votre retour.</p>
                    <button class="btn btn-primary" id="lap-back" type="button">Retour à mes rendez-vous</button>
                </div>
            `;
            main.querySelector('#lap-back')?.addEventListener('click', () => window.navigate?.('/rendez-vous'));
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        main.innerHTML = `
            <section class="lap-card">
                <div class="lap-header">
                    <p class="lap-kicker">Demande d’avis</p>
                    <h1>${isEditing ? 'Modifier votre avis' : 'Votre rendez-vous est terminé'}</h1>
                    <p>${isEditing ? 'Vous pouvez ajuster votre note et votre commentaire.' : 'Prenez quelques secondes pour partager votre retour. C’est optionnel, mais très utile pour améliorer les prestations.'}</p>
                </div>

                <div class="lap-summary">
                    <div><span>Service</span><strong>${escapeHtml(rdv.service_nom_snapshot || '—')}</strong></div>
                    <div><span>Coiffeur</span><strong>${escapeHtml(rdv.coiffeur_username || rdv.coiffeur?.username || '—')}</strong></div>
                    <div><span>Date</span><strong>${formatDate(rdv.date_heure_debut)}</strong></div>
                </div>

                <div class="lap-rating">
                    <label>Votre note</label>
                    <div class="lap-stars" id="lap-stars"></div>
                </div>

                <div class="lap-comment">
                    <label for="lap-comment">Commentaire</label>
                    <textarea id="lap-comment" rows="4" placeholder="Dites-nous ce que vous avez pensé du service…"></textarea>
                </div>

                <div class="lap-actions">
                    <button class="btn btn-outline-secondary" id="lap-skip" type="button">Ignorer</button>
                    <button class="btn btn-primary" id="lap-submit" type="button">${isEditing ? 'Mettre à jour l’avis' : 'Publier l’avis'}</button>
                </div>
            </section>
        `;

        const starsEl = main.querySelector('#lap-stars');
        const renderStars = () => {
            starsEl.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `lap-star ${i <= note ? 'lap-star-active' : ''}`;
                btn.innerHTML = `<i data-lucide="star"></i>`;
                btn.addEventListener('click', () => {
                    note = i;
                    renderStars();
                });
                starsEl.appendChild(btn);
            }
            if (window.lucide) window.lucide.createIcons();
        };

        renderStars();
        if (existingAvis?.commentaire) {
            main.querySelector('#lap-comment').value = existingAvis.commentaire;
        }

        main.querySelector('#lap-skip').addEventListener('click', () => {
            showToast('La demande d’avis a été ignorée.', 'info');
            window.navigate?.('/rendez-vous');
        });

        main.querySelector('#lap-submit').addEventListener('click', async () => {
            const commentaire = main.querySelector('#lap-comment').value.trim();
            try {
                const payload = { rendez_vous: id, note, commentaire };
                if (isEditing && existingAvis?.id) {
                    await AvisAPI.modifierAvis(existingAvis.id, payload);
                    showToast('⭐ Votre avis a été mis à jour.');
                } else {
                    await AvisAPI.creerAvis(payload);
                    showToast('⭐ Merci pour votre avis !');
                }
                window.navigate?.('/rendez-vous');
            } catch (error) {
                showToast(error.response?.data?.error || error.response?.data?.detail || 'Impossible de publier cet avis.', 'error');
            }
        });
    };

    const charger = async () => {
        try {
            const [rdv, avis] = await Promise.all([
                RendezVousAPI.getDetail(id),
                AvisAPI.getMesAvis().catch(() => []),
            ]);
            existingAvis = Array.isArray(avis) ? avis.find((a) => String(a.rendez_vous) === String(id)) || null : null;
            note = existingAvis?.note || 5;
            render(rdv);
        } catch (error) {
            main.innerHTML = `
                <div class="lap-empty">
                    <i data-lucide="alert-triangle"></i>
                    <h2>Impossible de charger ce rendez-vous</h2>
                    <p>${error.response?.data?.detail || 'Le rendez-vous est introuvable ou n’est plus accessible.'}</p>
                    <button class="btn btn-primary" id="lap-back" type="button">Retour</button>
                </div>`;
            main.querySelector('#lap-back')?.addEventListener('click', () => window.navigate?.('/rendez-vous'));
            if (window.lucide) window.lucide.createIcons();
        }
    };

    charger();
    return page;
};

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
