import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css"; // Import direct du CSS pour Vite

/**
 * Utilitaire de notification Mixo
 * @param {string} text - Le message à afficher
 * @param {'success' | 'error' | 'info'} type - Le style du toast
 */
export const showToast = (text, type = "success") => {
    // Configuration des couleurs
    const colors = {
        success: "#c4a66a", // Gold Mixo
        error: "#ff5f6d",   // Rouge Alerte
        info: "#3498db"     // Bleu Info
    };

    Toastify({
        text: text,
        duration: 3500,
        gravity: "top",       // "top" ou "bottom"
        position: "right",    // "left", "center" ou "right"
        stopOnFocus: true,    // Empêche de fermer si on survole
        close: true,          // Ajoute une petite croix
        style: {
            background: colors[type] || colors.success,
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 20px",
            maxWidth: "90vw", // Responsive : ne dépasse pas de l'écran sur mobile
        },
        // Animation responsive personnalisée
        offset: {
            x: window.innerWidth < 768 ? 10 : 20, // Plus proche du bord sur mobile
            y: 20
        },
    }).showToast();
};