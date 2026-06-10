/**
 * ============================================================
 * COMPOSANT ATOMIQUE : AvatarUpload.js
 * ============================================================
 * Gère l'affichage et l'upload de la photo de profil.
 * Composant autonome, aucune dépendance externe.
 * ============================================================
 */

/**
 * @param {string} username  - Initiales à afficher si pas de photo
 * @param {string} role      - 'client' ou 'coiffeur'
 * @param {Function} onChange - Callback déclenché avec le fichier sélectionné
 */
export const AvatarUpload = (username = '', role = 'client', onChange = null) => {
    const initials = username.substring(0, 2).toUpperCase();
    const roleLabel = role === 'coiffeur' ? 'Coiffeur' : 'Client';

    const wrapper = document.createElement('div');
    wrapper.className = 'avatar-upload-wrapper';

    wrapper.innerHTML = `
        <!-- Cercle principal avec initiales ou photo -->
        <div class="avatar-circle" id="avatar-display">
            <span class="avatar-initials">${initials}</span>
            <img class="avatar-img d-none" id="avatar-img" alt="Photo de profil" />

            <!-- Overlay au survol pour indiquer la possibilité d'upload -->
            <div class="avatar-overlay">
                <i data-lucide="camera" class="avatar-camera-icon"></i>
                <span class="avatar-overlay-text">Changer</span>
            </div>
        </div>

        <!-- Badge rôle sous l'avatar -->
        <span class="role-badge">${roleLabel}</span>

        <!-- Input file caché — déclenché par le clic sur le cercle -->
        <input
            type="file"
            id="avatar-file-input"
            accept="image/*"
            class="d-none"
        />
    `;

    // --- LOGIQUE ---
    const circle    = wrapper.querySelector('#avatar-display');
    const fileInput = wrapper.querySelector('#avatar-file-input');
    const img       = wrapper.querySelector('#avatar-img');
    const initEl    = wrapper.querySelector('.avatar-initials');

    // Clic sur le cercle → ouvre le sélecteur de fichier
    circle.addEventListener('click', () => fileInput.click());

    // Prévisualisation de l'image sélectionnée
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            img.src = ev.target.result;
            img.classList.remove('d-none');
            initEl.classList.add('d-none');
        };
        reader.readAsDataURL(file);

        // Remonte le fichier vers le composant parent
        if (typeof onChange === 'function') onChange(file);
    });

    return wrapper;
};