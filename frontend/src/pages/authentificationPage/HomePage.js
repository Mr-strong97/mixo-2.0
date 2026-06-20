import { HomeClientPage } from './HomeClientPage.js';
import { HomeCoiffeurPage } from './HomeCoiffeurPage.js';
import { HomeAdminPage } from './HomeAdminPage.js';

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

    if (role === 'admin') return HomeAdminPage();
    if (role === 'coiffeur') return HomeCoiffeurPage();
    return HomeClientPage();
};
