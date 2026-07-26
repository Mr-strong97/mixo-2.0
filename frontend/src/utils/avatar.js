/**
 * ============================================================
 * utils/avatar.js — MIXO
 * ============================================================
 * Système d'avatars illustrés, construit comme un configurateur :
 * chaque preset combine une coiffure + une tenue + un ton de peau,
 * plutôt qu'un visage unique simplement recoloré. Ça permet des
 * avatars visuellement distincts, tout en gardant un seul visage
 * de base à maintenir.
 *
 * ⚠️ Contrat public inchangé : les pages qui consomment déjà
 * renderAvatarMarkup() / getAvatarPreset() / AVATAR_PRESET_LIST
 * (Discussion, Favoris, Historique, AvatarPicker…) n'ont besoin
 * d'aucune modification.
 * ============================================================
 */

const AVATAR_PRESETS = [
    { key: 'initials', label: 'Initiales', description: 'Vos initiales, sobres et rapides.', bgFrom: '#0A66C2', bgTo: '#70B5F9' },
    { key: 'classique', label: 'Classique', description: 'Coupe courte, look net et intemporel.', bgFrom: '#F59E0B', bgTo: '#FCD34D', hair: '#2B1E14', outfit: '#D97706', skin: '#F3C9A6', hairStyle: 'short', outfitStyle: 'collar' },
    { key: 'eclat', label: 'Éclat', description: 'Cheveux longs et ondulés, look lumineux.', bgFrom: '#0F75DA', bgTo: '#38BDF8', hair: '#243B53', outfit: '#2563EB', skin: '#F8D5C0', hairStyle: 'wavyLong', outfitStyle: 'blazer' },
    { key: 'nature', label: 'Nature', description: 'Boucles naturelles, esprit décontracté.', bgFrom: '#10B981', bgTo: '#34D399', hair: '#1F2937', outfit: '#059669', skin: '#8A5A3C', hairStyle: 'curly', outfitStyle: 'collar' },
    { key: 'chic', label: 'Chic', description: 'Lunettes et barbe soignée.', bgFrom: '#111827', bgTo: '#4B5563', hair: '#111827', outfit: '#374151', skin: '#EFC9A8', hairStyle: 'shortBeard', outfitStyle: 'blazer', glasses: true },
    { key: 'coeur', label: 'Cœur', description: 'Coiffure attachée, barrette cœur.', bgFrom: '#EF4444', bgTo: '#FB7185', hair: '#5B2A2A', outfit: '#BE123C', skin: '#F6CBA9', hairStyle: 'headbandHeart', outfitStyle: 'vneck' },
    { key: 'etoile', label: 'Étoile', description: 'Longue chevelure, headband étoile.', bgFrom: '#C4A66A', bgTo: '#E7CF99', hair: '#4B3621', outfit: '#A16207', skin: '#3D2A1E', hairStyle: 'headbandStar', outfitStyle: 'collar' },
    { key: 'zen', label: 'Zen', description: 'Chignon serein, esprit posé.', bgFrom: '#059669', bgTo: '#34D399', hair: '#1F2937', outfit: '#047857', skin: '#E8B88A', hairStyle: 'bun', outfitStyle: 'turtleneck' },
];

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ---------- Bibliothèque de coiffures (silhouette au-dessus/autour du visage) ---------- */
const HAIR_PARTS = {
    short: (hair) => `
        <path d="M35 39c3-10 12-17 22-17 4 0 8 1 11 3 2 2 4 5 4 8-3 1-6 1-8-1-2-1-4-1-6 0-3 2-5 6-5 10 0 1 0 2-1 2H35z" fill="${hair}"/>
    `,
    wavyLong: (hair) => `
        <path d="M35 39c3-10 12-17 22-17 4 0 8 1 11 3 2 2 4 5 4 8-3 1-6 1-8-1-2-1-4-1-6 0-3 2-5 6-5 10 0 1 0 2-1 2H35z" fill="${hair}"/>
        <path d="M31 43c-3 9-4 20 1 28 2-3 3-7 3-11l1-13z" fill="${hair}"/>
        <path d="M65 43c3 9 4 20-1 28-2-3-3-7-3-11l-1-13z" fill="${hair}"/>
    `,
    curly: (hair) => `
        <circle cx="33" cy="34" r="7" fill="${hair}"/>
        <circle cx="41" cy="26" r="8" fill="${hair}"/>
        <circle cx="53" cy="25" r="8" fill="${hair}"/>
        <circle cx="63" cy="32" r="7" fill="${hair}"/>
        <circle cx="48" cy="22" r="8" fill="${hair}"/>
        <circle cx="35" cy="42" r="6" fill="${hair}"/>
        <circle cx="61" cy="42" r="6" fill="${hair}"/>
    `,
    shortBeard: (hair) => `
        <path d="M35 39c3-10 12-17 22-17 4 0 8 1 11 3 2 2 4 5 4 8-3 1-6 1-8-1-2-1-4-1-6 0-3 2-5 6-5 10 0 1 0 2-1 2H35z" fill="${hair}"/>
        <path d="M38 46c1 7 4 13 10 13s9-6 10-13c-1 4-4 6-10 6s-9-2-10-6z" fill="${hair}" opacity=".9"/>
    `,
    headbandHeart: (hair) => `
        <path d="M34 40c2-9 10-15 18-15s16 6 18 15c-3 3-8 4-12 3-4-1-8-1-12 0-4 1-9 0-12-3z" fill="${hair}"/>
        <path d="M30 44c-2 8-2 18 2 25 2-4 2-9 2-9l1-13z" fill="${hair}"/>
        <rect x="33" y="36" width="30" height="4" rx="2" fill="#BE123C"/>
        <path d="M48 31c-1-1-3-1-4 0-.6.6-1 1.2-1 2 0 3 4 5 5 6 1-1 5-3 5-6 0-.8-.4-1.4-1-2-1-1-3-1-4 0Z" fill="#FB7185"/>
    `,
    headbandStar: (hair) => `
        <path d="M33 41c1-10 9-17 19-17 8 0 15 5 18 12-3 2-6 2-9 1-4-1-7-1-11 0-5 1-11 3-17 4z" fill="${hair}"/>
        <path d="M30 45c-3 8-3 18 1 26 2-5 2-11 2-11l1-15z" fill="${hair}"/>
        <rect x="32" y="37" width="32" height="4" rx="2" fill="#A16207"/>
        <path d="M48 29l1.6 3.4 3.7.3-2.8 2.4.9 3.6-3.4-2-3.4 2 .9-3.6-2.8-2.4 3.7-.3z" fill="#E7CF99"/>
    `,
    bun: (hair) => `
        <path d="M35 39c3-9 11-16 20-16 5 0 9 2 12 5-2 4-6 6-10 6-3 0-6 0-8 2-3 2-5 5-5 8H35z" fill="${hair}"/>
        <circle cx="61" cy="24" r="7" fill="${hair}"/>
    `,
};

