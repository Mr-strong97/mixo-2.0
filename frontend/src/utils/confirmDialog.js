export const confirmDialog = (title, message, { confirmText = 'Confirmer', cancelText = 'Annuler' } = {}) => {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'mxo-confirm-overlay';
        overlay.innerHTML = `
            <div class="mxo-confirm-modal" role="dialog" aria-modal="true">
                <h3 class="mxo-confirm-title">${title}</h3>
                <p class="mxo-confirm-message">${message}</p>
                <div class="mxo-confirm-actions">
                    <button type="button" class="mxo-confirm-cancel">${cancelText}</button>
                    <button type="button" class="mxo-confirm-ok">${confirmText}</button>
                </div>
            </div>
        `;

        const close = (value) => {
            overlay.remove();
            resolve(value);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });

        overlay.querySelector('.mxo-confirm-cancel').addEventListener('click', () => close(false));
        overlay.querySelector('.mxo-confirm-ok').addEventListener('click', () => close(true));

        document.body.appendChild(overlay);
    });
};
