"""
authentification/models/audit_log.py
=======================================
Trace toutes les actions sensibles pour la sécurité et la conformité RGPD.
Les entrées sont en LECTURE SEULE — jamais modifiées, jamais supprimées.
"""
import uuid

from django.db import models
from .utilisateur import Utilisateur


class ActionChoix(models.TextChoices):
    CONNEXION          = 'CONNEXION',          'Connexion'
    CONNEXION_ECHEC    = 'CONNEXION_ECHEC',    'Échec de connexion'
    DECONNEXION        = 'DECONNEXION',        'Déconnexion'
    INSCRIPTION        = 'INSCRIPTION',        'Inscription'
    MODIF_PROFIL       = 'MODIF_PROFIL',       'Modification du profil'
    MODIF_MOT_DE_PASSE = 'MODIF_MOT_DE_PASSE','Changement de mot de passe'
    SUPPRESSION_COMPTE = 'SUPPRESSION_COMPTE', 'Suppression du compte'
    COMPTE_VERROUILLE  = 'COMPTE_VERROUILLE',  'Compte verrouillé'
    ADMIN_RDV_MODIF    = 'ADMIN_RDV_MODIF',    'Modification rendez-vous admin'
    ADMIN_RDV_ANNULE   = 'ADMIN_RDV_ANNULE',   'Annulation rendez-vous admin'
    ADMIN_RDV_SUSPEND  = 'ADMIN_RDV_SUSPEND',  'Suspension rendez-vous admin'


class AuditLog(models.Model):
    """
    Journal d'audit immuable.
    Chaque ligne représente un événement système.
    """
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Peut être null si l'utilisateur n'est pas identifié (ex: tentative avec email inconnu)
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='audit_logs'
    )

    action      = models.CharField(max_length=30, choices=ActionChoix.choices)
    ressource   = models.CharField(max_length=255, blank=True)  # Ex: "profil/uuid"
    ip_adresse  = models.GenericIPAddressField(null=True, blank=True)
    user_agent  = models.TextField(blank=True)
    succes      = models.BooleanField(default=True)
    details     = models.JSONField(default=dict, blank=True)  # Infos complémentaires
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Journal d\'audit'
        verbose_name_plural = 'Journaux d\'audit'
        ordering            = ['-created_at']
        # On n'autorise jamais la modification d'un log
        default_permissions = ('view',)

    def __str__(self):
        qui = self.utilisateur.username if self.utilisateur else 'Inconnu'
        return f"[{self.created_at:%d/%m/%Y %H:%M}] {qui} — {self.action}"

    # ---------------------------------------------------------------- #
    # MÉTHODE DE CLASSE : crée un log depuis une requête HTTP
    # ---------------------------------------------------------------- #

    @classmethod
    def enregistrer(cls, request, action, utilisateur=None, succes=True, details=None):
        """
        Raccourci pour créer un log depuis une vue Django.
        Usage : AuditLog.enregistrer(request, ActionChoix.CONNEXION, user)
        """
        # Récupère l'IP réelle (derrière un proxy/load balancer si besoin)
        ip = (
            request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
            or request.META.get('REMOTE_ADDR')
        )
        cls.objects.create(
            utilisateur=utilisateur,
            action=action,
            ip_adresse=ip or None,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            succes=succes,
            details=details or {},
        )
