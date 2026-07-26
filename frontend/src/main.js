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
// Le routeur est conservé à la racine du projet pour partager les entrées SPA.
import { initRouter } from '../../router.js';

// --- 3. INITIALISATION ---
const app = document.querySelector('#app');

// Prompt PWA conservé pour le bouton « Installer l'application ».
window.__mixoInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.__mixoInstallPrompt = event;
    window.dispatchEvent(new CustomEvent('mixo:pwa-install-available'));
});
window.addEventListener('appinstalled', () => {
    window.__mixoInstallPrompt = null;
});

if (app) {
    initRouter(app);
} else {
    console.error("Erreur : L'élément #app est introuvable dans le HTML.");
}

// Enregistrement du service worker pour rendre l'app installable et
// garder un minimum de cache hors ligne sans modifier le comportement métier.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.warn('[PWA] Service worker non enregistré :', error);
        });
    });
}
