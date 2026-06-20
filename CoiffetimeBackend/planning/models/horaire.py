"""
horaire.py — MIXO · Module Horaires
Créneaux d'ouverture hebdomadaires récurrents d'un coiffeur.
"""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur


class Horaire(models.Model):
    """Un créneau horaire récurrent (ex : Lundi 09:00–18:00) pour un coiffeur."""

    JOUR_CHOICES = [
        (0, _('Lundi')),
        (1, _('Mardi')),
        (2, _('Mercredi')),
        (3, _('Jeudi')),
        (4, _('Vendredi')),
        (5, _('Samedi')),
        (6, _('Dimanche')),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coiffeur      = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='horaires',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    jour_semaine  = models.PositiveSmallIntegerField(
        choices=JOUR_CHOICES, verbose_name=_("Jour de la semaine"),
    )
    heure_debut   = models.TimeField(verbose_name=_("Heure de début"))
    heure_fin     = models.TimeField(verbose_name=_("Heure de fin"))
    actif         = models.BooleanField(default=True, verbose_name=_("Créneau actif"))
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['jour_semaine', 'heure_debut']
        verbose_name = _("Horaire")
        verbose_name_plural = _("Horaires")
        indexes = [
            models.Index(fields=['coiffeur', 'jour_semaine']),
        ]

    def __str__(self):
        return f"{self.coiffeur.username} — {self.get_jour_semaine_display()} {self.heure_debut}-{self.heure_fin}"

    def clean(self):
        if self.heure_debut and self.heure_fin and self.heure_debut >= self.heure_fin:
            raise ValidationError(_("L'heure de fin doit être postérieure à l'heure de début."))
