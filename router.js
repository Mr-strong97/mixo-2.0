// ============================================================
//  router.js — MIXO · Routeur SPA
// ============================================================

// ── 2.1. BIENVENUE & TUNNEL D'AUTHENTIFICATION ──
import { WelcomePage }          from './frontend/src/pages/authentificationPage/WelcomePage.js';
import { LoginPage }             from './frontend/src/pages/authentificationPage/LoginPage.js';
import { RegisterPage }          from './frontend/src/pages/authentificationPage/RegisterPage.js';
import { HomePage }              from './frontend/src/pages/authentificationPage/HomePage.js';
import { HomeAdminPage }         from './frontend/src/pages/authentificationPage/HomeAdminPage.js';

// ── 2.2. GESTION DE COMPTE, SÉCURITÉ & VÉRIFICATION ──
import { VerifyEmailPage }       from './frontend/src/pages/authentificationPage/VerifyEmailPage.js';
import { ForgotPasswordPage }    from './frontend/src/pages/authentificationPage/ForgotPasswordPage.js';
import { ResetPasswordPage }     from './frontend/src/pages/authentificationPage/ResetPasswordPage.js';
import { SuspendedAccountPage }  from './frontend/src/pages/authentificationPage/SuspendedAccountPage.js';

// ── 2.3. ESPACES PROFIL ──
import { SettingsPage }            from './frontend/src/pages/authentificationPage/SettingsPage.js';
import { ClientSettingsPage }      from './frontend/src/pages/authentificationPage/ClientSettingsPage.js';
import { CoiffeurSettingsPage }    from './frontend/src/pages/authentificationPage/CoiffeurSettingsPage.js';
import { AdminSettingsPage }       from './frontend/src/pages/authentificationPage/AdminSettingsPage.js';

// ── 2.4. NOTIFICATIONS ──
import { NotificationPage }      from './frontend/src/pages/notificationPage/NotificationPage.js';
import { DiscussionPage }        from './frontend/src/pages/discussionPage/DiscussionPage.js';

// ── 2.5. ADMINISTRATION ──
import { AdminProfilePage }      from './frontend/src/pages/authentificationPage/AdminProfilePage.js';
import { AdminStatsPage }        from './frontend/src/pages/authentificationPage/AdminStatsPage.js';
import { AuditLogPage }          from './frontend/src/pages/authentificationPage/AuditLogPage.js';
import { AdminDashboardPage }    from './frontend/src/pages/adminDashboard/AdminDashboardPage.js';
import { AdminUsersPage }        from './frontend/src/pages/adminPage/AdminPage.js';


// ── 2.6. MODULE SERVICES ──
//   Espace Client
import { ClientServicesPage }        from './frontend/src/pages/servicePage/ClientservicesPage.js';
import { ServiceDetailPage }         from './frontend/src/pages/servicePage/ServiceDetailPage.js';
import { ReservationPage }          from './frontend/src/pages/rendezvousPage/ReservationPage.js';
//   Espace Coiffeur
import { CoiffeurServicesPage }      from './frontend/src/pages/servicePage/CoiffeurServicesPage.js';
import { CoiffeurServiceDetailPage } from './frontend/src/pages/servicePage/CoiffeurServiceDetailPage.js';
import { CoiffeurServiceEditPage }   from './frontend/src/pages/servicePage/CoiffeurServiceEditPage.js';
import { ServiceWizardPage }         from './frontend/src/pages/servicePage/ServiceWizardPage.js';
import { ClientRendezVousPage }      from './frontend/src/pages/rendezvousPage/ClientRendezVousPage.js';
import { CoiffeurRendezVousPage }     from './frontend/src/pages/rendezvousPage/CoiffeurRendezVousPage.js';
import { PaiementPage }              from './frontend/src/pages/paiementPage/PaiementPage.js';
import { FacturesPage }              from './frontend/src/pages/facturePage/FacturesPage.js';
import { CoiffeurAvisPage }          from './frontend/src/pages/avisPage/CoiffeurAvisPage.js';
import { LaisserAvisPage }           from './frontend/src/pages/avisPage/LaisserAvisPage.js';
import { AvisDetailPage }            from './frontend/src/pages/avisPage/AvisDetailPage.js';
import { FavorisPage }               from './frontend/src/pages/favorisPage/FavorisPage.js';
import { HistoriquePage }            from './frontend/src/pages/historiquePage/HistoriquePage.js';
import { CoiffeurDashboardPage }     from './frontend/src/pages/dashboardPage/CoiffeurDashboardPage.js';


