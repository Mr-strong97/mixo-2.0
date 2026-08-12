/**
 * HomeClientSection.js — MIXO
 * Bloc d'accueil dédié aux clients.
 */
export const HomeClientSection = () => {
    const section = document.createElement('section');
    section.className = 'client-home';

    const username = escapeHtml(localStorage.getItem('username') || 'vous');

    section.innerHTML = `
        <header class="client-home__header">
            <h1>Bonjour ${username}, votre prochain rendez-vous commence ici.</h1>
            <p>Choisissez une prestation, comparez les coiffeurs et réservez un créneau disponible.</p>
        </header>

        <article class="client-home__priority" aria-labelledby="client-priority-title">
            <div class="client-home__priority-mark" aria-hidden="true"><i data-lucide="scissors"></i></div>
            <div class="client-home__priority-copy">
                <h2 id="client-priority-title">Trouver un service de coiffure</h2>
                <p>Filtrez par catégorie, prix ou ville, puis consultez la fiche du coiffeur avant de réserver.</p>
            </div>
            <div class="client-home__checks" aria-label="Étapes de réservation">
                <span><i data-lucide="search"></i> Comparer</span>
                <span><i data-lucide="calendar-check"></i> Choisir un créneau</span>
                <span><i data-lucide="shield-check"></i> Réserver</span>
            </div>
            <button class="client-home__primary" id="client-home-services" type="button">
                Explorer les services <i data-lucide="arrow-right"></i>
            </button>
        </article>

        <section class="client-home__quick" aria-labelledby="client-quick-title">
            <div class="client-home__section-head">
                <h2 id="client-quick-title">Accès rapides</h2>
                <p>Retrouvez vos actions essentielles.</p>
            </div>
            <div class="client-home__quick-grid">
                ${quickAction('calendar-days', 'Mes rendez-vous', 'Suivre et gérer mes réservations', '/rendez-vous')}
                ${quickAction('receipt-text', 'Factures', 'Consulter mes factures et paiements', '/factures')}
                ${quickAction('messages-square', 'Messages', 'Échanger avec mon coiffeur', '/discussion')}
                ${quickAction('heart', 'Favoris', 'Retrouver mes services enregistrés', '/favoris')}
            </div>
        </section>

        <section class="client-home__guide" aria-labelledby="client-guide-title">
            <div class="client-home__section-head">
                <h2 id="client-guide-title">Une réservation claire</h2>
            </div>
            <ol>
                <li><strong>Choisissez</strong><span>une prestation adaptée à votre besoin.</span></li>
                <li><strong>Réservez</strong><span>un horaire proposé par le coiffeur.</span></li>
                <li><strong>Confirmez</strong><span>et retrouvez le suivi dans vos rendez-vous.</span></li>
            </ol>
        </section>
    `;

    section.querySelector('#client-home-services').addEventListener('click', () => {
        if (window.navigate) window.navigate('/services');
    });

    section.querySelectorAll('[data-client-route]').forEach((button) => {
        button.addEventListener('click', () => {
            if (window.navigate) window.navigate(button.dataset.clientRoute);
        });
    });

    return section;
};

function quickAction(icon, title, description, route) {
    return `
        <button class="client-home__quick-card" type="button" data-client-route="${route}">
            <span class="client-home__quick-icon"><i data-lucide="${icon}"></i></span>
            <span class="client-home__quick-copy"><strong>${title}</strong><small>${description}</small></span>
            <i data-lucide="chevron-right" class="client-home__chevron"></i>
        </button>`;
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
