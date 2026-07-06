import { AVATAR_PRESET_LIST, renderAvatarMarkup } from '../../utils/avatar.js';

export const AvatarPicker = (username = '', currentChoice = '', onChange = null) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'avatar-picker';
    wrapper.dataset.avatarChoice = currentChoice || 'initials';
    const getUsername = () => (typeof username === 'function' ? username() : username);

    wrapper.innerHTML = `
        <div class="avatar-picker__header">
            <div>
                <p class="avatar-picker__title">Avatar</p>
                <p class="avatar-picker__subtitle">Choisissez un avatar illustré ou gardez vos initiales.</p>
            </div>
            <div id="avatar-preview"></div>
        </div>
        <div class="avatar-picker__grid" id="avatar-picker-grid"></div>
    `;

    const preview = wrapper.querySelector('#avatar-preview');
    const grid = wrapper.querySelector('#avatar-picker-grid');
    const state = { choice: currentChoice || 'initials' };
    const choiceButtons = new Map();
    const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };

    const renderPreview = () => {
        preview.innerHTML = renderAvatarMarkup({
            username: getUsername(),
            avatar_choice: state.choice,
        }, { size: 'lg' });
        refreshIcons();
    };

    const refreshInitialsButton = () => {
        const initialsBtn = choiceButtons.get('initials');
        if (!initialsBtn) return;
        initialsBtn.innerHTML = `
            ${renderAvatarMarkup({
                username: getUsername(),
                avatar_choice: 'initials',
            }, { size: 'md' })}
            <span class="avatar-choice-label">${AVATAR_PRESET_LIST[0].label}</span>
        `;
    };

    AVATAR_PRESET_LIST.forEach((preset) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `avatar-choice-btn ${state.choice === preset.key ? 'is-selected' : ''}`;
        btn.innerHTML = `
            ${renderAvatarMarkup({
                username: getUsername(),
                avatar_choice: preset.key,
            }, { size: 'md' })}
            <span class="avatar-choice-label">${preset.label}</span>
        `;
        btn.addEventListener('click', () => {
            state.choice = preset.key;
            wrapper.dataset.avatarChoice = state.choice;
            wrapper.querySelectorAll('.avatar-choice-btn').forEach((item) => item.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            renderPreview();
            if (typeof onChange === 'function') onChange(state.choice);
        });
        choiceButtons.set(preset.key, btn);
        grid.appendChild(btn);
    });

    renderPreview();
    wrapper.refreshAvatarPreview = () => {
        refreshInitialsButton();
        renderPreview();
        refreshIcons();
    };
    return wrapper;
};
