"""
abonnement_utilisateur.py — MIXO · Module Abonnements
Souscription d'un coiffeur à un plan (ou période d'essai gratuite).
"""
import uuid
from datetime import timedelta
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur
from .abonnement_plan import AbonnementPlan

DUREE_ESSAI_JOURS = 14


class AbonnementUtilisateur(models.Model):
    """
    Souscription d'un coiffeur à un AbonnementPlan, ou période d'essai
    gratuite (periode_essai=True, abonnement_plan peut alors être null).
    """

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coiffeur          = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='abonnements',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    abonnement_plan   = models.ForeignKey(
        AbonnementPlan,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='souscriptions',
        verbose_name=_("Plan souscrit"),
        help_text=_("Null pendant une période d'essai sans plan payant choisi."),
    )
    date_debut        = models.DateField(verbose_name=_("Date de début"))
    date_fin          = models.DateField(verbose_name=_("Date de fin"))
    actif             = models.BooleanField(default=True, verbose_name=_("Actif"))
    periode_essai     = models.BooleanField(default=False, verbose_name=_("Période d'essai"))
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_debut']
        verbose_name = _("Abonnement utilisateur")
        verbose_name_plural = _("Abonnements utilisateurs")
        indexes = [
            models.Index(fields=['coiffeur', 'actif']),
            models.Index(fields=['date_fin']),
        ]

    def __str__(self):
        label = 'Essai gratuit' if self.periode_essai else (self.abonnement_plan.nom if self.abonnement_plan else 'Sans plan')
        return f"{self.coiffeur.username} — {label} (jusqu'au {self.date_fin})"

    @property
    def est_expire(self) -> bool:
        return timezone.localdate() > self.date_fin

    @property
    def jours_restants(self) -> int:
        delta = (self.date_fin - timezone.localdate()).days
        return max(0, delta)

    @classmethod
    def creer_essai_gratuit(cls, coiffeur) -> "AbonnementUtilisateur":
        """Crée la période d'essai gratuite de 14 jours pour un nouveau coiffeur."""
        today = timezone.localdate()
        return cls.objects.create(
            coiffeur=coiffeur,
            abonnement_plan=None,
            date_debut=today,
            date_fin=today + timedelta(days=DUREE_ESSAI_JOURS),
            actif=True,
            periode_essai=True,
        )
