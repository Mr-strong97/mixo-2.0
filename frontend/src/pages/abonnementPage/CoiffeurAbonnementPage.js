/**
 * CoiffeurAbonnementPage.js — MIXO
 * Espace Coiffeur — Version 1 gratuite
 * URL : /coiffeur/abonnement
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { requireRole } from '../../utils/AuthGuard.js';

import '../../styles/abonnementStyles/Abonnements.css';

export const CoiffeurAbonnementPage = () => {
    if (!requireRole('coiffeur')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'abp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'abp-main';
    main.innerHTML = `
        <div class="abp-header">
            <h1>Version 1 gratuite</h1>
            <p>Mixo est actuellement accessible sans abonnement pour tous les coiffeurs.</p>
        </div>
        <div class="abp-status-card" style="align-items:flex-start;gap:16px;flex-direction:column;">
            <div>
                <span class="abp-status-label">Statut</span>
                <strong>Accès gratuit</strong>
            </div>
            <p style="margin:0;color:#334155;line-height:1.7;">
                Les abonnements sont retirés de la Version 1 et pourront être réintroduits plus tard dans une future version.
            </p>
        </div>
    `;
    page.appendChild(main);
    page.appendChild(Footer());
    return page;
};
