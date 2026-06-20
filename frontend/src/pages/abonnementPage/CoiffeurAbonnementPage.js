/**
 * CoiffeurAbonnementPage.js — MIXO
 * Espace Coiffeur — Mon abonnement
 * URL : /coiffeur/abonnement
 */
import { Navbar }   from '../../components/navbars/Navbar.js';
import { Footer }   from '../../components/Footer.js';
import { PlanCard } from '../../components/abonnementComponents/PlanCard.js';
import { TrialBanner } from '../../components/abonnementComponents/TrialBanner.js';
import { AbonnementAPI } from '../../api/AbonnementAPI.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';

import '../../styles/abonnementStyles/Abonnements.css';

export const CoiffeurAbonnementPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'abp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'abp-main';
    main.innerHTML = `<div class="abp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const charger = async () => {
        try {
            const [statut, plans] = await Promise.all([
                AbonnementAPI.getMonStatut(),
                AbonnementAPI.getPlans(),
            ]);

            main.innerHTML = `
                <div class="abp-header">
                    <h1>Mon abonnement</h1>
                    <p>Choisissez le plan qui correspond à votre activité.</p>
                </div>
                <div id="abp-banner"></div>
                <div class="abp-status-card">
                    <div>
                        <span class="abp-status-label">Statut actuel</span>
                        <strong>${statut.a_abonnement ? (statut.periode_essai ? 'Essai gratuit' : (statut.plan_nom || 'Abonné')) : 'Aucun abonnement actif'}</strong>
                    </div>
                    ${statut.a_abonnement && !statut.expire ? `
                        <div class="abp-status-detail">
                            <span>${statut.jours_restants} jour${statut.jours_restants > 1 ? 's' : ''} restant${statut.jours_restants > 1 ? 's' : ''}</span>
                        </div>` : ''}
                </div>
                <div class="abp-plans-grid" id="abp-plans"></div>
            `;

            const bannerEl = TrialBanner(statut, () => {
                main.querySelector('#abp-plans')?.scrollIntoView({ behavior: 'smooth' });
            });
            if (bannerEl) main.querySelector('#abp-banner').appendChild(bannerEl);

            const grid = main.querySelector('#abp-plans');
            plans
                .filter(p => p.plan !== 'ESSAI')
                .forEach(plan => {
                    const isCurrent = !statut.periode_essai && statut.plan === plan.plan;
                    grid.appendChild(PlanCard(plan, isCurrent, souscrire));
                });

            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            main.innerHTML = `<div class="abp-error"><i data-lucide="alert-triangle"></i><p>Erreur de chargement de l'abonnement.</p></div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    const souscrire = async (planId) => {
        try {
            await AbonnementAPI.souscrire(planId);
            showToast('✅ Abonnement souscrit avec succès !');
            charger();
        } catch (e) {
            showToast(`❌ ${e.response?.data?.error || e.message || 'Erreur lors de la souscription.'}`);
        }
    };

    charger();
    return page;
};
