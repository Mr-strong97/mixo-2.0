"""
disponibilite_exception.py — MIXO · Module Horaires
Indisponibilité (ou disponibilité exceptionnelle) ponctuelle d'un coiffeur
pour une date précise — congé, maladie, jour férié, fermeture exceptionnelle…
"""
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur


class DisponibiliteException(models.Model):
    """Exception ponctuelle aux horaires habituels, pour une date donnée."""

    CATEGORIE_CHOICES = [
        ('conge',                    _('Congé')),
        ('maladie',                  _('Maladie')),
        ('ferie',                    _('Jour férié')),
        ('fermeture_exceptionnelle', _('Fermeture exceptionnelle')),
        ('ouverture_exceptionnelle', _('Ouverture exceptionnelle')),
        ('autre',                    _('Autre')),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coiffeur    = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='disponibilite_exceptions',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    date        = models.DateField(verbose_name=_("Date concernée"))
    disponible  = models.BooleanField(
        default=False,
        verbose_name=_("Disponible ce jour-là"),
        help_text=_("False = indisponible (congé, maladie…). True = exceptionnellement ouvert."),
    )
    categorie   = models.CharField(
        max_length=30, choices=CATEGORIE_CHOICES, default='autre',
        verbose_name=_("Catégorie"),
    )
    motif       = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Motif"))
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = _("Disponibilité exceptionnelle")
        verbose_name_plural = _("Disponibilités exceptionnelles")
        unique_together = [('coiffeur', 'date')]
        indexes = [
            models.Index(fields=['coiffeur', 'date']),
        ]

    def __str__(self):
        statut = 'disponible' if self.disponible else 'indisponible'
        return f"{self.coiffeur.username} — {self.date} ({statut})"
