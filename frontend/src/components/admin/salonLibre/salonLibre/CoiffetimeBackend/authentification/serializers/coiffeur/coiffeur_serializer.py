"""
authentification/serializers/coiffeur/coiffeur_serializer.py
===============================================================
Serializer dédié au profil Coiffeur avec données imbriquées.
"""
from rest_framework import serializers
from ...models.coiffeur    import Coiffeur
from ...models.utilisateur import Utilisateur


class UtilisateurResumSerializer(serializers.ModelSerializer):
    """Résumé de l'utilisateur imbriqué dans le profil coiffeur."""
    class Meta:
        model  = Utilisateur
        fields = ['id', 'username', 'email', 'avatar_choice', 'first_name', 'last_name', 'statut']
        read_only_fields = fields


class CoiffeurSerializer(serializers.ModelSerializer):
    """Lecture complète du profil coiffeur (GET)."""
    utilisateur = UtilisateurResumSerializer(read_only=True)

    class Meta:
        model  = Coiffeur
        fields = [
            'utilisateur',
            'specialite',
            'bio',
            'sexe',
            'telephone',
            'adresse',
            'note_moyenne',
            'est_verifie',
            'created_at',
        ]
        read_only_fields = ['note_moyenne', 'est_verifie', 'created_at']


class CoiffeurUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour partielle du profil coiffeur (PATCH/PUT)."""
    class Meta:
        model  = Coiffeur
        fields = ['specialite', 'bio', 'sexe', 'telephone', 'adresse']
