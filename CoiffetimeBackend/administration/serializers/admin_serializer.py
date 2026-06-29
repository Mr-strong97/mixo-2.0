"""
administration/serializers/admin_serializer.py
================================================
Serializers pour la vue d'administration.
"""
from rest_framework import serializers
from authentification.models.utilisateur import Utilisateur


class UtilisateurAdminSerializer(serializers.ModelSerializer):
    """Vue complète d'un utilisateur pour l'admin."""
    class Meta:
        model  = Utilisateur
        fields = [
            'id', 'username', 'email',
            'first_name', 'last_name',
            'telephone', 'photo',
            'role', 'statut',
            'email_verifie',
            'tentatives_connexion',
            'date_joined',
            'last_login',
        ]
        read_only_fields = fields


class ValiderCompteSerializer(serializers.Serializer):
    """Payload pour valider ou rejeter un compte."""
    action  = serializers.ChoiceField(choices=['valider', 'rejeter'])
    raison  = serializers.CharField(required=False, allow_blank=True)
