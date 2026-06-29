"""
authentification/serializers/utilisateur_serializer.py
=========================================================
Serializer en lecture pour afficher le profil complet.
Le rôle et l'email ne sont pas modifiables ici.
"""
from rest_framework import serializers
from ..models.utilisateur import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Utilisateur
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'telephone',
            'photo',
            'role',
            'statut',
            'email_verifie',
            'date_joined',  # created_at de Django AbstractUser
            'last_login',   # derniere_connexion de Django AbstractUser
        ]
        # Ces champs sont affichés mais jamais modifiables
        read_only_fields = ['id', 'role', 'statut', 'email_verifie', 'date_joined', 'last_login']
