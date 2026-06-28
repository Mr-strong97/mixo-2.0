/**
 * NotificationBell.js — MIXO
 * Cloche de notifications dans la navbar — badge avec compteur non lus.
 * @param {Function} onClick () => void  (navigue vers /notifications)
 * @returns {HTMLElement}
 */
import { NotificationAPI } from '../../api/NotificationAPI.js';

export const NotificationBell = (onClick = null) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'ntb-wrapper';
    wrapper.innerHTML = `
        <button class="ntb-btn" type="button" title="Notifications">
            <i data-lucide="bell"></i>
            <span class="ntb-badge" id="ntb-badge" style="display:none;">0</span>
        </button>`;

    wrapper.querySelector('.ntb-btn').addEventListener('click', () => {
        onClick?.();
        window.navigate?.('/notifications');
    });

    NotificationAPI.getNonLues()
        .then(data => {
            const count = Array.isArray(data) ? data.length : (data.count || 0);
            const badge = wrapper.querySelector('#ntb-badge');
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            }
        })
        .catch(() => {});

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};
