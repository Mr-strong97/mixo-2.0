"""
avis_serializers.py — MIXO · Module Avis
"""
from rest_framework import serializers
from ..models import Avis


class AvisCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Avis
        fields = ['rendez_vous', 'note', 'commentaire']

    def validate_note(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("La note doit être comprise entre 1 et 5.")
        return value


class AvisSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.username', read_only=True)
    service_nom     = serializers.CharField(source='rendez_vous.service_nom_snapshot', read_only=True)

    class Meta:
        model  = Avis
        fields = [
            'id', 'client', 'client_username', 'rendez_vous', 'service_nom',
            'coiffeur', 'note', 'commentaire', 'reponse_coiffeur',
            'signale', 'created_at',
        ]
        read_only_fields = [
            'id', 'client', 'client_username', 'coiffeur', 'service_nom',
            'signale', 'created_at',
        ]


class RepondreAvisSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Avis
        fields = ['reponse_coiffeur']
