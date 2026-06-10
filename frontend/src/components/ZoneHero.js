/**
 * ZoneHero.js — Coiffetime / MIXO
 * Composant de la section d'accueil (Hero Section)
 */
export const ZoneHero = () => {
    const hero = document.createElement('section');
    hero.className = 'mixo-hero-section';

    hero.innerHTML = `
        <div class="m_hero_container">
            <div class="m_hero_content">
                <span class="m_hero_badge">
                    <i data-lucide="sparkles"></i>
                    Le standard de l'excellence
                </span>
                <h1 class="m_hero_title">
                    Exceptional <br>
                    <span class="m_hero_gradient">Craftsmanship.</span>
                </h1>
                <p class="m_hero_description">
                    Découvrez l'excellence des soins capillaires et de la barbe chez Mixo Barber. 
                    Précision, style et tradition réinventés pour le luxe moderne.
                </p>
                <div class="m_hero_actions">
                    <button class="m_hero_btn_primary" id="hero-booking-btn">
                        <i data-lucide="calendar"></i>
                        Réserver un rendez-vous
                    </button>
                    <button class="m_hero_btn_secondary" id="hero-discover-btn">
                        Voir nos services
                    </button>
                </div>
            </div>
            
            <div class="m_hero_image_wrapper">
                <div class="m_hero_image_overlay"></div>
                <!-- L'image de fond "Main (4).jpg" ou similaire sera configurée via le CSS -->
                <div class="m_hero_image"></div>
            </div>
        </div>
    `;

    // Événements de navigation rapides
    hero.querySelector('#hero-booking-btn').addEventListener('click', () => {
        if (window.navigate) window.navigate('/catalogue');
        else window.location.href = '#catalogue';
    });

    hero.querySelector('#hero-discover-btn').addEventListener('click', () => {
        const target = document.querySelector('.mixo-catalogue-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });

    return hero;
};