/**
 * HowItWorks.js — Mixo
 * Section "Comment ça fonctionne ?" — parcours unifié en 5 étapes,
 * valable aussi bien pour les clients que pour les coiffeurs.
 */
export const HowItWorks = () => {
    const section = document.createElement('section');
    section.className = 'mixo-howit mixo-section mixo-section--tinted';
    section.id = 'comment-ca-marche';

    const steps = [
        {
            icon: 'user-plus',
            title: 'Créer un compte',
            text: 'Inscrivez-vous gratuitement en tant que client ou professionnel et accédez à votre espace personnel Mixo.'
        },
        {
            icon: 'user-cog',
            title: 'Compléter son profil',
            text: 'Renseignez vos informations, vos préférences ou les détails de votre salon pour une expérience sur mesure.'
        },
        {
            icon: 'list-plus',
            title: 'Rechercher ou publier un service',
            text: 'Les clients explorent les prestations disponibles ; les coiffeurs mettent en ligne leur catalogue.'
        },
        {
            icon: 'calendar-check',
            title: 'Réserver ou gérer ses rendez-vous',
            text: 'Réservez un créneau en quelques clics, ou organisez votre agenda professionnel en toute simplicité.'
        },
        {
            icon: 'heart-handshake',
            title: 'Profiter de l\'expérience Mixo',
            text: 'Vivez une prestation de qualité, laissez un avis, et revenez quand vous voulez : tout est centralisé.'
        }
    ];

    section.innerHTML = `
        <div class="mixo-container">
            <div class="mixo-section-head" data-animate="fade-up">
                <h2 class="mixo-section-title">Cinq étapes pour démarrer sur Mixo.</h2>
                <p class="mixo-section-subtitle">
                    Que vous soyez client ou professionnel, le parcours Mixo reste simple
                    et rapide — de l'inscription jusqu'à la prise de rendez-vous.
                </p>
            </div>

            <div class="mixo-howit__track">
                <div class="mixo-howit__line" aria-hidden="true"></div>
                ${steps.map((step, i) => `
                    <div class="mixo-howit__item" data-animate="fade-up" data-delay="${i * 90}">
                        <span class="mixo-howit__icon">
                            <i data-lucide="${step.icon}"></i>
                            <span class="mixo-howit__num">${String(i + 1).padStart(2, '0')}</span>
                        </span>
                        <h3>${step.title}</h3>
                        <p>${step.text}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    return section;
};
