/**
 * FinalCta.js — Mixo
 * Section de clôture — appel à l'action final, double destination
 * (client / professionnel), avec un halo décoratif en accent.
 */
export const FinalCta = () => {
    const section = document.createElement('section');
    section.className = 'mixo-cta mixo-section';
    section.id = 'rejoindre';

    section.innerHTML = `
        <div class="mixo-cta__glow" aria-hidden="true"></div>
        <div class="mixo-container mixo-cta__inner" data-animate="zoom-in">
            <span class="mixo-eyebrow"><i data-lucide="rocket"></i><span>Prêt à commencer ?</span></span>
            <h2 class="mixo-cta__title">Rejoignez Mixo dès aujourd'hui.</h2>
            <p class="mixo-cta__subtitle">
                Que vous cherchiez votre prochain coiffeur ou que vous souhaitiez
                développer votre activité, Mixo vous accompagne à chaque étape.
            </p>
            <div class="mixo-cta__actions">
                <button class="m_hero_btn_primary" id="cta-client-btn">
                    <i data-lucide="calendar-check"></i>
                    Trouver mon coiffeur
                </button>
                <button class="m_hero_btn_secondary" id="cta-pro-btn">
                    <i data-lucide="briefcase"></i>
                    Devenir partenaire
                </button>
            </div>
        </div>
    `;

    section.querySelector('#cta-client-btn').addEventListener('click', () => {
        if (window.navigate) window.navigate('/services');
        else window.location.href = '/services';
    });

    section.querySelector('#cta-pro-btn').addEventListener('click', () => {
        const target = document.getElementById('pour-coiffeurs');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return section;
};
