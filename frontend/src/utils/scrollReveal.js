/**
 * scrollReveal.js — Mixo
 * Petits utilitaires d'animation au scroll, partagés par les sections de la Home :
 *  - reveal-on-scroll (fade / slide / zoom) via IntersectionObserver
 *  - barre de progression de scroll globale
 *  - count-up animé (easeOutExpo), pour la section Statistiques
 *  - helper de progression de scroll d'une section, pour la section "Transformation"
 *
 * Respecte `prefers-reduced-motion` : tout est affiché immédiatement, sans animation.
 */

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Active les animations d'apparition pour tout élément possédant l'attribut
 * `data-animate` à l'intérieur de `root`.
 *
 * Valeurs supportées pour `data-animate` : "fade-up" (défaut), "fade-in",
 * "zoom-in", "fade-left", "fade-right".
 * `data-delay` (en ms) permet de décaler l'apparition d'un élément précis.
 *
 * @param {ParentNode} root
 * @returns {() => void} fonction de nettoyage (déconnecte l'observer)
 */
export function initScrollReveal(root = document) {
    const elements = root.querySelectorAll('[data-animate]');
    if (!elements.length) return () => {};

    if (prefersReducedMotion()) {
        elements.forEach((el) => el.classList.add('is-visible'));
        return () => {};
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    elements.forEach((el) => {
        if (el.dataset.delay) {
            el.style.transitionDelay = `${el.dataset.delay}ms`;
        }
        observer.observe(el);
    });

    return () => observer.disconnect();
}

/**
 * Insère une fine barre de progression de scroll, fixée en haut du viewport.
 * N'a aucun effet si une instance existe déjà dans `container`.
 *
 * @param {HTMLElement} container - élément auquel attacher la barre (défaut: body)
 * @returns {() => void} fonction de nettoyage
 */
export function initScrollProgress(container = document.body) {
    if (container.querySelector(':scope > .mixo-scroll-progress')) {
        return () => {};
    }

    const bar = document.createElement('div');
    bar.className = 'mixo-scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    container.appendChild(bar);

    const update = () => {
        if (!bar.isConnected) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
        window.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
        bar.remove();
    };
}

/** Courbe d'accélération douce (easeOutExpo), utilisée pour le count-up. */
export function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Anime la valeur textuelle de `el` de 0 vers `target` avec un easeOutExpo.
 * Les nombres entiers restent entiers (formatés en fr-FR), les décimaux
 * conservent une décimale.
 *
 * @param {HTMLElement} el
 * @param {number} target
 * @param {{suffix?: string, duration?: number, locale?: string}} [options]
 */
export function animateCountUp(el, target, options = {}) {
    const { suffix = '', duration = 1800, locale = 'fr-FR' } = options;
    const isInt = Number.isInteger(target);

    if (prefersReducedMotion()) {
        el.textContent = `${isInt ? target.toLocaleString(locale) : target}${suffix}`;
        return;
    }

    const start = performance.now();
    el.classList.add('is-counting');

    function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutExpo(progress);
        const current = eased * target;
        const display = isInt
            ? Math.floor(current).toLocaleString(locale)
            : current.toFixed(1);

        el.textContent = `${display}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            el.textContent = `${isInt ? target.toLocaleString(locale) : target}${suffix}`;
            el.classList.remove('is-counting');
        }
    }
    requestAnimationFrame(frame);
}

/**
 * Calcule, de façon throttlée par requestAnimationFrame, la progression
 * (0 → 1) du scroll à travers `section` (0 = haut de la section vient
 * d'atteindre le haut du viewport, 1 = bas de la section atteint le bas du
 * viewport), puis appelle `onProgress(progress)`.
 *
 * Utilisé par la section "Transformation" pour piloter le canvas scroll-driven.
 *
 * @param {HTMLElement} section
 * @param {(progress: number) => void} onProgress
 * @returns {() => void} fonction de nettoyage
 */
export function onSectionScrollProgress(section, onProgress) {
    let ticking = false;

    const measure = () => {
        ticking = false;
        if (!section.isConnected) return;

        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress = scrollable > 0
            ? Math.min(1, Math.max(0, -rect.top / scrollable))
            : 0;

        onProgress(progress);
    };

    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(measure);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
    };
}
