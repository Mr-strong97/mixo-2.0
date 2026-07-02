"""
rendez_vous.py — MIXO · Modèle central du module Rendez-vous

NOTE D'ARCHITECTURE : le FK `service` est en SET_NULL (pas PROTECT) pour
rester compatible avec `supprimer_service` (suppression dure existante
dans services/views/service_views.py). Pour ne jamais perdre l'historique
même si le service est supprimé/modifié plus tard, le nom/prix/durée du
service sont capturés en "snapshot" au moment de la création du RDV.

⚠️ Le champ `paiement` (FK vers paiements.Paiement) est ajouté dans la
migration 0002 — pas ici — pour éviter une dépendance circulaire entre
les apps rendez_vous et paiements (paiements dépend déjà de rendez_vous
via son propre FK).
"""
import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur
from services.models import Service


class RendezVous(models.Model):

    STATUT_CHOICES = [
        ('EN_ATTENTE', _('En attente')),
        ('ACCEPTE',    _('Accepté')),
        ('REFUSE',     _('Refusé')),
        ('ANNULE',     _('Annulé')),
        ('SUSPENDU',   _('Suspendu')),
        ('TERMINE',    _('Terminé')),
    ]

    STATUT_PAIEMENT_CHOICES = [
        ('NON_PAYE',      _('Non payé')),
        ('PAYE_EN_LIGNE', _('Payé en ligne')),
        ('PAYE_SUR_PLACE', _('Payé sur place')),
        ('ANNULE',        _('Annulé')),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    client           = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE,
        related_name='rendez_vous_client',
        limit_choices_to={'role': 'CLIENT'},
        verbose_name=_("Client"),
    )
    coiffeur         = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE,
        related_name='rendez_vous_coiffeur',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    service          = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='rendez_vous',
        verbose_name=_("Service"),
    )

    # ── Snapshot du service au moment de la réservation ──────────
    # Préserve l'historique même si le service est modifié/supprimé après coup.
    service_nom_snapshot   = models.CharField(max_length=100, verbose_name=_("Nom du service (figé)"))
    service_prix_snapshot  = models.DecimalField(max_digits=8, decimal_places=2, verbose_name=_("Prix (figé)"))
    service_duree_snapshot = models.PositiveIntegerField(verbose_name=_("Durée en minutes (figée)"))

    date_heure_debut = models.DateTimeField(verbose_name=_("Début"))
    date_heure_fin   = models.DateTimeField(verbose_name=_("Fin"))
    statut           = models.CharField(
        max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE',
        verbose_name=_("Statut"),
    )
    statut_paiement  = models.CharField(
        max_length=20, choices=STATUT_PAIEMENT_CHOICES,
        default='NON_PAYE', verbose_name=_("Statut du paiement"),
    )

    # ── FK paiement — colonne créée par la migration 0002 ────────
    # (déclarée ici aussi : la migration crée la colonne en base,
    #  mais l'ORM a besoin de cette déclaration Python pour l'utiliser)
    paiement         = models.ForeignKey(
        'paiements.Paiement',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='rendez_vous_associe',
        verbose_name=_("Paiement"),
    )

    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_heure_debut']
        verbose_name = _("Rendez-vous")
        verbose_name_plural = _("Rendez-vous")
        indexes = [
            models.Index(fields=['coiffeur', 'statut']),
            models.Index(fields=['client', 'statut']),
            models.Index(fields=['date_heure_debut']),
        ]

    def __str__(self):
        return f"{self.client.username} → {self.coiffeur.username} — {self.date_heure_debut:%d/%m/%Y %H:%M} ({self.statut})"

    @property
    def est_passe(self) -> bool:
        return timezone.now() > self.date_heure_fin

    @property
    def peut_etre_annule(self) -> bool:
        return self.statut in ('EN_ATTENTE', 'ACCEPTE') and not self.est_passe

    @property
    def est_paye(self) -> bool:
        paiement = getattr(self, 'paiement', None)
        if paiement and paiement.statut in {'PAYE_EN_LIGNE', 'PAYE_SUR_PLACE', 'PAYE'}:
            return True
        return self.statut_paiement in {'PAYE_EN_LIGNE', 'PAYE_SUR_PLACE'}
