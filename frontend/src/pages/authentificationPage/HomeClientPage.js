import { Navbar } from '../../components/navbars/Navbar.js';
import { HomeClientSection } from '../../components/composantsHome/HomeClientSection.js';
import { PlatformOverview } from '../../components/composantsHome/PlatformOverview.js';
import { HowItWorks } from '../../components/composantsHome/HowItWorks.js';
import { Benefits } from '../../components/composantsHome/Benefits.js';
import { Testimonials } from '../../components/composantsHome/Testimonials.js';
import { FinalCta } from '../../components/composantsHome/FinalCta.js';
import { Footer } from '../../components/Footer.js';
import { initScrollReveal, initScrollProgress } from '../../utils/scrollReveal.js';
import '../../styles/authentificationStyles/Home.css';

export const HomeClientPage = () => {
    const page = document.createElement('div');
    page.className = 'home-page-wrapper home-page-wrapper--client';

    const main = document.createElement('main');
    main.append(
        HomeClientSection(),
        PlatformOverview(),
        HowItWorks(),
        Benefits(),
        Testimonials(),
        FinalCta()
    );

    page.append(Navbar(), main, Footer());

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
        initScrollReveal(page);
        initScrollProgress(page);
    }, 0);

    return page;
};
