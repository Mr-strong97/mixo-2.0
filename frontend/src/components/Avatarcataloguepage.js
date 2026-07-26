/**
 * ============================================================
 * AvatarCataloguePage.js — MIXO
 * Catalogue d'avatars illustrés (sélection plein écran)
 * ============================================================
 * Réutilise le même système de données que AvatarPicker.js
 * (AVATAR_PRESET_LIST / renderAvatarMarkup depuis utils/avatar.js),
 * pour que le choix fait ici soit rigoureusement le même objet
 * `avatar_choice` que celui déjà géré ailleurs dans l'app.
 *
 * Intégration : la persistance réelle (appel API de sauvegarde)
 * n'est pas connue de ce composant — comme AvatarPicker.js et
 * AvatarUpload.js, il ne fait aucun appel réseau lui-même.
 * Branchez votre sauvegarde via le paramètre `onConfirm`.
 *
 * @param {Object} user - { username, avatar_choice }
 * @param {Function} onConfirm - appelé avec la nouvelle clé choisie
 * ============================================================
 */
import { AVATAR_PRESET_LIST, renderAvatarMarkup } from '../utils/avatar.js';
import { Navbar } from './navbars/Navbar.js';
import { Footer } from './Footer.js';

import '../styles/Avatarcataloguepage.css';

export const AvatarCataloguePage = (user = {}, onConfirm = null) => {
    const username = user.username || user.name || 'MX';
    let baselineChoice = user.avatar_choice || user.avatarChoice || 'initials';

    const page = document.createElement('div');
    page.className = 'avatar-cat-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'avatar-cat-main';
    main.innerHTML = `
        <section class="avatar-cat-hero">
            <div>
                <h1>Catalogue d’Avatars</h1>
                <p>Parcourez notre collection d’illustrations professionnelles pour personnaliser votre identité sur Mixo.</p>
            </div>
            <div class="avatar-cat-tools">
                <div class="avatar-cat-search">
                    <i data-lucide="search"></i>
                    <input id="avatar-cat-search" type="search" placeholder="Rechercher un style…">
                </div>
                <button class="btn btn-outline-primary" id="avatar-cat-filter-btn" type="button">
                    <i data-lucide="sliders-horizontal"></i>
                    Filtres
                </button>
            </div>
        </section>

        <div class="avatar-cat-filter-row" id="avatar-cat-filter-row" hidden>
            <label for="avatar-cat-sort">Trier par</label>
            <select id="avatar-cat-sort">
                <option value="default">Par défaut</option>
                <option value="alpha">Nom (A → Z)</option>
            </select>
        </div>

        <section id="avatar-cat-grid" class="avatar-cat-grid"></section>
    `;
    page.appendChild(main);
    page.appendChild(Footer());

    const bar = document.createElement('div');
    bar.className = 'avatar-cat-bar';
    bar.hidden = true;
    page.appendChild(bar);

    const state = { choice: baselineChoice, search: '', sort: 'default' };

    const grid = main.querySelector('#avatar-cat-grid');
    const filterRow = main.querySelector('#avatar-cat-filter-row');
    const filterBtn = main.querySelector('#avatar-cat-filter-btn');
    const sortSelect = main.querySelector('#avatar-cat-sort');
    const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };

    const getFilteredPresets = () => {
        let list = [...AVATAR_PRESET_LIST];
        const q = state.search.trim().toLowerCase();
        if (q) {
            list = list.filter((p) => `${p.label} ${p.description || ''}`.toLowerCase().includes(q));
        }
        if (state.sort === 'alpha') {
            list = [...list].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
        }
        return list;
    };

    const renderBar = () => {
        const hasChange = state.choice !== baselineChoice;
        bar.hidden = !hasChange;
        if (!hasChange) return;

        bar.innerHTML = `
            <span class="avatar-cat-bar-check"><i data-lucide="check"></i></span>
            <p>1 avatar sélectionné</p>
            <span class="avatar-cat-bar-sep"></span>
            <button type="button" class="avatar-cat-bar-cancel" id="avatar-cat-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="avatar-cat-confirm">Confirmer la sélection</button>
        `;
        bar.querySelector('#avatar-cat-cancel').addEventListener('click', () => {
            state.choice = baselineChoice;
            renderGrid();
            renderBar();
        });
        bar.querySelector('#avatar-cat-confirm').addEventListener('click', () => {
            if (typeof onConfirm === 'function') onConfirm(state.choice);
            localStorage.setItem('avatar_choice', state.choice);
            window.dispatchEvent(new CustomEvent('mixo:profile-updated'));
            baselineChoice = state.choice;
            renderBar();
        });
        refreshIcons();
    };

    const renderGrid = () => {
        const items = getFilteredPresets();

        if (!items.length) {
            grid.innerHTML = `
                <div class="avatar-cat-empty">
                    <span class="avatar-cat-icon-circle"><i data-lucide="search-x"></i></span>
                    <h2>Aucun style trouvé</h2>
                    <p>Essayez un autre mot-clé de recherche.</p>
                </div>`;
            refreshIcons();
            return;
        }

        grid.innerHTML = items.map((preset) => {
            const isSelected = state.choice === preset.key;
            return `
                <button type="button" class="avatar-cat-card ${isSelected ? 'is-selected' : ''}" data-key="${preset.key}">
                    <span class="avatar-cat-card-media">
                        ${renderAvatarMarkup({ username, avatar_choice: preset.key }, { size: 'xl' })}
                    </span>
                    <span class="avatar-cat-card-body">
                        <strong>${preset.label}</strong>
                        <span>${preset.description || ''}</span>
                    </span>
                    <span class="avatar-cat-radio">${isSelected ? '<i data-lucide="check"></i>' : ''}</span>
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.avatar-cat-card').forEach((card) => {
            card.addEventListener('click', () => {
                state.choice = card.dataset.key;
                renderGrid();
                renderBar();
            });
        });

        refreshIcons();
    };

    main.querySelector('#avatar-cat-search').addEventListener('input', (e) => {
        state.search = e.target.value;
        renderGrid();
    });

    filterBtn.addEventListener('click', () => {
        const willOpen = filterRow.hidden;
        filterRow.hidden = !willOpen;
        filterBtn.classList.toggle('is-active', willOpen);
    });

    sortSelect.addEventListener('change', (e) => {
        state.sort = e.target.value;
        renderGrid();
    });

    renderGrid();
    renderBar();

    return page;
};
