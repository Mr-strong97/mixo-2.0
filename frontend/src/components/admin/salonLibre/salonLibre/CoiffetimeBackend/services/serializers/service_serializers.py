from rest_framework import serializers
from ..models import Service, Horaire, Avis

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['createur']

class HoraireSerializer(serializers.ModelSerializer):
    nom_jour = serializers.CharField(source='get_jour_semaine_display', read_only=True)

    class Meta:
        model = Horaire
        fields = ['id', 'coiffeur', 'jour_semaine', 'nom_jour', 'heure_debut', 'heure_fin']
        read_only_fields = ['id']

class AvisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avis
        fields = ['id', 'client', 'coiffeur', 'note', 'commentaire', 'date_creation']
        read_only_fields = ['id', 'client', 'date_creation']