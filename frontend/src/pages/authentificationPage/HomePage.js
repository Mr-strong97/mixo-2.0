import { HomeClientPage } from './HomeClientPage.js';
import { CoiffeurDashboardPage } from '../dashboardPage/CoiffeurDashboardPage.js';
import { AdminDashboardPage } from '../adminDashboard/AdminDashboardPage.js';

/**
 * Page : HomePage
 * Orchestre les sections de la nouvelle page d'accueil Mixo :
 *
 *   1. ZoneHero               — accroche + carte vidéo "client satisfait"
 *   2. PlatformOverview        — "Qu'est-ce que Mixo ?" (clients / coiffeurs)
 *   3. TransformationShowcase  — section signature scroll-driven (canvas)
 *   4. HowItWorks              — "Comment ça fonctionne ?" (5 étapes)
 *   5. Benefits                — avantages (clients / coiffeurs)
 *   6. StatsCatalogue          — statistiques animées (count-up)
 *   7. Testimonials            — avis clients & coiffeurs
 *   8. FinalCta                — appel à l'action de clôture
 */
export const HomePage = () => {
    const role = (localStorage.getItem('user_role') || 'client').toLowerCase().trim();

    // Après connexion, chaque rôle arrive directement dans son espace de
    // travail. replaceState garde un historique propre sans provoquer un
    // second rendu du routeur.
    if (role === 'admin') {
        window.history.replaceState({}, '', '/admin/dashboard');
        return AdminDashboardPage();
    }
    if (role === 'coiffeur') {
        window.history.replaceState({}, '', '/coiffeur/dashboard');
        return CoiffeurDashboardPage();
    }
    return HomeClientPage();
};
