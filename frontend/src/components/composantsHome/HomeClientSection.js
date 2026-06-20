/**
 * HomeClientSection.js — MIXO
 * Bloc d'accueil dédié aux clients.
 */
export const HomeClientSection = () => {
    const section = document.createElement('section');
    section.className = 'home-role-hero home-role-hero--client';

    section.innerHTML = `
        <div class="home-role-hero__content" data-animate="fade-up">
            <span class="home-role-hero__badge">
                <i data-lucide="smile"></i>
                Espace client
            </span>
            <h1 class="home-role-hero__title">Réservez votre prochain rendez-vous plus vite.</h1>
            <p class="home-role-hero__text">
                Comparez les coiffeurs, consultez les services disponibles et prenez rendez-vous
                en quelques clics, depuis une page pensée pour vos besoins.
            </p>
            <div class="home-role-hero__actions">
                <button class="home-role-hero__primary" id="client-home-services">
                    <i data-lucide="scissors"></i>
                    Voir les services
                </button>
                <button class="home-role-hero__secondary" id="client-home-history">
                    <i data-lucide="clock-3"></i>
                    Mon historique
                </button>
            </div>
        </div>

        <div class="home-role-hero__panel" data-animate="fade-left" data-delay="120">
            <div class="home-role-hero__card">
                <span class="home-role-hero__card_label">Ce que vous pouvez faire</span>
                <ul class="home-role-hero__list">
                    <li><i data-lucide="search"></i><span>Trouver un coiffeur selon vos critères</span></li>
                    <li><i data-lucide="calendar-check"></i><span>Réserver un créneau disponible</span></li>
                    <li><i data-lucide="bell"></i><span>Recevoir des rappels et confirmations</span></li>
                </ul>
            </div>
        </div>
    `;

    section.querySelector('#client-home-services').addEventListener('click', () => {
        if (window.navigate) window.navigate('/services');
    });

    section.querySelector('#client-home-history').addEventListener('click', () => {
        if (window.navigate) window.navigate('/historique');
    });

    return section;
};
