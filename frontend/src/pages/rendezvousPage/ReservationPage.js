/**
 * ReservationPage.js — MIXO
 * Espace Client — Réservation d'un service
 * URL : /services/:id/reserver
 */
import { Navbar }        from '../../components/navbars/Navbar.js';
import { Footer }        from '../../components/Footer.js';
import { CreneauPicker } from '../../components/rendezvousComponents/CreneauPicker.js';
import { ServiceAPI }    from '../../api/ServiceAPI.js';
import { RendezVousAPI } from '../../api/RendezVousAPI.js';
import { requireRole }   from '../../utils/AuthGuard.js';
import { showToast }     from '../../utils/toast.js';

import '../../styles/rendezvousStyles/RendezVous.css';

export const ReservationPage = ({ id } = {}) => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'rsv-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'rsv-main';
    main.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let picker;

    const charger = async () => {
        try {
            const service = await ServiceAPI.getServiceDetail(id);

            main.innerHTML = `
                <div class="rsv-header">
                    <button class="rsv-back" id="rsv-back" type="button"><i data-lucide="arrow-left"></i></button>
                    <div>
                        <h1>Réserver « ${escapeHtml(service.nom_prestation)} »</h1>
                        <p>Avec ${escapeHtml(service.coiffeur_username)} — ${service.duree_minutes} min — ${service.prix} FC</p>
                    </div>
                </div>

                <div class="rsv-layout">
                    <div id="rsv-picker"></div>
                    <div class="rsv-summary">
                        <h3>Récapitulatif</h3>
                        <div class="rsv-summary-row"><span>Service</span><strong>${escapeHtml(service.nom_prestation)}</strong></div>
                        <div class="rsv-summary-row"><span>Durée</span><strong>${service.duree_minutes} min</strong></div>
                        <div class="rsv-summary-row"><span>Prix</span><strong>${service.prix} FC</strong></div>
                        <div class="rsv-summary-row" id="rsv-summary-date"><span>Créneau</span><strong>Non sélectionné</strong></div>
                        <button class="rsv-btn-confirm" id="rsv-confirm" type="button" disabled>
                            <i data-lucide="calendar-check"></i> Envoyer la demande
                        </button>
                    </div>
                </div>
            `;

            picker = CreneauPicker(service.coiffeur, id, (date, heure) => {
                main.querySelector('#rsv-summary-date strong').textContent =
                    new Date(`${date}T${heure}`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ` à ${heure}`;
                main.querySelector('#rsv-confirm').disabled = false;
            });
            main.querySelector('#rsv-picker').appendChild(picker.element);

            main.querySelector('#rsv-back').addEventListener('click', () => window.navigate?.(`/services/${id}`));
            main.querySelector('#rsv-confirm').addEventListener('click', () => envoyerDemande(service));

            if (window.lucide) window.lucide.createIcons();

        } catch {
            main.innerHTML = `<p class="rvp-empty">Service introuvable.</p>`;
        }
    };

    const envoyerDemande = async (service) => {
        const selection = picker.getSelection();
        if (!selection) { showToast('Veuillez choisir un créneau.'); return; }

        const btn = main.querySelector('#rsv-confirm');
        btn.disabled = true;
        btn.innerHTML = `<span class="cse-spinner"></span> Envoi…`;

        try {
            const dateHeureLocale = `${selection.date}T${selection.heure}:00`;
            await RendezVousAPI.creer(id, dateHeureLocale);
            showToast('✅ Demande envoyée ! Le coiffeur va la confirmer.');
            window.navigate?.('/rendez-vous');
        } catch (e) {
            showToast(`❌ ${e.response?.data?.error || 'Erreur lors de la réservation.'}`);
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="calendar-check"></i> Envoyer la demande`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    charger();
    return page;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
