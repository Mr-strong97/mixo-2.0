from rest_framework import serializers
from ..models.rendezvous import RendezVous
from ..models.notification import Notification

class RendezVousSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    # La ligne 20 est probablement ici
    class Meta:  # <--- Doit être décalé de 4 espaces vers la droite
        model = Notification
        fields = ['id', 'message', 'type', 'statut', 'date_creation']
        read_only_fields = ['id', 'date_creation']