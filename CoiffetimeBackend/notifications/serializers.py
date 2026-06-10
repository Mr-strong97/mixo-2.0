"""
notifications/serializers.py
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    lu = serializers.SerializerMethodField()

    class Meta:
        model  = Notification
        fields = [
            'id', 'titre', 'message',
            'type', 'statut', 'lu',
            'lien', 'created_at',
        ]

    def get_lu(self, obj):
        return obj.statut == 'LU'