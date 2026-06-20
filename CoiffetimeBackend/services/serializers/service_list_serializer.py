"""
service_list_serializer.py — MIXO · Sérialiseur allégé pour le listing client.
Importe UNIQUEMENT depuis les modèles — aucun import depuis service_serializers.py
pour éviter tout risque de circular import.
"""
from rest_framework import serializers
from ..models import Service


class ServiceListSerializer(serializers.ModelSerializer):
    """Version compacte pour les grilles de services côté client (performances)."""

    coiffeur_username = serializers.CharField(source='coiffeur.username', read_only=True)
    coiffeur_photo    = serializers.SerializerMethodField()
    categorie_nom     = serializers.CharField(source='categorie.nom',   read_only=True, default=None)
    categorie_icone   = serializers.CharField(source='categorie.icone', read_only=True, default=None)

    class Meta:
        model  = Service
        fields = [
            'id',
            'nom_prestation',
            'prix',
            'duree_minutes',
            'image',
            'ville',
            'categorie_nom',
            'categorie_icone',
            'coiffeur_username',
            'coiffeur_photo',
        ]
        read_only_fields = fields

    def get_coiffeur_photo(self, obj):
        try:
            profil = getattr(obj.coiffeur, 'profil_coiffeur', None)
            if profil and getattr(profil, 'photo', None):
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profil.photo.url)
                return profil.photo.url
        except Exception:
            pass
        return None