"""
horaire_serializers.py — MIXO · Module Horaires
"""
from rest_framework import serializers
from ..models import Horaire


class HoraireSerializer(serializers.ModelSerializer):
    jour_semaine_label = serializers.CharField(source='get_jour_semaine_display', read_only=True)

    class Meta:
        model  = Horaire
        fields = [
            'id', 'coiffeur', 'jour_semaine', 'jour_semaine_label',
            'heure_debut', 'heure_fin', 'actif',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'coiffeur', 'jour_semaine_label', 'created_at', 'updated_at']

    def validate(self, attrs):
        heure_debut = attrs.get('heure_debut', getattr(self.instance, 'heure_debut', None))
        heure_fin   = attrs.get('heure_fin', getattr(self.instance, 'heure_fin', None))

        if heure_debut and heure_fin and heure_debut >= heure_fin:
            raise serializers.ValidationError(
                "L'heure de fin doit être postérieure à l'heure de début."
            )
        return attrs
