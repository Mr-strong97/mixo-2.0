/**
 * Composant Bouton réutilisable
 * @param {string} text     - Le texte du bouton
 * @param {string} variant  - 'solid' ou 'outline'
 * @param {string} iconName - Nom de l'icône Lucide (optionnel)
 */
export const ButtonPrimary = (text, variant = 'solid', iconName = null) => {
    const btn = document.createElement('button');
    btn.className = `btn-custom ${variant === 'solid' ? 'btn-gold' : 'btn-glass'}`;

    // ✅ FIX : Le 3e paramètre iconName est maintenant pris en compte.
    // Avant, toutes les pages passaient une icône (ex: "log-in") mais elle était ignorée.
    if (iconName) {
        btn.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;margin-right:8px;vertical-align:middle;"></i>${text}`;
    } else {
        btn.innerText = text;
    }

    return btn;
};