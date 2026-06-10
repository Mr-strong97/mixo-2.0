import { Navbar } from '../../components/navbars/Navbar.js';
import { ZoneHero } from '../../components/ZoneHero.js';
import { StatsCatalogue } from '../../components/StatsCatalogue.js';
import { Footer } from '../../components/Footer.js';


/**
 * Page : HomePage
 * Orchestre les différents composants pour construire l'accueil.
 */
export const HomePage = () => {
    // 1. Création du conteneur racine de la page
    const page = document.createElement('div');
    page.className = 'home-page-wrapper';

    // 2. Initialisation des composants (Pattern MVC : Vue)
    const nav = Navbar();
    const hero = ZoneHero();
    const stats = StatsCatalogue(); 
    const footer = Footer();

    // 3. Assemblage des composants dans le DOM (Règle 2)
    page.appendChild(nav);
    
    // On peut ajouter un conteneur "main" pour le SEO et la structure
    const main = document.createElement('main');
    main.appendChild(hero);
    main.appendChild(stats);
    
    // Ici, nous pourrons ajouter d'autres sections plus tard (ServicesCard, etc.)
    
    page.appendChild(main);
    page.appendChild(footer);

    // Initialisation des icônes Lucide après l'injection (Règle 5)
    // On utilise un setTimeout pour s'assurer que le DOM est prêt
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 0);

    return page;
};