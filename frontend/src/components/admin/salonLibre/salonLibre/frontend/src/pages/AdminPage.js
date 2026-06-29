/**
 * AdminPage.js — MIXO
 * 5 sections : Utilisateurs | Rendez-vous | Plannings | Services | Statistiques
 */
import { AdminUserSection }  from '../components/admin/AdminUserSection.js';
import { AdminPlaceholder }  from '../components/admin/AdminPlaceholder.js';
import { AdminStatsSection } from '../components/admin/AdminStatsSection.js';
import AdminUtilisateurs     from '../api/AdminService.js';
import { requireRole }       from '../utils/AuthGuard.js';
import { AuthentificationUtilisateurs } from '../api/axiosConfig.js';

export const AdminPage = () => {
    if (!requireRole('admin')) return document.createElement('div');

    const username = localStorage.getItem('username') || 'Admin';
    const initials = username.substring(0, 2).toUpperCase();

    const page = document.createElement('div');
    page.className = 'adm-page';

    page.innerHTML = `
    <div class="adm-layout">

        <!-- SIDEBAR -->
        <aside class="adm-sidebar">
            <div class="adm-sidebar-brand">
                <span class="adm-brand-logo">MIXO</span>
                <span class="adm-brand-sub">Administration</span>
            </div>

            <div class="adm-sidebar-profile">
                <div class="adm-sidebar-avatar">${initials}</div>
                <div class="adm-sidebar-info">
                    <span class="adm-sidebar-username">@${username}</span>
                    <span class="adm-sidebar-role">Administrateur</span>
                </div>
            </div>

            <nav class="adm-sidebar-nav">
                ${[
                    { id:'utilisateurs', icon:'users',       label:'Utilisateurs',   badge:'cnt-nav-attente' },
                    { id:'rdv',          icon:'calendar',     label:'Rendez-vous',    badge:'' },
                    { id:'plannings',    icon:'clock',        label:'Plannings',      badge:'' },
                    { id:'services',     icon:'scissors',     label:'Services',       badge:'' },
                    { id:'statistiques', icon:'bar-chart-2',  label:'Statistiques',   badge:'' },
                ].map(s => `
                    <button class="adm-nav-btn" data-section="${s.id}">
                        <i data-lucide="${s.icon}"></i>
                        <span>${s.label}</span>
                        ${s.badge ? `<span class="adm-nav-badge" id="${s.badge}"></span>` : ''}
                    </button>
                `).join('')}
            </nav>

            <div class="adm-sidebar-footer">
                <button class="adm-sidebar-logout" id="sidebar-logout">
                    <i data-lucide="log-out"></i>
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>

        <!-- CONTENU PRINCIPAL -->
        <main class="adm-main">
            <!-- Topbar -->
            <div class="adm-topbar">
                <div class="adm-topbar-left">
                    <h1 class="adm-topbar-title" id="section-title">Administration</h1>
                </div>
                <div class="adm-topbar-right">
                    <div class="adm-search-wrap">
                        <i data-lucide="search" class="adm-search-icon"></i>
                        <input type="text" id="adm-search" class="adm-search-input"
                               placeholder="Rechercher un utilisateur…"/>
                    </div>
                </div>
            </div>

            <!-- Stats rapides -->
            <div class="adm-quick-stats" id="adm-quick-stats">
                ${['val-total','val-actifs','val-attente','val-bannis'].map((id, i) => `
                    <div class="adm-qs-card">
                        <i data-lucide="${['users','check-circle','clock','ban'][i]}"></i>
                        <span class="adm-qs-val" id="${id}">…</span>
                        <span class="adm-qs-label">${['Total','Actifs','En attente','Bannis'][i]}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Zone de contenu dynamique -->
            <div class="adm-content-area" id="adm-content"></div>
        </main>
    </div>
    `;

    const contentArea = page.querySelector('#adm-content');
    const sectionTitle = page.querySelector('#section-title');

    // ── Stats rapides ──────────────────────────────────────────────
    AdminUtilisateurs.getDashboardStats().then(d => {
        page.querySelector('#val-total').textContent   = d.total_utilisateurs ?? 0;
        page.querySelector('#val-actifs').textContent  = d.coiffeurs_actifs ?? 0;
        page.querySelector('#val-attente').textContent = d.coiffeurs_en_attente ?? 0;
        page.querySelector('#val-bannis').textContent  = d.comptes_bannis ?? 0;

        const badge = page.querySelector('#cnt-nav-attente');
        if (badge && d.coiffeurs_en_attente > 0) {
            badge.textContent    = d.coiffeurs_en_attente;
            badge.style.display  = 'inline-flex';
        }
    }).catch(() => {});

    // ── Rendu section ──────────────────────────────────────────────
    const SECTION_TITLES = {
        utilisateurs: 'Gestion des utilisateurs',
        rdv:          'Gestion des rendez-vous',
        plannings:    'Gestion des plannings',
        services:     'Gestion des services',
        statistiques: 'Statistiques',
    };

    const renderSection = (id) => {
        page.querySelectorAll('.adm-nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.section === id);
        });
        sectionTitle.textContent = SECTION_TITLES[id] || id;
        contentArea.innerHTML = '';
        contentArea.style.animation = 'fadeUp 0.35s var(--ease-expo) both';

        if (id === 'utilisateurs') {
            contentArea.appendChild(AdminUserSection());
        } else if (id === 'statistiques') {
            contentArea.appendChild(AdminStatsSection());
        } else {
            contentArea.appendChild(AdminPlaceholder(id));
        }

        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    };

    page.querySelectorAll('.adm-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => renderSection(btn.dataset.section));
    });

    // Recherche globale
    page.querySelector('#adm-search').addEventListener('input', e => {
        const q = e.target.value.trim();
        if (!q) return;
        renderSection('utilisateurs');
        setTimeout(() => {
            const inp = contentArea.querySelector('#aus-search');
            if (inp) { inp.value = q; inp.dispatchEvent(new Event('input')); }
        }, 400);
    });

    page.querySelector('#sidebar-logout').addEventListener('click', () => {
        AuthentificationUtilisateurs.logout();
    });

    // Rendu initial
    renderSection('utilisateurs');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return page;
};