"""
abonnement_serializers.py — MIXO · Module Abonnements
"""
from rest_framework import serializers
from ..models import AbonnementPlan, AbonnementUtilisateur


class AbonnementPlanSerializer(serializers.ModelSerializer):
    liste_avantages = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model  = AbonnementPlan
        fields = [
            'id', 'nom', 'plan', 'prix_mensuel', 'duree_mois',
            'description', 'avantages', 'liste_avantages',
            'mise_en_avant_priorite', 'actif',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_prix_mensuel(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value

    def validate_duree_mois(self, value):
        if value < 1:
            raise serializers.ValidationError("La durée doit être d'au moins 1 mois.")
        return value


class AbonnementUtilisateurSerializer(serializers.ModelSerializer):
    coiffeur_username = serializers.CharField(source='coiffeur.username', read_only=True)
    plan_nom           = serializers.CharField(source='abonnement_plan.nom', read_only=True, default=None)
    plan_type          = serializers.CharField(source='abonnement_plan.plan', read_only=True, default=None)
    jours_restants     = serializers.IntegerField(read_only=True)
    est_expire         = serializers.BooleanField(read_only=True)

    class Meta:
        model  = AbonnementUtilisateur
        fields = [
            'id', 'coiffeur', 'coiffeur_username',
            'abonnement_plan', 'plan_nom', 'plan_type',
            'date_debut', 'date_fin', 'actif', 'periode_essai',
            'jours_restants', 'est_expire', 'created_at',
        ]
        read_only_fields = [
            'id', 'coiffeur', 'coiffeur_username',
            'plan_nom', 'plan_type', 'jours_restants', 'est_expire', 'created_at',
        ]