import { Navbar } from '../../components/navbars/Navbar.js';
import { HomeAdminSection } from '../../components/composantsHome/HomeAdminSection.js';
import { Footer } from '../../components/Footer.js';
import { initScrollReveal, initScrollProgress } from '../../utils/scrollReveal.js';
import '../../styles/authentificationStyles/Home.css';

export const HomeAdminPage = () => {
    const page = document.createElement('div');
    page.className = 'home-page-wrapper home-page-wrapper--admin';

    const main = document.createElement('main');
    main.innerHTML = `
        <section class="home-admin-stats mixo-section">
            <div class="mixo-container">
                <div class="home-admin-stats__grid">
                    <article class="home-admin-stats__card" data-animate="fade-up">
                        <span><i data-lucide="users"></i></span>
                        <strong>Gestion complète</strong>
                        <p>Surveillez les clients, les coiffeurs et les comptes en attente.</p>
                    </article>
                    <article class="home-admin-stats__card" data-animate="fade-up" data-delay="80">
                        <span><i data-lucide="scissors"></i></span>
                        <strong>Services validés</strong>
                        <p>Gardez une vue rapide sur les prestations publiées et leurs statuts.</p>
                    </article>
                    <article class="home-admin-stats__card" data-animate="fade-up" data-delay="160">
                        <span><i data-lucide="shield"></i></span>
                        <strong>Contrôle sécurité</strong>
                        <p>Accédez aux profils admin, à l’audit et aux paramétrages.</p>
                    </article>
                </div>
            </div>
        </section>
    `;
    main.prepend(HomeAdminSection());

    page.append(Navbar(), main, Footer());

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
        initScrollReveal(page);
        initScrollProgress(page);
    }, 0);

    return page;
};
