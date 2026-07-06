// --- 1. IMPORT DES STYLES ---

// ── 1.1. FRAMEWORKS & DESIGN SYSTEM GLOBALS ──
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/variables.css';
import './styles/toast.css';
import './styles/confirmDialog.css';

// ── 1.2. LAYOUTS GENERAUX & COMPOSANTS SQUELETTES ──
import './styles/Navbar.css';
import './styles/Footer.css';


// ── 1.3. MODULE AUTHENTIFICATION & COMPOSANTS FORMULAIRES ──
import './styles/authentificationStyles/Auth.css';
import './styles/authentificationStyles/InputGroup.css';
import './styles/authentificationStyles/FormField.css';
import './styles/authentificationStyles/ToggleField.css';
import './styles/authentificationStyles/ButtonPrimary.css';
import './styles/authentificationStyles/AvatarUpload.css';
import './styles/avatarChoice.css';

// ── 1.3.5. HOMEPAGE & MODULES D'ACCUEIL ──
import './styles/authentificationStyles/HomePage.css';
import './styles/authentificationStyles/ZoneHero.css';
import './styles/authentificationStyles/StatsCatalogue.css';


// ── 1.4. PAGES DU TUNNEL D'AUTHENTIFICATION ──
import './styles/authentificationStyles/WelcomePage.css';
import './styles/authentificationStyles/LoginPage.css';
import './styles/authentificationStyles/RegisterPage.css';
import './styles/authentificationStyles/ForgotPasswordPage.css';
import'./styles/authentificationStyles/serviceProfile.css';


// ── 1.5. PARAMÈTRES UTILISATEUR & COIFFEURS ──
import './styles/authentificationStyles/Settings.css';
import './styles/authentificationStyles/SettingsForm.css';

// ── 1.6. MODULE NOTIFICATIONS ──
import './styles/notificationStyles/NotificationPage.css';

// ── 1.7. DASHBOARD & LOGIQUE ADMINISTRATION ──
import './styles/adminStyles/AdminPage.css';
import './styles/adminStyles/AdminStats.css';
import './styles/adminStyles/AdminUserSection.css';
import './styles/adminStyles/AdminProfile.css';
import './styles/adminStyles/AdminPlaceholder.css';
import'./styles/adminStyles/AdminUsers.css';










// --- 2. IMPORT DU ROUTEUR ---
import { initRouter } from './router';

// --- 3. INITIALISATION ---
const app = document.querySelector('#app');

if (app) {
    initRouter(app);
} else {
    console.error("Erreur : L'élément #app est introuvable dans le HTML.");
}
