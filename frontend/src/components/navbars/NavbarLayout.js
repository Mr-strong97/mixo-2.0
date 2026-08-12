/**
 * NavbarLayout.js — MIXO
 * Shell partagé : rail desktop + app bar et navigation au pouce sur mobile.
 * L'API publique reste NavbarLayout(links) afin de ne pas casser les pages.
 */
import { AuthentificationUtilisateurs } from '../../api/axiosConfig.js';
import { checkUserStatus } from '../../utils/AuthGuard.js';
import { auth } from '../../firebase-config.js';
import { ChatAPI } from '../../api/ChatAPI.js';
import { renderAvatarMarkup } from '../../utils/avatar.js';

const BADGEABLE_IDS = new Set([
    'notifications', 'services', 'avis', 'rdv', 'factures', 'discussion', 'favoris',
]);

const ROLE_META = {
    client: { label: 'Client', home: '/home', settings: '/parametres/client' },
    coiffeur: { label: 'Coiffeur', home: '/coiffeur/dashboard', settings: '/parametres/coiffeur' },
    admin: { label: 'Administrateur', home: '/admin/dashboard', settings: '/admin/parametres' },
};

const ROLE_SECONDARY_LINKS = {
    client: [
        { id: 'services-quick', icon: 'scissors', label: 'Services', route: '/services' },
        { id: 'favoris', icon: 'heart', label: 'Favoris', route: '/favoris' },
        { id: 'historique', icon: 'history', label: 'Historique', route: '/historique' },
    ],
    coiffeur: [
        { id: 'services-quick', icon: 'scissors', label: 'Mes services', route: '/coiffeur/services' },
        { id: 'avis', icon: 'star', label: 'Avis clients', route: '/coiffeur/avis' },
        { id: 'portfolio', icon: 'images', label: 'Portfolio', route: '/coiffeur/portfolio' },
        { id: 'abonnement', icon: 'badge-check', label: 'Abonnement', route: '/coiffeur/abonnement' },
    ],
    admin: [
        { id: 'dashboard-quick', icon: 'layout-dashboard', label: 'Tableau de bord', route: '/admin/dashboard' },
        { id: 'profile', icon: 'user-round', label: 'Mon profil', route: '/admin/profile' },
        { id: 'stats', icon: 'chart-no-axes-combined', label: 'Statistiques', route: '/admin/stats' },
    ],
};

const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const isRouteActive = (pathname, route) => {
    if (!route) return false;
    if (pathname === route) return true;
    if (route !== '/' && pathname.startsWith(`${route}/`)) return true;
    if (route === '/rendez-vous' && pathname.includes('/rendez-vous')) return true;
    return false;
};

const renderBadge = (id, value = '') => BADGEABLE_IDS.has(id)
    ? `<span class="nl-badge" data-badge-id="${id}" ${value ? '' : 'hidden'}>${value}</span>`
    : '';

