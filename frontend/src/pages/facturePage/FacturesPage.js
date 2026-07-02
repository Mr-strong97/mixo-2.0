/**
 * FacturesPage.js — MIXO
 * Historique des factures
 * URL : /factures ou /factures/:id
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { requireAuth } from '../../utils/AuthGuard.js';
import { PaiementAPI } from '../../api/PaiementAPI.js';

export const FacturesPage = ({ id } = {}) => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'notif-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'notif-main';
    main.innerHTML = `<div class="notif-loader"><div class="spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const selectedId = id ? String(id) : '';

    const charger = async () => {
        try {
            const [factures, factureSelectionnee] = await Promise.all([
                PaiementAPI.getMesFactures(),
                selectedId ? PaiementAPI.getFactureDetail(selectedId).catch(() => null) : Promise.resolve(null),
            ]);

            main.innerHTML = `
                <div class="notif-header">
                    <div>
                        <h1 class="notif-title">
                            <i data-lucide="receipt-text" style="color:#1A56DB; fill:rgba(26,86,219,0.1);"></i>
                            Factures
                        </h1>
                        <p class="notif-subtitle">${factures.length} facture(s) disponible(s)</p>
                    </div>
                    ${factureSelectionnee ? `
                        <button class="notif-btn-all-read" id="facture-back" type="button">
                            <i data-lucide="arrow-left"></i>
                            Retour à la liste
                        </button>` : ''}
                </div>
                <div id="facture-focus"></div>
                <div class="factures-grid" id="factures-grid"></div>
            `;

            if (factureSelectionnee) {
                const focus = main.querySelector('#facture-focus');
                focus.appendChild(renderFactureFocus(factureSelectionnee));
                main.querySelector('#facture-back')?.addEventListener('click', () => window.navigate?.('/factures'));
            }

            const grid = main.querySelector('#factures-grid');
            if (!factures.length) {
                grid.innerHTML = `
                    <div class="notif-empty">
                        <i data-lucide="file-text"></i>
                        <p>Aucune facture pour le moment.</p>
                    </div>`;
            } else {
                factures.forEach((f) => {
                    const card = renderFacture(f);
                    if (selectedId && String(f.id) === selectedId) {
                        card.classList.add('facture-card-selected');
                    }
                    grid.appendChild(card);
                    if (selectedId && String(f.id) === selectedId) {
                        setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
                    }
                });
            }
            if (window.lucide) window.lucide.createIcons();
        } catch (e) {
            main.innerHTML = `<p class="notif-error">Impossible de charger les factures.</p>`;
        }
    };

    const renderFactureFocus = (f) => {
        const wrap = document.createElement('section');
        wrap.className = 'facture-focus';
        const date = f.created_at ? new Date(f.created_at).toLocaleString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        }) : '—';
        wrap.innerHTML = `
            <div class="facture-focus-card">
                <div class="facture-focus-head">
                    <div>
                        <p class="facture-focus-kicker">Facture sélectionnée</p>
                        <h2>${escapeHtml(f.numero_facture || 'Facture')}</h2>
                        <p>${date}</p>
                    </div>
                    <span class="facture-badge">${escapeHtml(f.statut || '—')}</span>
                </div>
                <div class="facture-meta">
                    <div><span>Client</span><strong>${escapeHtml(f.client_username || '—')}</strong></div>
                    <div><span>Coiffeur</span><strong>${escapeHtml(f.coiffeur_username || '—')}</strong></div>
                    <div><span>Service</span><strong>${escapeHtml(f.service_nom || f.service || '—')}</strong></div>
                    <div><span>Montant</span><strong>${escapeHtml(String(f.montant || '—'))} ${escapeHtml(f.devise || 'CDF')}</strong></div>
                    <div><span>Paiement</span><strong>${escapeHtml(f.mode_paiement || '—')}</strong></div>
                </div>
                ${f.preuve_paiement ? `<div class="facture-proof">Preuve: ${escapeHtml(f.preuve_paiement)}</div>` : ''}
            </div>
        `;
        return wrap;
    };

    const renderFacture = (f) => {
        const card = document.createElement('article');
        card.className = 'facture-card';
        const date = f.created_at ? new Date(f.created_at).toLocaleString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        }) : '—';
        card.innerHTML = `
            <div class="facture-head">
                <div>
                    <strong>${f.numero_facture}</strong>
                    <span>${date}</span>
                </div>
                <span class="facture-badge">${f.statut}</span>
            </div>
            <div class="facture-meta">
                <div><span>Client</span><strong>${escapeHtml(f.client_username || '—')}</strong></div>
                <div><span>Coiffeur</span><strong>${escapeHtml(f.coiffeur_username || '—')}</strong></div>
                <div><span>Service</span><strong>${escapeHtml(f.service_nom || f.service || '—')}</strong></div>
                <div><span>Montant</span><strong>${f.montant} ${f.devise || 'CDF'}</strong></div>
                <div><span>Paiement</span><strong>${escapeHtml(f.mode_paiement || '—')}</strong></div>
            </div>
            ${f.preuve_paiement ? `<div class="facture-proof">Preuve: ${escapeHtml(f.preuve_paiement)}</div>` : ''}
        `;
        return card;
    };

    function escapeHtml(str = '') {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    charger();
    return page;
};
