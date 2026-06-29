/**
 * AdminUserSection.js — MIXO
 * 6 onglets : En attente | Coiffeurs | Clients | Suspendus | Bannis | Journal
 * Suspension et bannissement : motif OBLIGATOIRE via modal.
 */
import AdminUtilisateurs    from '../../api/AdminService.js';
import { AdminAuditLog }    from './AdminAuditLog.js';
import { showToast }        from '../../utils/toast.js';

export const AdminUserSection = () => {
    const section = document.createElement('div');
    section.className = 'aus-wrapper';

    section.innerHTML = `
        <h2 class="aus-title">
            <i data-lucide="users"></i>
            Gestion des utilisateurs
        </h2>

        <div class="aus-tabs">
            <button class="aus-tab active" data-tab="attente">
                <i data-lucide="clock"></i> En attente
                <span class="aus-count" id="cnt-attente">…</span>
            </button>
            <button class="aus-tab" data-tab="coiffeurs">
                <i data-lucide="scissors"></i> Coiffeurs
                <span class="aus-count" id="cnt-coiffeurs">…</span>
            </button>
            <button class="aus-tab" data-tab="clients">
                <i data-lucide="user"></i> Clients
                <span class="aus-count" id="cnt-clients">…</span>
            </button>
            <button class="aus-tab" data-tab="suspendus">
                <i data-lucide="pause-circle"></i> Suspendus
                <span class="aus-count" id="cnt-suspendus">…</span>
            </button>
            <button class="aus-tab" data-tab="bannis">
                <i data-lucide="ban"></i> Bannis
                <span class="aus-count" id="cnt-bannis">…</span>
            </button>
            <button class="aus-tab" data-tab="journal">
                <i data-lucide="activity"></i> Journal
            </button>
        </div>

        <div class="aus-search-wrap" id="aus-search-zone">
            <i data-lucide="search" class="aus-search-icon"></i>
            <input type="text" id="aus-search" class="aus-search-input"
                   placeholder="Rechercher par nom d'utilisateur ou email…"/>
        </div>

        <div id="aus-list">
            <div class="aus-loader"><div class="spinner"></div></div>
        </div>

        <!-- Modal motif (suspend / ban) -->
        <div id="reason-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);
             z-index:9999;display:none;align-items:center;justify-content:center;">
            <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:20px;
                        padding:32px;max-width:480px;width:90%;">
                <h3 id="modal-title" style="color:#fff;font-size:1rem;font-weight:700;
                    letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;"></h3>
                <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin:0 0 20px;">
                    Le motif est obligatoire.
                </p>
                <textarea id="modal-reason" rows="4" placeholder="Motif détaillé…"
                    style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                           border-radius:12px;color:#fff;font-family:var(--font-main);font-size:0.85rem;
                           padding:12px 14px;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
                <div id="modal-duration-wrap" style="display:none;margin-top:12px;">
                    <input id="modal-duration" type="text" placeholder="Durée (ex: 7 jours, optionnel)"
                        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                               border-radius:10px;color:#fff;font-family:var(--font-main);font-size:0.82rem;
                               padding:10px 14px;outline:none;box-sizing:border-box;"/>
                </div>
                <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
                    <button id="modal-cancel"
                        style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                               color:rgba(255,255,255,0.6);padding:10px 20px;border-radius:10px;cursor:pointer;
                               font-family:var(--font-main);font-size:0.78rem;">
                        Annuler
                    </button>
                    <button id="modal-confirm"
                        style="background:#1A56DB;border:none;color:#fff;padding:10px 24px;border-radius:10px;
                               cursor:pointer;font-family:var(--font-main);font-size:0.78rem;font-weight:700;">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    `;

    const list        = section.querySelector('#aus-list');
    const searchInput = section.querySelector('#aus-search');
    const searchZone  = section.querySelector('#aus-search-zone');
    const modal       = section.querySelector('#reason-modal');
    let currentTab    = 'attente';
    let modalCallback = null;

    // ── MODAL ─────────────────────────────────────────────────────
    const openModal = (title, showDuration, callback) => {
        section.querySelector('#modal-title').textContent        = title;
        section.querySelector('#modal-reason').value            = '';
        section.querySelector('#modal-duration').value          = '';
        section.querySelector('#modal-duration-wrap').style.display = showDuration ? 'block' : 'none';
        modal.style.display = 'flex';
        modalCallback       = callback;
        section.querySelector('#modal-reason').focus();
    };

    section.querySelector('#modal-cancel').addEventListener('click', () => {
        modal.style.display = 'none';
        modalCallback = null;
    });
    section.querySelector('#modal-confirm').addEventListener('click', () => {
        const raison  = section.querySelector('#modal-reason').value.trim();
        const duree   = section.querySelector('#modal-duration').value.trim();
        if (!raison) { showToast("Le motif est obligatoire."); return; }
        modal.style.display = 'none';
        if (modalCallback) modalCallback(raison, duree);
        modalCallback = null;
    });

    // ── COMPTEURS ─────────────────────────────────────────────────
    const chargerCompteurs = async () => {
        try {
            const d = await AdminUtilisateurs.getDashboardStats();
            const set = (id, val) => {
                const el = section.querySelector(`#${id}`);
                if (el) el.textContent = val ?? 0;
            };
            set('cnt-attente',   d.coiffeurs_en_attente);
            set('cnt-coiffeurs', d.coiffeurs_actifs);
            set('cnt-clients',   d.total_clients);
            set('cnt-suspendus', d.comptes_suspendus ?? 0);
            set('cnt-bannis',    d.comptes_bannis ?? 0);
        } catch { /* silencieux */ }
    };

    // ── CHARGEMENT ONGLET ──────────────────────────────────────────
    const chargerOnglet = async (tab) => {
        currentTab = tab;
        searchInput.value = '';

        // Journal → composant dédié
        if (tab === 'journal') {
            searchZone.style.display = 'none';
            list.innerHTML = '';
            list.appendChild(AdminAuditLog());
            if (window.lucide) window.lucide.createIcons();
            return;
        }
        searchZone.style.display = '';
        list.innerHTML = `<div class="aus-loader"><div class="spinner"></div></div>`;

        try {
            let data;
            if      (tab === 'attente')   data = await AdminUtilisateurs.getPendingUsers();
            else if (tab === 'coiffeurs') data = await AdminUtilisateurs.getActiveHairdressers();
            else if (tab === 'clients')   data = await AdminUtilisateurs.getClients('ACTIF');
            else if (tab === 'suspendus') data = await AdminUtilisateurs.getClients('INACTIF');
            else if (tab === 'bannis')    data = await AdminUtilisateurs.getClients('BANNI');

            const items = data?.resultats || [];
            const countEl = section.querySelector(`#cnt-${tab}`);
            if (countEl) countEl.textContent = data?.count ?? items.length;

            afficher(items, tab);
        } catch (e) {
            list.innerHTML = `
                <div class="aus-empty">
                    <i data-lucide="alert-triangle" style="color:var(--danger);"></i>
                    <p>${e.message}</p>
                    <button class="aus-retry" onclick="this.closest('.aus-wrapper')
                        .querySelector('[data-tab=${tab}]').click()">Réessayer</button>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    // ── AFFICHAGE ──────────────────────────────────────────────────
    const afficher = (items, tab) => {
        list.innerHTML = '';
        if (items.length === 0) {
            list.innerHTML = `
                <div class="aus-empty">
                    <i data-lucide="inbox"></i>
                    <p>Aucun utilisateur dans cette catégorie.</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }
        items.forEach(user => list.appendChild(creerCarte(user, tab)));
        if (window.lucide) window.lucide.createIcons();
    };

    // ── CARTE UTILISATEUR ──────────────────────────────────────────
    const creerCarte = (user, tab) => {
        const card     = document.createElement('div');
        card.className = 'aus-card';
        card.dataset.id       = user.id;
        card.dataset.username = (user.username || '').toLowerCase();
        card.dataset.email    = (user.email || '').toLowerCase();

        const initiales  = (user.username || 'U').substring(0, 2).toUpperCase();
        const dateInsc   = new Date(user.date_joined).toLocaleDateString('fr-FR');
        const lastLogin  = user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais';

        const BADGES = {
            attente:   { cls: 'badge-pending', txt: 'EN ATTENTE' },
            coiffeurs: { cls: 'badge-active',  txt: 'ACTIF'      },
            clients:   { cls: 'badge-active',  txt: 'ACTIF'      },
            suspendus: { cls: 'badge-paused',  txt: 'SUSPENDU'   },
            bannis:    { cls: 'badge-banned',  txt: 'BANNI'      },
        };
        const badge = BADGES[tab] || BADGES.clients;

        card.innerHTML = `
            <div class="aus-card-top">
                <div class="aus-avatar">${initiales}</div>
                <div class="aus-info">
                    <span class="aus-username">@${user.username}</span>
                    <span class="aus-email">${user.email}</span>
                    <span class="aus-meta">
                        Inscrit le ${dateInsc} &nbsp;·&nbsp; Connexion : ${lastLogin}
                        &nbsp;·&nbsp; <strong>${user.role}</strong>
                    </span>
                </div>
                <span class="aus-badge ${badge.cls}">${badge.txt}</span>
            </div>
            <div class="aus-actions" id="actions-${user.id}"></div>
        `;

        const actionsEl = card.querySelector(`#actions-${user.id}`);
        const addBtn = (label, icon, cls, fn) => {
            const btn = document.createElement('button');
            btn.className = `aus-btn ${cls}`;
            btn.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
            btn.addEventListener('click', fn);
            actionsEl.appendChild(btn);
            return btn;
        };

        const retirer = () => {
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity    = '0';
            card.style.transform  = 'translateX(20px)';
            setTimeout(() => { card.remove(); chargerCompteurs(); }, 300);
        };

        // Actions selon onglet
        if (tab === 'attente') {
            addBtn('Valider', 'check-circle', 'aus-btn-validate', async () => {
                try {
                    await AdminUtilisateurs.validateUser(user.id);
                    showToast(`✅ @${user.username} validé !`);
                    retirer();
                } catch(e) { showToast(`❌ ${e.message}`); }
            });
            addBtn('Rejeter', 'x-circle', 'aus-btn-reject', () => {
                openModal('Rejeter le compte', false, async (raison) => {
                    try {
                        await AdminUtilisateurs.rejectUser(user.id, raison);
                        showToast(`🚫 @${user.username} rejeté.`);
                        retirer();
                    } catch(e) { showToast(`❌ ${e.message}`); }
                });
            });
        }

        if (tab === 'coiffeurs' || tab === 'clients') {
            addBtn('Suspendre', 'pause-circle', 'aus-btn-warn', () => {
                openModal('Suspendre le compte', true, async (raison, duree) => {
                    try {
                        await AdminUtilisateurs.suspendUser(user.id, raison, duree);
                        showToast(`⏸ @${user.username} suspendu.`);
                        retirer();
                    } catch(e) { showToast(`❌ ${e.message}`); }
                });
            });
            addBtn('Bannir', 'ban', 'aus-btn-reject', () => {
                openModal('Bannir définitivement', false, async (raison) => {
                    try {
                        await AdminUtilisateurs.banUser(user.id, raison);
                        showToast(`⛔ @${user.username} banni définitivement.`);
                        retirer();
                    } catch(e) { showToast(`❌ ${e.message}`); }
                });
            });
        }

        if (tab === 'suspendus') {
            addBtn('Réactiver', 'play-circle', 'aus-btn-validate', async () => {
                try {
                    await AdminUtilisateurs.reactivateUser(user.id);
                    showToast(`✅ @${user.username} réactivé.`);
                    retirer();
                } catch(e) { showToast(`❌ ${e.message}`); }
            });
            addBtn('Bannir', 'ban', 'aus-btn-reject', () => {
                openModal('Bannir définitivement', false, async (raison) => {
                    try {
                        await AdminUtilisateurs.banUser(user.id, raison);
                        showToast(`⛔ @${user.username} banni.`);
                        retirer();
                    } catch(e) { showToast(`❌ ${e.message}`); }
                });
            });
        }

        return card;
    };

    // ── RECHERCHE ──────────────────────────────────────────────────
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        list.querySelectorAll('.aus-card').forEach(c => {
            const match = !q || c.dataset.username?.includes(q) || c.dataset.email?.includes(q);
            c.style.display = match ? '' : 'none';
        });
    });

    // ── ONGLETS ────────────────────────────────────────────────────
    section.querySelectorAll('.aus-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            section.querySelectorAll('.aus-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            chargerOnglet(tab.dataset.tab);
        });
    });

    chargerCompteurs();
    chargerOnglet('attente');
    return section;
};