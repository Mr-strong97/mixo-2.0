/**
 * NavbarLayout.js — MIXO
 * Composant de base partagé par NavbarClient, NavbarCoiffeur, NavbarAdmin.
 * Structure : sidebar fixe gauche + burger mobile.
 *
 * @param {Array}  links      - [{ id, icon, label, route, active?, badge? }]
 * @param {String} activeRoute - Route actuellement active
 */
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { checkUserStatus } from '../../utils/AuthGuard.js';

export const NavbarLayout = (links = [], activeRoute = '') => {
    const username = localStorage.getItem('username') || 'Utilisateur';
    const role     = (localStorage.getItem('user_role') || 'client').toLowerCase();
    const initials = username.substring(0, 2).toUpperCase();

    const isAuthenticated = AuthentificationUtilisateurs.isAuthenticated();

    const fragment  = document.createDocumentFragment();
    const burgerBtn = document.createElement('button');
    burgerBtn.className = 'nl-burger';
    burgerBtn.id        = 'nl-burger';
    burgerBtn.innerHTML = `<span></span><span></span><span></span>`;

    const nav = document.createElement('nav');
    nav.className = 'nl-sidebar';

    nav.innerHTML = `
        <!-- Logo -->
        <div class="nl-logo" id="nl-logo">
            <span class="nl-logo-text">MIXO</span>
        </div>

        <!-- Liens de navigation -->
        <div class="nl-nav-scroll">
            <ul class="nl-links" id="nl-links">
                ${links.map(l => `
                    <li class="nl-item ${l.route && window.location.pathname === l.route ? 'nl-active' : ''}"
                        data-route="${l.route || ''}" id="nl-${l.id}">
                        <i data-lucide="${l.icon}" class="nl-icon"></i>
                        <span class="nl-label">${l.label}</span>
                        ${l.badge ? `<span class="nl-badge" id="badge-${l.id}">${l.badge}</span>` : ''}
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Profil utilisateur -->
        <div class="nl-profile">
            <div class="nl-profile-info">
                <div class="nl-avatar">${initials}</div>
                <div class="nl-profile-text">
                    <span class="nl-profile-name">${username}</span>
                    <span class="nl-profile-role">${role === 'admin' ? 'Administrateur' : role === 'coiffeur' ? 'Coiffeur' : 'Client Premium'}</span>
                </div>
            </div>
            <button class="nl-logout" id="nl-logout">
                <i data-lucide="log-out"></i>
                <span>Déconnexion</span>
            </button>
        </div>
    `;

    // ── Navigation ──────────────────────────────────────────
    const go = path => { if (window.navigate) window.navigate(path); else window.location.href = path; };

    nav.querySelector('#nl-logo').addEventListener('click', () => go('/home'));

    nav.querySelectorAll('.nl-item[data-route]').forEach(item => {
        item.addEventListener('click', () => {
            const route = item.dataset.route;
            if (!route) return;
            nav.querySelectorAll('.nl-item').forEach(i => i.classList.remove('nl-active'));
            item.classList.add('nl-active');
            closeMenu();
            go(route);
        });
    });

    nav.querySelector('#nl-logout').addEventListener('click', () => {
        AuthentificationUtilisateurs.logout();
    });

    // ── Burger ──────────────────────────────────────────────
    const closeMenu = () => {
        burgerBtn.classList.remove('active');
        nav.classList.remove('nl-open');
        document.body.classList.remove('no-scroll');
    };

    burgerBtn.addEventListener('click', e => {
        e.stopPropagation();
        burgerBtn.classList.toggle('active');
        nav.classList.toggle('nl-open');
        document.body.classList.toggle('no-scroll');
    });

    document.addEventListener('click', e => {
        if (nav.classList.contains('nl-open') && !nav.contains(e.target) && e.target !== burgerBtn) closeMenu();
    });

    // ── Vérification statut ─────────────────────────────────
    if (isAuthenticated) setTimeout(() => checkUserStatus(), 600);

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);

    fragment.appendChild(burgerBtn);
    fragment.appendChild(nav);
    return fragment;
};