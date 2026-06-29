/**
 * Footer.js
 * ==========
 * Footer vertical premium sous forme de sidebar droite visible uniquement sur desktop.
 * Harmonisé sur la charte épurée lumineuse (Bleu & Blanc).
 */

import { Logo } from "./Logo.js"; // Ajout de l'extension .js pour la sécurité du routage

export const Footer = () => {
    const footer = document.createElement('footer');
    footer.className = 'footer-premium-desktop';

    // On prépare la structure HTML avec un identifiant unique pour le logo
    footer.innerHTML = `
        <div class="footer-desktop-wrapper">
            <div class="footer-top">
                <div class="footer-brand" id="footer-logo-target"></div>

                <p class="footer-description">
                    Réservez votre style premium en quelques secondes.
                </p>

                <div class="social-wrapper">
                    <div class="social-circle" title="Instagram">
                        <i data-lucide="instagram"></i>
                    </div>
                    <div class="social-circle" title="Facebook">
                        <i data-lucide="facebook"></i>
                    </div>
                    <div class="social-circle" title="GitHub">
                        <i data-lucide="github"></i>
                    </div>
                    <div class="social-circle" title="YouTube">
                        <i data-lucide="youtube"></i>
                    </div>
                </div>
            </div>

            <div class="footer-center"></div>

            <div class="footer-bottom-desktop">
                <div class="contact-info">
                    <div class="contact-item">
                        <i data-lucide="map-pin"></i>
                        <span>Kinshasa, RD Congo</span>
                    </div>
                    <div class="contact-item">
                        <i data-lucide="phone"></i>
                        <span>+243 99 3071476</span>
                    </div>
                </div>
                <p class="copyright">
                    © 2026 Mixo
                </p>
            </div>
        </div>
    `;

    // ---------------------------------------------------------------- //
    // ALGORITHME D'INJECTION DU LOGO SÉCURISÉ
    // ---------------------------------------------------------------- //
    const logoTarget = footer.querySelector('#footer-logo-target');
    if (logoTarget && typeof Logo === 'function') {
        // On exécute la fonction Logo(taille) pour générer l'élément HTML propre
        const logoNode = Logo(70); 
        
        // Si la fonction renvoie un élément HTML (Object DOM), on l'insère avec appendChild
        if (logoNode instanceof HTMLElement) {
            logoTarget.appendChild(logoNode);
        } else {
            // Si jamais elle renvoyait une chaîne de texte, on l'applique en innerHTML
            logoTarget.innerHTML = logoNode;
        }
    }

    // ===== ROUTAGE ET EVENEMENTS =====
    footer.querySelector('#footer-link-home')?.addEventListener('click', () => {
        if (window.navigate) window.navigate('/home');
        else window.location.href = '/home';
    });

    footer.querySelector('#footer-link-services')?.addEventListener('click', () => {
        if (window.navigate) window.navigate('/services');
        else window.location.href = '/services';
    });

    footer.querySelector('#footer-link-client')?.addEventListener('click', () => {
        const username = localStorage.getItem('username');
        if (username) {
            if (window.navigate) window.navigate(`/${username.toLowerCase().trim()}`);
            else window.location.href = `/${username.toLowerCase().trim()}`;
        } else {
            if (window.navigate) window.navigate('/login');
            else window.location.href = '/login';
        }
    });

    // Sécurité Lucide : Force l'interprétation locale des balises data-lucide du footer
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons({
                attrs: {
                    'stroke-width': 2,
                    'class': 'lucide-footer-icon'
                }
            });
        }
    }, 50);

    return footer;
};