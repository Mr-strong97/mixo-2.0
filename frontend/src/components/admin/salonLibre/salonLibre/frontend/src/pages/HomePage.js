import { Navbar } from '../components/Navbar.js';
import { ZoneHero } from '../components/ZoneHero.js';
import { StatsCatalogue } from '../components/StatsCatalogue.js';
import { Footer } from '../components/Footer.js';

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

    // 3. Assemblage des composants dans le DOM
    // La Navbar reste fixe à gauche à la racine du wrapper
    page.appendChild(nav);
    
    // 🛠️ FIX : Création d'un wrapper de mise en page pour le contenu à droite de la sidebar
    const contentLayout = document.createElement('div');
    contentLayout.className = 'main-content-layout';
    
    const main = document.createElement('main');
    main.appendChild(hero);
    main.appendChild(stats);
    
    // On met le main et le footer dans le conteneur de droite
    contentLayout.appendChild(main);
    contentLayout.appendChild(footer);
    
    // On injecte le layout à côté de la Navbar
    page.appendChild(contentLayout);

    // Initialisation des icônes Lucide après l'injection (Règle 5)
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 0);

    return page;
};