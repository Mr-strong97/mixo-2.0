"""
authentification/models/client.py
====================================
Profil étendu du client.
"""
from django.db import models
from .utilisateur import Utilisateur


class Client(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='profil_client'
    )
    sexe      = models.CharField(max_length=10, blank=True)
    telephone = models.CharField(max_length=20, blank=True , null=True)
    adresse   = models.CharField(max_length=255, blank=True)
    ville     = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Client'
        verbose_name_plural = 'Clients'

    def __str__(self):
        return f"Client : {self.utilisateur.username}"