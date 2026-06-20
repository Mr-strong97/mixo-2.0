/**
 * AdminAbonnementsPage.js — MIXO
 * Espace Admin — Section Abonnements (rendue dans AdminServicesDashboardPage)
 */
import { AdminPlanForm }       from '../../components/adminComponents/AdminPlanForm.js';
import { AdminAbonnementsAPI } from '../../api/AdminAbonnementsAPI.js';
import { confirmDialog }       from '../../utils/confirmDialog.js';
import { showToast }           from '../../utils/toast.js';

/**
 * Rendu de la section Abonnements dans un conteneur fourni par le dashboard hôte.
 * @param {HTMLElement} container
 */
export const renderAdminAbonnementsSection = async (container) => {
    try {
        const [stats, plans] = await Promise.all([
            AdminAbonnementsAPI.getStats(),
            AdminAbonnementsAPI.getPlans(),
        ]);

        container.innerHTML = `
            <div class="adb-section-header">
                <h2>Abonnements</h2>
                <button class="adb-btn-add" id="aap-add-plan" type="button">
                    <i data-lucide="plus"></i> Nouveau plan
                </button>
            </div>

            <div class="aap-stats-grid">
                <div class="aap-stat-card"><span>${stats.essais_actifs}</span><label>Essais actifs</label></div>
                <div class="aap-stat-card"><span>${stats.payants_actifs}</span><label>Abonnés payants</label></div>
                <div class="aap-stat-card"><span>${stats.expires}</span><label>Expirés</label></div>
                <div class="aap-stat-card"><span>${stats.total}</span><label>Total</label></div>
            </div>

            <h3 class="aap-subtitle">Plans disponibles</h3>
            <div class="aap-plans-table" id="aap-plans-table"></div>
        `;

        const table = container.querySelector('#aap-plans-table');
        renderPlansTable(table, plans);

        container.querySelector('#aap-add-plan').addEventListener('click', () => {
            document.body.appendChild(AdminPlanForm(null, async (payload) => {
                await AdminAbonnementsAPI.creerPlan(payload);
                showToast('✅ Plan créé.');
                renderAdminAbonnementsSection(container);
            }, () => {}));
        });

        if (window.lucide) window.lucide.createIcons();

    } catch {
        container.innerHTML = `<p class="adb-error">Erreur de chargement des abonnements.</p>`;
    }
};

function renderPlansTable(container, plans) {
    container.innerHTML = `
        <table class="ast-table">
            <thead><tr><th>NOM</th><th>TYPE</th><th>PRIX</th><th>STATUT</th><th>ACTIONS</th></tr></thead>
            <tbody></tbody>
        </table>
    `;
    const tbody = container.querySelector('tbody');

    plans.forEach(plan => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(plan.nom)}</td>
            <td>${plan.plan}</td>
            <td>${plan.prix_mensuel} €</td>
            <td><span class="ast-badge" style="background:${plan.actif ? '#DCFCE7' : '#FEF2F2'};color:${plan.actif ? '#16A34A' : '#DC2626'};">${plan.actif ? 'Actif' : 'Désactivé'}</span></td>
            <td class="ast-actions">
                <button class="ast-icon-btn" data-action="edit" title="Modifier"><i data-lucide="pencil"></i></button>
                ${plan.actif ? `<button class="ast-icon-btn ast-icon-danger" data-action="disable" title="Désactiver"><i data-lucide="power-off"></i></button>` : ''}
            </td>
        `;
        tr.querySelector('[data-action="edit"]').addEventListener('click', () => {
            document.body.appendChild(AdminPlanForm(plan, async (payload) => {
                await AdminAbonnementsAPI.modifierPlan(plan.id, payload);
                showToast('✅ Plan modifié.');
                renderAdminAbonnementsSection(container.closest('#adb-content') || container);
            }, () => {}));
        });
        tr.querySelector('[data-action="disable"]')?.addEventListener('click', () => {
            confirmDialog(
                'Désactiver le plan ?',
                `Le plan « ${plan.nom} » sera retiré de la liste visible par les coiffeurs.`
            ).then((ok) => {
                if (!ok) return;
                AdminAbonnementsAPI.desactiverPlan(plan.id)
                    .then(() => { showToast('⏸ Plan désactivé.'); renderAdminAbonnementsSection(container.closest('#adb-content') || container); })
                    .catch(() => showToast('❌ Erreur.'));
            });
        });
        tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
}

function escapeHtml(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
