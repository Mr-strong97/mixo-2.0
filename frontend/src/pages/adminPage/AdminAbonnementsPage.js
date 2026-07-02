/**
 * AdminAbonnementsPage.js — MIXO
 * Module désactivé en Version 1
 */
export const renderAdminAbonnementsSection = async (container) => {
    container.innerHTML = `
        <div class="adb-section-header">
            <h2>Abonnements</h2>
        </div>
        <div class="adb-empty-state" style="padding:32px;border:1px solid #E2E8F0;border-radius:18px;background:#fff;">
            <h3 style="margin:0 0 10px;color:#0F172A;">Module désactivé</h3>
            <p style="margin:0;color:#64748B;line-height:1.7;">
                La Version 1 de Mixo est entièrement gratuite. Les abonnements seront réintroduits plus tard si nécessaire.
            </p>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
};
