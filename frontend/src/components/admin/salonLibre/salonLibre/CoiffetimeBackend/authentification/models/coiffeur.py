"""
authentification/models/coiffeur.py
======================================
Profil étendu du coiffeur.
Lié à Utilisateur par OneToOne (clé primaire partagée).
"""
from django.db import models
from .utilisateur import Utilisateur


class Coiffeur(models.Model):
    """
    Contient uniquement les champs spécifiques au coiffeur.
    Les champs communs (username, email…) restent dans Utilisateur.
    """
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='profil_coiffeur'
    )
    specialite  = models.CharField(max_length=100, blank=True)
    bio         = models.TextField(blank=True)
    sexe        = models.CharField(max_length=10, blank=True)
    telephone   = models.CharField(max_length=20, blank=True)
    adresse     = models.CharField(max_length=255, blank=True)

    # Notation automatiquement calculée depuis les Avis
    note_moyenne = models.FloatField(default=0.0)

    # Vrai quand la plateforme a vérifié le professionnel
    est_verifie  = models.BooleanField(default=False)

    # FK vers AbonnementPlan (app paiements, non encore créée)
    # Décommente quand l'app paiements est prête :
    # abonnement = models.ForeignKey(
    #     'paiements.AbonnementPlan',
    #     null=True, blank=True,
    #     on_delete=models.SET_NULL,
    #     related_name='coiffeurs'
    # )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Coiffeur'
        verbose_name_plural = 'Coiffeurs'

    def __str__(self):
        return f"Coiffeur : {self.utilisateur.username}"