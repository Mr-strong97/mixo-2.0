/**
 * ProfilePage.js
 * ==============
 * Orchestre les différents composants pour construire l'espace profil premium.
 * Gère le layout multi-colonnes (Navbar gauche / Contenu central / Footer sidebar droite).
 */

import { Navbar } from '../components/Navbar.js';
import { ServiceProfile } from '../components/serviceProfile.js';
import { Footer } from '../components/Footer.js';

export const ProfilePage = () => {
    // 1. Création du conteneur racine de la page
    const page = document.createElement('div');
    page.className = 'home-page-wrapper';

    // 2. Initialisation des composants (Pattern Vue)
    const nav = Navbar();
    const profil = ServiceProfile();
    const footer = Footer();

    // 3. Assemblage de la Navbar latérale gauche
    page.appendChild(nav);
    
    // 4. Création du layout principal (Zone centrale + Zone droite)
    const contentLayout = document.createElement('div');
    contentLayout.className = 'main-content-layout';
    
    const main = document.createElement('main');
    main.className = 'profile-page-container'; // Calé sur la classe racine de votre CSS de profil
    main.appendChild(profil);
    
    // On regroupe le contenu principal et le footer sidebar droite
    contentLayout.appendChild(main);
    contentLayout.appendChild(footer);
    
    // Injection du layout complet à côté de la Navbar gauche
    page.appendChild(contentLayout);

    // 5. Sécurité d'initialisation des icônes Lucide globales
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons({
                attrs: {
                    'stroke-width': 2
                }
            });
        }
    }, 100); // Léger décalage (100ms) pour laisser les composants enfants finir leur propre instanciation

    return page;
};