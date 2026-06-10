/**
 * Logo simple fonctionnel "M." (Cercle bleu, Texte blanc)
 */
export const Logo = (size = 100) => { // Réduit par défaut à 100px pour éviter un logo géant au chargement
    const container = document.createElement('div');
    container.className = "logo-wrapper";

    container.innerHTML = `
        <style>
            .logo-wrapper {
                display: inline-block;
            }
            .logo-circle {
                width: ${size}px;
                height: ${size}px;
                background-color: #0A66C2; /* Bleu */
                color: #ffffff;            /* Blanc */
                border-radius: 50%;        /* Forme un cercle parfait */
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Montserrat', 'Poppins', 'Segoe UI', sans-serif;
                font-weight: 700;
                font-size: ${size * 0.38}px; /* Taille du texte proportionnelle au cercle */
                user-select: none;
                transition: background-color 0.3s ease;
                padding-right: ${size * 0.04}px; /* Léger décalage pour recentrer le "M." à cause du point */
                box-sizing: border-box;
            }
            .logo-circle:hover {
                background-color:  #70B5F9; /* Bleu un peu plus foncé au survol */
            }
        </style>
        
        <div class="logo-circle">
            M.
        </div>
    `;

    return container;
};