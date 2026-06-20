/**
 * PlatformOverview.js — Mixo
 * Section "Qu'est-ce que Mixo ?" — explique le fonctionnement de la
 * plateforme via deux parcours : Pour les clients / Pour les coiffeurs.
 */
export const PlatformOverview = () => {
    const section = document.createElement('section');
    section.className = 'mixo-overview mixo-section';
    section.id = 'decouvrir-mixo';

    const clientFeatures = [
        {
            icon: 'search',
            title: 'Rechercher un coiffeur',
            text: 'Filtrez par ville, spécialité ou disponibilité : Mixo affiche en un instant les coiffeurs et barbiers autour de vous.'
        },
        {
            icon: 'list-checks',
            title: 'Consulter les services disponibles',
            text: 'Parcourez les prestations, les tarifs et les avis de chaque professionnel pour faire le bon choix.'
        },
        {
            icon: 'calendar-check',
            title: 'Prendre rendez-vous',
            text: 'Choisissez un créneau libre et confirmez votre réservation en quelques secondes, sans appel ni attente.'
        }
    ];

    const proFeatures = [
        {
            icon: 'store',
            title: 'Créer son compte professionnel',
            text: 'Inscrivez votre salon ou votre activité, personnalisez votre profil et mettez en valeur votre savoir-faire.'
        },
        {
            icon: 'megaphone',
            title: 'Publier ses services',
            text: 'Ajoutez vos prestations, vos tarifs et vos disponibilités pour gagner en visibilité auprès de nouveaux clients.'
        },
        {
            icon: 'calendar-clock',
            title: 'Gérer ses rendez-vous',
            text: 'Suivez votre agenda en temps réel, confirmez ou réorganisez vos réservations depuis votre espace dédié.'
        }
    ];

    const renderList = (items) => items.map(({ icon, title, text }) => `
        <li>
            <span class="mixo-overview__list_icon"><i data-lucide="${icon}"></i></span>
            <div>
                <h4>${title}</h4>
                <p>${text}</p>
            </div>
        </li>
    `).join('');

    section.innerHTML = `
        <div class="mixo-container">
            <div class="mixo-section-head" data-animate="fade-up">
                <span class="mixo-eyebrow"><i data-lucide="layout-grid"></i><span>Qu'est-ce que Mixo ?</span></span>
                <h2 class="mixo-section-title">Une plateforme, deux univers connectés.</h2>
                <p class="mixo-section-subtitle">
                    Mixo met en relation les clients en quête d'un coiffeur de confiance et les
                    professionnels qui veulent développer leur activité — avec, au centre, une
                    prise de rendez-vous simple, rapide et transparente pour tout le monde.
                </p>
            </div>

            <div class="mixo-overview__grid">
                <article class="mixo-overview__card mixo-overview__card--client" data-animate="fade-left">
                    <div class="mixo-overview__card_header">
                        <span class="mixo-overview__icon mixo-overview__icon--client"><i data-lucide="smile"></i></span>
                        <div>
                            <span class="mixo-overview__tag">Espace client</span>
                            <h3>Pour les clients</h3>
                        </div>
                    </div>
                    <ul class="mixo-overview__list">
                        ${renderList(clientFeatures)}
                    </ul>
                </article>

                <article class="mixo-overview__card mixo-overview__card--pro" id="pour-coiffeurs" data-animate="fade-right">
                    <div class="mixo-overview__card_header">
                        <span class="mixo-overview__icon mixo-overview__icon--pro"><i data-lucide="scissors"></i></span>
                        <div>
                            <span class="mixo-overview__tag">Espace professionnel</span>
                            <h3>Pour les coiffeurs</h3>
                        </div>
                    </div>
                    <ul class="mixo-overview__list">
                        ${renderList(proFeatures)}
                    </ul>
                </article>
            </div>
        </div>
    `;

    return section;
};
