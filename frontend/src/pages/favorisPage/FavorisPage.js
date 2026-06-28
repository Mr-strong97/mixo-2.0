/**
 * FavorisPage.js — MIXO
 * Espace Client — Mes favoris
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { Footer } from '../../components/Footer.js';
import { FavorisAPI } from '../../api/FavorisAPI.js';
import { requireRole } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';

import '../../styles/favorisStyles/FavorisPage.css';

export const FavorisPage = () => {
    if (!requireRole('client')) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'fav-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'fav-main';
    main.innerHTML = `
        <section class="fav-hero">
            <div>
                <p class="fav-kicker">Mes sélections</p>
                <h1>Les services que j’aime garder sous la main</h1>
                <p>Retrouvez rapidement vos prestations préférées, comparez les tarifs et réservez en un clic.</p>
            </div>
            <div class="fav-hero-pill">
                <i data-lucide="heart"></i>
                <span id="fav-count">0 favoris</span>
            </div>
        </section>

        <section class="fav-toolbar">
            <div class="fav-search">
                <i data-lucide="search"></i>
                <input type="search" id="fav-search" placeholder="Rechercher un service, un coiffeur, une catégorie…">
            </div>
            <button class="fav-refresh" id="fav-refresh" type="button">
                <i data-lucide="refresh-cw"></i>
                Actualiser
            </button>
        </section>

        <section id="fav-list" class="fav-grid">
            <div class="fav-loader"><div class="mxo-spinner"></div></div>
        </section>
    `;
    page.appendChild(main);
    page.appendChild(Footer());

    let favoris = [];
    let filtre = '';

    const render = () => {
        const list = main.querySelector('#fav-list');
        const data = favoris.filter(item => {
            if (!filtre) return true;
            const service = item.service_detail || {};
            const haystack = [
                service.nom_prestation,
                service.coiffeur_username,
                service.categorie_nom,
                service.ville,
            ].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(filtre.toLowerCase());
        });

        main.querySelector('#fav-count').textContent = `${favoris.length} favori${favoris.length > 1 ? 's' : ''}`;

        if (!data.length) {
            list.innerHTML = `
                <div class="fav-empty">
                    <i data-lucide="heart-off"></i>
                    <h2>Aucun favori pour l’instant</h2>
                    <p>Ajoutez des services depuis le catalogue pour les retrouver ici.</p>
                    <button class="btn btn-primary" id="fav-go-services" type="button">Explorer les services</button>
                </div>`;
            list.querySelector('#fav-go-services')?.addEventListener('click', () => window.navigate?.('/services'));
            if (window.lucide) window.lucide.createIcons();
            dispatchCount();
            return;
        }

        list.innerHTML = '';
        data.forEach(favori => {
            const service = favori.service_detail || {};
            const card = document.createElement('article');
            card.className = 'fav-card';
            card.innerHTML = `
                <div class="fav-card-media">
                    ${service.image
                        ? `<img src="${service.image}" alt="${escapeHtml(service.nom_prestation || '')}">`
                        : `<div class="fav-card-placeholder"><i data-lucide="scissors"></i></div>`
                    }
                    <span class="fav-card-category">${escapeHtml(service.categorie_nom || 'Service')}</span>
                    <button class="fav-remove" type="button" title="Retirer des favoris">
                        <i data-lucide="heart-off"></i>
                    </button>
                </div>
                <div class="fav-card-body">
                    <div class="fav-card-head">
                        <h2>${escapeHtml(service.nom_prestation || 'Service')}</h2>
                        <span class="fav-card-price">${formatPrix(service.prix)}€</span>
                    </div>
                    <div class="fav-card-meta">
                        <span><i data-lucide="user-round"></i> ${escapeHtml(service.coiffeur_username || '—')}</span>
                        <span><i data-lucide="clock"></i> ${service.duree_minutes || '—'} min</span>
                        <span><i data-lucide="map-pin"></i> ${escapeHtml(service.ville || '—')}</span>
                    </div>
                    <p class="fav-card-desc">${escapeHtml(service.description || 'Aucune description disponible.')}</p>
                    <div class="fav-card-actions">
                        <button class="btn btn-outline-primary btn-sm" data-action="detail" type="button">Voir le détail</button>
                        <button class="btn btn-primary btn-sm" data-action="book" type="button">Prendre rendez-vous</button>
                    </div>
                </div>
            `;

            card.querySelector('[data-action="detail"]').addEventListener('click', () => window.navigate?.(`/services/${service.id}`));
            card.querySelector('[data-action="book"]').addEventListener('click', () => window.navigate?.(`/services/${service.id}/reserver`));
            card.querySelector('.fav-remove').addEventListener('click', async () => {
                try {
                    await FavorisAPI.remove(favori.id);
                    favoris = favoris.filter(f => f.id !== favori.id);
                    showToast('❤️ Service retiré des favoris.', 'success');
                    render();
                } catch (error) {
                    showToast(error.response?.data?.detail || 'Impossible de retirer ce favori.', 'error');
                }
            });

            list.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
        dispatchCount();
    };

    const charger = async () => {
        main.querySelector('#fav-list').innerHTML = `<div class="fav-loader"><div class="mxo-spinner"></div></div>`;
        try {
            const data = await FavorisAPI.getMesFavoris();
            favoris = data.resultats || [];
            render();
        } catch (error) {
            main.querySelector('#fav-list').innerHTML = `
                <div class="fav-empty">
                    <i data-lucide="alert-triangle"></i>
                    <h2>Impossible de charger vos favoris</h2>
                    <p>${error.response?.data?.detail || 'Réessayez dans un instant.'}</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    const dispatchCount = () => {
        window.dispatchEvent(new CustomEvent('mixo:favorites-updated', { detail: { count: favoris.length } }));
    };

    main.querySelector('#fav-search').addEventListener('input', (e) => {
        filtre = e.target.value.trim();
        render();
    });

    main.querySelector('#fav-refresh').addEventListener('click', charger);

    charger();
    return page;
};

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

