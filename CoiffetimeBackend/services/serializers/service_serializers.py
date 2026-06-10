"""
service_serializers.py — MIXO · Sérialiseurs du module Services
"""
from rest_framework import serializers
from ..models import Service, ServiceImage, CategorieService

# Taille max image : 5 Mo
IMAGE_MAX_BYTES = 5 * 1024 * 1024


# ──────────────────────────────────────────────────────────────
#  CATÉGORIE
# ──────────────────────────────────────────────────────────────
class CategorieServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CategorieService
        fields = ['id', 'nom', 'description', 'icone', 'created_at']
        read_only_fields = ['id', 'created_at']


# ──────────────────────────────────────────────────────────────
#  IMAGE DE GALERIE
# ──────────────────────────────────────────────────────────────
class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ServiceImage
        fields = ['id', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_image(self, value):
        if value.size > IMAGE_MAX_BYTES:
            raise serializers.ValidationError("L'image ne doit pas dépasser 5 Mo.")
        return value


# ──────────────────────────────────────────────────────────────
#  SERVICE — liste & création / modification
# ──────────────────────────────────────────────────────────────
class ServiceSerializer(serializers.ModelSerializer):
    """Sérialiseur utilisé pour la liste, la création et les mises à jour."""

    # Champs calculés en lecture seule
    coiffeur_username = serializers.CharField(source='coiffeur.username', read_only=True)
    coiffeur_photo    = serializers.SerializerMethodField()
    categorie_nom     = serializers.CharField(source='categorie.nom', read_only=True)
    categorie_icone   = serializers.CharField(source='categorie.icone', read_only=True)

    class Meta:
        model  = Service
        fields = [
            'id',
            'coiffeur', 'coiffeur_username', 'coiffeur_photo',
            'categorie', 'categorie_nom', 'categorie_icone',
            'nom_prestation', 'description',
            'duree_minutes', 'prix',
            'image', 'ville',
            'statut', 'actif',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'coiffeur', 'coiffeur_username', 'coiffeur_photo',
            'categorie_nom', 'categorie_icone',
            'created_at', 'updated_at',
        ]

    def get_coiffeur_photo(self, obj):
        """Retourne l'URL de la photo de profil du coiffeur si disponible."""
        try:
            profil = getattr(obj.coiffeur, 'profil_coiffeur', None)
            if profil and hasattr(profil, 'photo') and profil.photo:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profil.photo.url)
                return profil.photo.url
        except Exception:
            pass
        return None

    def validate_nom_prestation(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Le nom de la prestation est obligatoire.")
        if len(value) < 3:
            raise serializers.ValidationError("Le nom doit contenir au moins 3 caractères.")
        return value

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0 €.")
        if value > 9999:
            raise serializers.ValidationError("Le prix ne peut pas dépasser 9 999 €.")
        return value

    def validate_duree_minutes(self, value):
        if value < 5:
            raise serializers.ValidationError("La durée minimale est de 5 minutes.")
        if value > 480:
            raise serializers.ValidationError("La durée maximale est de 8 heures (480 minutes).")
        return value

    def validate_image(self, value):
        if value and value.size > IMAGE_MAX_BYTES:
            raise serializers.ValidationError("L'image principale ne doit pas dépasser 5 Mo.")
        return value

    def validate(self, attrs):
        """Validation croisée des champs."""
        statut = attrs.get('statut', 'actif')
        actif  = attrs.get('actif', True)

        # Cohérence statut / actif
        if statut == 'actif' and not actif:
            attrs['actif'] = True
        if statut == 'inactif' and actif:
            attrs['actif'] = False

        return attrs


# ──────────────────────────────────────────────────────────────
#  SERVICE — détail enrichi (lecture seule)
# ──────────────────────────────────────────────────────────────
class ServiceDetailSerializer(ServiceSerializer):
    """Sérialiseur complet avec galerie d'images imbriquée."""

    galerie = ServiceImageSerializer(many=True, read_only=True)

    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ['galerie']