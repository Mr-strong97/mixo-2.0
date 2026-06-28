"""
rendez_vous_serializers.py — MIXO · Module Rendez-vous
"""
from rest_framework import serializers
from ..models import RendezVous


class RendezVousCreateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur de création. Le client ne fournit QUE service + date_heure_debut —
    date_heure_fin est calculée côté serveur à partir de la durée du service
    (jamais à partir d'une valeur envoyée par le client, pour éviter toute
    manipulation des horaires/durées facturées).
    """

    class Meta:
        model  = RendezVous
        fields = ['service', 'date_heure_debut']

    def validate_date_heure_debut(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("La date du rendez-vous doit être dans le futur.")
        return value


class RendezVousSerializer(serializers.ModelSerializer):
    """Sérialiseur de lecture enrichi."""

    client_username    = serializers.CharField(source='client.username', read_only=True)
    coiffeur_username   = serializers.CharField(source='coiffeur.username', read_only=True)
    statut_label        = serializers.CharField(source='get_statut_display', read_only=True)
    est_passe            = serializers.BooleanField(read_only=True)
    peut_etre_annule     = serializers.BooleanField(read_only=True)
    est_paye             = serializers.BooleanField(read_only=True)

    class Meta:
        model  = RendezVous
        fields = [
            'id', 'client', 'client_username', 'coiffeur', 'coiffeur_username',
            'service', 'service_nom_snapshot', 'service_prix_snapshot', 'service_duree_snapshot',
            'date_heure_debut', 'date_heure_fin', 'statut', 'statut_label',
            'paiement', 'est_paye', 'est_passe', 'peut_etre_annule',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields
