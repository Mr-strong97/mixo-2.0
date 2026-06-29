/**
 * Navbar.js
 * ==========
 * Admin : "Statistiques" (dropdown) + "Profil Admin" + "Administration"
 * Autres : Accueil + Services + Espace (profil/client/coiffeur)
 */
import { AuthentificationUtilisateurs } from '../api/axiosConfig.js';

export const Navbar = () => {
    const isAuthenticated = AuthentificationUtilisateurs.isAuthenticated();
    const rawRole  = localStorage.getItem('user_role') || 'client';
    const role     = rawRole.toLowerCase().trim();
    const userId   = localStorage.getItem('user_id');
    const username = localStorage.getItem('username') || 'Utilisateur';

    const isCoiffeur = role === 'coiffeur';
    const isAdmin    = role === 'admin';

    const profileLabel = isCoiffeur ? 'Espace Coiffeur' : 'Espace Client';
    const profileIcon  = isCoiffeur ? 'scissors' : 'user';

    const wrapper   = document.createDocumentFragment();
    const burgerBtn = document.createElement('button');
    burgerBtn.className = 'burger-menu';
    burgerBtn.id = 'burgerBtn';
    burgerBtn.setAttribute('title', 'Menu');
    burgerBtn.innerHTML = `<span></span><span></span><span></span>`;

    const nav = document.createElement('nav');
    nav.className = 'navbar-main';

    nav.innerHTML = `
        <div class="nav-container container">

            <div class="nav-brand" id="nav-brand">
                <div class="brand-avatar-wrapper" data-initials="${username.substring(0,2).toUpperCase()}">
                    <div class="role-badge text-uppercase font-bold border border-primary text-white  bg-primary rounded-full px-3 py-1">${role}</div>
                </div>
            </div>

            <div class="nav-content">
                <ul class="nav-links">

                    ${isAdmin ? `
                   
                    <!-- Profil Admin -->
                    <li id="nav-admin-profile" class="nav-link">
                        <i data-lucide="user-cog"></i>
                        <span>Profil Admin</span>
                    </li>

                    <!-- Administration -->
                    <li id="nav-admin" class="nav-link nav-link-admin">
                        <i data-lucide="shield-check"></i>
                        <span>Administration</span>
                    </li>

                    ` : `
                    <!-- ═══ LIENS STANDARD ═══ -->
                    <li id="nav-home" class="nav-link">
                        <i data-lucide="home"></i><span>Accueil</span>
                    </li>
                    <li id="nav-services" class="nav-link">
                        <i data-lucide="scissors"></i><span>Services</span>
                    </li>

                    ${isAuthenticated ? `
                    <li id="nav-profile" class="nav-link">
                        <i data-lucide="${profileIcon}"></i>
                        <span>${profileLabel}</span>
                    </li>
                    ` : `
                    <li id="nav-login" class="nav-link">
                        <i data-lucide="log-in"></i><span>Connexion</span>
                    </li>
                    `}
                    `}

                </ul>
            </div>

            <div class="nav-right">
                <div class="nav-icons navbar-actions-container">
                    <div class="icon-box">
                        <i data-lucide="search"></i>
                        <span>Recherche</span>
                    </div>
                    ${isAuthenticated ? `
                    <div class="icon-box notification-box">
                        <i data-lucide="bell"></i>
                        <span class="notif-dot"></span>
                        <span>Notifications</span>
                    </div>
                    <div class="icon-box" id="nav-logout-btn" title="Déconnexion">
                        <i data-lucide="log-out"></i>
                        <span>Déconnexion</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // ---- Navigation ----
    const go = (path) => {
        if (window.navigate) window.navigate(path);
        else window.location.href = path;
    };

    const goProfileSpace = () => {
        if (username && userId) go(`/${username.toLowerCase().trim()}/${userId}`);
        else go('/login');
    };
    window.goToProfileSpace = goProfileSpace;

    // ---- Clics ----
    const closeMenu = () => {
        burgerBtn.classList.remove('active');
        nav.classList.remove('mobile-open');
        document.body.classList.remove('no-scroll');
    };
    const toggleMenu = (e) => {
        e.stopPropagation();
        burgerBtn.classList.toggle('active');
        nav.classList.toggle('mobile-open');
        document.body.classList.toggle('no-scroll');
    };
    burgerBtn.addEventListener('click', toggleMenu);
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('mobile-open') &&
            !nav.contains(e.target) && e.target !== burgerBtn) {
            closeMenu();
        }
    });

    nav.querySelector('#nav-brand')?.addEventListener('click',        () => { closeMenu(); go('/home'); });
    nav.querySelector('#nav-home')?.addEventListener('click',         () => { closeMenu(); go('/home'); });
    nav.querySelector('#nav-services')?.addEventListener('click',     () => { closeMenu(); go('/services'); });
    nav.querySelector('#nav-profile')?.addEventListener('click',      () => { closeMenu(); goProfileSpace(); });
    nav.querySelector('#nav-login')?.addEventListener('click',        () => { closeMenu(); go('/login'); });
    nav.querySelector('#nav-admin')?.addEventListener('click',        () => { closeMenu(); go('/admin'); });
    nav.querySelector('#nav-admin-profile')?.addEventListener('click',() => { closeMenu(); go('/admin/profile'); });
    nav.querySelector('#nav-logout-btn')?.addEventListener('click',   () => {
        closeMenu();
        AuthentificationUtilisateurs.logout();
    });

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);

    wrapper.appendChild(burgerBtn);
    wrapper.appendChild(nav);
    return wrapper;
};

export default Navbar;