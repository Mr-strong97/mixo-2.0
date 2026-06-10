/**
 * AdminPlaceholder.js — MIXO
 * Sections non encore développées.
 */
const SECTIONS = {
    dashboard: {
        icon:'layout-dashboard', titre:'Tableau de bord',
        desc:'Vue d\'ensemble globale des activités de la plateforme Mixo.',
        features:['KPI en temps réel','Alertes système','Activité récente','Graphiques de performance'],
    },
    rdv: {
        icon:'calendar', titre:'Gestion des Rendez-vous',
        desc:'Supervisez tous les rendez-vous de la plateforme et gérez les conflits.',
        features:['Vue calendrier globale','Annulations et reports','Taux de présence','Rendez-vous du jour'],
    },
    services: {
        icon:'scissors', titre:'Gestion des Services',
        desc:'Gérez le catalogue de services proposés par les coiffeurs sur Mixo.',
        features:['Valider les nouveaux services','Fixer les catégories','Gérer les tarifs','Services populaires'],
    },
    parametres: {
        icon:'settings', titre:'Paramètres de la Plateforme',
        desc:'Configurez les paramètres globaux de l\'application Mixo.',
        features:['Paramètres généraux','Gestion des emails','Sécurité et accès','Maintenance'],
    },
    avis: {
        icon:'star', titre:'Gestion des Avis',
        desc:'Modérez les avis clients et gérez les signalements.',
        features:['Modérer les avis','Supprimer les abus','Statistiques de satisfaction','Répondre aux avis'],
    },
};

export const AdminPlaceholder = (sectionId) => {
    const info = SECTIONS[sectionId];
    if (!info) return document.createElement('div');

    const wrapper = document.createElement('div');
    wrapper.className = 'placeholder-section';

    wrapper.innerHTML = `
        <div class="placeholder-card">
            <div class="placeholder-icon">
                <i data-lucide="${info.icon}"></i>
            </div>
            <h2 class="placeholder-title">${info.titre}</h2>
            <p class="placeholder-desc">${info.desc}</p>

            <div class="placeholder-features">
                <p class="features-label">Fonctionnalités prévues</p>
                <ul>
                    ${info.features.map(f => `
                        <li>
                            <i data-lucide="check" class="feature-check"></i>
                            ${f}
                        </li>`).join('')}
                </ul>
            </div>

            <div class="placeholder-badge">
                <i data-lucide="hammer"></i>
                En cours de développement
            </div>
        </div>
    `;

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};