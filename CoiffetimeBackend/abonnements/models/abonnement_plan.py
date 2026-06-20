"""
abonnement_plan.py — MIXO · Module Abonnements
Modèle des plans d'abonnement proposés aux coiffeurs.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class AbonnementPlan(models.Model):
    """Un plan d'abonnement (Gratuit/Essai, Standard, Premium, Pro)."""

    PLAN_CHOICES = [
        ('ESSAI',    _('Essai gratuit')),
        ('STANDARD', _('Standard')),
        ('PREMIUM',  _('Premium')),
        ('PRO',      _('Pro')),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom            = models.CharField(max_length=100, verbose_name=_("Nom du plan"))
    plan           = models.CharField(
        max_length=20, choices=PLAN_CHOICES, unique=True,
        verbose_name=_("Type de plan"),
    )
    prix_mensuel   = models.DecimalField(
        max_digits=8, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix mensuel (€)"),
    )
    duree_mois     = models.PositiveIntegerField(
        default=1, validators=[MinValueValidator(1)],
        verbose_name=_("Durée (mois)"),
        help_text=_("Durée d'un cycle de facturation, en mois."),
    )
    description    = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    avantages      = models.TextField(
        blank=True, null=True,
        verbose_name=_("Avantages"),
        help_text=_("Un avantage par ligne — affiché sous forme de liste à puces côté frontend."),
    )
    mise_en_avant_priorite = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Priorité de mise en avant"),
        help_text=_("Plus la valeur est élevée, plus les services du coiffeur sont mis en avant dans les listings clients."),
    )
    actif          = models.BooleanField(default=True, verbose_name=_("Plan actif"))
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['prix_mensuel']
        verbose_name = _("Plan d'abonnement")
        verbose_name_plural = _("Plans d'abonnement")

    def __str__(self):
        return f"{self.nom} ({self.get_plan_display()})"

    @property
    def liste_avantages(self):
        """Retourne les avantages sous forme de liste (un élément par ligne non vide)."""
        if not self.avantages:
            return []
        return [ligne.strip() for ligne in self.avantages.splitlines() if ligne.strip()]
