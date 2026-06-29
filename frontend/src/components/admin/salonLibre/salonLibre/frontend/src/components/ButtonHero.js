// ButtonHero.js
export const ButtonHero = (text, variant = "primary") => {
    const btn = document.createElement('button');
    // Variante primary = Gold, secondary = Outline White
    btn.className = `btn-custom ${variant === 'primary' ? 'btn-gold' : 'btn-outline'}`;
    btn.innerText = text;
    return btn;
};