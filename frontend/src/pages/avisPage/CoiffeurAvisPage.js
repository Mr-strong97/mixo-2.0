/**
 * CoiffeurAvisPage.js — MIXO
 * Espace Coiffeur — Avis Clients
 * URL : /coiffeur/avis
 */
import { Navbar }         from '../../components/navbars/Navbar.js';
import { Footer }         from '../../components/Footer.js';
import { AvisCard }       from '../../components/avisComponents/AvisCard.js';
import { RatingStarsBar } from '../../components/avisComponents/RatingStarsBar.js';
import { AvisAPI }        from '../../api/AvisAPI.js';
import { requireRole }    from '../../utils/AuthGuard.js';
import { showToast }      from '../../utils/toast.js';
import { attachLiveRefresh } from '../../utils/liveRefresh.js';

import '../../styles/avisStyles/Avis.css';

export const CoiffeurAvisPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'avp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'avp-main';
    main.innerHTML = `<div class="avp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const charger = async () => {
        try {
            const { stats, avis } = await AvisAPI.getMesAvisRecus();

            main.innerHTML = `
                <div class="avp-header">
                    <h1>Avis Clients</h1>
                    <p>Consultez les retours de vos clients et répondez à leurs commentaires.</p>
                </div>
                <div id="avp-stats"></div>
                <div class="avp-list" id="avp-list"></div>
            `;

            main.querySelector('#avp-stats').appendChild(RatingStarsBar(stats));

            const list = main.querySelector('#avp-list');
            if (!avis.length) {
                list.innerHTML = `<p class="avp-empty">Vous n'avez pas encore reçu d'avis.</p>`;
            } else {
                avis.forEach(a => list.appendChild(AvisCard(a, {
                    onRepondre: async (avisId, texte) => {
                        await AvisAPI.repondre(avisId, texte);
                        showToast('✅ Réponse envoyée.');
                        charger();
                    },
                    onSignaler: async (avisId) => {
                        await AvisAPI.signaler(avisId);
                        showToast('🚩 Avis signalé pour modération.');
                        charger();
                    },
                })));
            }

            if (window.lucide) window.lucide.createIcons();

        } catch {
            main.innerHTML = `<p class="avp-empty">Erreur de chargement des avis.</p>`;
        }
    };

    attachLiveRefresh(charger, { intervalMs: 15000 });
    return page;
};
