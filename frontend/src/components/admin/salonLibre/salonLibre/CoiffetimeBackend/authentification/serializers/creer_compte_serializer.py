"""
authentification/serializers/creer_compte_serializer.py
Envoie email de vérification après inscription.
"""
from django.db import transaction
from rest_framework import serializers

from ..models.utilisateur import Utilisateur, RoleChoix, StatutChoix
from ..models.coiffeur    import Coiffeur
from ..models.client      import Client
from ..models.token       import Token, TypeToken
from ..compte             import validerMotDePasse


class CreerCompteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = Utilisateur
        fields = ['username', 'email', 'password', 'role', 'avatar_choice']

    def validate_password(self, valeur):
        validerMotDePasse(valeur)
        return valeur

    def validate_role(self, valeur):
        if valeur.upper() not in [RoleChoix.CLIENT, RoleChoix.COIFFEUR]:
            raise serializers.ValidationError("Rôle invalide.")
        return valeur.upper()

    def validate_email(self, valeur):
        if Utilisateur.objects.filter(email=valeur.lower()).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return valeur.lower()

    @transaction.atomic
    def create(self, donnees):
        role = donnees.get('role', RoleChoix.CLIENT)
        statut_initial = (
            StatutChoix.ACTIF if role == RoleChoix.CLIENT
            else StatutChoix.EN_ATTENTE
        )

        utilisateur = Utilisateur.objects.create_user(
            username=donnees['username'],
            email=donnees['email'],
            password=donnees['password'],
            role=role,
            avatar_choice=donnees.get('avatar_choice', ''),
            statut=statut_initial,
            email_verifie=False,
        )

        if role == RoleChoix.COIFFEUR:
            Coiffeur.objects.create(utilisateur=utilisateur)
        else:
            Client.objects.create(utilisateur=utilisateur)

        # Envoi email de vérification
        try:
            from ..services.email_service import envoyer_email_verification
            token_brut, _ = Token.creer(
                utilisateur=utilisateur,
                type_token=TypeToken.VERIFICATION_EMAIL,
                duree_minutes=1440
            )
            envoyer_email_verification(utilisateur, token_brut)
        except Exception as e:
            print(f" Email non envoyé : {e}")

        return utilisateur
