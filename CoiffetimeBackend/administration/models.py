import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class StatutDemandeReactivation(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', 'En attente'
    ACCEPTEE = 'ACCEPTEE', 'Acceptée'
    REFUSEE = 'REFUSEE', 'Refusée'


class DemandeReactivation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='demandes_reactivation',
    )
    message = models.TextField()
    statut = models.CharField(
        max_length=20,
        choices=StatutDemandeReactivation.choices,
        default=StatutDemandeReactivation.EN_ATTENTE,
    )
    motif_refus = models.TextField(blank=True, default='')
    traite_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes_reactivation_traitees',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Demande de réactivation"
        verbose_name_plural = "Demandes de réactivation"
        indexes = [
            models.Index(fields=['statut', '-created_at']),
            models.Index(fields=['utilisateur', '-created_at']),
        ]

    def __str__(self):
        return f"{self.utilisateur.username} — {self.statut}"

    def accepter(self, admin_user=None):
        self.statut = StatutDemandeReactivation.ACCEPTEE
        self.traite_par = admin_user
        self.reviewed_at = timezone.now()
        self.save(update_fields=['statut', 'traite_par', 'reviewed_at'])

    def refuser(self, motif: str, admin_user=None):
        self.statut = StatutDemandeReactivation.REFUSEE
        self.motif_refus = motif
        self.traite_par = admin_user
        self.reviewed_at = timezone.now()
        self.save(update_fields=['statut', 'motif_refus', 'traite_par', 'reviewed_at'])
