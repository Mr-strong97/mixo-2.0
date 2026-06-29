export const HeroSlider = (images) => {
    const container = document.createElement('div');
    container.className = 'hero-slider-wrapper';

    container.innerHTML = images.map((img, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}" 
             style="background-image: url('${img}')">
        </div>
    `).join('');

    let current = 0;
    const slides = container.querySelectorAll('.slide');

    // ✅ FIX : On démarre l'interval et on le stocke dans une variable.
    // Sans ça, chaque navigation sur /home créait un nouvel interval
    // sans jamais arrêter les précédents (fuite mémoire).
    const intervalId = setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);

    // ✅ FIX : On observe quand le composant est retiré du DOM
    // pour nettoyer l'interval automatiquement.
    const observer = new MutationObserver(() => {
        if (!document.body.contains(container)) {
            clearInterval(intervalId);
            observer.disconnect();
            console.log('🧹 HeroSlider : interval nettoyé');
        }
    });

    // On observe le body pour détecter la suppression du composant
    observer.observe(document.body, { childList: true, subtree: true });

    return container;
};