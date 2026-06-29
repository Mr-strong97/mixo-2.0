import { WelcomePage }           from './pages/WelcomePage.js';
import { RegisterPage }          from './pages/RegisterPage.js';
import { LoginPage }             from './pages/LoginPage.js';
import { HomePage }              from './pages/HomePage.js';
import { ProfilePage }           from './pages/ProfilePage.js';
import { SettingsPage }          from './pages/SettingsPage.js';
import { AdminPage }             from './pages/AdminPage.js';
import { AdminProfilePage }      from './pages/AdminProfilePage.js';
import { AdminStatsPage }        from './pages/AdminStatsPage.js';
import { VerifyEmailPage }       from './pages/VerifyEmailPage.js';
import { ForgotPasswordPage }    from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage }     from './pages/ResetPasswordPage.js';
import { SuspendedAccountPage }  from './pages/SuspendedAccountPage.js';

const routes = [
    { path: /^\/$/, component: WelcomePage },
    { path: /^\/login$/,             component: LoginPage },
    { path: /^\/register$/,          component: RegisterPage },
    { path: /^\/home$/,              component: HomePage },
    { path: /^\/settings$/,          component: SettingsPage },
    { path: /^\/admin$/,             component: AdminPage },
    { path: /^\/admin\/profile$/,    component: AdminProfilePage },
    { path: /^\/admin\/stats$/,      component: AdminStatsPage },
    { path: /^\/verify-email$/,      component: VerifyEmailPage },
    { path: /^\/forgot-password$/,   component: ForgotPasswordPage },
    { path: /^\/reset-password$/,    component: ResetPasswordPage },
    { path: /^\/compte-suspendu$/,   component: SuspendedAccountPage },
    { path: /^\/([a-zA-Z0-9._-]+)\/([a-z0-9-]+)$/, component: ProfilePage },
];

export const initRouter = (appElement) => {
    const render = () => {
        const path  = window.location.pathname;
        const route = routes.find(r => r.path.test(path));
        const Ctor  = route ? route.component : WelcomePage;

        appElement.innerHTML = '';

        try {
            const match  = route ? path.match(route.path) : null;
            let   params = {};
            if (match && route?.component === ProfilePage) {
                params = { username: match[1], id: match[2] };
            }
            appElement.appendChild(Ctor(params));
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            console.error("Erreur de rendu :", error);
        }
    };

    window.navigate = (path) => {
        window.history.pushState({}, "", path);
        render();
    };
    window.onpopstate = () => render();
    render();
};

export const getRouteParams = () => {
    const parts = window.location.pathname.split('/');
    return { username: parts[1] || null, id: parts[2] || null };
};