"""
notifications/models.py
========================
Modèle central des notifications Coiffetime.
App dédiée : toutes les autres apps importent d'ici.
"""
import uuid
from django.db import models


class StatutNotification(models.TextChoices):
    NON_LU = 'NON_LU', 'Non lu'
    LU     = 'LU',     'Lu'


class TypeNotification(models.TextChoices):
    INFO          = 'INFO',          'Information'
    SUCCES        = 'SUCCES',        'Succès'
    AVERTISSEMENT = 'AVERTISSEMENT', 'Avertissement'
    DANGER        = 'DANGER',        'Danger'
    SYSTEME       = 'SYSTEME',       'Système'
    RDV_DEMANDE_ENVOYEE   = 'RDV_DEMANDE_ENVOYEE',   'Demande envoyée'
    RDV_NOUVELLE_DEMANDE  = 'RDV_NOUVELLE_DEMANDE',  'Nouvelle demande'
    RDV_ACCEPTE           = 'RDV_ACCEPTE',           'Rendez-vous accepté'
    RDV_REFUSE            = 'RDV_REFUSE',            'Rendez-vous refusé'
    RDV_ANNULE            = 'RDV_ANNULE',            'Rendez-vous annulé'
    RDV_MODIFIE           = 'RDV_MODIFIE',           'Rendez-vous modifié'
    PAIEMENT_VALIDE       = 'PAIEMENT_VALIDE',       'Paiement validé'
    PAIEMENT_RECU         = 'PAIEMENT_RECU',         'Paiement reçu'
    PAIEMENT_ECHOUE       = 'PAIEMENT_ECHOUE',       'Paiement échoué'
    PAIEMENT_ECHEC_ADMIN  = 'PAIEMENT_ECHEC_ADMIN',  'Échec paiement'
    AVIS_DEMANDE          = 'AVIS_DEMANDE',          'Demande d’avis'
    AVIS_REPONSE_COIFFEUR = 'AVIS_REPONSE_COIFFEUR', 'Réponse du coiffeur'
    NOUVEL_AVIS           = 'NOUVEL_AVIS',           'Nouvel avis'
    NOUVEL_UTILISATEUR    = 'NOUVEL_UTILISATEUR',    'Nouvel utilisateur'
    SIGNALEMENT           = 'SIGNALEMENT',           'Signalement'
    ALERTE_SYSTEME        = 'ALERTE_SYSTEME',        'Alerte système'


class Notification(models.Model):
    id            = models.UUIDField(
                        primary_key=True,
                        default=uuid.uuid4,
                        editable=False,
                    )
    utilisateur   = models.ForeignKey(
                        'authentification.Utilisateur',
                        on_delete=models.CASCADE,
                        related_name='notifications_recues',  # ✅ FIX: Résout définitivement la collision (clash E304/E305)
                        null=True, 
                        blank=True
                    )
    titre         = models.CharField(max_length=200)
    message       = models.TextField()
    statut        = models.CharField(
                        max_length=10,
                        choices=StatutNotification.choices,
                        default=StatutNotification.NON_LU
                    )
    type          = models.CharField(
                        max_length=32,
                        choices=TypeNotification.choices,
                        default=TypeNotification.INFO
                    )
    lien          = models.CharField(max_length=255, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ['-created_at']
        verbose_name = 'Notification'
        # Ajout d'un index de performance pour accélérer les requêtes de l'historique
        indexes = [
            models.Index(fields=['utilisateur', '-created_at']),
        ]

    def __str__(self):
        user = self.utilisateur.username if self.utilisateur else 'Global'
        return f"[{self.type}] {user} — {self.titre}"

    # ── Propriété de commodité ────────────────────────────────────
    @property
    def est_lue(self):
        return self.statut == StatutNotification.LU

    # ── Méthode factory ──────────────────────────────────────────
    @classmethod
    def creer(cls, utilisateur, titre, message,
              type=TypeNotification.INFO, lien=''):
        """
        Crée, enregistre en BDD et retourne une instance de notification.
        Usage dans n'importe quelle app :
            from notifications.models import Notification, TypeNotification
            Notification.creer(user, "Titre", "Message", TypeNotification.DANGER)
        """
        return cls.objects.create(
            utilisateur=utilisateur,
            titre=titre,
            message=message,
            type=type,
            lien=lien,
            statut=StatutNotification.NON_LU,
        )
