/**
 * ClientRendezVousPage.js — MIXO
 * Espace Client — Mes rendez-vous
 * URL : /rendez-vous
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { RendezVousCard } from '../../components/rendezvousComponents/RendezVousCard.js';
import { RendezVousAPI } from '../../api/RendezVousAPI.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';
import { attachLiveRefresh } from '../../utils/liveRefresh.js';

import '../../styles/rendezvousStyles/RendezVous.css';

const FILTRES = [
    { val: '', label: 'Tous' },
    { val: 'EN_ATTENTE', label: 'En attente' },
    { val: 'ACCEPTE', label: 'Acceptés' },
    { val: 'REFUSE', label: 'Refusés' },
    { val: 'ANNULE', label: 'Annulés' },
    { val: 'TERMINE', label: 'Terminés' },
];

export const ClientRendezVousPage = ({ id } = {}) => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'rvp-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'rvp-main';
    main.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;
    page.appendChild(main);
    page.appendChild(Footer());

    const state = {
        search: '',
        statut: '',
        rdvs: [],
        loading: true,
        error: '',
    };
    const selectedId = id ? String(id) : '';

    const renderShell = () => {
        main.innerHTML = `
            <section class="rvp-hero">
                <div class="rvp-hero-copy">
                    <p class="rvp-kicker">Espace client</p>
                    <h1>Mes rendez-vous</h1>
                    <p>Consultez, filtrez et suivez tous vos rendez-vous en un seul endroit.</p>
                </div>
                <div class="rvp-summary" id="rvp-summary"></div>
            </section>

            <section id="rvp-focus"></section>

            <section class="rvp-toolbar">
                <div class="rvp-search">
                    <label for="rvp-search">Recherche</label>
                    <div class="rvp-search-box">
                        <i data-lucide="search"></i>
                        <input id="rvp-search" type="search" placeholder="Service, coiffeur, paiement, statut…">
                    </div>
                </div>
                <div class="rvp-toolbar-filters" id="rvp-filters"></div>
            </section>

            <section id="rvp-list" class="rvp-list">
                <div class="rvp-loader"><div class="mxo-spinner"></div></div>
            </section>
        `;

        const searchInput = main.querySelector('#rvp-search');
        searchInput.value = state.search;
        searchInput.addEventListener('input', (e) => {
            state.search = e.target.value;
            renderContent();
        });

        const filtersEl = main.querySelector('#rvp-filters');
        FILTRES.forEach((f) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `rvp-filter-btn ${f.val === state.statut ? 'rvp-filter-active' : ''}`;
            btn.textContent = f.label;
            btn.addEventListener('click', () => {
                state.statut = f.val;
                renderShell();
                renderContent();
            });
            filtersEl.appendChild(btn);
        });

        if (window.lucide) window.lucide.createIcons();
    };

    const filteredRdvs = () => {
        const needle = state.search.trim().toLowerCase();
        return state.rdvs.filter((rdv) => {
            const matchesStatut = !state.statut || rdv.statut === state.statut;
            if (!matchesStatut) return false;

            if (!needle) return true;

            const haystack = [
                rdv.service_nom_snapshot,
                rdv.coiffeur_username,
                rdv.statut_label,
                rdv.mode_paiement_label,
                rdv.statut_paiement_label,
                rdv.service_prix_snapshot,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(needle);
        });
    };

    const renderSummary = () => {
        const el = main.querySelector('#rvp-summary');
        if (!el) return;

        const counts = FILTRES.reduce((acc, f) => {
            acc[f.val || 'ALL'] = f.val
                ? state.rdvs.filter((rdv) => rdv.statut === f.val).length
                : state.rdvs.length;
            return acc;
        }, {});

        el.innerHTML = `
            <div class="rvp-summary-card">
                <span>Total</span>
                <strong>${counts.ALL || 0}</strong>
            </div>
            <div class="rvp-summary-card">
                <span>En attente</span>
                <strong>${counts.EN_ATTENTE || 0}</strong>
            </div>
            <div class="rvp-summary-card">
                <span>Acceptés</span>
                <strong>${counts.ACCEPTE || 0}</strong>
            </div>
            <div class="rvp-summary-card">
                <span>Refusés</span>
                <strong>${counts.REFUSE || 0}</strong>
            </div>
            <div class="rvp-summary-card">
                <span>Annulés</span>
                <strong>${counts.ANNULE || 0}</strong>
            </div>
            <div class="rvp-summary-card">
                <span>Terminés</span>
                <strong>${counts.TERMINE || 0}</strong>
            </div>
        `;
    };

    const renderFocus = () => {
        const host = main.querySelector('#rvp-focus');
        if (!host) return;

        if (!selectedId) {
            host.innerHTML = '';
            return;
        }

        const rdv = state.rdvs.find((item) => String(item.id) === selectedId);
        if (!rdv) {
            host.innerHTML = `
                <div class="rvp-empty-state" style="margin:0 0 24px;">
                    <i data-lucide="calendar-search"></i>
                    <h2>Rendez-vous introuvable</h2>
                    <p>La notification pointe vers un rendez-vous qui n'est plus disponible dans cette liste.</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const date = new Date(rdv.date_heure_debut).toLocaleString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        });

        host.innerHTML = `
            <section class="rvp-focus-card" style="margin-bottom:24px;padding:24px;border:1px solid #DBE6F3;border-radius:24px;background:#fff;box-shadow:0 18px 40px rgba(15,23,42,0.06);">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                    <div>
                        <p class="rvp-kicker">Rendez-vous sélectionné</p>
                        <h2 style="margin:6px 0 8px;font-size:1.4rem;">${escapeHtml(rdv.service_nom_snapshot)}</h2>
                        <p style="margin:0;color:#475569;">Avec ${escapeHtml(rdv.coiffeur_username || '—')}</p>
                    </div>
                    <span class="rvc-completed-label" style="margin-top:0;">${escapeHtml(rdv.statut_label || rdv.statut || '—')}</span>
                </div>
                <div class="rvp-summary" style="margin-top:18px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
                    <div class="rvp-summary-card"><span>Date</span><strong>${date}</strong></div>
                    <div class="rvp-summary-card"><span>Service</span><strong>${escapeHtml(rdv.service_nom_snapshot || '—')}</strong></div>
                    <div class="rvp-summary-card"><span>Paiement</span><strong>${escapeHtml(rdv.mode_paiement_label || rdv.statut_paiement_label || '—')}</strong></div>
                    <div class="rvp-summary-card"><span>Montant</span><strong>${escapeHtml(String(rdv.service_prix_snapshot || '—'))} CDF</strong></div>
                </div>
            </section>
        `;
    };

    const renderContent = () => {
        const list = main.querySelector('#rvp-list');
        if (!list) return;

        renderSummary();

        if (state.loading) {
            list.innerHTML = `<div class="rvp-loader"><div class="mxo-spinner"></div></div>`;
            return;
        }

        if (state.error) {
            list.innerHTML = `<p class="rvp-empty">${state.error}</p>`;
            return;
        }

        const rdvs = filteredRdvs();
        if (!rdvs.length) {
            list.innerHTML = `
                <div class="rvp-empty-state">
                    <i data-lucide="calendar-x"></i>
                    <h2>Aucun rendez-vous trouvé</h2>
                    <p>Essayez un autre filtre ou une autre recherche.</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        list.innerHTML = '';
        rdvs.forEach((rdv) => {
            const card = RendezVousCard(rdv, {
                onAnnuler: (r) => confirmerAnnulation(r),
                onPayer: (r) => window.navigate?.(`/paiement/${r.id}`),
                onLaisserAvis: (r) => window.navigate?.(`/avis/laisser/${r.id}`),
            });

            if (selectedId && String(rdv.id) === selectedId) {
                card.classList.add('rvc-card-selected');
                setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
            }

            list.appendChild(card);
        });
    };

    const load = async () => {
        state.loading = true;
        state.error = '';
        renderContent();

        try {
            state.rdvs = await RendezVousAPI.getMesDemandes();
        } catch {
            state.error = 'Erreur de chargement. Réessayez dans quelques instants.';
            state.rdvs = [];
        } finally {
            state.loading = false;
            renderFocus();
            renderContent();
        }
    };

    const confirmerAnnulation = (rdv) => {
        if (!window.confirm('Annuler ce rendez-vous ?')) return;
        RendezVousAPI.annuler(rdv.id)
            .then(() => {
                showToast('✅ Rendez-vous annulé.');
                load();
            })
            .catch((e) => showToast(`❌ ${e.response?.data?.error || 'Erreur.'}`));
    };

    renderShell();
    attachLiveRefresh(load, { intervalMs: 12000 });
    return page;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
