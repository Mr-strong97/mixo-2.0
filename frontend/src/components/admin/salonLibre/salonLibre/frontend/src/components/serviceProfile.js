import { AuthentificationUtilisateurs } from '../api/axiosConfig.js';
import { showToast } from '../utils/toast.js';

export const ServiceProfile = () => {
    // 1. Récupération des données sécurisées
    const rawRole = localStorage.getItem('user_role') || 'client';
    const role = rawRole.toLowerCase().trim();
    const username = localStorage.getItem('username') || 'Utilisateur';
    const isCoiffeur = role === 'coiffeur';

    const container = document.createElement('div');
    container.className = 'profile-page-container';

    container.innerHTML = `
        <!-- Section Image : Visible au centre sur Desktop, passe au-dessus sur Mobile -->
        <div class="profile-image-banner">
            <div class="profile-bg-image"></div>
            <div class="profile-image-overlay"></div>
            <!-- Titre visible uniquement sur Mobile (cf. Screenshot_2026-05-28_12-10-58.jpg) -->
            <div class="brand-mobile-label">
                <span class="brand-sub">ESPACE</span>
                <h1 class="brand-main text-white">MIXO</h1>
            </div>
        </div>

        <!-- Section Menu et Données -->
        <div class="profile-content-panel">
            <div class="profile-card-wrapper">
                
                <!-- Header : Avatar + Statut Pill -->
                <div class="profile-user-header">
                    <div class="avatar-circle-blue">
                        ${username.substring(0, 2).toUpperCase()}
                    </div>
                    <div class="name-status-pill">
                        <span class="user-profile-name">${username}</span>
                        <div class="status-online-wrap">
                            <span class="status-text">en ligne</span>
                            <span class="status-dot"></span>
                        </div>
                    </div>
                </div>

                <!-- Liste des Menus -->
                <div class="profile-menu-list">
                    
                    <div class="menu-item" onclick="window.navigate('/appointments')">
                        <div class="menu-item-left">
                            <i data-lucide="calendar" class="menu-icon"></i>
                            <span class="menu-label">Mes rendez-vous</span>
                        </div>
                        <span class="badge-count">12</span>
                    </div>

                    <div class="menu-item" onclick="window.navigate('${isCoiffeur ? '/horaires' : '/avis'}')">
                        <div class="menu-item-left">
                            <i data-lucide="${isCoiffeur ? 'clock' : 'star'}" class="menu-icon"></i>
                            <span class="menu-label">${isCoiffeur ? 'Mes Horaires' : 'Mes Avis'}</span>
                        </div>
                        ${isCoiffeur ? '<i data-lucide="chevron-right" class="chevron-icon"></i>' : '<span class="badge-count">5</span>'}
                    </div>

                    <div class="menu-item">
                        <div class="menu-item-left">
                            <i data-lucide="scissors" class="menu-icon"></i>
                            <span class="menu-label">Services favoris</span>
                        </div>
                        <span class="favori-tag">Coupe</span>
                    </div>

                    <div class="menu-item" onclick="window.navigate('/settings')">
                        <div class="menu-item-left">
                            <i data-lucide="user-cog" class="menu-icon"></i>
                            <span class="menu-label">Compte</span>
                        </div>
                        <i data-lucide="chevron-right" class="chevron-icon"></i>
                    </div>

                    <div class="menu-item">
                        <div class="menu-item-left">
                            <i data-lucide="life-buoy" class="menu-icon"></i>
                            <span class="menu-label">Aide</span>
                        </div>
                        <i data-lucide="chevron-right" class="chevron-icon" style="opacity: 0.3;"></i>
                    </div>

                    <div class="menu-item logout-item" id="logout-trigger">
                        <div class="menu-item-left text-danger">
                            <i data-lucide="log-out" class="menu-icon text-danger"></i>
                            <span class="menu-label fw-bold text-danger">Déconnexion</span>
                        </div>
                        <i data-lucide="power" class="power-icon"></i>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 2. Logique de déconnexion
    container.querySelector('#logout-trigger').addEventListener('click', () => {
        showToast.confirm("Voulez-vous vraiment vous déconnecter ?", {
            onConfirm: () => {
                AuthentificationUtilisateurs.logout();
            }
        });
    });

    // Réinitialisation des icônes Lucide si présentes globalement
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);

    return container;
};