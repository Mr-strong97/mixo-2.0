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
    statut_paiement_label = serializers.CharField(source='get_statut_paiement_display', read_only=True)
    mode_paiement       = serializers.SerializerMethodField()
    mode_paiement_label = serializers.SerializerMethodField()
    a_un_avis           = serializers.SerializerMethodField()
    avis_id             = serializers.SerializerMethodField()
    est_passe            = serializers.BooleanField(read_only=True)
    peut_etre_annule     = serializers.BooleanField(read_only=True)
    est_paye             = serializers.BooleanField(read_only=True)

    def get_mode_paiement(self, obj):
        paiement = getattr(obj, 'paiement', None)
        if paiement and getattr(paiement, 'methode', ''):
            return paiement.methode
        return None

    def get_mode_paiement_label(self, obj):
        paiement = getattr(obj, 'paiement', None)
        if paiement and getattr(paiement, 'methode', ''):
            try:
                return paiement.get_methode_display()
            except Exception:
                return paiement.methode

        if obj.statut_paiement == 'PAYE_SUR_PLACE':
            return 'Paiement sur place'
        if obj.statut_paiement == 'PAYE_EN_LIGNE':
            return 'Paiement en ligne'
        if obj.statut_paiement == 'ANNULE':
            return 'Paiement annulé'
        return 'Non disponible'

    def get_a_un_avis(self, obj):
        return getattr(obj, 'avis', None) is not None

    def get_avis_id(self, obj):
        avis = getattr(obj, 'avis', None)
        if avis is None:
            return None
        return str(avis.id)

    class Meta:
        model  = RendezVous
        fields = [
            'id', 'client', 'client_username', 'coiffeur', 'coiffeur_username',
            'service', 'service_nom_snapshot', 'service_prix_snapshot', 'service_duree_snapshot',
            'date_heure_debut', 'date_heure_fin', 'statut', 'statut_label',
            'statut_paiement', 'statut_paiement_label',
            'mode_paiement', 'mode_paiement_label', 'a_un_avis', 'avis_id',
            'paiement', 'est_paye', 'est_passe', 'peut_etre_annule',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields
