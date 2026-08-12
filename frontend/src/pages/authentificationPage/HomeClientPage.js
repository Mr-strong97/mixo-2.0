import { Navbar } from '../../components/navbars/Navbar.js';
import { HomeClientSection } from '../../components/composantsHome/HomeClientSection.js';
import { Footer } from '../../components/Footer.js';
import { requireAuth } from '../../utils/AuthGuard.js';
import '../../styles/authentificationStyles/ClientHome.css';

export const HomeClientPage = () => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'client-home-page';

    const main = document.createElement('main');
    main.className = 'client-home-main';
    main.append(HomeClientSection());

    page.append(Navbar(), main, Footer());

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
    }, 0);

    return page;
};
