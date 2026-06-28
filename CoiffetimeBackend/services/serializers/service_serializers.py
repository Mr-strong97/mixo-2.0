"""
service_serializers.py — MIXO · Sérialiseurs du module Services
"""
from django.core.exceptions import DisallowedHost
from rest_framework import serializers
from ..models import Service, ServiceImage, CategorieService

IMAGE_MAX_BYTES = 5 * 1024 * 1024


class CategorieServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorieService
        fields = ['id', 'nom', 'description', 'icone', 'created_at']
        read_only_fields = ['id', 'created_at']


class ServiceImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        url = obj.image.url
        if not request:
            return url
        try:
            return request.build_absolute_uri(url)
        except DisallowedHost:
            return url

    def validate_image(self, value):
        if value.size > IMAGE_MAX_BYTES:
            raise serializers.ValidationError("L'image ne doit pas dépasser 5 Mo.")
        return value


class ServiceSerializer(serializers.ModelSerializer):
    coiffeur_username = serializers.CharField(source='coiffeur.username', read_only=True)
    coiffeur_photo = serializers.SerializerMethodField()
    categorie_nom = serializers.SerializerMethodField()
    categorie_icone = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    est_favori = serializers.SerializerMethodField()
    nb_favoris = serializers.SerializerMethodField()
    note_moyenne = serializers.SerializerMethodField()
    nb_avis = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id',
            'coiffeur', 'coiffeur_username', 'coiffeur_photo',
            'categorie', 'categorie_nom', 'categorie_icone',
            'nom_prestation', 'description',
            'duree_minutes', 'prix',
            'image', 'ville',
            'statut', 'actif',
            'est_favori', 'nb_favoris', 'note_moyenne', 'nb_avis',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'coiffeur', 'coiffeur_username', 'coiffeur_photo',
            'categorie_nom', 'categorie_icone',
            'est_favori', 'nb_favoris', 'note_moyenne', 'nb_avis',
            'created_at', 'updated_at',
        ]

    def get_coiffeur_photo(self, obj):
        try:
            profil = getattr(obj.coiffeur, 'profil_coiffeur', None)
            if profil and hasattr(profil, 'photo') and profil.photo:
                request = self.context.get('request')
                if request:
                    try:
                        return request.build_absolute_uri(profil.photo.url)
                    except DisallowedHost:
                        return profil.photo.url
                return profil.photo.url
        except Exception:
            pass
        return None

    def get_categorie_nom(self, obj):
        categorie = getattr(obj, 'categorie', None)
        return getattr(categorie, 'nom', None)

    def get_categorie_icone(self, obj):
        categorie = getattr(obj, 'categorie', None)
        return getattr(categorie, 'icone', None)

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        url = obj.image.url
        if not request:
            return url
        try:
            return request.build_absolute_uri(url)
        except DisallowedHost:
            return url

    def get_est_favori(self, obj):
        annotated = getattr(obj, 'est_favori_agg', None)
        if annotated is not None:
            return bool(annotated)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not request or not user or not user.is_authenticated or getattr(user, 'role', None) != 'CLIENT':
            return False
        try:
            from favoris.models import Favori
            return Favori.objects.filter(client=user, service=obj).exists()
        except Exception:
            return False

    def get_nb_favoris(self, obj):
        annotated = getattr(obj, 'nb_favoris_agg', None)
        if annotated is not None:
            return int(annotated or 0)
        try:
            from favoris.models import Favori
            return Favori.objects.filter(service=obj).count()
        except Exception:
            return 0

    def get_note_moyenne(self, obj):
        annotated = getattr(obj, 'note_moyenne_agg', None)
        if annotated is not None:
            return round(float(annotated or 0), 2)
        try:
            from avis.models import Avis
            from django.db.models import Avg
            note = Avis.objects.filter(rendez_vous__service=obj).aggregate(avg=Avg('note'))['avg']
            return round(float(note or 0), 2)
        except Exception:
            return 0

    def get_nb_avis(self, obj):
        annotated = getattr(obj, 'nb_avis_agg', None)
        if annotated is not None:
            return int(annotated or 0)
        try:
            from avis.models import Avis
            return Avis.objects.filter(rendez_vous__service=obj).count()
        except Exception:
            return 0

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
        statut = attrs.get('statut', 'actif')
        actif = attrs.get('actif', True)
        if statut == 'actif' and not actif:
            attrs['actif'] = True
        if statut == 'inactif' and actif:
            attrs['actif'] = False
        return attrs


class ServiceDetailSerializer(ServiceSerializer):
    galerie = ServiceImageSerializer(many=True, read_only=True)

    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ['galerie']
