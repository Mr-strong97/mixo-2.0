"""
avis.py — MIXO · Modèle central du module Avis

Contrainte clé : `rendez_vous` est en OneToOneField — garantit nativement
"un seul avis par rendez-vous" au niveau base de données, sans dépendre
uniquement d'une vérification applicative.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur


class Avis(models.Model):

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client           = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE,
        related_name='avis_donnes',
        limit_choices_to={'role': 'CLIENT'},
        verbose_name=_("Client"),
    )
    rendez_vous      = models.OneToOneField(
        'rendez_vous.RendezVous',
        on_delete=models.CASCADE,
        related_name='avis',
        verbose_name=_("Rendez-vous"),
    )
    coiffeur         = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE,
        related_name='avis_recus',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    note             = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Note (1 à 5)"),
    )
    commentaire      = models.TextField(blank=True, null=True, verbose_name=_("Commentaire"))
    reponse_coiffeur = models.TextField(blank=True, null=True, verbose_name=_("Réponse du coiffeur"))
    signale          = models.BooleanField(default=False, verbose_name=_("Signalé"))
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Avis")
        verbose_name_plural = _("Avis")
        indexes = [
            models.Index(fields=['coiffeur', 'note']),
            models.Index(fields=['signale']),
        ]

    def __str__(self):
        return f"{self.client.username} → {self.coiffeur.username} : {self.note}/5"
