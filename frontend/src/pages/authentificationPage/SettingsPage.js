/**
 * SettingsPage.js
 * ================
 * MODIFICATION : Alignement du layout avec la Sidebar (Column) globale.
 * - createCoiffeurModel / createClientModel gèrent maintenant
 * les données imbriquées { utilisateur: {...}, ... }.
 * - Ajout d'AuthGuard : redirige vers /login si non connecté.
 */

import { Navbar }             from '../../components/navbars/Navbar.js';
import { Footer }             from '../../components/Footer.js';
import { SettingsForm }       from '../../components/settings/SettingsForm.js';
import { createClientModel, createCoiffeurModel } from '../../models/UserModel.js';
import { ProfilUtilisateur }  from '../../api/axiosConfig.js';
import { requireAuth }        from '../../utils/AuthGuard.js';

export const SettingsPage = () => {
    const page = document.createElement('div');
    page.className = 'settings-page-wrapper';

    const nav = Navbar();
    page.appendChild(nav);

    // 🛠️ FIX : Création du wrapper pour décaler le formulaire à droite de la sidebar sur PC
    const contentLayout = document.createElement('div');
    contentLayout.className = 'main-content-layout';

    const main = document.createElement('main');
    main.className = 'settings-main';
    
    const footer = Footer();

    // On assemble la vue de droite
    contentLayout.appendChild(main);
    contentLayout.appendChild(footer);
    
    // Injection du layout à côté de la Navbar
    page.appendChild(contentLayout);

    main.innerHTML = `
        <div class="settings-loader" id="settings-loader">
            <div class="loader-spinner"></div>
            <p class="loader-text">Chargement du profil...</p>
        </div>
        <div id="settings-content" class="d-none"></div>
    `;

    const loadProfile = async () => {
        // Redirige vers /login si non connecté
        if (!requireAuth()) return;

        const { id, role } = ProfilUtilisateur.getCurrentUser();

        try {
            /**
             * apiData est maintenant imbriqué :
             * { utilisateur: { id, username, email, statut, ... },
             * specialite/sexe/telephone/... }
             * createCoiffeurModel / createClientModel gèrent ce format.
             */
            const apiData = await ProfilUtilisateur.getUserProfile(role, id);

            const model = role === 'coiffeur'
                ? createCoiffeurModel(apiData)
                : createClientModel(apiData);

            main.querySelector('#settings-loader').remove();
            const content = main.querySelector('#settings-content');
            content.classList.remove('d-none');

            const header = document.createElement('div');
            header.className = 'settings-header';
            header.innerHTML = `
                <h1 class="settings-title">
                    <i data-lucide="user-cog"></i>
                    Mon Compte
                </h1>
                <p class="settings-subtitle">Gérez vos informations personnelles</p>
            `;
            content.appendChild(header);

            const form = SettingsForm(model, (updatedModel) => {
                localStorage.setItem('username', updatedModel.username.toLowerCase().trim());
            });
            content.appendChild(form);

            setTimeout(() => {
                if (window.lucide) window.lucide.createIcons();
            }, 0);

        } catch (error) {
            console.error('Erreur chargement profil :', error);
            main.querySelector('#settings-loader').innerHTML = `
                <p class="text-danger">
                    Impossible de charger votre profil.
                    <a href="#" onclick="window.navigate('/home')">Retour à l'accueil</a>
                </p>
            `;
        }
    };

    loadProfile();
    return page;
};