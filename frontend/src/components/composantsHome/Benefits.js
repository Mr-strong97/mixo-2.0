/**
 * Benefits.js — Mixo
 * Section "Avantages" — bénéfices de la plateforme pour les clients
 * et pour les coiffeurs, sous forme de listes à coches animées.
 */
export const Benefits = () => {
    const section = document.createElement('section');
    section.className = 'mixo-benefits mixo-section';
    section.id = 'avantages';

    const clientBenefits = [
        {
            title: 'Trouver rapidement un coiffeur',
            text: 'Une recherche géolocalisée et filtrée pour dénicher le bon professionnel en quelques secondes.'
        },
        {
            title: 'Consulter les services disponibles',
            text: 'Prestations, tarifs et avis : toutes les informations utiles avant de réserver, au même endroit.'
        },
        {
            title: 'Réserver en quelques clics',
            text: 'Un agenda en temps réel, accessible 24h/24, sans appel ni temps d\'attente.'
        },
        {
            title: 'Recevoir des notifications',
            text: 'Confirmations, rappels et mises à jour de votre rendez-vous, automatiquement.'
        },
        {
            title: 'Gagner du temps',
            text: 'Toutes vos démarches coiffure centralisées sur une seule plateforme, simple et rapide.'
        }
    ];

    const proBenefits = [
        {
            title: 'Développer leur visibilité',
            text: 'Un profil et des prestations exposés à une communauté grandissante de clients.'
        },
        {
            title: 'Publier leurs services',
            text: 'Mettez à jour votre catalogue, vos tarifs et vos disponibilités en quelques minutes.'
        },
        {
            title: 'Gérer leurs rendez-vous',
            text: 'Un agenda centralisé pour suivre, confirmer et organiser chaque réservation.'
        },
        {
            title: 'Fidéliser leurs clients',
            text: 'Historique et préférences pour personnaliser chaque prestation et créer du lien.'
        },
        {
            title: 'Développer leur activité',
            text: 'Statistiques et visibilité accrue pour faire grandir votre salon, sereinement.'
        }
    ];

    const renderList = (items) => items.map(({ title, text }, i) => `
        <li style="--i:${i}">
            <span class="mixo-benefits__check"><i data-lucide="check"></i></span>
            <div>
                <h4>${title}</h4>
                <p>${text}</p>
            </div>
        </li>
    `).join('');

    section.innerHTML = `
        <div class="mixo-container">
            <div class="mixo-section-head" data-animate="fade-up">
                <span class="mixo-eyebrow"><i data-lucide="gift"></i><span>Pourquoi choisir Mixo ?</span></span>
                <h2 class="mixo-section-title">Des avantages pensés pour chacun.</h2>
                <p class="mixo-section-subtitle">
                    Mixo simplifie la vie des clients comme celle des professionnels —
                    chacun y trouve des outils pensés pour ses besoins.
                </p>
            </div>

            <div class="mixo-benefits__grid">
                <div class="mixo-benefits__card mixo-benefits__card--client" data-animate="fade-up">
                    <div class="mixo-benefits__head">
                        <span class="mixo-benefits__icon"><i data-lucide="smile"></i></span>
                        <h3>Pour les clients</h3>
                    </div>
                    <ul class="mixo-benefits__list">
                        ${renderList(clientBenefits)}
                    </ul>
                </div>

                <div class="mixo-benefits__card mixo-benefits__card--pro" data-animate="fade-up" data-delay="120">
                    <div class="mixo-benefits__head">
                        <span class="mixo-benefits__icon"><i data-lucide="scissors"></i></span>
                        <h3>Pour les coiffeurs</h3>
                    </div>
                    <ul class="mixo-benefits__list">
                        ${renderList(proBenefits)}
                    </ul>
                </div>
            </div>
        </div>
    `;

    return section;
};
