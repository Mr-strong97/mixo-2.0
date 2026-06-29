/**
 * AdminPlaceholder.js
 * =====================
 * Affichage pour les sections non encore développées.
 * Emplacement : src/components/admin/AdminPlaceholder.js
 */
const SECTION_INFO = {
    avis: {
        icon:    'star',
        titre:   'Gestion des Avis',
        desc:    'Modérez les avis laissés par les clients, signalez les commentaires inappropriés et répondez aux avis.',
        features: ['Voir tous les avis', 'Supprimer les avis abusifs', 'Voir les avis signalés', 'Statistiques de satisfaction'],
    },
    horaires: {
        icon:    'clock',
        titre:   'Gestion des Horaires',
        desc:    'Supervisez les créneaux de disponibilité des coiffeurs et gérez les exceptions.',
        features: ['Vue calendrier globale', 'Gérer les jours de fermeture', 'Voir les conflits d\'horaires', 'Exporter les plannings'],
    },
    notifications: {
        icon:    'bell',
        titre:   'Gestion des Notifications',
        desc:    'Envoyez des notifications ciblées aux utilisateurs et gérez les campagnes de communication.',
        features: ['Envoyer une notification globale', 'Cibler par rôle (client/coiffeur)', 'Historique des envois', 'Modèles de notification'],
    },
    medias: {
        icon:    'image',
        titre:   'Gestion des Médias',
        desc:    'Modérez les photos et vidéos publiées par les coiffeurs dans leurs portfolios.',
        features: ['Valider les médias en attente', 'Supprimer les contenus inappropriés', 'Statistiques d\'utilisation', 'Stockage et quotas'],
    },
    paiements: {
        icon:    'credit-card',
        titre:   'Gestion des Paiements',
        desc:    'Suivez les transactions, gérez les remboursements et consultez les rapports financiers.',
        features: ['Tableau de bord financier', 'Historique des transactions', 'Gérer les remboursements', 'Commissions plateforme'],
    },
};

export const AdminPlaceholder = (sectionId) => {
    const info = SECTION_INFO[sectionId];
    if (!info) return document.createElement('div');

    const wrapper = document.createElement('div');
    wrapper.className = 'admin-section placeholder-section';

    wrapper.innerHTML = `
        <div class="placeholder-card">
            <div class="placeholder-icon">
                <i data-lucide="${info.icon}"></i>
            </div>
            <h2 class="placeholder-title">${info.titre}</h2>
            <p class="placeholder-desc">${info.desc}</p>

            <div class="placeholder-features">
                <p class="features-label">Fonctionnalités prévues :</p>
                <ul>
                    ${info.features.map(f => `
                        <li>
                            <i data-lucide="check" class="feature-check"></i>
                            ${f}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="placeholder-badge">
                <i data-lucide="hammer"></i>
                En cours de développement
            </div>
        </div>
    `;

    return wrapper;
};