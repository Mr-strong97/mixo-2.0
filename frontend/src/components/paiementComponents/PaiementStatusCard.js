/**
 * PaiementStatusCard.js — MIXO
 * Affiche le statut d'un paiement avec montants.
 *
 * @param {Object} paiement { statut, montant_total, methode_label, transaction_id, created_at }
 * @returns {HTMLElement}
 */
const STATUT_INFO = {
    EN_ATTENTE: { color: '#D97706', icon: 'clock',        label: 'En attente' },
    PAYE:       { color: '#16A34A', icon: 'check-circle', label: 'Payé' },
    ECHOUE:     { color: '#DC2626', icon: 'x-circle',     label: 'Échoué' },
    REMBOURSE:  { color: '#0A66C2', icon: 'rotate-ccw',   label: 'Remboursé' },
};

export const PaiementStatusCard = (paiement) => {
    const card = document.createElement('div');
    card.className = 'psc-card';
    const info = STATUT_INFO[paiement.statut] || STATUT_INFO.EN_ATTENTE;

    card.innerHTML = `
        <div class="psc-top">
            <i data-lucide="${info.icon}" style="color:${info.color};width:28px;height:28px;"></i>
            <div>
                <span class="psc-statut" style="color:${info.color};">${info.label}</span>
                <span class="psc-methode">${paiement.methode_label}</span>
            </div>
        </div>
        <div class="psc-montants">
            <div class="psc-row"><span>Total payé</span><strong>${paiement.montant_total} €</strong></div>
            <div class="psc-row"><span>Réf. transaction</span><code>${paiement.transaction_id}</code></div>
        </div>
    `;

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return card;
};
