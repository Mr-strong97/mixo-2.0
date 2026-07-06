const AVATAR_PRESETS = [
    { key: 'initials', label: 'Initiales', bgFrom: '#0A66C2', bgTo: '#70B5F9' },
    { key: 'classique', label: 'Classique', bgFrom: '#F59E0B', bgTo: '#FCD34D', hair: '#2B1E14', outfit: '#D97706', accessory: 'none' },
    { key: 'eclat', label: 'Éclat', bgFrom: '#0F75DA', bgTo: '#38BDF8', hair: '#243B53', outfit: '#2563EB', accessory: 'spark' },
    { key: 'nature', label: 'Nature', bgFrom: '#10B981', bgTo: '#34D399', hair: '#1F2937', outfit: '#059669', accessory: 'leaf' },
    { key: 'chic', label: 'Chic', bgFrom: '#111827', bgTo: '#4B5563', hair: '#111827', outfit: '#374151', accessory: 'glasses' },
    { key: 'coeur', label: 'Cœur', bgFrom: '#EF4444', bgTo: '#FB7185', hair: '#5B2A2A', outfit: '#BE123C', accessory: 'heart' },
    { key: 'etoile', label: 'Étoile', bgFrom: '#C4A66A', bgTo: '#E7CF99', hair: '#4B3621', outfit: '#A16207', accessory: 'star' },
    { key: 'zen', label: 'Zen', bgFrom: '#059669', bgTo: '#34D399', hair: '#1F2937', outfit: '#047857', accessory: 'bun' },
];

const SVG_NS = 'http://www.w3.org/2000/svg';

const createAvatarSvg = (preset) => {
    const bgFrom = preset.bgFrom || '#0A66C2';
    const bgTo = preset.bgTo || '#70B5F9';
    const hair = preset.hair || '#1F2937';
    const outfit = preset.outfit || '#0F75DA';
    const skin = '#F8D5C0';
    const accent = preset.accent || '#FDE68A';
    const accessory = preset.accessory || 'none';

    const accessoryMarkup = {
        spark: `<g fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round">
            <path d="M72 24v10M67 29h10M82 18l3 5M80 20l5 3"/>
        </g>`,
        leaf: `<path d="M78 23c-7 1-11 6-12 12 6 1 11-1 15-5 3-4 3-8-3-7Z" fill="${accent}" opacity=".95"/>`,
        glasses: `<g fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round">
            <circle cx="51" cy="50" r="7" />
            <circle cx="71" cy="50" r="7" />
            <path d="M58 50h6"/>
        </g>`,
        heart: `<path d="M76 24c-2-2-5-2-7 0-1 1-2 2-2 4 0 5 7 9 9 11 2-2 9-6 9-11 0-2-1-3-2-4-2-2-5-2-7 0Z" fill="${accent}" opacity=".95"/>`,
        star: `<path d="M77 21l2.8 6 6.5.6-4.9 4.1 1.5 6.4-5.9-3.4-5.9 3.4 1.5-6.4-4.9-4.1 6.5-.6z" fill="${accent}" opacity=".98"/>`,
        bun: `<circle cx="80" cy="28" r="6" fill="${hair}" opacity=".92"/>`,
        none: '',
    }[accessory] || '';

    return `
        <svg xmlns="${SVG_NS}" viewBox="0 0 96 96" aria-hidden="true" focusable="false" class="mxo-avatar-svg">
            <defs>
                <linearGradient id="bg-${preset.key}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${bgFrom}"/>
                    <stop offset="100%" stop-color="${bgTo}"/>
                </linearGradient>
            </defs>
            <circle cx="48" cy="48" r="44" fill="url(#bg-${preset.key})"/>
            <circle cx="48" cy="42" r="14" fill="${skin}"/>
            <path d="M30 82c1-12 9-22 18-22s17 10 18 22" fill="${outfit}" />
            <path d="M35 39c3-10 12-17 22-17 4 0 8 1 11 3 2 2 4 5 4 8-3 1-6 1-8-1-2-1-4-1-6 0-3 2-5 6-5 10 0 1 0 2-1 2H35z" fill="${hair}"/>
            <path d="M37 50c2 3 6 5 11 5s9-2 11-5" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="43" cy="41" r="1.8" fill="#24303F"/>
            <circle cx="53" cy="41" r="1.8" fill="#24303F"/>
            <path d="M45 47c2 2 4 2 6 0" fill="none" stroke="#24303F" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M34 64h28c4 0 7 3 7 7v6H27v-6c0-4 3-7 7-7Z" fill="rgba(255,255,255,.18)"/>
            ${accessoryMarkup}
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
