/**
 * HistoriquePage.js — MIXO
 * Espace Client — Historique d'activités
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { HistoriqueAPI } from '../../api/HistoriqueAPI.js';
import { requireRole } from '../../utils/AuthGuard.js';

import '../../styles/historiqueStyles/HistoriquePage.css';

const TYPES = [
    { value: '', label: 'Tout' },
    { value: 'rdv', label: 'Rendez-vous' },
    { value: 'paiement', label: 'Paiements' },
    { value: 'avis', label: 'Avis' },
];

const STATUTS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ACCEPTE', label: 'Accepté' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' },
    { value: 'REFUSE', label: 'Refusé' },
    { value: 'PAYE', label: 'Payé' },
];

export const HistoriquePage = () => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'his-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'his-main';
    main.innerHTML = `
        <section class="his-hero">
            <div>
                <p class="his-kicker">Historique client</p>
                <h1>Tout ce que vous avez fait sur la plateforme</h1>
                <p>Rendez-vous, paiements et avis publiés, regroupés dans une vue claire et filtrable.</p>
            </div>
            <div class="his-stats" id="his-stats"></div>
        </section>

        <section class="his-filters">
            <div class="his-filter">
                <label>Recherche</label>
                <div class="his-input-wrap"><i data-lucide="search"></i><input id="his-search" type="search" placeholder="Service, coiffeur, transaction…"></div>
            </div>
            <div class="his-filter">
                <label>Date</label>
                <input id="his-date" type="date">
            </div>
            <div class="his-filter">
                <label>Type</label>
                <select id="his-type"></select>
            </div>
            <div class="his-filter">
                <label>Statut</label>
                <select id="his-statut"></select>
            </div>
        </section>

        <section id="his-list" class="his-list">
            <div class="his-loader"><div class="mxo-spinner"></div></div>
        </section>
    `;
    page.appendChild(main);
    page.appendChild(Footer());

    const state = { search: '', date: '', type: '', statut: '' };

    const buildSelect = (el, items) => {
        el.innerHTML = items.map(i => `<option value="${i.value}">${i.label}</option>`).join('');
    };

    buildSelect(main.querySelector('#his-type'), TYPES);
    buildSelect(main.querySelector('#his-statut'), STATUTS);

    const renderStats = (stats = {}) => {
        const el = main.querySelector('#his-stats');
        el.innerHTML = `
            <div class="his-stat"><span>Rendez-vous</span><strong>${stats.rdv ?? 0}</strong></div>
            <div class="his-stat"><span>Paiements</span><strong>${stats.paiements ?? 0}</strong></div>
            <div class="his-stat"><span>Avis</span><strong>${stats.avis ?? 0}</strong></div>
        `;
    };

    const renderList = (items = []) => {
        const el = main.querySelector('#his-list');
        if (!items.length) {
            el.innerHTML = `
                <div class="his-empty">
                    <i data-lucide="inbox"></i>
                    <h2>Aucune activité trouvée</h2>
                    <p>Affinez vos filtres ou revenez plus tard.</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        el.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('article');
            card.className = `his-card his-${item.type.toLowerCase()}`;
            const meta = item.type === 'PAIEMENT'
                ? `Montant payé : ${formatPrix(item.montant)} €`
                : item.type === 'AVIS'
                    ? `Note : ${item.note}/5`
                    : `Statut : ${labelStatut(item.statut)}`;

            card.innerHTML = `
                <div class="his-card-icon">
                    <i data-lucide="${iconFor(item.type)}"></i>
                </div>
                <div class="his-card-body">
                    <div class="his-card-top">
                        <div>
                            <h2>${escapeHtml(item.titre)}</h2>
                            <p>${escapeHtml(item.sous_titre || item.service || '')}</p>
                        </div>
                        <span class="his-card-date">${formatDate(item.date)}</span>
                    </div>
                    <div class="his-card-meta">${escapeHtml(meta)}</div>
                    ${item.commentaire ? `<p class="his-comment">"${escapeHtml(item.commentaire)}"</p>` : ''}
                    ${item.reponse ? `<p class="his-reply"><strong>Réponse :</strong> ${escapeHtml(item.reponse)}</p>` : ''}
                    <div class="his-card-actions">
                        ${item.lien ? `<button class="btn btn-outline-primary btn-sm" type="button" data-link="${escapeHtml(item.lien)}">Voir</button>` : ''}
                    </div>
                </div>
            `;

            card.querySelector('[data-link]')?.addEventListener('click', (e) => {
                const link = e.currentTarget.getAttribute('data-link');
                if (window.navigate) window.navigate(link);
                else window.location.href = link;
            });

            el.appendChild(card);
        });
        if (window.lucide) window.lucide.createIcons();
    };

    const charger = async () => {
        main.querySelector('#his-list').innerHTML = `<div class="his-loader"><div class="mxo-spinner"></div></div>`;
        try {
            const data = await HistoriqueAPI.getMesActivites(state);
            renderStats(data.stats);
            renderList(data.resultats || []);
        } catch (error) {
            main.querySelector('#his-list').innerHTML = `
                <div class="his-empty">
                    <i data-lucide="alert-triangle"></i>
                    <h2>Impossible de charger l’historique</h2>
                    <p>${error.response?.data?.detail || 'Réessayez plus tard.'}</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    let typingTimer = null;
    const refresh = () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(charger, 250);
    };

    main.querySelector('#his-search').addEventListener('input', (e) => { state.search = e.target.value; refresh(); });
    main.querySelector('#his-date').addEventListener('change', (e) => { state.date = e.target.value; charger(); });
    main.querySelector('#his-type').addEventListener('change', (e) => { state.type = e.target.value; charger(); });
    main.querySelector('#his-statut').addEventListener('change', (e) => { state.statut = e.target.value; charger(); });

    charger();
    return page;
};

function iconFor(type) {
    if (type === 'PAIEMENT') return 'wallet';
    if (type === 'AVIS') return 'star';
    return 'calendar-days';
}

function labelStatut(statut = '') {
    return statut ? statut.replaceAll('_', ' ').toLowerCase() : '—';
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPrix(prix) {
    const n = parseFloat(prix);
    if (Number.isNaN(n)) return '0';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

