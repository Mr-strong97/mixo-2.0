/**
 * ClientRendezVousPage.js — MIXO
 * Espace Client — Mes rendez-vous
 * URL : /rendez-vous
 */
import { Navbar }          from '../../components/navbars/Navbar.js';
import { Footer }          from '../../components/Footer.js';
import { RendezVousCard }  from '../../components/rendezvousComponents/RendezVousCard.js';
import { LaisserAvisModal } from '../../components/avisComponents/LaisserAvisModal.js';
import { RendezVousAPI }   from '../../api/RendezVousAPI.js';
import { AvisAPI }         from '../../api/AvisAPI.js';
import { requireRole }     from '../../utils/AuthGuard.js';
import { showToast }       from '../../utils/toast.js';

import '../../styles/rendezvousStyles/RendezVous.css';

const FILTRES = [
    { val: '', label: 'Tous' },
    { val: 'EN_ATTENTE', label: 'En attente' },
    { val: 'ACCEPTE', label: 'Acceptés' },
    { val: 'TERMINE', label: 'Terminés' },
];

export const ClientRendezVousPage = () => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'rvp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'rvp-main';
    main.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let activeFiltre = '';

    const render = () => {
        main.innerHTML = `
            <div class="rvp-header">
                <h1>Mes rendez-vous</h1>
                <p>Suivez vos demandes de réservation.</p>
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
            const rdvs = await RendezVousAPI.getMesDemandes(activeFiltre);
            if (!rdvs.length) {
                list.innerHTML = `<p class="rvp-empty">Aucun rendez-vous pour ce filtre.</p>`;
                return;
            }
            list.innerHTML = '';
            rdvs.forEach(rdv => {
                list.appendChild(RendezVousCard(rdv, {
                    onAnnuler: (r) => confirmerAnnulation(r),
                    onPayer:   (r) => window.navigate?.(`/paiement/${r.id}`),
                    onLaisserAvis: (r) => ouvrirModalAvis(r),
                }));
            });
        } catch {
            list.innerHTML = `<p class="rvp-empty">Erreur de chargement.</p>`;
        }
    };

    const confirmerAnnulation = (rdv) => {
        if (!window.confirm('Annuler ce rendez-vous ?')) return;
        RendezVousAPI.annuler(rdv.id)
            .then(() => { showToast('✅ Rendez-vous annulé.'); charger(); })
            .catch(e => showToast(`❌ ${e.response?.data?.error || 'Erreur.'}`));
    };

    const ouvrirModalAvis = (rdv) => {
        document.body.appendChild(LaisserAvisModal(rdv, async (payload) => {
            await AvisAPI.creerAvis(payload);
            showToast('⭐ Merci pour votre avis !');
            charger();
        }, () => {}));
    };

    charger();
    return page;
};
