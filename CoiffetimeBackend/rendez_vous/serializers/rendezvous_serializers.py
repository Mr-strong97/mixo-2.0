from rest_framework import serializers
from ..models.rendezvous import RendezVous
from notifications.serializers import NotificationSerializer as CentralNotificationSerializer

class RendezVousSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = '__all__'

class NotificationSerializer(CentralNotificationSerializer):
    pass
