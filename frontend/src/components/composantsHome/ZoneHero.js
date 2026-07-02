/**
 * ZoneHero.js — Mixo
 * Section d'accueil (Hero) de la marketplace Mixo.
 *
 * - Présente Mixo en une phrase (badge) + accroche orientée client
 * - Deux CTA : un pour les clients (réserver), un pour les coiffeurs (rejoindre)
 * - Carte vidéo "client satisfait" en boucle (preuve sociale)
 * - Fond décoratif : orbes flous + grille subtile (cf. SKILL.md)
 */
export const ZoneHero = () => {
    const hero = document.createElement('section');
    hero.className = 'mixo-hero-section';
    hero.id = 'hero';

    hero.innerHTML = `
        <div class="m_hero_bg" aria-hidden="true">
            <div class="m_hero_orb m_hero_orb--a"></div>
            <div class="m_hero_orb m_hero_orb--b"></div>
            <div class="m_hero_grid"></div>
        </div>

        <div class="m_hero_container">
            <div class="m_hero_content" data-animate="fade-up">
                <span class="m_hero_badge">
                    <i data-lucide="sparkles"></i>
                    La plateforme qui connecte coiffeurs &amp; clients
                </span>
                <h1 class="m_hero_title">
                    Votre prochain coiffeur, <br>
                    <span class="m_hero_gradient">à portée de clic.</span>
                </h1>
                <p class="m_hero_description">
                    Mixo réunit clients et professionnels de la coiffure sur une
                    seule plateforme : recherchez, comparez les prestations et
                    réservez votre rendez-vous en quelques clics — où que vous soyez.
                </p>
                <div class="m_hero_actions">
                    <button class="m_hero_btn_primary" id="hero-booking-btn">
                        <i data-lucide="calendar-check"></i>
                        Réserver un coiffeur
                    </button>
                    <button class="m_hero_btn_secondary" id="hero-pro-btn">
                        <i data-lucide="briefcase"></i>
                        Je suis coiffeur
                    </button>
                </div>
            </div>

            <div class="m_hero_visual" data-animate="zoom-in" data-delay="150">
                <div class="m_hero_visual_glow" aria-hidden="true"></div>

                <div class="m_hero_video_card">
                    <img
                        class="m_hero_video"
                        src="/images/mixo3.png"
                        alt="Client Mixo souriant"
                        loading="eager"
                        decoding="async"
                    >
                    <div class="m_hero_video_badge">
                        <i data-lucide="badge-check"></i>
                        <span>Client Mixo &middot; rendez-vous réussi</span>
                    </div>
                </div>

                <div class="m_hero_float_card">
                    <i data-lucide="star"></i>
                    <div class="m_hero_float_card_text">
                        <strong>4.9/5</strong>
                        <span>+2 300 avis vérifiés</span>
                    </div>
                </div>
            </div>
        </div>

        <button class="m_hero_scroll_hint" id="hero-scroll-hint" type="button" aria-label="Découvrir comment fonctionne Mixo">
            <span>Découvrir Mixo</span>
            <i data-lucide="chevron-down"></i>
        </button>
    `;

    // CTA principal : direction réservation (client)
    hero.querySelector('#hero-booking-btn').addEventListener('click', () => {
        if (window.navigate) window.navigate('/services');
        else window.location.href = '/services';
    });

    // CTA secondaire : ancre vers le bloc "Pour les coiffeurs"
    hero.querySelector('#hero-pro-btn').addEventListener('click', () => {
        const target = document.getElementById('pour-coiffeurs');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Indication de scroll : ancre vers la présentation de la plateforme
    hero.querySelector('#hero-scroll-hint').addEventListener('click', () => {
        const target = document.getElementById('decouvrir-mixo');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return hero;
};
