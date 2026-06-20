/**
 * HomeAdminSection.js — MIXO
 * Bloc d'accueil dédié aux administrateurs.
 */
export const HomeAdminSection = () => {
    const section = document.createElement('section');
    section.className = 'home-role-hero home-role-hero--admin';

    section.innerHTML = `
        <div class="home-role-hero__content" data-animate="fade-up">
            <span class="home-role-hero__badge">
                <i data-lucide="shield-check"></i>
                Espace administrateur
            </span>
            <h1 class="home-role-hero__title">Supervisez la plateforme en un seul endroit.</h1>
            <p class="home-role-hero__text">
                Consultez les utilisateurs, validez les comptes, contrôlez les services et gardez
                une vue claire sur l’activité globale de Mixo.
            </p>
            <div class="home-role-hero__actions">
                <button class="home-role-hero__primary" id="admin-home-dashboard">
                    <i data-lucide="layout-dashboard"></i>
                    Tableau de bord
                </button>
                <button class="home-role-hero__secondary" id="admin-home-services">
                    <i data-lucide="scissors"></i>
                    Gérer les services
                </button>
            </div>
        </div>

        <div class="home-role-hero__panel" data-animate="fade-left" data-delay="120">
            <div class="home-role-hero__card">
                <span class="home-role-hero__card_label">Surveillance rapide</span>
                <ul class="home-role-hero__list">
                    <li><i data-lucide="users"></i><span>Validation des comptes et rôles</span></li>
                    <li><i data-lucide="activity"></i><span>Suivi des actions et journaux</span></li>
                    <li><i data-lucide="bar-chart-2"></i><span>Analyse des volumes et tendances</span></li>
                </ul>
            </div>
        </div>
    `;

    section.querySelector('#admin-home-dashboard').addEventListener('click', () => {
        if (window.navigate) window.navigate('/admin');
    });

    section.querySelector('#admin-home-services').addEventListener('click', () => {
        if (window.navigate) window.navigate('/admin/services');
    });

    return section;
};
