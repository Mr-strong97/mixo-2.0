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
import { auth } from '../../firebase-config.js';
import { ChatAPI } from '../../api/ChatAPI.js';
import { renderAvatarMarkup } from '../../utils/avatar.js';

const BADGEABLE_IDS = new Set(['notifications', 'services', 'avis', 'rdv', 'factures', 'discussion']);

export const NavbarLayout = (links = [], activeRoute = '') => {
    const username = localStorage.getItem('username') || 'Utilisateur';
    const role     = (localStorage.getItem('user_role') || 'client').toLowerCase();
    const initials = username.substring(0, 2).toUpperCase();
    const pathname = window.location.pathname;

    const isAuthenticated = AuthentificationUtilisateurs.isAuthenticated();
    let badgeState = {};

    const fragment  = document.createDocumentFragment();

    const nav = document.createElement('nav');
    nav.className = 'nl-sidebar';
    const mobileHeader = document.createElement('header');
    mobileHeader.className = 'nl-mobile-header';
    mobileHeader.innerHTML = `
        <button class="nl-mobile-logo" type="button" aria-label="Accueil">Mixo</button>
        <div class="nl-mobile-actions">
            <button class="nl-mobile-action" data-mobile-route="/notifications" aria-label="Notifications"><i data-lucide="bell"></i></button>
            <button class="nl-mobile-action" data-mobile-route="/discussion" aria-label="Messages"><i data-lucide="messages-square"></i><span class="nl-mobile-badge"></span></button>
        </div>`;
    const closeOnOutsideClick = (e) => {
        if (nav.classList.contains('nl-open') && !nav.contains(e.target)) {
            closeMenu();
        }
    };

    nav.innerHTML = `
        <!-- Logo -->
        <div class="nl-logo" id="nl-logo">
            <span class="nl-logo-text">MIXO</span>
        </div>

        <!-- Liens de navigation -->
        <div class="nl-nav-scroll">
            <ul class="nl-links" id="nl-links">
                ${links.map(l => `
                    <li class="nl-item ${l.route && (pathname === l.route || (l.route === '/discussion' && pathname.startsWith('/discussion'))) ? 'nl-active' : ''}"
                        data-route="${l.route || ''}" id="nl-${l.id}">
                        <i data-lucide="${l.icon}" class="nl-icon"></i>
                        <span class="nl-label">${l.label}</span>
                        ${(l.badge || BADGEABLE_IDS.has(l.id)) ? `<span class="nl-badge" id="badge-${l.id}" style="${l.badge ? '' : 'display:none;'}">${l.badge || ''}</span>` : ''}
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Profil utilisateur -->
        <div class="nl-profile">
            <div class="nl-profile-info">
                <div class="nl-avatar">
                    ${renderAvatarMarkup({
                        username,
                        avatar_choice: localStorage.getItem('avatar_choice') || '',
                    }, { size: 'sm' })}
                </div>
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

    mobileHeader.querySelector('.nl-mobile-logo').addEventListener('click', () => go(role === 'coiffeur' ? '/coiffeur/dashboard' : '/home'));
    mobileHeader.querySelectorAll('[data-mobile-route]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.mobileRoute)));

    nav.querySelector('#nl-logo').addEventListener('click', () => go(role === 'coiffeur' ? '/coiffeur/dashboard' : '/home'));

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

    const syncProfile = () => {
        const nextUsername = localStorage.getItem('username') || 'Utilisateur';
        const nextAvatarChoice = localStorage.getItem('avatar_choice') || '';
        const nameEl = nav.querySelector('.nl-profile-name');
        const avatarEl = nav.querySelector('.nl-avatar');
        if (nameEl) nameEl.textContent = nextUsername;
        if (avatarEl) {
            avatarEl.innerHTML = renderAvatarMarkup({
                username: nextUsername,
                avatar_choice: nextAvatarChoice,
            }, { size: 'sm' });
        }
    };

    const applyBadges = (counts = {}) => {
        badgeState = { ...badgeState, ...counts };
        BADGEABLE_IDS.forEach((id) => {
            const badge = nav.querySelector(`#badge-${id}`);
            if (!badge) return;
            const count = Number(badgeState[id] || 0);
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : String(count);
                badge.style.display = 'inline-flex';
            } else {
                badge.textContent = '';
                badge.style.display = 'none';
            }
        });
    };

    const closeMenu = () => {
        nav.classList.remove('nl-open');
        document.body.classList.remove('no-scroll');
        document.body.classList.remove('nav-menu-open');
    };

    if (document.__mixoNavbarOutsideClickHandler) {
        document.removeEventListener('click', document.__mixoNavbarOutsideClickHandler);
    }
    document.__mixoNavbarOutsideClickHandler = closeOnOutsideClick;
    document.addEventListener('click', closeOnOutsideClick);

    // ── Vérification statut ─────────────────────────────────
    if (isAuthenticated) {
        setTimeout(() => checkUserStatus(), 600);
        ChatAPI.getSummary()
            .then((data) => applyBadges({ discussion: data?.unread_count ?? 0 }))
            .catch(() => {});
        if (!window.__mixoStatusPoller) {
            window.__mixoStatusPoller = setInterval(() => {
                if (auth.currentUser) checkUserStatus();
            }, 10000);
        }
        if (!window.__mixoNavbarBadgeListener) {
            window.__mixoNavbarBadgeListener = (event) => applyBadges(event.detail || {});
            window.addEventListener('mixo:badges-updated', window.__mixoNavbarBadgeListener);
        }
        if (!window.__mixoNavbarFocusListener) {
            window.__mixoNavbarFocusListener = () => {
                if (auth.currentUser) checkUserStatus();
            };
            window.addEventListener('focus', window.__mixoNavbarFocusListener);
        }
        if (!window.__mixoNavbarVisibilityListener) {
            window.__mixoNavbarVisibilityListener = () => {
                if (!document.hidden && auth.currentUser) checkUserStatus();
            };
            document.addEventListener('visibilitychange', window.__mixoNavbarVisibilityListener);
        }
        if (!window.__mixoNavbarProfileListener) {
            window.__mixoNavbarProfileListener = () => syncProfile();
            window.addEventListener('mixo:profile-updated', window.__mixoNavbarProfileListener);
        }
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);

    fragment.appendChild(mobileHeader);
    fragment.appendChild(nav);
    return fragment;
};
