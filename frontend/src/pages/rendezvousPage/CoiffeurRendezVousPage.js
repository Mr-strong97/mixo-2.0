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
import { confirmDialog }       from '../../utils/confirmDialog.js';
import { attachLiveRefresh }   from '../../utils/liveRefresh.js';

import '../../styles/rendezvousStyles/RendezVous.css';

const FILTRES = [
    { val: '', label: 'Tous' },
    { val: 'EN_ATTENTE', label: 'En attente' },
    { val: 'ACCEPTE', label: 'Acceptés' },
    { val: 'TERMINE', label: 'Terminés' },
];

export const CoiffeurRendezVousPage = ({ id } = {}) => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'rvp-page rvp-coiffeur-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'rvp-main';
    main.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const selectedId = id ? String(id) : '';
    let activeFiltre = selectedId ? '' : 'EN_ATTENTE';

    const render = () => {
        main.innerHTML = `
            <div class="rvp-header rvp-coiffeur-header">
                <h1>Mes rendez-vous</h1>
                <p>Gérez les demandes de réservation de vos clients.</p>
            </div>
            <div id="rvp-focus"></div>
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
            renderFocus(rdvs);
            if (!rdvs.length) {
                list.innerHTML = `<p class="rvp-empty">Aucun rendez-vous pour ce filtre.</p>`;
                return;
            }
            list.innerHTML = '';
            rdvs.forEach(rdv => {
                const card = RendezVousRequestCard(rdv, {
                    onAccepter: (r) => agir(RendezVousAPI.accepter, r, '✅ Rendez-vous accepté.'),
                    onRefuser:  (r) => agir(RendezVousAPI.refuser, r, '⏸ Rendez-vous refusé.'),
                    onTerminer: (r) => agir(RendezVousAPI.terminer, r, '✅ Rendez-vous marqué terminé.'),
                    onAnnuler:  (r) => confirmerAnnulation(r),
                });

                if (selectedId && String(rdv.id) === selectedId) {
                    card.classList.add('rvc-card-selected');
                    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
                }

                list.appendChild(card);
            });
        } catch {
            list.innerHTML = `<p class="rvp-empty">Erreur de chargement.</p>`;
        }
    };

    const renderFocus = (rdvs = []) => {
        const host = main.querySelector('#rvp-focus');
        if (!host) return;
        if (!selectedId) {
            host.innerHTML = '';
            return;
        }

        const rdv = rdvs.find((item) => String(item.id) === selectedId);
        if (!rdv) {
            host.innerHTML = `
                <div class="rvp-empty" style="margin:0 0 20px;">
                    Le rendez-vous lié à cette notification n'est pas visible dans le filtre actuel.
                </div>`;
            return;
        }

        const date = new Date(rdv.date_heure_debut).toLocaleString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        });
        host.innerHTML = `
            <section class="rvp-focus-card" style="margin:0 0 20px;padding:20px;border:1px solid #DBE6F3;border-radius:20px;background:#fff;">
                <p class="rvp-kicker">Rendez-vous sélectionné</p>
                <h2 style="margin:6px 0 8px;">${escapeHtml(rdv.service_nom_snapshot)}</h2>
                <p style="margin:0 0 14px;color:#475569;">Client : ${escapeHtml(rdv.client_username || '—')}</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
                    <div class="rvp-summary-card"><span>Date</span><strong>${date}</strong></div>
                    <div class="rvp-summary-card"><span>Statut</span><strong>${escapeHtml(rdv.statut_label || rdv.statut || '—')}</strong></div>
                    <div class="rvp-summary-card"><span>Paiement</span><strong>${escapeHtml(rdv.mode_paiement_label || rdv.statut_paiement_label || '—')}</strong></div>
                    <div class="rvp-summary-card"><span>Montant</span><strong>${escapeHtml(String(rdv.service_prix_snapshot || '—'))} CDF</strong></div>
                </div>
            </section>
        `;
    };

    const agir = (apiFn, rdv, successMsg) => {
        apiFn(rdv.id)
            .then(() => { showToast(successMsg); charger(); })
            .catch(e => showToast(`❌ ${e.response?.data?.error || 'Erreur.'}`));
    };

    const confirmerAnnulation = async (rdv) => {
        const ok = await confirmDialog(
            'Annuler ce rendez-vous ?',
            'Le client sera informé de l’annulation. Vérifiez bien avant de confirmer cette action.',
            { confirmText: 'Annuler', cancelText: 'Retour' }
        );

        if (!ok) return;

        agir(RendezVousAPI.annuler, rdv, 'Rendez-vous annulé avec succès.');
    };

    attachLiveRefresh(charger, { intervalMs: 12000 });
    return page;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
