"""
facture.py — MIXO · Facturation
"""
import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Facture(models.Model):
    STATUT_CHOICES = [
        ('GENEREE', _('Générée')),
        ('PAYEE',    _('Payée')),
        ('ANNULEE',  _('Annulée')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero_facture = models.CharField(max_length=40, unique=True, verbose_name=_("Numéro de facture"))
    paiement = models.OneToOneField(
        'paiements.Paiement',
        on_delete=models.CASCADE,
        related_name='facture',
        verbose_name=_("Paiement source"),
    )
    client = models.ForeignKey(
        'authentification.Utilisateur',
        on_delete=models.CASCADE,
        related_name='factures_client',
        verbose_name=_("Client"),
    )
    coiffeur = models.ForeignKey(
        'authentification.Utilisateur',
        on_delete=models.CASCADE,
        related_name='factures_coiffeur',
        verbose_name=_("Coiffeur"),
    )
    service = models.CharField(max_length=120, verbose_name=_("Service"))
    montant = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Montant (CDF)"))
    mode_paiement = models.CharField(max_length=20, verbose_name=_("Mode de paiement"))
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='GENEREE', verbose_name=_("Statut"))
    devise = models.CharField(max_length=8, default='CDF', verbose_name=_("Devise"))
    preuve_paiement = models.CharField(max_length=255, blank=True, default='', verbose_name=_("Preuve de paiement"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Facture")
        verbose_name_plural = _("Factures")
        indexes = [
            models.Index(fields=['client', '-created_at']),
            models.Index(fields=['coiffeur', '-created_at']),
            models.Index(fields=['statut']),
        ]

    def __str__(self):
        return f"{self.numero_facture} — {self.montant}{self.devise}"

    @classmethod
    def generer_numero(cls) -> str:
        now = timezone.now()
        return f"MXO-{now:%Y%m%d}-{uuid.uuid4().hex[:6].upper()}"
