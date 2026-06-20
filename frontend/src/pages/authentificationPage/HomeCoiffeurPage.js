import { Navbar } from '../../components/navbars/Navbar.js';
import { HomeCoiffeurSection } from '../../components/composantsHome/HomeCoiffeurSection.js';
import { PlatformOverview } from '../../components/composantsHome/PlatformOverview.js';
import { HowItWorks } from '../../components/composantsHome/HowItWorks.js';
import { Benefits } from '../../components/composantsHome/Benefits.js';
import { StatsCatalogue } from '../../components/composantsHome/StatsCatalogue.js';
import { FinalCta } from '../../components/composantsHome/FinalCta.js';
import { Footer } from '../../components/Footer.js';
import { initScrollReveal, initScrollProgress } from '../../utils/scrollReveal.js';
import '../../styles/authentificationStyles/Home.css';

export const HomeCoiffeurPage = () => {
    const page = document.createElement('div');
    page.className = 'home-page-wrapper home-page-wrapper--coiffeur';

    const main = document.createElement('main');
    main.append(
        HomeCoiffeurSection(),
        PlatformOverview(),
        HowItWorks(),
        Benefits(),
        StatsCatalogue(),
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
