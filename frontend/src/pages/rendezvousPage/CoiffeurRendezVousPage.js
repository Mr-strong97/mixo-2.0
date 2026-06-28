/**
 * CoiffeurRendezVousPage.js — MIXO
 * Espace Coiffeur — Mes rendez-vous
 * URL : /coiffeur/rendez-vous
 */
import { Navbar }              from '../../components/navbars/Navbar.js';
import { Footer }              from '../../components/Footer.js';
import { RendezVousRequestCard } from '../../components/rendezvousComponents/RendezVousRequestCard.js';
import { RendezVousAPI }       from '../../api/RendezVousAPI.js';
import { requireRole }         from '../../utils/AuthGuard.js';
import { showToast }           from '../../utils/toast.js';

import '../../styles/rendezvousStyles/RendezVous.css';

const FILTRES = [
    { val: '', label: 'Tous' },
    { val: 'EN_ATTENTE', label: 'En attente' },
    { val: 'ACCEPTE', label: 'Acceptés' },
    { val: 'TERMINE', label: 'Terminés' },
];

export const CoiffeurRendezVousPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'rvp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'rvp-main';
    main.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let activeFiltre = 'EN_ATTENTE';

    const render = () => {
        main.innerHTML = `
            <div class="rvp-header">
                <h1>Mes rendez-vous</h1>
                <p>Gérez les demandes de réservation de vos clients.</p>
            </div>
            <div class="rvp-filters" id="rvp-filters"></div>
            <div id="rvp-list" class="rvp-list"></div>
        `;

        const filtersEl = main.querySelector('#rvp-filters');
        FILTRES.forEach(f => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `rvp-filter-btn ${f.val === activeFiltre ? 'rvp-filter-active' : ''}`;
            btn.textContent = f.label;
            btn.addEventListener('click', () => { activeFiltre = f.val; charger(); });
            filtersEl.appendChild(btn);
        });
    };

    const charger = async () => {
        render();
        const list = main.querySelector('#rvp-list');
        list.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;

        try {
            const rdvs = await RendezVousAPI.getMesRendezVous(activeFiltre);
            if (!rdvs.length) {
                list.innerHTML = `<p class="rvp-empty">Aucun rendez-vous pour ce filtre.</p>`;
                return;
            }
            list.innerHTML = '';
            rdvs.forEach(rdv => {
                list.appendChild(RendezVousRequestCard(rdv, {
                    onAccepter: (r) => agir(RendezVousAPI.accepter, r, '✅ Rendez-vous accepté.'),
                    onRefuser:  (r) => agir(RendezVousAPI.refuser, r, '⏸ Rendez-vous refusé.'),
                    onTerminer: (r) => agir(RendezVousAPI.terminer, r, '✅ Rendez-vous marqué terminé.'),
                    onAnnuler:  (r) => { if (window.confirm('Annuler ce rendez-vous ?')) agir(RendezVousAPI.annuler, r, '✅ Rendez-vous annulé.'); },
                }));
            });
        } catch {
            list.innerHTML = `<p class="rvp-empty">Erreur de chargement.</p>`;
        }
    };

    const agir = (apiFn, rdv, successMsg) => {
        apiFn(rdv.id)
            .then(() => { showToast(successMsg); charger(); })
            .catch(e => showToast(`❌ ${e.response?.data?.error || 'Erreur.'}`));
    };

    charger();
    return page;
};
