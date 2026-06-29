/**
 * UserModel.js
 * =============
 * CHANGEMENTS vs backend mis à jour :
 *  - Le backend retourne maintenant des données IMBRIQUÉES :
 *      Coiffeur : { utilisateur: { id, username, email... }, specialite, bio... }
 *      Client   : { utilisateur: { id, username, email... }, sexe, telephone... }
 *  - createClientModel / createCoiffeurModel gèrent les deux formats
 *    (imbriqué ET plat) pour rester compatibles.
 *  - Ajout de : statut, adresse, ville (client), note_moyenne, est_verifie (coiffeur)
 *  - Trois fonctions de payload séparées pour les deux appels PATCH distincts.
 */

const BASE_FIELDS = {
    id:        null,
    username:  '',
    email:     '',
    firstName: '',
    lastName:  '',
    statut:    '',
    role:      '',
    sexe:      '',
    telephone: '',
    adresse:   '',
};

// ------------------------------------------------------------------ //
// MODÈLE CLIENT
// ------------------------------------------------------------------ //
export const createClientModel = (apiData = {}) => {
    /**
     * apiData peut arriver sous deux formes :
     *   - Imbriqué (depuis /auth/clients/{id}/) :
     *       { utilisateur: { id, username, email, first_name, last_name, statut },
     *         sexe, telephone, adresse, ville }
     *   - Plat (depuis localStorage ou autre source) :
     *       { id, username, email, ... }
     */
    const user = apiData.utilisateur || apiData;

    return {
        ...BASE_FIELDS,
        role:      'client',
        id:        user.id          ?? null,
        username:  user.username    ?? '',
        email:     user.email       ?? '',
        firstName: user.first_name  ?? '',
        lastName:  user.last_name   ?? '',
        statut:    user.statut      ?? '',
        // Champs spécifiques au client
        sexe:      apiData.sexe      ?? '',
        telephone: apiData.telephone ?? '',
        adresse:   apiData.adresse   ?? '',
        ville:     apiData.ville     ?? '',
    };
};

// ------------------------------------------------------------------ //
// MODÈLE COIFFEUR
// ------------------------------------------------------------------ //
export const createCoiffeurModel = (apiData = {}) => {
    /**
     * apiData imbriqué depuis /auth/coiffeurs/{id}/ :
     *   { utilisateur: { id, username, email, first_name, last_name, statut },
     *     specialite, bio, sexe, telephone, adresse, note_moyenne, est_verifie }
     */
    const user = apiData.utilisateur || apiData;

    return {
        ...BASE_FIELDS,
        role:        'coiffeur',
        id:          user.id         ?? null,
        username:    user.username   ?? '',
        email:       user.email      ?? '',
        firstName:   user.first_name ?? '',
        lastName:    user.last_name  ?? '',
        statut:      user.statut     ?? '',
        // Champs spécifiques au coiffeur
        specialite:  apiData.specialite  ?? '',
        bio:         apiData.bio         ?? '',
        sexe:        apiData.sexe        ?? '',
        telephone:   apiData.telephone   ?? '',
        adresse:     apiData.adresse     ?? '',
        note_moyenne: apiData.note_moyenne ?? 0,
        est_verifie:  apiData.est_verifie  ?? false,
    };
};

// ------------------------------------------------------------------ //
// PAYLOADS POUR LES APPELS API
// Les deux PATCH sont séparés car ils touchent deux endpoints différents.
// ------------------------------------------------------------------ //

/**
 * Payload 1 : champs Utilisateur → PATCH auth/profil/{id}/
 * Accepté par UtilisateurSerializer (backend).
 */
export const modelToUserPayload = (model) => ({
    username:   model.username,
    first_name: model.firstName,
    last_name:  model.lastName,
});

/**
 * Payload 2 coiffeur : champs profil → PATCH auth/coiffeurs/{id}/
 * Accepté par CoiffeurUpdateSerializer (backend).
 */
export const modelToCoiffeurPayload = (model) => ({
    specialite: model.specialite,
    bio:        model.bio,
    sexe:       model.sexe,
    telephone:  model.telephone,
    adresse:    model.adresse,
});

/**
 * Payload 2 client : champs profil → PATCH auth/clients/{id}/
 * Accepté par ClientUpdateSerializer (backend).
 */
export const modelToClientPayload = (model) => ({
    sexe:      model.sexe,
    telephone: model.telephone,
    adresse:   model.adresse,
    ville:     model.ville,
});

/**
 * Raccourci : retourne le bon payload selon le rôle.
 * Utilisé dans SettingsForm.
 */
export const modelToApiPayload = (model) =>
    model.role === 'coiffeur'
        ? modelToCoiffeurPayload(model)
        : modelToClientPayload(model);