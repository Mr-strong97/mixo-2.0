export const confirmDialog = (title, message, { confirmText = 'Confirmer', cancelText = 'Annuler' } = {}) => {
    return new Promise((resolve) => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;

        const overlay = document.createElement('div');
        overlay.className = 'mxo-confirm-overlay';
        overlay.setAttribute('role', 'presentation');

        const modal = document.createElement('div');
        modal.className = 'mxo-confirm-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'mxo-confirm-title');
        modal.setAttribute('aria-describedby', 'mxo-confirm-message');

        const titleEl = document.createElement('h3');
        titleEl.className = 'mxo-confirm-title';
        titleEl.id = 'mxo-confirm-title';
        titleEl.textContent = title;

        const messageEl = document.createElement('p');
        messageEl.className = 'mxo-confirm-message';
        messageEl.id = 'mxo-confirm-message';
        messageEl.textContent = message;

        const actions = document.createElement('div');
        actions.className = 'mxo-confirm-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'mxo-confirm-cancel';
        cancelBtn.textContent = cancelText;

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'mxo-confirm-ok';
        okBtn.textContent = confirmText;

        actions.append(cancelBtn, okBtn);
        modal.append(titleEl, messageEl, actions);
        overlay.appendChild(modal);

        const close = (value) => {
            document.body.style.overflow = previousOverflow;
            overlay.removeEventListener('click', handleOverlayClick);
            document.removeEventListener('keydown', handleKeydown, true);
            overlay.remove();
            previousFocus?.focus?.();
            resolve(value);
        };

        function handleOverlayClick(e) {
            if (e.target === overlay) close(false);
        }

        function handleKeydown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                close(false);
            }
            if (e.key === 'Tab') {
                const focusables = [cancelBtn, okBtn];
                const currentIndex = focusables.indexOf(document.activeElement);
                if (currentIndex === -1) return;
                e.preventDefault();
                const nextIndex = e.shiftKey
                    ? (currentIndex - 1 + focusables.length) % focusables.length
                    : (currentIndex + 1) % focusables.length;
                focusables[nextIndex].focus();
            }
        }

        overlay.addEventListener('click', handleOverlayClick);
        cancelBtn.addEventListener('click', () => close(false));
        okBtn.addEventListener('click', () => close(true));
        document.addEventListener('keydown', handleKeydown, true);

        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);
        window.requestAnimationFrame(() => cancelBtn.focus());
    });
};
