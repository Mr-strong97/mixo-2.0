/**
 * AdminSidebar.js
 * ================
 * Barre latérale de navigation admin avec 6 sections.
 * Emplacement : src/components/admin/AdminSidebar.js
 *
 * @param {string}   activeSection  - Section actuellement active
 * @param {Function} onSelect       - Callback appelé avec l'id de la section cliquée
 */
export const AdminSidebar = (activeSection = 'utilisateurs', onSelect) => {
    const sections = [
        { id: 'utilisateurs', icon: 'users',       label: 'Utilisateurs',   ready: true  },
        { id: 'avis',         icon: 'star',         label: 'Avis',           ready: false },
        { id: 'horaires',     icon: 'clock',        label: 'Horaires',       ready: false },
        { id: 'notifications',icon: 'bell',         label: 'Notifications',  ready: false },
        { id: 'medias',       icon: 'image',        label: 'Médias',         ready: false },
        { id: 'paiements',    icon: 'credit-card',  label: 'Paiements',      ready: false },
    ];

    const sidebar = document.createElement('aside');
    sidebar.className = 'admin-sidebar';

    sidebar.innerHTML = `
        <div class="sidebar-brand">
            <i data-lucide="shield-check" class="sidebar-brand-icon"></i>
            <span>Administration</span>
        </div>

        <nav class="sidebar-nav">
            ${sections.map(s => `
                <button
                    class="sidebar-item ${s.id === activeSection ? 'active' : ''} ${!s.ready ? 'coming-soon' : ''}"
                    data-section="${s.id}"
                    ${!s.ready ? 'title="Bientôt disponible"' : ''}
                >
                    <i data-lucide="${s.icon}" class="sidebar-item-icon"></i>
                    <span class="sidebar-item-label">${s.label}</span>
                    ${!s.ready ? '<span class="sidebar-badge-soon">Bientôt</span>' : ''}
                </button>
            `).join('')}
        </nav>

        <div class="sidebar-footer">
            <button id="sidebar-logout" class="sidebar-logout">
                <i data-lucide="log-out"></i>
                <span>Déconnexion</span>
            </button>
        </div>
    `;

    // ---- Navigation ----
    sidebar.querySelectorAll('.sidebar-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            const isReady = sections.find(s => s.id === section)?.ready;
            if (!isReady) return; // Ignore les sections non disponibles

            sidebar.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (typeof onSelect === 'function') onSelect(section);
        });
    });

    // ---- Déconnexion ----
    sidebar.querySelector('#sidebar-logout').addEventListener('click', () => {
        import('../../api/axiosConfig.js').then(({ AuthentificationUtilisateurs }) => {
            AuthentificationUtilisateurs.logout();
        });
    });

    return sidebar;
};