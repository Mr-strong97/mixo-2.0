// --- 1. IMPORT DES STYLES ---
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/variables.css';
import './styles/ButtonPrimary.css';
import './styles/WelcomePage.css';
import './styles/InputGroup.css';
import './styles/RegisterPage.css';
import './styles/LoginPage.css';
import './styles/toast.css';
import './styles/Footer.css';
import './styles/Navbar.css';
import './styles/Navbar.additions.css';
import './styles/HeroSlider.css';
import './styles/serviceProfile.css'
import './styles/SettingsPage.css';
import './styles/AvatarUpload.css';
import './styles/FormField.css';
import './styles/ToggleField.css';
import './styles/SettingsForm.css';
import './styles/homePage.css';
import './styles/AdminPage.css';
import './styles/AdminUserSection.css';
import './styles/AdminProfile.css';
import './styles/AdminStats.css';
import './styles/AdminPlaceholder.css';
import './styles/ForgotPasswordPage.css';










// --- 2. IMPORT DU ROUTEUR ---
import { initRouter } from './router';

// --- 3. INITIALISATION ---
const app = document.querySelector('#app');

if (app) {
    initRouter(app);
} else {
    console.error("Erreur : L'élément #app est introuvable dans le HTML.");
}