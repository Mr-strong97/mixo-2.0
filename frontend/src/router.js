// ============================================================
//  router.js — MIXO · Routeur SPA
// ============================================================

// ── 2.1. BIENVENUE & TUNNEL D'AUTHENTIFICATION ──
import { WelcomePage }          from './pages/authentificationPage/WelcomePage.js';
import { LoginPage }             from './pages/authentificationPage/LoginPage.js';
import { RegisterPage }          from './pages/authentificationPage/RegisterPage.js';
import { HomePage }              from './pages/authentificationPage/HomePage.js';

// ── 2.2. GESTION DE COMPTE, SÉCURITÉ & VÉRIFICATION ──
import { VerifyEmailPage }       from './pages/authentificationPage/VerifyEmailPage.js';
import { ForgotPasswordPage }    from './pages/authentificationPage/ForgotPasswordPage.js';
import { ResetPasswordPage }     from './pages/authentificationPage/ResetPasswordPage.js';
import { SuspendedAccountPage }  from './pages/authentificationPage/SuspendedAccountPage.js';

// ── 2.3. ESPACES PROFIL ──
import { ProfilePage }           from './pages/authentificationPage/ProfilePage.js';
import { SettingsPage }          from './pages/authentificationPage/SettingsPage.js';

// ── 2.4. NOTIFICATIONS ──
import { NotificationPage }      from './pages/notificationPage/NotificationPage.js';

// ── 2.5. ADMINISTRATION ──
import { AdminPage }             from './pages/authentificationPage/AdminPage.js';
import { AdminProfilePage }      from './pages/authentificationPage/AdminProfilePage.js';
import { AdminStatsPage }        from './pages/authentificationPage/AdminStatsPage.js';
import { AuditLogPage }          from './pages/authentificationPage/AuditLogPage.js';

// ── 2.6. MODULE SERVICES ──
import { ClientServicesPage }    from './pages/servicePage/ClientservicesPage.js';
import { CoiffeurServicesPage }  from './pages/servicePage/CoiffeurServicesPage.js';
import { ServiceWizardPage }     from './pages/servicePage/ServiceWizardPage.js';


// ─────────────────────────────────────────────────────────────
const routes = [
    { path: /^\/$/, component: WelcomePage },

    // Auth
    { path: /^\/login$/,           component: LoginPage },
    { path: /^\/register$/,        component: RegisterPage },
    { path: /^\/verify-email$/,    component: VerifyEmailPage },
    { path: /^\/forgot-password$/, component: ForgotPasswordPage },
    { path: /^\/reset-password$/,  component: ResetPasswordPage },
    { path: /^\/compte-suspendu$/, component: SuspendedAccountPage },

    // Compte & paramètres
    { path: /^\/settings$/,        component: SettingsPage },

    // Accueil connecté
    { path: /^\/home$/,            component: HomePage },

    // Administration
    { path: /^\/admin$/,           component: AdminPage },
    { path: /^\/admin\/profile$/,  component: AdminProfilePage },
    { path: /^\/admin\/stats$/,    component: AdminStatsPage },
    { path: /^\/admin\/journal$/,  component: AuditLogPage },

    // Notifications
    { path: /^\/notifications$/,   component: NotificationPage },

    // ── Module Services ──────────────────────────────────────
    // /services           → dispatche selon le rôle (client ou coiffeur)
    { path: /^\/services$/, component: ClientServicesPage },

    // /coiffeur/services           → tableau de bord des services (coiffeur)
    { path: /^\/coiffeur\/services$/, component: CoiffeurServicesPage },

    // /coiffeur/services/new       → wizard création
    { path: /^\/coiffeur\/services\/new$/, component: ServiceWizardPage },

    // /coiffeur/services/:id/edit  → wizard édition
    {
        path: /^\/coiffeur\/services\/([a-zA-Z0-9_-]+)\/edit$/,
        component: (params) => ServiceWizardPage(params),
        paramKeys: ['serviceId'],
    },

    // Profil public : /:username/:id
    { path: /^\/([a-zA-Z0-9._-]+)\/([a-z0-9-]+)$/, component: ProfilePage },
];

// ─────────────────────────────────────────────────────────────
export const initRouter = (appElement) => {
    const render = () => {
        const path  = window.location.pathname;
        const route = routes.find(r => r.path.test(path));
        const Ctor  = route ? route.component : WelcomePage;

        appElement.innerHTML = '';

        try {
            const match = route ? path.match(route.path) : null;
            let params  = {};
            if (match && route?.component === ProfilePage) {
                params = { username: match[1], id: match[2] };
            }
            appElement.appendChild(Ctor(params));
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            console.error('[Router] Erreur de rendu :', error);
        }
    };

    window.navigate = (path) => {
        window.history.pushState({}, '', path);
        render();
    };
    window.onpopstate = () => render();
    render();
};