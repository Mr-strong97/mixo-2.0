/**
 * SettingsForm.js
 * ================
 * CHANGEMENTS vs backend mis à jour :
 *  - handleSubmit fait maintenant DEUX appels PATCH séparés :
 *      1. auth/profil/{id}/     → username, first_name, last_name
 *      2. auth/coiffeurs/{id}/  → specialite, bio, sexe, telephone, adresse
 *         auth/clients/{id}/    → sexe, telephone, adresse, ville
 *  - Ajout du champ "adresse" (nouveau dans backend)
 *  - Ajout du champ "ville" (clients uniquement)
 *  - Import de ProfilUtilisateur pour les deux méthodes de mise à jour.
 */

import { FormField, getFieldValue }      from './FormField.js';
import { ToggleField, getSpecialiteValue } from './ToggleField.js';
import { AvatarUpload }                   from './AvatarUpload.js';
import { modelToUserPayload, modelToApiPayload } from '../../models/UserModel.js';
import { ProfilUtilisateur }              from '../../api/axiosConfig.js';
import { showToast }                      from '../../utils/toast.js';

export const SettingsForm = (model, onUpdate = null) => {
    const isCoiffeur = model.role === 'coiffeur';

    const form = document.createElement('div');
    form.className = 'settings-form-wrapper';

    // ---------------------------------------------------------------- //
    // 1. COMPOSANTS ATOMIQUES
    // ---------------------------------------------------------------- //
    const avatar = AvatarUpload(model.username, model.role);

    // Colonne gauche
    const emailField = FormField({
        id: 'field-email', type: 'email', label: 'Email unique',
        icon: 'mail', value: model.email, disabled: true,
    });
    const bioField = FormField({
        id: 'field-bio', type: 'textarea', label: 'Bio',
        icon: 'file-text', value: model.bio || '', disabled: true,
        hidden: !isCoiffeur, // Bio uniquement pour les coiffeurs
    });
    const sexeField = FormField({
        id: 'field-sexe', type: 'select', label: 'Sexe',
        icon: 'user-2', value: model.sexe, disabled: true,
        options: [
            { value: 'M',  label: 'Homme' },
            { value: 'F',  label: 'Femme' },
            { value: 'NB', label: 'Non-binaire' },
        ],
    });

    // Colonne droite
    const usernameField = FormField({
        id: 'field-username', type: 'text', label: "Nom d'utilisateur",
        icon: 'at-sign', value: model.username, disabled: true,
    });
    const firstNameField = FormField({
        id: 'field-firstname', type: 'text', label: 'Prénom',
        icon: 'user', value: model.firstName, disabled: true,
    });
    const lastNameField = FormField({
        id: 'field-lastname', type: 'text', label: 'Nom',
        icon: 'user', value: model.lastName, disabled: true,
    });
    const phoneField = FormField({
        id: 'field-phone', type: 'tel', label: 'Téléphone',
        icon: 'phone', value: model.telephone, disabled: true,
    });
    const adresseField = FormField({
        id: 'field-adresse', type: 'text', label: 'Adresse',
        icon: 'map-pin', value: model.adresse || '', disabled: true,
    });
    // Ville : uniquement pour les clients
    const villeField = FormField({
        id: 'field-ville', type: 'text', label: 'Ville',
        icon: 'building', value: model.ville || '', disabled: true,
        hidden: isCoiffeur,
    });

    // Toggle spécialité (coiffeur uniquement)
    const toggleField = ToggleField(model.specialite, isCoiffeur);

    // Mot de passe (lecture seule)
    const passwordDisplay = FormField({
        id: 'field-password', type: 'password', label: 'Mot de passe',
        icon: 'lock', value: '••••••••', disabled: true,
    });

    // ---------------------------------------------------------------- //
    // 2. ASSEMBLAGE
    // ---------------------------------------------------------------- //
    form.innerHTML = `
        <div class="settings-grid">
            <div class="settings-col-left">
                <div id="avatar-mount"></div>
                <div id="left-fields"></div>
            </div>
            <div class="settings-col-right">
                <div id="right-fields"></div>
            </div>
        </div>
        <div class="settings-password-row">
            <div id="password-mount"></div>
        </div>
        <div class="settings-submit-row">
            <button id="settings-btn" class="settings-btn-action">
                <i data-lucide="edit-3" id="btn-icon"></i>
                <span id="btn-text">Modifier</span>
            </button>
        </div>
    `;

    form.querySelector('#avatar-mount').appendChild(avatar);

    const leftFields = form.querySelector('#left-fields');
    leftFields.appendChild(emailField);
    leftFields.appendChild(bioField);
    leftFields.appendChild(sexeField);

    const rightFields = form.querySelector('#right-fields');
    rightFields.appendChild(usernameField);
    rightFields.appendChild(firstNameField);
    rightFields.appendChild(lastNameField);
    rightFields.appendChild(phoneField);
    rightFields.appendChild(adresseField);
    rightFields.appendChild(villeField);
    rightFields.appendChild(toggleField);

    form.querySelector('#password-mount').appendChild(passwordDisplay);

    // ---------------------------------------------------------------- //
    // 3. LOGIQUE MODIFIER / VALIDER
   let isEditMode = false;

    const editableIds = [
        'field-bio', 'field-sexe',
        'field-username', 'field-firstname', 'field-lastname',
        'field-phone', 'field-adresse', 'field-ville',
    ];

    const setEditMode = (active) => {
        isEditMode = active;

        editableIds.forEach(id => {
            const el = form.querySelector(`#${id}`);
            if (el) el.disabled = !active;
        });

        const toggleCheck = form.querySelector('#toggle-specialite');
        const specInput   = form.querySelector('#specialite-value');
        if (toggleCheck) toggleCheck.disabled = !active;
        if (specInput)   specInput.disabled   = !active;

        const btn     = form.querySelector('#settings-btn');
        const btnIcon = form.querySelector('#btn-icon');
        const btnText = form.querySelector('#btn-text');

        if (btn) {
            if (active) {
                // On sécurise en vérifiant que les éléments internes existent avant d'y toucher
                if (btnIcon) btnIcon.setAttribute('data-lucide', 'check');
                if (btnText) btnText.textContent = 'Valider';
                btn.classList.add('active');
            } else {
                if (btnIcon) btnIcon.setAttribute('data-lucide', 'edit-3');
                if (btnText) btnText.textContent = 'Modifier';
                btn.classList.remove('active');
            }
        }

        if (window.lucide) window.lucide.createIcons();
    };

    const handleSubmit = async () => {
        const updatedModel = {
            ...model,
            username:   getFieldValue(form, 'field-username'),
            firstName:  getFieldValue(form, 'field-firstname'),
            lastName:   getFieldValue(form, 'field-lastname'),
            bio:        getFieldValue(form, 'field-bio'),
            sexe:       getFieldValue(form, 'field-sexe'),
            telephone:  getFieldValue(form, 'field-phone'),
            adresse:    getFieldValue(form, 'field-adresse'),
            ville:      isCoiffeur ? '' : getFieldValue(form, 'field-ville'),
            specialite: isCoiffeur ? getSpecialiteValue(form) : '',
        };

        const btn = form.querySelector('#settings-btn');
        const originalHtml = btn ? btn.innerHTML : 'Modifier';

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Sauvegarde...`;
            }

            /**
             * APPEL 1 : met à jour les champs Utilisateur (username, prénom, nom)
             */
            await ProfilUtilisateur.updateUserFields(
                model.id,
                modelToUserPayload(updatedModel)
            );

            /**
             * APPEL 2 : met à jour les champs spécifiques au rôle
             */
            await ProfilUtilisateur.updateProfileFields(
                model.role,
                model.id,
                modelToApiPayload(updatedModel)
            );

            // Mise à jour du username en localStorage si changé
            if (updatedModel.username !== model.username) {
                localStorage.setItem('username', updatedModel.username.toLowerCase().trim());
            }

            showToast('Profil mis à jour avec succès !');

            // --- REPASSE LE BOUTON EN MODE "MODIFIER" & ACTUALISE LA PAGE ---
            setEditMode(false);
            if (typeof onUpdate === 'function') onUpdate(updatedModel);

            // Petit délai pour laisser l'utilisateur voir le Toast de succès, puis recharge la page
            setTimeout(() => {
                window.location.reload(); 
            }, 1000);

        } catch (error) {
            showToast(`Erreur serveur lors de la sauvegarde : ${error.message || error}`);
            if (btn) btn.innerHTML = originalHtml;
            setEditMode(true); // En cas d'erreur, on reste en mode édition pour ne pas perdre les saisies
        } finally {
            if (btn) btn.disabled = false;
        }
    };

    const settingsBtn = form.querySelector('#settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Évite les soumissions sauvages de formulaires
            if (!isEditMode) setEditMode(true);
            else handleSubmit();
        });
    }

    return form;
};