"""
facture_serializers.py — MIXO · Facturation
"""
from rest_framework import serializers
from ..models import Facture


class FactureSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.username', read_only=True)
    coiffeur_username = serializers.CharField(source='coiffeur.username', read_only=True)
    paiement_id = serializers.UUIDField(source='paiement.id', read_only=True)
    service_nom = serializers.CharField(source='service', read_only=True)

    class Meta:
        model = Facture
        fields = [
            'id', 'numero_facture', 'paiement_id',
            'client', 'client_username',
            'coiffeur', 'coiffeur_username',
            'service', 'service_nom',
            'montant', 'mode_paiement', 'statut', 'devise',
            'preuve_paiement', 'created_at', 'updated_at',
        ]
        read_only_fields = fields
