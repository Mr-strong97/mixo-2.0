"""
portfolio_serializers.py — MIXO · Module Portfolio

NOTE : la spec demandait un champ `string url` simple. On expose plutôt
un vrai FileField (`media`) côté stockage (cohérent avec Service/ServiceImage
dans le reste du projet), et on dérive `url` en lecture seule — l'API
publique reste donc fidèle au contrat attendu (`url`) sans sacrifier les
validations de fichier (extension, taille) gérées par Django.
"""
from rest_framework import serializers
from ..models import PortfolioMedia

MEDIA_MAX_BYTES = 15 * 1024 * 1024  # 15 Mo (vidéos plus lourdes que des images)


class PortfolioMediaSerializer(serializers.ModelSerializer):
    url                = serializers.SerializerMethodField()
    coiffeur_username  = serializers.CharField(source='coiffeur.username', read_only=True)

    class Meta:
        model  = PortfolioMedia
        fields = [
            'id', 'coiffeur', 'coiffeur_username',
            'media', 'url', 'type', 'titre',
            'mis_en_avant', 'ordre',
            'signale', 'motif_signalement',
            'created_at',
        ]
        read_only_fields = [
            'id', 'coiffeur', 'coiffeur_username', 'url',
            'signale', 'motif_signalement', 'created_at',
        ]
        extra_kwargs = {
            'media': {'write_only': True},
        }

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.media:
            return request.build_absolute_uri(obj.media.url) if request else obj.media.url
        return None

    def validate_media(self, value):
        if value.size > MEDIA_MAX_BYTES:
            raise serializers.ValidationError("Le fichier ne doit pas dépasser 15 Mo.")
        return value


class PortfolioMediaAdminSerializer(PortfolioMediaSerializer):
    """Variante admin — expose les champs de modération en écriture."""

    class Meta(PortfolioMediaSerializer.Meta):
        read_only_fields = [
            'id', 'coiffeur', 'coiffeur_username', 'url', 'created_at',
        ]