// services du coiffeur dans le systeme
import { CoiffeurAbonnementPage } from './frontend/src/pages/abonnementPage/CoiffeurAbonnementPage.js';
import { CoiffeurHorairesPage }   from './frontend/src/pages/horairePage/CoiffeurHorairesPage.js';
import { CoiffeurPortfolioPage }  from './frontend/src/pages/portfolioPage/CoiffeurPortfolioPage.js';
import { AdminServicesDashboardPage } from './frontend/src/pages/adminPage/AdminServicesDashboardPage.js';
import { CoiffeurProfilPage } from './frontend/src/pages/profilPage/CoiffeurProfilPage.js';
import { AdminRendezVousPage } from './frontend/src/pages/adminRendezVous/AdminRendezVousPage.js';
import { AvatarCataloguePage } from './frontend/src/components/Avatarcataloguepage.js';


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

const getUserRole = () => (localStorage.getItem('user_role') || '').toLowerCase();

const roleBasedPage = (clientPage, coiffeurPage, fallbackPage = null) => () => {
    const role = getUserRole();
    if (role === 'client') return clientPage();
    if (role === 'coiffeur') return coiffeurPage();
    return fallbackPage ? fallbackPage() : createInfoPage('Accès', 'Cette page est réservée à un rôle connecté.')();
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
    { path: /^\/avatars$/,              component: () => AvatarCataloguePage({
        username: localStorage.getItem('username') || 'Utilisateur',
        avatar_choice: localStorage.getItem('avatar_choice') || 'initials',
    }) },
    { path: /^\/parametres\/client$/,   component: ClientSettingsPage },
    { path: /^\/parametres\/coiffeur$/, component: CoiffeurSettingsPage },

    // Accueil connecté
    { path: /^\/home$/,            component: HomePage },
    { path: /^\/admin\/home$/,     component: HomeAdminPage },

    // Administration
    { path: /^\/admin\/users$/, component: AdminUsersPage },
    { path: /^\/admin$/,             component: AdminDashboardPage },
    { path: /^\/admin\/dashboard$/,  component: AdminDashboardPage },
    { path: /^\/admin\/profile$/,    component: AdminProfilePage },
    { path: /^\/admin\/stats$/,      component: AdminStatsPage },
    { path: /^\/admin\/journal$/,    component: AuditLogPage },
    { path: /^\/admin\/rendez-vous$/, component: AdminRendezVousPage },
    { path: /^\/admin\/extended\/paiements\/([a-fA-F0-9-]{36})\/?$/, component: createInfoPage('Paiement administrateur', 'La consultation détaillée de ce paiement est en cours de mise en place.') },
    { path: /^\/admin\/parametres$/, component: AdminSettingsPage },

    // Notifications
    { path: /^\/notifications$/,   component: NotificationPage },
    { path: /^\/discussion$/,      component: DiscussionPage },
    { path: /^\/discussion\/([a-fA-F0-9-]{36})$/, component: (params) => DiscussionPage(params), paramKeys: ['rendez_vous_id'] },
    { path: /^\/factures$/,        component: FacturesPage },
    { path: /^\/factures\/([a-fA-F0-9-]{36})$/, component: (params) => FacturesPage(params), paramKeys: ['id'] },

    // Pages en cours de réalisation mais déjà reliées à la navigation
    { path: /^\/favoris$/,         component: FavorisPage },
    { path: /^\/historique$/,      component: HistoriquePage },
    { path: /^\/rendez-vous\/([a-fA-F0-9-]{36})$/, component: (params) => ClientRendezVousPage(params), paramKeys: ['id'] },
    { path: /^\/rendez-vous$/,     component: roleBasedPage(ClientRendezVousPage, CoiffeurRendezVousPage) },
    { path: /^\/coiffeur\/rendez-vous\/([a-fA-F0-9-]{36})$/, component: (params) => CoiffeurRendezVousPage(params), paramKeys: ['id'] },
    { path: /^\/coiffeur\/rendez-vous$/, component: CoiffeurRendezVousPage },
    { path: /^\/paiement\/([a-zA-Z0-9_-]+)$/, component: (params) => PaiementPage(params), paramKeys: ['id'] },
    { path: /^\/avis\/laisser\/([a-fA-F0-9-]{36})$/, component: (params) => LaisserAvisPage(params), paramKeys: ['id'] },
    { path: /^\/avis\/([a-fA-F0-9-]{36})$/, component: (params) => AvisDetailPage(params), paramKeys: ['id'] },
    { path: /^\/coiffeur\/avis\/([a-fA-F0-9-]{36})$/, component: (params) => AvisDetailPage(params), paramKeys: ['id'] },
    { path: /^\/coiffeur\/avis$/, component: CoiffeurAvisPage },
    { path: /^\/avis$/,            component: roleBasedPage(createInfoPage('Avis', 'L’espace avis clients est disponible pour les coiffeurs.'), CoiffeurAvisPage) },
    { path: /^\/plannings$/,       component: createInfoPage('Plannings', 'La gestion des plannings coiffeur est en préparation.') },


    // ════════════════════════════════════════════════════════
    //  MODULE SERVICES
    //   ORDRE CRITIQUE : routes spécifiques avant /:id générique
    // ════════════════════════════════════════════════════════

    // ── Espace Coiffeur — routes fixes (avant /:id) ──────────
    { path: /^\/coiffeur\/dashboard$/,     component: CoiffeurDashboardPage },
    { path: /^\/coiffeur\/services$/,     component: CoiffeurServicesPage },
    { path: /^\/coiffeur\/services\/new$/, component: ServiceWizardPage },
    { path: /^\/services\/([a-zA-Z0-9_-]+)\/reserver$/, component: (params) => ReservationPage(params), paramKeys: ['id'] },
    

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
    { path: /^\/services\/([a-zA-Z0-9_-]+)$/, component: (params) => ServiceDetailPage(params), paramKeys: ['id'] },

    { path: /^\/coiffeur\/abonnement$/, component: CoiffeurAbonnementPage },
    { path: /^\/coiffeur\/horaires$/,   component: CoiffeurHorairesPage },
    { path: /^\/coiffeur\/portfolio$/,  component: CoiffeurPortfolioPage },
    { path: /^\/profil\/([a-zA-Z0-9_-]+)\/([a-fA-F0-9-]{36})$/, component: (params) => CoiffeurProfilPage(params), paramKeys: ['username', 'id'] },
    { path: /^\/([a-zA-Z0-9_-]+)\/([a-fA-F0-9-]{36})$/, component: (params) => CoiffeurProfilPage(params), paramKeys: ['username', 'id'] },
    { path: /^\/admin\/services$/,      component: AdminServicesDashboardPage },

];

// ─────────────────────────────────────────────────────────────
export const initRouter = (appElement) => {
    const render = () => {
        if (typeof window.__mixoPageCleanup === 'function') {
            try { window.__mixoPageCleanup(); } catch (error) { console.warn('[Router] cleanup failed', error); }
            window.__mixoPageCleanup = null;
        }

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
