"""
authentification/serializers/client/client_serializer.py
===========================================================
Serializer dédié au profil Client avec données imbriquées.
"""
from rest_framework import serializers
from ...models.client      import Client
from ...models.utilisateur import Utilisateur


class UtilisateurResumSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Utilisateur
        fields = ['id', 'username', 'email', 'avatar_choice', 'first_name', 'last_name', 'statut']
        read_only_fields = fields


class ClientSerializer(serializers.ModelSerializer):
    """Lecture complète du profil client (GET)."""
    utilisateur = UtilisateurResumSerializer(read_only=True)

    class Meta:
        model  = Client
        fields = [
            'utilisateur',
            'sexe',
            'telephone',
            'adresse',
            'ville',
            'created_at',
        ]
        read_only_fields = ['created_at']


class ClientUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour partielle du profil client (PATCH/PUT)."""
    class Meta:
        model  = Client
        fields = ['sexe', 'telephone', 'adresse', 'ville']
