/**
 * AdminUserSection.js — MIXO
 * 5 onglets : EN ATTENTE | COIFFEURS | CLIENTS | SUSPENDUS | BANNIS
 * Journal supprimé → page dédiée /admin/journal accessible depuis NavbarAdmin
 */
import AdminService       from '../../api/AdminService.js';
import { showToast }      from '../../utils/toast.js';

const PER_PAGE = 10;

export const AdminUserSection = () => {
    const section = document.createElement('div');
    section.className = 'adm-user-section';

    section.innerHTML = `
        <div class="adm-user-header">
            <i data-lucide="users" style="color:#0A66C2;width:22px;height:22px;flex-shrink:0;"></i>
            <h2 class="adm-user-title">GESTION DES UTILISATEURS</h2>
        </div>

        <!-- 5 onglets (sans Journal) -->
        <div class="adm-tabs-bar">
            <button class="adm-tab active" data-tab="attente">
                <i data-lucide="clock"></i> EN ATTENTE
                <span class="adm-tab-badge" id="cnt-attente">0</span>
            </button>
            <button class="adm-tab" data-tab="coiffeurs">
                <i data-lucide="scissors"></i> COIFFEURS
            </button>
            <button class="adm-tab" data-tab="clients">
                <i data-lucide="user"></i> CLIENTS
            </button>
            <button class="adm-tab" data-tab="suspendus">
                <i data-lucide="pause-circle"></i> SUSPENDUS
            </button>
            <button class="adm-tab" data-tab="bannis">
                <i data-lucide="ban"></i> BANNIS
            </button>
        </div>

        <!-- Recherche -->
        <div class="adm-search-row">
            <div class="adm-search-inner">
                <i data-lucide="search" class="adm-search-ico"></i>
                <input type="text" id="adm-search" class="adm-search-field"
                       placeholder="Rechercher par nom d'utilisateur ou email…"/>
            </div>
        </div>

        <!-- Table -->
        <div id="adm-table-zone"></div>

        <!-- Modal overlay -->
        <div id="adm-modal-overlay" style="display:none;position:fixed;inset:0;
             background:rgba(0,0,0,0.55);z-index:9999;align-items:center;
             justify-content:center;backdrop-filter:blur(3px);">
            <div id="adm-modal-box" style="background:#fff;border-radius:20px;
                 padding:36px 32px;max-width:520px;width:90%;
                 box-shadow:0 24px 60px rgba(0,0,0,0.15);">
            </div>
        </div>
    `;

    const tableZone = section.querySelector('#adm-table-zone');
    const overlay   = section.querySelector('#adm-modal-overlay');
    const modalBox  = section.querySelector('#adm-modal-box');
    let allItems = [], currentTab = 'attente';

    // ── MODAL ──────────────────────────────────────────────
    const openModal = html => {
        modalBox.innerHTML = html;
        overlay.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
    };
    const closeModal = () => { overlay.style.display = 'none'; };
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    // ── CHARGER ────────────────────────────────────────────
    const charger = async (tab) => {
        currentTab = tab;
        section.querySelector('#adm-search').value = '';
        tableZone.innerHTML = `<div class="adm-tbl-loader"><div class="adm-spinner"></div></div>`;

        try {
            let data;
            if      (tab === 'attente')   data = await AdminService.getPendingUsers();
            else if (tab === 'coiffeurs') data = await AdminService.getActiveHairdressers();
            else if (tab === 'clients')   data = await AdminService.getClients('ACTIF');
            else if (tab === 'suspendus') data = await AdminService.getAllUsers({ statut: 'INACTIF' });
            else if (tab === 'bannis')    data = await AdminService.getAllUsers({ statut: 'BANNI' });

            allItems = data?.resultats || [];

            if (tab === 'attente') {
                const el = section.querySelector('#cnt-attente');
                if (el) el.textContent = allItems.length;
            }

            afficher(allItems, 1);
        } catch (err) {
            tableZone.innerHTML = `
                <div class="adm-tbl-empty">
                    <i data-lucide="alert-triangle" style="color:#DC2626;width:32px;height:32px;"></i>
                    <p>${err.message}</p>
                </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    // ── AFFICHER ───────────────────────────────────────────
    const afficher = (items, page) => {
        const start = (page - 1) * PER_PAGE;
        const slice = items.slice(start, start + PER_PAGE);
        const pages = Math.ceil(items.length / PER_PAGE);

        if (items.length === 0) {
            tableZone.innerHTML = buildEmpty(currentTab);
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        tableZone.innerHTML = `
            <div class="adm-tbl-wrap">
                <table class="adm-tbl">
                    <thead>${buildHead(currentTab)}</thead>
                    <tbody id="tbl-body"></tbody>
                </table>
                <div class="adm-tbl-footer">
                    <span class="adm-tbl-info">
                        Affichage de ${start + 1}–${Math.min(start + PER_PAGE, items.length)} sur ${items.length}
                    </span>
                    <div class="adm-pagination" id="adm-pag"></div>
                </div>
            </div>`;

        const tbody = tableZone.querySelector('#tbl-body');
        slice.forEach(u => tbody.insertAdjacentHTML('beforeend', buildRow(u, currentTab)));

        // Les libellés servent au rendu mobile en fiches, sans dupliquer le
        // contenu ni modifier les colonnes du tableau desktop.
        const labels = [...tableZone.querySelectorAll('.adm-tbl thead th')]
            .map((th) => th.textContent.trim());
        tableZone.querySelectorAll('.adm-tbl tbody tr').forEach((row) => {
            [...row.children].forEach((cell, index) => {
                cell.dataset.label = labels[index] || '';
            });
        });

        tableZone.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () =>
                handleAction(btn.dataset.action, btn.dataset.id, btn.dataset.name));
        });

        if (pages > 1) buildPagination(tableZone.querySelector('#adm-pag'), page, pages);
        if (window.lucide) window.lucide.createIcons();
    };

    // ── HEADER ─────────────────────────────────────────────
    const buildHead = tab => {
        const th = s => `<th>${s}</th>`;
        if (tab === 'attente')   return `<tr>${th('UTILISATEUR')}${th('SPÉCIALITÉ')}${th('DATE D\'INSCRIPTION')}${th('STATUT')}${th('ACTIONS')}</tr>`;
        if (tab === 'coiffeurs') return `<tr>${th('COIFFEUR')}${th('EMAIL')}${th('DATE D\'INSCRIPTION')}${th('STATUT')}${th('ACTIONS')}</tr>`;
        if (tab === 'clients')   return `<tr>${th('CLIENT')}${th('EMAIL')}${th('DATE D\'INSCRIPTION')}${th('STATUT')}${th('ACTIONS')}</tr>`;
        if (tab === 'suspendus') return `<tr>${th('UTILISATEUR')}${th('DATE SUSPENSION')}${th('RAISON')}${th('STATUT')}${th('ACTIONS')}</tr>`;
        if (tab === 'bannis')    return `<tr>${th('UTILISATEUR')}${th('RAISON DU BANNISSEMENT')}${th('DATE')}${th('STATUT')}${th('ACTIONS')}</tr>`;
        return '';
    };

    // ── LIGNE ──────────────────────────────────────────────
    const buildRow = (u, tab) => {
        const ini   = (u.username || 'U').substring(0, 2).toUpperCase();
        const date  = u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';
        const name  = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username;

        const userCell = `
            <td class="adm-tbl-user" data-label="Utilisateur">
                <div class="adm-tbl-avatar">${ini}</div>
                <div><div class="adm-tbl-name">${name}</div><div class="adm-tbl-email">${u.email || '—'}</div></div>
            </td>`;

        if (tab === 'attente') return `<tr>${userCell}
            <td class="adm-tbl-muted" data-label="Spécialité">${u.specialite || '—'}</td>
            <td class="adm-tbl-muted" data-label="Inscription">${date}</td>
            <td data-label="Statut"><span class="adm-badge adm-badge-pending">EN ATTENTE</span></td>
            <td class="adm-tbl-actions" data-label="Actions">
                <button class="adm-icon-btn adm-icon-validate" data-action="valider" data-id="${u.id}" data-name="${u.username}" title="Valider" aria-label="Valider ${name}"><i data-lucide="check"></i></button>
                <button class="adm-icon-btn adm-icon-reject"   data-action="rejeter" data-id="${u.id}" data-name="${u.username}" title="Rejeter" aria-label="Rejeter ${name}"><i data-lucide="x"></i></button>
            </td></tr>`;

        if (tab === 'coiffeurs') return `<tr>
            <td class="adm-tbl-user" data-label="Coiffeur">
                <div class="adm-tbl-avatar">${ini}</div>
                <div><div class="adm-tbl-name">${name}</div><div class="adm-tbl-email">@${u.username}</div></div>
            </td>
            <td class="adm-tbl-muted" data-label="Email">${u.email || '—'}</td>
            <td class="adm-tbl-muted" data-label="Inscription">${date}</td>
            <td data-label="Statut"><span class="adm-badge adm-badge-active">ACTIF</span></td>
            <td class="adm-tbl-actions" data-label="Actions">
                <button class="adm-icon-btn adm-icon-suspend" data-action="suspendre" data-id="${u.id}" data-name="${u.username}" title="Suspendre" aria-label="Suspendre ${name}"><i data-lucide="pause-circle"></i></button>
                <button class="adm-icon-btn adm-icon-ban"     data-action="bannir"    data-id="${u.id}" data-name="${u.username}" title="Bannir" aria-label="Bannir ${name}"><i data-lucide="ban"></i></button>
            </td></tr>`;

        if (tab === 'clients') return `<tr>${userCell}
            <td class="adm-tbl-muted" data-label="Email">${u.email || '—'}</td>
            <td class="adm-tbl-muted" data-label="Inscription">${date}</td>
            <td data-label="Statut"><span class="adm-badge adm-badge-active">ACTIF</span></td>
            <td class="adm-tbl-actions" data-label="Actions">
                <button class="adm-icon-btn adm-icon-suspend" data-action="suspendre" data-id="${u.id}" data-name="${u.username}" title="Suspendre" aria-label="Suspendre ${name}"><i data-lucide="pause-circle"></i></button>
                <button class="adm-icon-btn adm-icon-ban"     data-action="bannir"    data-id="${u.id}" data-name="${u.username}" title="Bannir" aria-label="Bannir ${name}"><i data-lucide="ban"></i></button>
            </td></tr>`;

        if (tab === 'suspendus') {
            const ds = u.updated_at ? new Date(u.updated_at).toLocaleDateString('fr-FR') : '—';
            return `<tr>${userCell}
                <td class="adm-tbl-muted" data-label="Suspension">${ds}</td>
                <td class="adm-tbl-muted" data-label="Raison">${u.raison_suspension || '—'}</td>
                <td data-label="Statut"><span class="adm-badge adm-badge-suspended">SUSPENDU</span></td>
                <td class="adm-tbl-actions" data-label="Actions">
                    <button class="adm-icon-btn adm-icon-reactivate" data-action="reactiver" data-id="${u.id}" data-name="${u.username}" title="Réactiver" aria-label="Réactiver ${name}"><i data-lucide="rotate-ccw"></i></button>
                    <button class="adm-icon-btn adm-icon-delete"     data-action="voir"      data-id="${u.id}" data-name="${u.username}" title="Voir détails" aria-label="Voir les détails de ${name}"><i data-lucide="eye"></i></button>
                </td></tr>`;
        }

        if (tab === 'bannis') {
            const db = u.updated_at ? new Date(u.updated_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';
            return `<tr>${userCell}
                <td class="adm-tbl-muted" data-label="Raison">${u.raison_bannissement || '—'}</td>
                <td class="adm-tbl-muted" data-label="Date">${db}</td>
                <td data-label="Statut"><span class="adm-badge adm-badge-banned">BANNI</span></td>
                <td class="adm-tbl-actions" data-label="Actions">
                    <button class="adm-icon-btn adm-icon-reactivate" data-action="reactiver" data-id="${u.id}" data-name="${u.username}" title="Réactiver" aria-label="Réactiver ${name}"><i data-lucide="rotate-ccw"></i></button>
                    <button class="adm-icon-btn adm-icon-delete"     data-action="voir"      data-id="${u.id}" data-name="${u.username}" title="Voir détails" aria-label="Voir les détails de ${name}"><i data-lucide="eye"></i></button>
                </td></tr>`;
        }
        return '';
    };

    // ── ACTIONS ────────────────────────────────────────────
    const handleAction = (action, userId, username) => {
        if (action === 'valider') {
            doAction(async () => { await AdminService.validateUser(userId); showToast(`✅ @${username} validé !`); charger(currentTab); });
        } else if (action === 'rejeter') {
            openMotifModal(`REJETER @${username.toUpperCase()}`, false, async r => {
                await AdminService.rejectUser(userId, r); showToast(`🚫 @${username} rejeté.`); charger(currentTab);
            });
        } else if (action === 'suspendre') {
            openMotifModal(`SUSPENDRE @${username.toUpperCase()}`, true, async (r, d) => {
                await AdminService.suspendUser(userId, r, d); showToast(`⏸ @${username} suspendu.`); charger(currentTab);
            });
        } else if (action === 'bannir') {
            openBanModal(username, async r => {
                await AdminService.banUser(userId, r); showToast(`⛔ @${username} banni.`); charger(currentTab);
            });
        } else if (action === 'reactiver') {
            doAction(async () => { await AdminService.reactivateUser(userId); showToast(`✅ @${username} réactivé.`); charger(currentTab); });
        } else if (action === 'voir') {
            openDetailModal(allItems.find(u => u.id === userId) || { username });
        }
    };

    const doAction = async fn => { try { await fn(); } catch(e) { showToast(`❌ ${e.message}`); } };

    // ── MODAL BANNIR ───────────────────────────────────────
    const openBanModal = (username, onConfirm) => {
        openModal(`
            <h3 style="font-size:0.95rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#1A1D20;margin:0 0 8px;">BANNIR DÉFINITIVEMENT @${username.toUpperCase()}</h3>
            <p style="font-size:0.84rem;color:#62676B;margin:0 0 18px;">Le motif est obligatoire et sera envoyé à l'utilisateur.</p>
            <textarea id="modal-raison" rows="5" placeholder="Décrivez précisément la raison…"
                style="width:100%;background:#F0F4F9;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.86rem;color:#1A1D20;padding:14px;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
            <div style="display:flex;gap:12px;margin-top:20px;">
                <button id="mc" style="flex:1;height:48px;background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:600;color:#1A1D20;cursor:pointer;">Annuler</button>
                <button id="mok" style="flex:1;height:48px;background:#0A66C2;border:none;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:700;color:#fff;cursor:pointer;">Confirmer</button>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:16px;padding:10px 14px;background:#FEF2F2;border-radius:10px;">
                <i data-lucide="alert-triangle" style="color:#DC2626;width:16px;height:16px;flex-shrink:0;"></i>
                <span style="font-size:0.8rem;font-weight:600;color:#DC2626;">Cette action est irréversible et interdira tout accès futur.</span>
            </div>
        `);
        modalBox.querySelector('#mc').addEventListener('click', closeModal);
        modalBox.querySelector('#mok').addEventListener('click', () => {
            const r = modalBox.querySelector('#modal-raison').value.trim();
            if (!r) { showToast("Le motif est obligatoire."); return; }
            closeModal();
            doAction(() => onConfirm(r));
        });
    };

    // ── MODAL MOTIF ────────────────────────────────────────
    const openMotifModal = (title, showDuree, onConfirm) => {
        openModal(`
            <h3 style="font-size:0.95rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#1A1D20;margin:0 0 8px;">${title}</h3>
            <p style="font-size:0.84rem;color:#62676B;margin:0 0 18px;">Le motif est obligatoire.</p>
            <textarea id="modal-raison" rows="4" placeholder="Motif détaillé…"
                style="width:100%;background:#F0F4F9;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.86rem;color:#1A1D20;padding:14px;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
            ${showDuree ? `<input id="modal-duree" type="text" placeholder="Durée (optionnel)"
                style="width:100%;margin-top:10px;background:#F0F4F9;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.84rem;color:#1A1D20;padding:12px 14px;outline:none;box-sizing:border-box;"/>` : ''}
            <div style="display:flex;gap:12px;margin-top:20px;">
                <button id="mc" style="flex:1;height:48px;background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:600;color:#1A1D20;cursor:pointer;">Annuler</button>
                <button id="mok" style="flex:1;height:48px;background:#0A66C2;border:none;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:700;color:#fff;cursor:pointer;">Confirmer</button>
            </div>
        `);
        modalBox.querySelector('#mc').addEventListener('click', closeModal);
        modalBox.querySelector('#mok').addEventListener('click', () => {
            const r = modalBox.querySelector('#modal-raison').value.trim();
            const d = modalBox.querySelector('#modal-duree')?.value.trim() || '';
            if (!r) { showToast("Le motif est obligatoire."); return; }
            closeModal(); doAction(() => onConfirm(r, d));
        });
    };

    // ── MODAL DÉTAILS ──────────────────────────────────────
    const openDetailModal = u => {
        const dateInsc  = u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-FR') : '—';
        const lastLogin = u.last_login  ? new Date(u.last_login).toLocaleString('fr-FR') : 'Jamais';
        openModal(`
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
                <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#0A66C2,#3B82F6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1rem;flex-shrink:0;">
                    ${(u.username||'U').substring(0,2).toUpperCase()}
                </div>
                <div>
                    <div style="font-weight:700;font-size:1rem;color:#1A1D20;">@${u.username}</div>
                    <div style="font-size:0.8rem;color:#62676B;">${u.email||'—'}</div>
                </div>
                <span style="margin-left:auto;padding:4px 12px;border-radius:100px;font-size:0.65rem;font-weight:700;background:${u.statut==='ACTIF'?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)'};color:${u.statut==='ACTIF'?'#16A34A':'#DC2626'};">${u.statut||'—'}</span>
            </div>
            ${[['Rôle',u.role||'—'],['Date inscription',dateInsc],['Dernière connexion',lastLogin],['Email vérifié',u.email_verifie?'Oui':'Non']].map(([l,v])=>`
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F0F4F9;font-size:0.84rem;">
                    <span style="color:#62676B;font-weight:500;">${l}</span>
                    <span style="color:#1A1D20;font-weight:600;">${v}</span>
                </div>`).join('')}
            <button id="dc" style="width:100%;margin-top:20px;height:46px;background:#0A66C2;border:none;border-radius:12px;color:#fff;font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;">Fermer</button>
        `);
        modalBox.querySelector('#dc').addEventListener('click', closeModal);
    };

    // ── PAGINATION ─────────────────────────────────────────
    const buildPagination = (el, page, pages) => {
        [['<', page-1], ...Array.from({length:Math.min(pages,5)},(_,i)=>[i+1,i+1]), ['>',page+1]].forEach(([l,p])=>{
            if (typeof l === 'number' && l !== 1 && l !== pages && Math.abs(l-page) > 1) return;
            const btn = document.createElement('button');
            btn.className = `adm-page-btn ${p===page?'active':''}`;
            btn.textContent = l;
            btn.disabled = p < 1 || p > pages;
            btn.addEventListener('click', () => afficher(allItems, p));
            el.appendChild(btn);
        });
    };

    // ── VIDE ───────────────────────────────────────────────
    const buildEmpty = tab => {
        const t = {attente:'Aucun coiffeur en attente de validation.',coiffeurs:'Aucun coiffeur actif.',clients:'Aucun client actif.',suspendus:'Aucun compte suspendu.',bannis:'Aucun compte banni.'}[tab]||'Aucun résultat.';
        const s = {attente:'Tous les nouveaux comptes ont été traités avec succès.'}[tab]||'';
        return `<div class="adm-tbl-empty">
            <div class="adm-empty-icon"><i data-lucide="inbox" style="width:36px;height:36px;color:#0A66C2;opacity:0.4;"></i></div>
            <p style="font-size:0.9rem;font-weight:600;color:#1A1D20;margin:0 0 4px;">${t}</p>
            <p style="font-size:0.8rem;color:#62676B;margin:0;">${s}</p>
        </div>`;
    };

    // ── RECHERCHE ──────────────────────────────────────────
    section.querySelector('#adm-search').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        afficher(q ? allItems.filter(u => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) : allItems, 1);
    });

    // ── ONGLETS ────────────────────────────────────────────
    section.querySelectorAll('.adm-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            section.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            charger(tab.dataset.tab);
        });
    });

    charger('attente');
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return section;
};
