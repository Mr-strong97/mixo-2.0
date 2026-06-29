import { ButtonHero } from './ButtonHero';
import { HeroSlider } from './HeroSlider';

export const ZoneHero = () => {
    const section = document.createElement('section');
    section.className = 'zone-hero';

    const images = [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000',
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000',
        'https://images.unsplash.com/photo-1585747821305-33f7224d8528?q=80&w=1000',
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000',
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000',
        'https://images.unsplash.com/photo-1493246507139-91e8bef99c17?q=80&w=1000',
        'https://images.unsplash.com/photo-1599351431247-f509152c7133?q=80&w=1000',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=1000',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1000'
    ];

    section.innerHTML = `
        <div class="container h-100">
            <div class="row align-items-center h-100 g-5">
                <!-- TEXTE (GAUCHE) -->
                <div class="col-lg-6 hero-text-area">
                    <div class="badge-premium mb-3">COIFFURE HAUTE COUTURE</div>
                    <h1 class="display-title">
                        LA COIFFURE : <br>
                        <span class="text-gold">UN ART À DEUX.</span>
                    </h1>
                    <p class="hero-subtitle">
                        Vivez une expérience immersive où l'expertise rencontre vos désirs. 
                        Un duo parfait pour sublimer votre identité.
                    </p>
                    <div class="hero-btns-group">
                        <div id="primary-btn-root"></div>
                        <div id="secondary-btn-root"></div>
                    </div>
                </div>

                <!-- SLIDER (DROITE) -->
                <div class="col-lg-6">
                    <div class="glass-frame">
                        <div id="slider-mount"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Montage des composants
    section.querySelector('#primary-btn-root').appendChild(ButtonHero("Réserver", "primary"));
    section.querySelector('#secondary-btn-root').appendChild(ButtonHero("Services", "secondary"));
    section.querySelector('#slider-mount').appendChild(HeroSlider(images));

    return section;
};