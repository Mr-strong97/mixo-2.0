/**
 * Modèle de données pour les statistiques du catalogue (MVC)
 */
export const StatsModel = {
    getStats: () => {
        return [
            { id: "users", value: "30K", label: "UTILISATEURS", type: "standard" },
            { id: "services", value: "100K", label: "SERVICES PRO", type: "standard" },
            { id: "best-barber", value: "100", label: "MEILLEUR COIFFEUR DE LA JOURNÉE", type: "highlight" },
            { id: "ad", value: "PUBLICITÉ", label: "ESPACE PARTENAIRE", type: "ad" }
        ];
    }
};