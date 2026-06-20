// ============================================================
//  router.js — MIXO · Routeur SPA
// ============================================================

// ── 2.1. BIENVENUE & TUNNEL D'AUTHENTIFICATION ──
import { WelcomePage }          from './pages/authentificationPage/WelcomePage.js';
import { LoginPage }             from './pages/authentificationPage/LoginPage.js';
import { RegisterPage }          from './pages/authentificationPage/RegisterPage.js';
import { HomePage }              from './pages/authentificationPage/HomePage.js';
import { HomeAdminPage }         from './pages/authentificationPage/HomeAdminPage.js';

// ── 2.2. GESTION DE COMPTE, SÉCURITÉ & VÉRIFICATION ──
import { VerifyEmailPage }       from './pages/authentificationPage/VerifyEmailPage.js';
import { ForgotPasswordPage }    from './pages/authentificationPage/ForgotPasswordPage.js';
import { ResetPasswordPage }     from './pages/authentificationPage/ResetPasswordPage.js';
import { SuspendedAccountPage }  from './pages/authentificationPage/SuspendedAccountPage.js';

// ── 2.3. ESPACES PROFIL ──
import { SettingsPage }            from './pages/authentificationPage/SettingsPage.js';
import { ClientSettingsPage }      from './pages/authentificationPage/ClientSettingsPage.js';
import { CoiffeurSettingsPage }    from './pages/authentificationPage/CoiffeurSettingsPage.js';

// ── 2.4. NOTIFICATIONS ──
import { NotificationPage }      from './pages/notificationPage/NotificationPage.js';

// ── 2.5. ADMINISTRATION ──
import { AdminPage }             from './pages/authentificationPage/AdminPage.js';
import { AdminProfilePage }      from './pages/authentificationPage/AdminProfilePage.js';
import { AdminStatsPage }        from './pages/authentificationPage/AdminStatsPage.js';
import { AuditLogPage }          from './pages/authentificationPage/AuditLogPage.js';

// ── 2.6. MODULE SERVICES ──
//   Espace Client
import { ClientServicesPage }        from './pages/servicePage/ClientservicesPage.js';
import { ServiceDetailPage }         from './pages/servicePage/ServiceDetailPage.js';
//   Espace Coiffeur
import { CoiffeurServicesPage }      from './pages/servicePage/CoiffeurServicesPage.js';
import { CoiffeurServiceDetailPage } from './pages/servicePage/CoiffeurServiceDetailPage.js';
import { CoiffeurServiceEditPage }   from './pages/servicePage/CoiffeurServiceEditPage.js';
import { ServiceWizardPage }         from './pages/servicePage/ServiceWizardPage.js';


// services du coiffeur dans le systeme
import { CoiffeurAbonnementPage } from './pages/abonnementPage/CoiffeurAbonnementPage.js';
import { CoiffeurHorairesPage }   from './pages/horairePage/CoiffeurHorairesPage.js';
import { CoiffeurPortfolioPage }  from './pages/portfolioPage/CoiffeurPortfolioPage.js';
import { AdminServicesDashboardPage } from './pages/adminPage/AdminServicesDashboardPage.js';


