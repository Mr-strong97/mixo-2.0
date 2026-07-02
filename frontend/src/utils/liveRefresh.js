/**
 * liveRefresh.js — MIXO
 * Aide légère pour les vues SPA qui doivent se synchroniser automatiquement.
 */

const registerCleanup = (cleanup) => {
    const previous = window.__mixoPageCleanup;
    window.__mixoPageCleanup = () => {
        try {
            if (typeof previous === 'function') previous();
        } finally {
            if (typeof cleanup === 'function') cleanup();
        }
    };
    return cleanup;
};

export const attachLiveRefresh = (loadFn, options = {}) => {
    const intervalMs = Number(options.intervalMs || 15000);
    const refetchOnFocus = options.refetchOnFocus !== false;
    const refetchOnVisible = options.refetchOnVisible !== false;
    const stopWhenFalse = options.stopWhenFalse === true;
    let timer = null;
    let disposed = false;

    const dispose = () => {
        disposed = true;
        if (timer) clearInterval(timer);
        if (refetchOnFocus) window.removeEventListener('focus', onFocus);
        if (refetchOnVisible) document.removeEventListener('visibilitychange', onVisibility);
    };

    const tick = () => {
        if (disposed) return;
        Promise.resolve(loadFn()).then((result) => {
            if (stopWhenFalse && result === false) dispose();
        }).catch(() => {});
    };

    const start = () => {
        if (timer) clearInterval(timer);
        timer = setInterval(tick, intervalMs);
    };

    const onFocus = () => tick();
    const onVisibility = () => {
        if (!document.hidden) tick();
    };

    tick();
    start();

    if (refetchOnFocus) window.addEventListener('focus', onFocus);
    if (refetchOnVisible) document.addEventListener('visibilitychange', onVisibility);

    return registerCleanup(dispose);
};

export const dispatchLiveEvent = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
};
