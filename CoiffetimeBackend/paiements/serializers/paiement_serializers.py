"""
paiement_serializers.py — MIXO · Module Paiements
"""
from rest_framework import serializers
from ..models import Paiement
from .facture_serializers import FactureSerializer


class PaiementSerializer(serializers.ModelSerializer):
    methode_label = serializers.CharField(source='get_methode_display', read_only=True)
    statut_label  = serializers.CharField(source='get_statut_display', read_only=True)
    service_nom   = serializers.CharField(source='rendez_vous.service_nom_snapshot', read_only=True)
    facture       = FactureSerializer(read_only=True)

    class Meta:
        model  = Paiement
        fields = [
            'id', 'rendez_vous', 'service_nom',
            'montant_total', 'montant_commission', 'montant_coiffeur',
            'statut', 'statut_label', 'methode', 'methode_label',
            'transaction_id', 'facture', 'created_at',
        ]
        read_only_fields = fields


class InitierPaiementSerializer(serializers.Serializer):
    """Sérialiseur d'entrée pour l'initiation — ne fait QUE valider la méthode choisie."""
    methode = serializers.ChoiceField(choices=Paiement.METHODE_CHOICES)
    numero_telephone = serializers.CharField(max_length=20, required=False, allow_blank=True)