const createInfoPage = (title, description) => (extra = {}) => {
    const page = document.createElement('div');
    page.className = 'route-placeholder';
    page.innerHTML = `
        <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;background:linear-gradient(135deg,#F8FAFC,#EEF4FF);">
            <section style="max-width:720px;width:100%;background:#fff;border:1px solid #E2E8F0;border-radius:24px;padding:36px;box-shadow:0 24px 60px rgba(15,23,42,0.08);">
                <p style="text-transform:uppercase;letter-spacing:.18em;font-size:.75rem;font-weight:700;color:#0A66C2;margin:0 0 12px;">Bientôt disponible</p>
                <h1 style="margin:0 0 12px;font-size:2rem;line-height:1.1;color:#0F172A;">${title}</h1>
                <p style="margin:0;color:#475569;font-size:1rem;line-height:1.7;">${description}</p>
                ${extra.message ? `<div style="margin-top:18px;padding:14px 16px;border-radius:14px;background:#F8FAFC;color:#334155;">${extra.message}</div>` : ''}
            </section>
        </main>
    `;
    if (window.lucide) window.lucide.createIcons();
    return page;
};


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
    { path: /^\/settings$/,             component: SettingsPage },
    { path: /^\/parametres\/client$/,   component: ClientSettingsPage },
    { path: /^\/parametres\/coiffeur$/, component: CoiffeurSettingsPage },

    // Accueil connecté
    { path: /^\/home$/,            component: HomePage },
    { path: /^\/admin\/home$/,     component: HomeAdminPage },

    // Administration
    { path: /^\/admin$/,             component: AdminPage },
    { path: /^\/admin\/profile$/,    component: AdminProfilePage },
    { path: /^\/admin\/stats$/,      component: AdminStatsPage },
    { path: /^\/admin\/journal$/,    component: AuditLogPage },
    { path: /^\/admin\/parametres$/, component: createInfoPage('Paramètres administrateur', 'Les paramètres admin seront exposés dans un écran dédié.') },

    // Notifications
    { path: /^\/notifications$/,   component: NotificationPage },

    // Pages en cours de réalisation mais déjà reliées à la navigation
    { path: /^\/favoris$/,         component: createInfoPage('Favoris', 'La liste de favoris sera disponible dans une prochaine itération.') },
    { path: /^\/historique$/,      component: createInfoPage('Historique', 'Vos rendez-vous passés et à venir apparaîtront ici.') },
    { path: /^\/rendez-vous$/,     component: createInfoPage('Rendez-vous', 'La gestion détaillée des rendez-vous coiffeur arrive bientôt.') },
    { path: /^\/plannings$/,       component: createInfoPage('Plannings', 'La gestion des plannings coiffeur est en préparation.') },
    { path: /^\/avis$/,            component: createInfoPage('Avis', 'L’espace avis clients sera relié prochainement.') },


    // ════════════════════════════════════════════════════════
    //  MODULE SERVICES
    //   ORDRE CRITIQUE : routes spécifiques avant /:id générique
    // ════════════════════════════════════════════════════════

    // ── Espace Coiffeur — routes fixes (avant /:id) ──────────
    { path: /^\/coiffeur\/services$/,     component: CoiffeurServicesPage },
    { path: /^\/coiffeur\/services\/new$/, component: ServiceWizardPage },
    

    // ── Espace Coiffeur — routes paramétrées ─────────────────
    {
        path: /^\/coiffeur\/services\/([a-zA-Z0-9_-]+)\/edit$/,
        component: (params) => CoiffeurServiceEditPage(params),
        paramKeys: ['id'],
    },
    {
        path: /^\/coiffeur\/services\/([a-zA-Z0-9_-]+)$/,
        component: (params) => CoiffeurServiceDetailPage(params),
        paramKeys: ['id'],
    },

    // ── Espace Client — liste puis détail ────────────────────
    { path: /^\/services$/, component: ClientServicesPage },
    {
        path: /^\/services\/([a-zA-Z0-9_-]+)$/,
        component: (params) => ServiceDetailPage(params),
        paramKeys: ['id'],
    },

    { path: /^\/coiffeur\/abonnement$/, component: CoiffeurAbonnementPage },
    { path: /^\/coiffeur\/horaires$/,   component: CoiffeurHorairesPage },
    { path: /^\/coiffeur\/portfolio$/,  component: CoiffeurPortfolioPage },
    { path: /^\/admin\/services$/,      component: AdminServicesDashboardPage },

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
            if (match && route?.paramKeys?.length) {
                params = route.paramKeys.reduce((acc, key, index) => {
                    acc[key] = match[index + 1];
                    return acc;
                }, {});
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
