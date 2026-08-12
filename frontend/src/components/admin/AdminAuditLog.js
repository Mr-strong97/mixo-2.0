/**
 * AdminAuditLog.js — Journal de bord
 * Filtres : date, utilisateur, type d'action
 * Emplacement : src/components/admin/AdminAuditLog.js
 */
import api from '../../api/axiosConfig.js';

const ACTION_LABELS = {
    'CONNEXION':           { label: 'Connexion',              color: '#10B981' },
    'CONNEXION_ECHEC':     { label: 'Tentative échouée',      color: '#EF4444' },
    'INSCRIPTION':         { label: 'Inscription',            color: '#1A56DB' },
    'DECONNEXION':         { label: 'Déconnexion',            color: '#6B7280' },
    'MODIF_PROFIL':        { label: 'Modification profil',    color: '#F59E0B' },
    'MODIF_MOT_DE_PASSE':  { label: 'Changement MDP',         color: '#F59E0B' },
    'SUPPRESSION_COMPTE':  { label: 'Suppression compte',     color: '#EF4444' },
    'VERIF_EMAIL':         { label: 'Email vérifié',          color: '#10B981' },
    'VERROUILLAGE':        { label: 'Compte verrouillé',      color: '#EF4444' },
    'DEMANDE_REACTIVATION':{ label: 'Demande réactivation',   color: '#F59E0B' },
};

export const AdminAuditLog = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'audit-wrapper';

    wrapper.innerHTML = `
        <h2 class="audit-title">
            <i data-lucide="activity"></i>
            Journal de bord
        </h2>

        <div class="audit-filters">
            <div class="audit-filter-group">
                <label>Utilisateur</label>
                <input type="text" id="filter-user" class="audit-input" placeholder="Rechercher…"/>
            </div>
            <div class="audit-filter-group">
                <label>Type d'action</label>
                <select id="filter-action" class="audit-select">
                    <option value="">Toutes les actions</option>
                    ${Object.entries(ACTION_LABELS).map(([k, v]) =>
                        `<option value="${k}">${v.label}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="audit-filter-group">
                <label>Date début</label>
                <input type="date" id="filter-date-start" class="audit-input"/>
            </div>
            <div class="audit-filter-group">
                <label>Date fin</label>
                <input type="date" id="filter-date-end" class="audit-input"/>
            </div>
            <button id="btn-filter" class="audit-btn-filter">
                <i data-lucide="search"></i> Filtrer
            </button>
            <button id="btn-reset" class="audit-btn-reset">
                <i data-lucide="x"></i> Réinitialiser
            </button>
        </div>

        <div id="audit-count" class="audit-count"></div>
        <div id="audit-list">
            <div class="audit-loader"><div class="spinner"></div></div>
        </div>

        <div class="audit-pagination" id="audit-pagination"></div>
    `;

    const listEl   = wrapper.querySelector('#audit-list');
    const countEl  = wrapper.querySelector('#audit-count');
    const pagEl    = wrapper.querySelector('#audit-pagination');
    let currentPage = 1;

    const getFilters = () => ({
        user:       wrapper.querySelector('#filter-user').value.trim(),
        action:     wrapper.querySelector('#filter-action').value,
        date_debut: wrapper.querySelector('#filter-date-start').value,
        date_fin:   wrapper.querySelector('#filter-date-end').value,
    });

    const charger = async (page = 1) => {
        currentPage = page;
        listEl.innerHTML = `<div class="audit-loader"><div class="spinner"></div></div>`;

        const f = getFilters();
        const params = new URLSearchParams({ page });
        if (f.user)       params.set('user', f.user);
        if (f.action)     params.set('action', f.action);
        if (f.date_debut) params.set('date_debut', f.date_debut);
        if (f.date_fin)   params.set('date_fin', f.date_fin);

        try {
            const res = await api.get(`admin/audit/?${params}`);
            const { total, pages, resultats } = res.data;

            countEl.textContent = `${total} action${total > 1 ? 's' : ''} enregistrée${total > 1 ? 's' : ''}`;

            if (resultats.length === 0) {
                listEl.innerHTML = `
                    <div class="audit-empty">
                        <i data-lucide="inbox"></i>
                        <p>Aucun résultat pour ces filtres.</p>
                    </div>`;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            listEl.innerHTML = `
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Rôle</th>
                            <th>Action</th>
                            <th>Statut</th>
                            <th>IP</th>
                            <th>Date / Heure</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resultats.map(row => {
                            const info  = ACTION_LABELS[row.action] || { label: row.action, color: '#6B7280' };
                            
                            // 💻 CORRECTION ICI : Remplacement de row.cree_le par row.created_at
                            const date  = row.created_at ? new Date(row.created_at).toLocaleString('fr-FR') : '—';
                            const succes = row.succes;
                            
                            return `
                                <tr class="audit-row">
                                    <td class="audit-user" data-label="Utilisateur">@${row.username}</td>
                                    <td data-label="Rôle"><span class="audit-role audit-role-${(row.user_role||'').toLowerCase()}">${row.user_role}</span></td>
                                    <td data-label="Action"><span class="audit-action-badge" style="background:${info.color}18;color:${info.color};border-color:${info.color}30">${info.label}</span></td>
                                    <td data-label="Statut"><span class="audit-status ${succes ? 'audit-ok' : 'audit-fail'}">${succes ? '✓' : '✗'}</span></td>
                                    <td class="audit-ip" data-label="Adresse IP">${row.ip_adresse || '—'}</td>
                                    <td class="audit-date" data-label="Date et heure">${date}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;

            // Pagination
            pagEl.innerHTML = '';
            if (pages > 1) {
                for (let p = 1; p <= pages; p++) {
                    const btn = document.createElement('button');
                    btn.className = `audit-page-btn ${p === page ? 'active' : ''}`;
                    btn.textContent = p;
                    btn.addEventListener('click', () => charger(p));
                    pagEl.appendChild(btn);
                }
            }

            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            listEl.innerHTML = `<p class="audit-error">Erreur : ${err.message}</p>`;
        }
    };

    wrapper.querySelector('#btn-filter').addEventListener('click', () => charger(1));
    wrapper.querySelector('#btn-reset').addEventListener('click', () => {
        wrapper.querySelector('#filter-user').value       = '';
        wrapper.querySelector('#filter-action').value     = '';
        wrapper.querySelector('#filter-date-start').value = '';
        wrapper.querySelector('#filter-date-end').value   = '';
        charger(1);
    });

    // Enter sur les inputs
    wrapper.querySelectorAll('.audit-input').forEach(i => {
        i.addEventListener('keydown', e => { if (e.key === 'Enter') charger(1); });
    });

    charger(1);
    return wrapper;
};
