/**
 * NotificationPage.js — Coiffetime
 * URL mise à jour : /api/notifications/ (app dédiée)
 */
import { Navbar }      from '../../components/navbars/Navbar.js';
import { Footer }      from '../../components/Footer.js';
import { requireAuth } from '../../utils/AuthGuard.js';
import api             from '../../api/axiosConfig.js';
import { showToast }   from '../../utils/toast.js';
import { attachLiveRefresh } from '../../utils/liveRefresh.js';

const TYPE_CONFIG = {
    INFO:           { icon: 'info',           color: '#1A56DB', bg: 'rgba(26,86,219,0.08)'  },
    SUCCES:         { icon: 'check-circle',   color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    AVERTISSEMENT:  { icon: 'alert-triangle', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
    DANGER:         { icon: 'x-circle',       color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
    SYSTEME:        { icon: 'settings',       color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
    CHAT_MESSAGE:   { icon: 'messages-square', color: '#0A66C2', bg: 'rgba(10,102,194,0.08)' },
};

export const NotificationPage = () => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'notif-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'notif-main';
    main.innerHTML = `
        <div class="notif-header">
            <div>
                <h1 class="notif-title">
                    <i data-lucide="bell" style="color:#1A56DB; fill:rgba(26,86,219,0.1);"></i>
                    Notifications
                </h1>
                <p class="notif-subtitle" id="notif-count">Chargement…</p>
            </div>
            <div class="notif-controls">
                <select id="filter-type" class="notif-filter-select">
                    <option value="">Tous les types</option>
                    <option value="INFO">Information</option>
                    <option value="SUCCES">Succès</option>
                    <option value="AVERTISSEMENT">Avertissement</option>
                    <option value="DANGER">Danger</option>
                    <option value="SYSTEME">Système</option>
                    <option value="CHAT_MESSAGE">Message chat</option>
                </select>
                <button class="notif-btn-all-read" id="btn-all-read">
                    <i data-lucide="check-check"></i>
                    Tout marquer comme lu
                </button>
            </div>
        </div>
        <div id="notif-list">
            <div class="notif-loader"><div class="spinner"></div></div>
        </div>
    `;
    page.appendChild(main);
    page.appendChild(Footer());

    const listEl = main.querySelector('#notif-list');

    const charger = async () => {
        const typeFilter = main.querySelector('#filter-type').value;
        const params     = typeFilter ? `?type=${typeFilter}` : '';

        try {
            const res  = await api.get(`notifications/${params}`);
            const data = res.data;

            // Affichage propre du compteur comme sur l'image maquette
            const countNonLues = data.non_lues || 0;
            const countTotal = data.count || 0;
            main.querySelector('#notif-count').textContent =
                `${countNonLues} non lue${countNonLues > 1 ? 's' : ''} · ${countTotal} au total`;

            if (!data.resultats || data.resultats.length === 0) {
                listEl.innerHTML = `
                    <div class="notif-empty">
                        <i data-lucide="bell-off"></i>
                        <p>Aucune notification pour l'instant.</p>
                    </div>`;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            listEl.innerHTML = '';
            data.resultats.forEach(n => listEl.appendChild(creerItem(n)));
            if (window.lucide) window.lucide.createIcons();

        } catch (err) {
            listEl.innerHTML = `<p class="notif-error">Erreur : ${err.message}</p>`;
        }
    };

    const creerItem = (n) => {
        const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
        const date = new Date(n.created_at).toLocaleString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
        });
        const destination = typeof n.lien === 'string' ? n.lien.replace(/\/+$/, '') || '/' : n.lien;
        
        const item = document.createElement('div');
        // Utilisation des propriétés dynamiques du backend (est_lue ou lu)
        const estLu = n.est_lue !== undefined ? n.est_lue : n.lu;
        item.className = `notif-item ${estLu ? 'notif-read' : 'notif-unread'}`;
        item.dataset.id = n.id;

        item.innerHTML = `
            <div class="notif-item-icon" style="background:${cfg.bg};">
                <i data-lucide="${cfg.icon}" style="color:${cfg.color}; width:18px; height:18px;"></i>
            </div>
            <div class="notif-item-body">
                <div class="notif-item-header">
                    <span class="notif-item-titre">${escapeHtml(n.titre || 'Notification')}</span>
                    ${!estLu ? '<span class="notif-unread-dot"></span>' : ''}
                </div>
                <p class="notif-item-msg">${escapeHtml(n.message || '')}</p>
                <div class="notif-item-footer">
                    <span class="notif-item-date">
                        <i data-lucide="calendar" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px; opacity:0.6;"></i>
                        ${date}
                    </span>
                </div>
            </div>
            <div class="notif-item-actions">
                ${n.type === 'AVIS_DEMANDE' && n.lien ? `<button class="notif-btn-avis" type="button">
                    <i data-lucide="star"></i>
                    Donner mon avis
                </button>` : ''}
                ${!estLu ? `<button class="notif-btn-read" title="Marquer comme lu" aria-label="Marquer cette notification comme lue">
                    <i data-lucide="check"></i>
                </button>` : ''}
                <button class="notif-btn-del" title="Supprimer" aria-label="Supprimer cette notification">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;

        // Événement Marquer comme lu
        item.querySelector('.notif-btn-read')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await api.patch(`notifications/${n.id}/lire/`);
                charger();
            } catch {
                showToast("Impossible de marquer cette notification comme lue.");
            }
        });

        // Événement Supprimer
        item.querySelector('.notif-btn-del').addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await api.delete(`notifications/${n.id}/supprimer/`);
                item.style.opacity   = '0';
                item.style.transform = 'translateY(10px)';
                item.style.transition = 'all 0.25s ease';
                setTimeout(() => { item.remove(); charger(); }, 250);
            } catch {
                showToast("Impossible de supprimer cette notification.");
            }
        });

        // Redirection vers le lien
        if (n.lien) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                if (!estLu) api.patch(`notifications/${n.id}/lire/`).catch(() => {});
                if (window.navigate) window.navigate(destination);
                else window.location.href = destination;
            });
        }

        item.querySelector('.notif-btn-avis')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!estLu) api.patch(`notifications/${n.id}/lire/`).catch(() => {});
            if (window.navigate) window.navigate(destination);
            else window.location.href = destination;
        });

        return item;
    };

    // Bouton Tout lire
    main.querySelector('#btn-all-read').addEventListener('click', async () => {
        try {
            await api.patch('notifications/tout-lire/');
            showToast('✅ Toutes les notifications marquées comme lues.');
            charger();
        } catch {
            showToast("Impossible de marquer toutes les notifications comme lues.");
        }
    });

    // Filtre
    main.querySelector('#filter-type').addEventListener('change', () => charger());

    attachLiveRefresh(charger, { intervalMs: 10000 });
    return page;
};

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
