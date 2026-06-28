/**
 * PaiementPage.js — MIXO
 * Espace Client — Paiement d'un rendez-vous accepté
 * URL : /paiement/:rendezVousId
 */
import { Navbar }                   from '../../components/navbars/Navbar.js';
import { Footer }                   from '../../components/Footer.js';
import { PaiementMethodeSelector }  from '../../components/paiementComponents/PaiementMethodeSelector.js';
import { PaiementStatusCard }       from '../../components/paiementComponents/PaiementStatusCard.js';
import { RendezVousAPI }            from '../../api/RendezVousAPI.js';
import { PaiementAPI }              from '../../api/PaiementAPI.js';
import { requireRole }              from '../../utils/AuthGuard.js';
import { showToast }                from '../../utils/toast.js';

import '../../styles/paiementStyles/Paiement.css';

export const PaiementPage = ({ id } = {}) => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'pap-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'pap-main';
    main.innerHTML = `<div class="pap-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    let selector;

    const charger = async () => {
        try {
            const rdv = await RendezVousAPI.getDetail(id);

            if (rdv.statut !== 'ACCEPTE') {
                main.innerHTML = `
                    <div class="pap-error">
                        <i data-lucide="info"></i>
                        <p>Ce rendez-vous ne peut pas être payé (statut : ${rdv.statut}).</p>
                        <button class="pap-btn-back" onclick="window.navigate('/rendez-vous')" type="button">Retour à mes rendez-vous</button>
                    </div>`;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            if (rdv.est_paye) {
                main.innerHTML = `
                    <div class="pap-success">
                        <i data-lucide="check-circle" style="color:#16A34A;width:52px;height:52px;"></i>
                        <h2>Ce rendez-vous est déjà payé.</h2>
                        <button class="pap-btn-back" onclick="window.navigate('/rendez-vous')" type="button">Mes rendez-vous</button>
                    </div>`;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            const date = new Date(rdv.date_heure_debut).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
            });

            main.innerHTML = `
                <div class="pap-header">
                    <button class="rsv-back" id="pap-back" type="button"><i data-lucide="arrow-left"></i></button>
                    <div>
                        <h1>Paiement</h1>
                        <p>${escapeHtml(rdv.service_nom_snapshot)} — ${date}</p>
                    </div>
                </div>

                <div class="pap-layout">
                    <div class="pap-left">
                        <h3 class="pap-section-title">Choisissez votre méthode de paiement</h3>
                        <div id="pap-methode"></div>

                        <div class="pap-field" id="pap-tel-wrap" style="display:none;">
                            <label>Numéro de téléphone (optionnel)</label>
                            <input type="tel" id="pap-tel" placeholder="ex : +243 812 345 678"/>
                        </div>

                        <button class="pap-btn-pay" id="pap-pay" type="button" disabled>
                            <i data-lucide="lock"></i> Payer ${rdv.service_prix_snapshot} €
                        </button>
                        <p class="pap-secure"><i data-lucide="shield-check"></i> Paiement sécurisé — Mixo ne stocke pas vos coordonnées bancaires.</p>
                    </div>

                    <div class="pap-summary">
                        <h3>Récapitulatif</h3>
                        <div class="pap-sum-row"><span>Service</span><strong>${escapeHtml(rdv.service_nom_snapshot)}</strong></div>
                        <div class="pap-sum-row"><span>Coiffeur</span><strong>${escapeHtml(rdv.coiffeur_username)}</strong></div>
                        <div class="pap-sum-row"><span>Date</span><strong>${date}</strong></div>
                        <div class="pap-sum-row pap-total"><span>Total</span><strong>${rdv.service_prix_snapshot} €</strong></div>
                        <p class="pap-notice"><i data-lucide="info"></i> Le créneau est confirmé. Finalisez le paiement pour valider définitivement votre réservation.</p>
                    </div>
                </div>
            `;

            selector = PaiementMethodeSelector((methode) => {
                main.querySelector('#pap-pay').disabled = !methode;
                main.querySelector('#pap-tel-wrap').style.display = methode ? 'flex' : 'none';
            });
            main.querySelector('#pap-methode').appendChild(selector.element);

            main.querySelector('#pap-back').addEventListener('click', () => window.navigate('/rendez-vous'));
            main.querySelector('#pap-pay').addEventListener('click', () => payer(rdv));

            if (window.lucide) window.lucide.createIcons();

        } catch {
            main.innerHTML = `<p class="pap-empty">Rendez-vous introuvable.</p>`;
        }
    };

    const payer = async (rdv) => {
        const methode = selector.getMethode();
        if (!methode) { showToast('Veuillez choisir une méthode de paiement.'); return; }

        const btn = main.querySelector('#pap-pay');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="cse-spinner"></span> Paiement en cours…`;

        try {
            const tel = main.querySelector('#pap-tel').value.trim();
            const paiement = await PaiementAPI.initier(rdv.id, methode, tel);

            main.innerHTML = `
                <div class="pap-result">
                    <h2>${paiement.statut === 'PAYE' ? '✅ Paiement validé !' : '❌ Paiement échoué'}</h2>
                    <div id="pap-status-card"></div>
                    <button class="pap-btn-back" id="pap-retour" type="button">Mes rendez-vous</button>
                </div>`;
            main.querySelector('#pap-status-card').appendChild(PaiementStatusCard(paiement));
            main.querySelector('#pap-retour').addEventListener('click', () => window.navigate('/rendez-vous'));
            if (window.lucide) window.lucide.createIcons();

        } catch (e) {
            showToast(`❌ ${e.response?.data?.error || 'Erreur lors du paiement.'}`);
            btn.disabled = false;
            btn.innerHTML = orig;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    charger();
    return page;
};

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
