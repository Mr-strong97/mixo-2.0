"""
paiement.py — MIXO · Modèle central du module Paiements

Sécurité intégrée au niveau modèle :
  - transaction_id unique (empêche tout doublon de transaction)
  - montants calculés et stockés au moment du paiement (jamais recalculés
    a posteriori à partir d'un service qui pourrait avoir changé de prix)
"""
import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

TAUX_COMMISSION = Decimal('0.15')  # 15% — ajustable selon la politique commerciale


class Paiement(models.Model):

    STATUT_CHOICES = [
        ('EN_ATTENTE', _('En attente')),
        ('PAYE',       _('Payé')),
        ('ECHOUE',     _('Échoué')),
        ('REMBOURSE',  _('Remboursé')),
    ]

    METHODE_CHOICES = [
        ('AIRTEL_MONEY',   _('Airtel Money')),
        ('ORANGE_MONEY',   _('Orange Money')),
        ('MPESA',          _('M-Pesa')),
        ('AFRICELL_MONEY', _('Africell Money')),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rendez_vous         = models.ForeignKey(
        'rendez_vous.RendezVous',
        on_delete=models.CASCADE,
        related_name='paiements',
        verbose_name=_("Rendez-vous"),
    )
    montant_total       = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name=_("Montant total (€)"),
    )
    montant_commission  = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Commission plateforme (€)"))
    montant_coiffeur    = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Part coiffeur (€)"))
    statut              = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE', verbose_name=_("Statut"))
    methode             = models.CharField(max_length=20, choices=METHODE_CHOICES, verbose_name=_("Méthode"))
    transaction_id       = models.CharField(max_length=100, unique=True, verbose_name=_("ID transaction"))
    created_at           = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Paiement")
        verbose_name_plural = _("Paiements")
        indexes = [
            models.Index(fields=['rendez_vous', 'statut']),
            models.Index(fields=['statut']),
        ]

    def __str__(self):
        return f"Paiement {self.transaction_id} — {self.montant_total}€ ({self.statut})"

    @classmethod
    def calculer_montants(cls, montant_total: Decimal) -> dict:
        commission = (montant_total * TAUX_COMMISSION).quantize(Decimal('0.01'))
        return {
            'montant_total':      montant_total,
            'montant_commission': commission,
            'montant_coiffeur':   montant_total - commission,
        }
