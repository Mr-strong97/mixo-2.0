"""
disponibilite_serializers.py — MIXO · Module Horaires
"""
from rest_framework import serializers
from ..models import DisponibiliteException


class DisponibiliteExceptionSerializer(serializers.ModelSerializer):
    categorie_label = serializers.CharField(source='get_categorie_display', read_only=True)

    class Meta:
        model  = DisponibiliteException
        fields = [
            'id', 'coiffeur', 'date', 'disponible',
            'categorie', 'categorie_label', 'motif', 'created_at',
        ]
        read_only_fields = ['id', 'coiffeur', 'categorie_label', 'created_at']

    def validate_date(self, value):
        from django.utils import timezone
        if value < timezone.localdate():
            raise serializers.ValidationError("Impossible de créer une exception pour une date passée.")
        return value