/* ---------- Bibliothèque de tenues (col / silhouette du haut du buste) ---------- */
const OUTFIT_PARTS = {
    collar: (outfit) => `
        <path d="M30 82c1-12 9-22 18-22s17 10 18 22" fill="${outfit}"/>
    `,
    vneck: (outfit) => `
        <path d="M30 82c1-12 9-22 18-22s17 10 18 22" fill="${outfit}"/>
        <path d="M43 61l5 8 5-8" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    blazer: (outfit) => `
        <path d="M30 82c1-12 9-22 18-22s17 10 18 22" fill="${outfit}"/>
        <path d="M41 61l-7 21M55 61l7 21" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="2" stroke-linecap="round"/>
    `,
    turtleneck: (outfit) => `
        <path d="M30 82c1-12 9-22 18-22s17 10 18 22" fill="${outfit}"/>
        <path d="M40 62c3 3 13 3 16 0v5c-3 3-13 3-16 0z" fill="rgba(255,255,255,.22)"/>
    `,
};

/* Lunettes recentrées sur les yeux réels du visage (cx 43 / 53) — corrige un décalage de l'ancienne version */
const GLASSES_MARKUP = `
    <g fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round">
        <circle cx="43" cy="41" r="6.5" />
        <circle cx="53" cy="41" r="6.5" />
        <path d="M49.5 41h-3"/>
        <path d="M36.5 39l-3-1"/>
        <path d="M59.5 39l3-1"/>
    </g>
`;

const createAvatarSvg = (preset) => {
    const bgFrom = preset.bgFrom || '#0A66C2';
    const bgTo = preset.bgTo || '#70B5F9';
    const hair = preset.hair || '#1F2937';
    const outfit = preset.outfit || '#0F75DA';
    const skin = preset.skin || '#F1C7A0';
    const hairStyle = preset.hairStyle || 'short';
    const outfitStyle = preset.outfitStyle || 'collar';

    const hairMarkup = (HAIR_PARTS[hairStyle] || HAIR_PARTS.short)(hair);
    const outfitMarkup = (OUTFIT_PARTS[outfitStyle] || OUTFIT_PARTS.collar)(outfit);
    const glassesMarkup = preset.glasses ? GLASSES_MARKUP : '';

    return `
        <svg xmlns="${SVG_NS}" viewBox="0 0 96 96" aria-hidden="true" focusable="false" class="mxo-avatar-svg">
            <defs>
                <linearGradient id="bg-${preset.key}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${bgFrom}"/>
                    <stop offset="100%" stop-color="${bgTo}"/>
                </linearGradient>
            </defs>
            <circle cx="48" cy="48" r="44" fill="url(#bg-${preset.key})"/>
            ${outfitMarkup}
            <circle cx="48" cy="42" r="14" fill="${skin}"/>
            <path d="M37 50c2 3 6 5 11 5s9-2 11-5" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="43" cy="41" r="1.8" fill="#24303F"/>
            <circle cx="53" cy="41" r="1.8" fill="#24303F"/>
            <path d="M45 47c2 2 4 2 6 0" fill="none" stroke="#24303F" stroke-width="1.8" stroke-linecap="round"/>
            ${hairMarkup}
            <path d="M34 64h28c4 0 7 3 7 7v6H27v-6c0-4 3-7 7-7Z" fill="rgba(255,255,255,.12)"/>
            ${glassesMarkup}
        </svg>
    `;
};

const escapeHtml = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || 'MX';

export const getAvatarPreset = (avatarChoice = '') =>
    AVATAR_PRESETS.find((item) => item.key === avatarChoice) || AVATAR_PRESETS[0];

export const renderAvatarMarkup = (user = {}, { size = 'md', className = '' } = {}) => {
    const username = user.username || user.name || 'MX';
    const photo = user.photo || '';
    const avatarChoice = String(user.avatar_choice || user.avatarChoice || '').trim();
    const preset = getAvatarPreset(avatarChoice);
    const sizeClass = `mxo-avatar--${size}`;
    const extraClass = className ? ` ${className}` : '';

    if (photo) {
        return `
            <span class="mxo-avatar ${sizeClass} mxo-avatar--photo${extraClass}">
                <img src="${escapeHtml(photo)}" alt="${escapeHtml(username)}">
            </span>
        `;
    }

    if (avatarChoice && preset.key !== 'initials') {
        const avatarSvg = createAvatarSvg(preset);
        return `
            <span class="mxo-avatar ${sizeClass} mxo-avatar--choice${extraClass}" data-avatar-key="${escapeHtml(preset.key)}" style="background:linear-gradient(135deg, ${preset.bgFrom || '#0A66C2'}, ${preset.bgTo || '#70B5F9'});">
                ${avatarSvg}
            </span>
        `;
    }

    return `
        <span class="mxo-avatar ${sizeClass} mxo-avatar--initials${extraClass}" data-avatar-key="initials">
            ${escapeHtml(initials(username))}
        </span>
    `;
};

export const AVATAR_PRESET_LIST = AVATAR_PRESETS;