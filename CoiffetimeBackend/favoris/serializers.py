"""favoris/serializers.py — MIXO · Sérialiseurs du module Favoris"""
from rest_framework import serializers

from services.serializers.service_serializers import ServiceSerializer
from .models import Favori


class FavoriSerializer(serializers.ModelSerializer):
    service_detail = serializers.SerializerMethodField()
    service_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Favori
        fields = ['id', 'client', 'service', 'service_id', 'service_detail', 'created_at']
        read_only_fields = ['id', 'client', 'service', 'service_detail', 'created_at']

    def get_service_detail(self, obj):
        request = self.context.get('request')
        return ServiceSerializer(obj.service, context={'request': request}).data


class FavoriToggleSerializer(serializers.Serializer):
    service_id = serializers.UUIDField()

