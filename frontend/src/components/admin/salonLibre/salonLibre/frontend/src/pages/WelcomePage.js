import { ButtonPrimary } from '../components/ButtonPrimary';
import { Logo } from '../components/Logo';

export const WelcomePage = () => {
    const container = document.createElement('div');
    container.className = 'container-fluid vh-100 d-flex align-items-center p-0';

    container.innerHTML = `
    <div class="row w-100 m-0 h-100 welcome-container">
        <div class="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-image-section">
            <div class="glass-overlay">
                <p class="welcome-tagline">
                    Une nouvelle façon de réserver<br> 
                    <span class="highlight-brand">votre salon.</span>
                </p>
            </div>
        </div>

        <div class="col-md-6 col-12 d-flex flex-column align-items-center justify-content-center p-5 bg-form-section">
            <div class="form-content-wrapper text-center">
                
                <div id="main-logo" class="mb-4 d-flex justify-content-center"></div>            
                
                <h2 class="welcome-title">Votre temps est précieux</h2>
                
                <p class="welcome-description">
                    Notre plateforme connecte clients et coiffeurs grâce à un système de réservation simple, rapide et sécurisé.
                </p>
                
                <div id="action-buttons" class="w-100 d-flex flex-column align-items-center gap-3"></div>
                
            </div>
        </div>
    </div>
`;
    // 1. Injection du Logo
    const logoContainer = container.querySelector('#main-logo');
    logoContainer.appendChild(Logo("120"));

    // 2. Injection des boutons
    const btnContainer = container.querySelector('#action-buttons');

    const startBtn = ButtonPrimary("C'est parti !", 'solid', 'arrow-right');
    const loginBtn = ButtonPrimary("J'ai déjà un compte", 'outline', 'log-in');

    // 3. Logique de navigation (Unique et Propre)
    startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigate) {
            window.navigate('/register');
        }
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigate) {
            window.navigate('/login');
        }
    });

    btnContainer.appendChild(startBtn);
    btnContainer.appendChild(loginBtn);

    return container;
};