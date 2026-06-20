/**
 * HomeCoiffeurSection.js — MIXO
 * Bloc d'accueil dédié aux coiffeurs.
 */
export const HomeCoiffeurSection = () => {
    const section = document.createElement('section');
    section.className = 'home-role-hero home-role-hero--coiffeur';

    section.innerHTML = `
        <div class="home-role-hero__content" data-animate="fade-up">
            <span class="home-role-hero__badge">
                <i data-lucide="scissors"></i>
                Espace coiffeur
            </span>
            <h1 class="home-role-hero__title">Pilotez votre activité depuis un tableau de bord clair.</h1>
            <p class="home-role-hero__text">
                Gérez vos services, vos horaires, vos rendez-vous et votre portfolio depuis une
                page d’accueil orientée productivité.
            </p>
            <div class="home-role-hero__actions">
                <button class="home-role-hero__primary" id="pro-home-services">
                    <i data-lucide="layout-list"></i>
                    Mes services
                </button>
                <button class="home-role-hero__secondary" id="pro-home-hours">
                    <i data-lucide="calendar-clock"></i>
                    Mes horaires
                </button>
            </div>
        </div>

        <div class="home-role-hero__panel" data-animate="fade-left" data-delay="120">
            <div class="home-role-hero__card">
                <span class="home-role-hero__card_label">Raccourcis métier</span>
                <ul class="home-role-hero__list">
                    <li><i data-lucide="clipboard-list"></i><span>Mettre à jour vos prestations</span></li>
                    <li><i data-lucide="calendar-days"></i><span>Gérer les créneaux et exceptions</span></li>
                    <li><i data-lucide="image"></i><span>Valoriser votre portfolio</span></li>
                </ul>
            </div>
        </div>
    `;

    section.querySelector('#pro-home-services').addEventListener('click', () => {
        if (window.navigate) window.navigate('/coiffeur/services');
    });

    section.querySelector('#pro-home-hours').addEventListener('click', () => {
        if (window.navigate) window.navigate('/coiffeur/horaires');
    });

    return section;
};
