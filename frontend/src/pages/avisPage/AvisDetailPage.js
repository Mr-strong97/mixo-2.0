/**
 * AvisDetailPage.js — MIXO
 * Détail d'un avis depuis une notification.
 * URL : /avis/:id ou /coiffeur/avis/:id
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { AvisAPI } from '../../api/AvisAPI.js';
import { RendezVousAPI } from '../../api/RendezVousAPI.js';
import { requireAuth } from '../../utils/AuthGuard.js';

export const AvisDetailPage = ({ id } = {}) => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'lap-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'lap-main';
    main.innerHTML = `<div class="lap-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const role = (localStorage.getItem('user_role') || '').toLowerCase();
    const selectedId = id ? String(id) : '';

    const load = async () => {
        try {
            const avisList = role === 'coiffeur'
                ? await AvisAPI.getMesAvisRecus()
                : await AvisAPI.getMesAvis();

            const avis = Array.isArray(avisList)
                ? avisList.find((item) => String(item.id) === selectedId)
                : null;

            if (!avis) {
                main.innerHTML = `
                    <div class="lap-empty">
                        <i data-lucide="search-x"></i>
                        <h2>Avis introuvable</h2>
                        <p>Cet avis n'est pas disponible depuis votre compte.</p>
                        <button class="btn btn-primary" id="lap-back" type="button">Retour</button>
                    </div>`;
                main.querySelector('#lap-back')?.addEventListener('click', () => {
                    window.navigate?.(role === 'coiffeur' ? '/coiffeur/avis' : '/rendez-vous');
                });
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            const rdv = await RendezVousAPI.getDetail(avis.rendez_vous);
            const dateAvis = avis.created_at ? new Date(avis.created_at).toLocaleString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            }) : '—';
            const dateRdv = rdv?.date_heure_debut ? new Date(rdv.date_heure_debut).toLocaleString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            }) : '—';

            main.innerHTML = `
                <section class="lap-card">
                    <div class="lap-header">
                        <h1>${role === 'coiffeur' ? 'Avis reçu' : 'Votre avis'}</h1>
                        <p>Voici le détail complet de l'avis lié à ce rendez-vous.</p>
                    </div>

                    <div class="lap-summary">
                        <div><span>Service</span><strong>${escapeHtml(rdv.service_nom_snapshot || avis.service_nom || '—')}</strong></div>
                        <div><span>Coiffeur</span><strong>${escapeHtml(rdv.coiffeur_username || '—')}</strong></div>
                        <div><span>Date du rendez-vous</span><strong>${dateRdv}</strong></div>
                        <div><span>Date de l'avis</span><strong>${dateAvis}</strong></div>
                    </div>

                    <div class="lap-rating">
                        <label>Note attribuée</label>
                        <div class="lap-stars" aria-label="Note de ${avis.note} sur 5">
                            ${Array.from({ length: 5 }, (_, i) => `
                                <i data-lucide="star" style="color:${i < avis.note ? '#F59E0B' : '#CBD5E1'};fill:${i < avis.note ? '#F59E0B' : 'transparent'};width:22px;height:22px;"></i>
                            `).join('')}
                        </div>
                    </div>

                    <div class="lap-comment">
                        <label>Commentaire</label>
                        <div class="lap-note-box">${escapeHtml(avis.commentaire || 'Aucun commentaire.')}</div>
                    </div>

                    ${avis.reponse_coiffeur ? `
                        <div class="lap-comment">
                            <label>Réponse du coiffeur</label>
                            <div class="lap-note-box">${escapeHtml(avis.reponse_coiffeur)}</div>
                        </div>
                    ` : ''}

                    <div class="lap-actions">
                        <button class="btn btn-outline-secondary" id="lap-back" type="button">Retour</button>
                    </div>
                </section>
            `;

            main.querySelector('#lap-back')?.addEventListener('click', () => {
                window.navigate?.(role === 'coiffeur' ? '/coiffeur/avis' : '/rendez-vous');
            });
            if (window.lucide) window.lucide.createIcons();
        } catch (error) {
            main.innerHTML = `
                <div class="lap-empty">
                    <i data-lucide="alert-triangle"></i>
                    <h2>Impossible de charger cet avis</h2>
                    <p>${error.response?.data?.detail || 'Une erreur est survenue lors du chargement.'}</p>
                    <button class="btn btn-primary" id="lap-back" type="button">Retour</button>
                </div>`;
            main.querySelector('#lap-back')?.addEventListener('click', () => {
                window.navigate?.(role === 'coiffeur' ? '/coiffeur/avis' : '/rendez-vous');
            });
            if (window.lucide) window.lucide.createIcons();
        }
    };

    load();
    return page;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
