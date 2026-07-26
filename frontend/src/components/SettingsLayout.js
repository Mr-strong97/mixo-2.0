/**
 * SettingsLayout.js — MIXO
 * Composant commun : structure sidebar gauche + contenu droite.
 * Utilisé par ClientSettingsPage et CoiffeurSettingsPage.
 *
 * @param {Array}  sections  [{ id, icon, label, render() }]
 * @param {String} title     Titre de la page
 * @param {String} color     Couleur accent (défaut #0A66C2)
 */
export const SettingsLayout = (sections = [], title = 'Paramètres', color = '#0A66C2', secondaryLinks = []) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'stl-wrapper';

    wrapper.innerHTML = `
        <div class="stl-layout">

            <!-- Sidebar navigation -->
            <aside class="stl-sidebar">
                <div class="stl-sidebar-title">
                    <i data-lucide="settings" style="color:${color};width:18px;height:18px;flex-shrink:0;"></i>
                    <span>${title}</span>
                </div>
                <nav class="stl-nav" id="stl-nav"></nav>
                ${secondaryLinks.length ? `<div class="stl-secondary-title">Accès rapides</div><nav class="stl-nav stl-secondary-nav" id="stl-secondary-nav"></nav>` : ''}
            </aside>

            <!-- Contenu dynamique -->
            <div class="stl-content" id="stl-content">
                <div class="stl-content-loader">
                    <div class="adm-spinner"></div>
                </div>
            </div>
        </div>
    `;

    const nav     = wrapper.querySelector('#stl-nav');
    const secondaryNav = wrapper.querySelector('#stl-secondary-nav');
    const content = wrapper.querySelector('#stl-content');
    let activeId  = sections[0]?.id;

    // ── Construction de la nav ──────────────────────────────
    sections.forEach((s, i) => {
        const btn = document.createElement('button');
        btn.className  = `stl-nav-btn ${i === 0 ? 'active' : ''}`;
        btn.dataset.id = s.id;
        btn.innerHTML  = `
            <i data-lucide="${s.icon}" class="stl-nav-ico"></i>
            <span>${s.label}</span>
        `;
        btn.addEventListener('click', () => activate(s.id));
        nav.appendChild(btn);
    });
    secondaryLinks.forEach((link) => {
        const btn = document.createElement('button');
        btn.className = `stl-nav-btn stl-secondary-btn ${link.danger ? 'stl-danger-btn' : ''}`;
        btn.innerHTML = `<i data-lucide="${link.icon}" class="stl-nav-ico"></i><span>${link.label}</span>`;
        btn.addEventListener('click', () => {
            if (typeof link.action === 'function') return link.action();
            window.navigate?.(link.route);
        });
        secondaryNav?.appendChild(btn);
    });

    // ── Activation d'une section ────────────────────────────
    const activate = (id) => {
        activeId = id;
        nav.querySelectorAll('.stl-nav-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.id === id));

        content.innerHTML = '';
        const section = sections.find(s => s.id === id);
        if (section?.render) {
            content.appendChild(section.render());
        }
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 30);
    };

    // ── Rendu initial ───────────────────────────────────────
    activate(activeId);
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 0);
    return wrapper;
};