export const NavbarLayout = (links = [], _activeRoute = '', options = {}) => {
    if (typeof window.__mixoNavbarCleanup === 'function') window.__mixoNavbarCleanup();

    const username = localStorage.getItem('username') || 'Utilisateur';
    const role = (localStorage.getItem('user_role') || 'client').toLowerCase().trim();
    const roleMeta = ROLE_META[role] || ROLE_META.client;
    const pathname = window.location.pathname;
    const avatarChoice = localStorage.getItem('avatar_choice') || '';
    const primaryLinks = links.slice(0, 5);
    const secondaryLinks = options.secondaryLinks || ROLE_SECONDARY_LINKS[role] || [];
    const utilityLinks = [
        { id: 'notifications', icon: 'bell', label: 'Notifications', route: '/notifications' },
        { id: 'discussion', icon: 'messages-square', label: 'Messages', route: '/discussion' },
        ...secondaryLinks,
    ];

    const fragment = document.createDocumentFragment();
    const shell = document.createElement('div');
    shell.className = 'nl-shell';
    document.body.classList.add('mixo-shell-active');
    document.body.dataset.mixoRole = role;

    shell.innerHTML = `
        <header class="nl-mobile-header">
            <button class="nl-mobile-brand" type="button" data-route="${roleMeta.home}" aria-label="Accueil Mixo">
                <span class="nl-brand-mark" aria-hidden="true">M</span>
                <span class="nl-brand-copy"><strong>Mixo</strong><small>${roleMeta.label}</small></span>
            </button>
            <div class="nl-mobile-actions">
                <button class="nl-utility-btn" type="button" data-route="/notifications" aria-label="Notifications">
                    <i data-lucide="bell"></i>${renderBadge('notifications')}
                </button>
                <button class="nl-utility-btn" type="button" data-route="/discussion" aria-label="Messages">
                    <i data-lucide="messages-square"></i>${renderBadge('discussion')}
                </button>
                <button class="nl-profile-trigger" type="button" aria-label="Ouvrir le menu du compte" aria-expanded="false" aria-controls="nl-account-sheet">
                    <span class="nl-avatar-target">${renderAvatarMarkup({ username, avatar_choice: avatarChoice }, { size: 'sm' })}</span>
                </button>
            </div>
        </header>

        <aside class="nl-sidebar" aria-label="Navigation ${roleMeta.label}">
            <button class="nl-desktop-brand" type="button" data-route="${roleMeta.home}" aria-label="Accueil Mixo">
                <span class="nl-brand-mark" aria-hidden="true">M</span>
                <span class="nl-brand-copy"><strong>Mixo</strong><small>${roleMeta.label}</small></span>
            </button>

            <nav class="nl-desktop-nav" aria-label="Navigation principale">
                ${primaryLinks.map((link) => `
                    <button type="button" id="nl-${link.id}" class="nl-item ${isRouteActive(pathname, link.route) ? 'nl-active' : ''}"
                        data-route="${link.route || ''}" ${isRouteActive(pathname, link.route) ? 'aria-current="page"' : ''}>
                        <i data-lucide="${link.icon}" class="nl-icon"></i>
                        <span class="nl-label">${escapeHtml(link.label)}</span>
                        ${renderBadge(link.id, link.badge || '')}
                    </button>
                `).join('')}
            </nav>

            <div class="nl-desktop-secondary">
                <p>Accès rapides</p>
                ${utilityLinks.map((link) => `
                    <button type="button" id="nl-${link.id}" class="nl-secondary-item" data-route="${link.route}">
                        <i data-lucide="${link.icon}"></i><span>${escapeHtml(link.label)}</span>${renderBadge(link.id)}
                    </button>
                `).join('')}
            </div>

            <div class="nl-profile">
                <div class="nl-profile-info">
                    <span class="nl-avatar-target">${renderAvatarMarkup({ username, avatar_choice: avatarChoice }, { size: 'sm' })}</span>
                    <span class="nl-profile-text"><strong class="nl-profile-name">${escapeHtml(username)}</strong><small>${roleMeta.label}</small></span>
                </div>
                <button class="nl-logout" type="button" data-logout>
                    <i data-lucide="log-out"></i><span>Déconnexion</span>
                </button>
            </div>
        </aside>

        <nav class="nl-bottom-nav" aria-label="Navigation principale mobile">
            ${primaryLinks.map((link) => `
                <button type="button" class="nl-bottom-item ${isRouteActive(pathname, link.route) ? 'nl-active' : ''}"
                    data-route="${link.route || ''}" ${isRouteActive(pathname, link.route) ? 'aria-current="page"' : ''}>
                    <span class="nl-bottom-icon"><i data-lucide="${link.icon}"></i>${renderBadge(link.id, link.badge || '')}</span>
                    <span>${escapeHtml(link.mobileLabel || link.label)}</span>
                </button>
            `).join('')}
        </nav>

        <div class="nl-account-overlay" hidden>
            <button class="nl-account-backdrop" type="button" aria-label="Fermer le menu du compte"></button>
            <section class="nl-account-sheet" id="nl-account-sheet" role="dialog" aria-modal="true" aria-labelledby="nl-account-title">
                <div class="nl-sheet-handle" aria-hidden="true"></div>
                <div class="nl-account-heading">
                    <div class="nl-account-person">
                        <span class="nl-avatar-target">${renderAvatarMarkup({ username, avatar_choice: avatarChoice }, { size: 'md' })}</span>
                        <div><strong id="nl-account-title" class="nl-profile-name">${escapeHtml(username)}</strong><span>${roleMeta.label}</span></div>
                    </div>
                    <button class="nl-sheet-close" type="button" aria-label="Fermer"><i data-lucide="x"></i></button>
                </div>
                <nav class="nl-account-links" aria-label="Raccourcis du compte">
                    ${utilityLinks.map((link) => `
                        <button type="button" data-route="${link.route}">
                            <i data-lucide="${link.icon}"></i><span>${escapeHtml(link.label)}</span>${renderBadge(link.id)}<i data-lucide="chevron-right"></i>
                        </button>
                    `).join('')}
                    <button type="button" data-route="${roleMeta.settings}">
                        <i data-lucide="settings"></i><span>Paramètres du compte</span><i data-lucide="chevron-right"></i>
                    </button>
                </nav>
                <button class="nl-sheet-logout" type="button" data-logout>
                    <i data-lucide="log-out"></i><span>Se déconnecter</span>
                </button>
            </section>
        </div>
    `;

    const isAuthenticated = AuthentificationUtilisateurs.isAuthenticated();
    const accountOverlay = shell.querySelector('.nl-account-overlay');
    const profileTrigger = shell.querySelector('.nl-profile-trigger');
    let badgeState = {};
    let closeTimer = null;

    const go = (path) => {
        closeAccountSheet(false);
        if (window.navigate) window.navigate(path);
        else window.location.href = path;
    };

    const openAccountSheet = () => {
        window.clearTimeout(closeTimer);
        accountOverlay.hidden = false;
        requestAnimationFrame(() => accountOverlay.classList.add('is-open'));
        document.body.classList.add('no-scroll');
        profileTrigger?.setAttribute('aria-expanded', 'true');
        window.setTimeout(() => shell.querySelector('.nl-sheet-close')?.focus(), 120);
    };

    function closeAccountSheet(restoreFocus = true) {
        if (!accountOverlay || accountOverlay.hidden) return;
        accountOverlay.classList.remove('is-open');
        document.body.classList.remove('no-scroll');
        profileTrigger?.setAttribute('aria-expanded', 'false');
        closeTimer = window.setTimeout(() => { accountOverlay.hidden = true; }, 240);
        if (restoreFocus) profileTrigger?.focus();
    }

    const applyBadges = (counts = {}) => {
        badgeState = { ...badgeState, ...counts };
        BADGEABLE_IDS.forEach((id) => {
            const count = Number(badgeState[id] || 0);
            shell.querySelectorAll(`[data-badge-id="${id}"]`).forEach((badge) => {
                badge.textContent = count > 99 ? '99+' : String(count || '');
                badge.hidden = count <= 0;
            });
        });
    };

    const syncProfile = () => {
        const nextUsername = localStorage.getItem('username') || 'Utilisateur';
        const nextAvatarChoice = localStorage.getItem('avatar_choice') || '';
        shell.querySelectorAll('.nl-profile-name').forEach((element) => { element.textContent = nextUsername; });
        shell.querySelectorAll('.nl-avatar-target').forEach((element) => {
            const size = element.closest('.nl-account-person') ? 'md' : 'sm';
            element.innerHTML = renderAvatarMarkup({ username: nextUsername, avatar_choice: nextAvatarChoice }, { size });
        });
    };

    shell.querySelectorAll('[data-route]').forEach((button) => {
        button.addEventListener('click', () => button.dataset.route && go(button.dataset.route));
    });
    shell.querySelectorAll('[data-logout]').forEach((button) => {
        button.addEventListener('click', () => AuthentificationUtilisateurs.logout());
    });
    profileTrigger?.addEventListener('click', openAccountSheet);
    shell.querySelector('.nl-account-backdrop')?.addEventListener('click', () => closeAccountSheet());
    shell.querySelector('.nl-sheet-close')?.addEventListener('click', () => closeAccountSheet());

    const onKeydown = (event) => {
        if (event.key === 'Escape' && !accountOverlay.hidden) closeAccountSheet();
    };
    document.addEventListener('keydown', onKeydown);

    const onBadgesUpdated = (event) => applyBadges(event.detail || {});
    const onProfileUpdated = () => syncProfile();
    window.addEventListener('mixo:badges-updated', onBadgesUpdated);
    window.addEventListener('mixo:profile-updated', onProfileUpdated);

    if (isAuthenticated) {
        window.setTimeout(() => checkUserStatus(), 600);
        ChatAPI.getSummary()
            .then((data) => applyBadges({ discussion: data?.unread_count ?? 0 }))
            .catch(() => {});

        if (!window.__mixoStatusPoller) {
            window.__mixoStatusPoller = window.setInterval(() => {
                if (auth.currentUser) checkUserStatus();
            }, 10000);
        }
    }

    window.__mixoNavbarCleanup = () => {
        window.clearTimeout(closeTimer);
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('mixo:badges-updated', onBadgesUpdated);
        window.removeEventListener('mixo:profile-updated', onProfileUpdated);
        document.body.classList.remove('no-scroll');
    };

    window.setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    fragment.appendChild(shell);
    return fragment;
};
