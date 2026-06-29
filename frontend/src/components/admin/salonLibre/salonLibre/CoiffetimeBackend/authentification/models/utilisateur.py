"""
authentification/models/utilisateur.py
========================================
Modèle utilisateur central avec sécurité renforcée :
  - UUID en clé primaire
  - Soft delete (RGPD)
  - Verrouillage après 5 tentatives de connexion
  - Email unique obligatoire
  - Statut et rôle typés (Enum Django)
"""
import uuid
from datetime import timedelta

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone


# ------------------------------------------------------------------ #
# ENUMS (évite les fautes de frappe dans le code)
# ------------------------------------------------------------------ #

class RoleChoix(models.TextChoices):
    CLIENT   = 'CLIENT',   'Client'
    COIFFEUR = 'COIFFEUR', 'Coiffeur'
    ADMIN    = 'ADMIN',    'Administrateur'


class StatutChoix(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', 'En attente de vérification'
    ACTIF      = 'ACTIF',      'Actif'
    INACTIF    = 'INACTIF',    'Inactif'
    BANNI      = 'BANNI',      'Banni'


# ------------------------------------------------------------------ #
# MANAGER PERSONNALISÉ
# Hérite de UserManager pour garder create_user() / create_superuser()
# tout en excluant automatiquement les comptes soft-deleted.
# ------------------------------------------------------------------ #

class UtilisateurManager(UserManager):
    def get_queryset(self):
        # Les requêtes normales ne voient jamais les comptes supprimés
        return super().get_queryset().filter(deleted_at__isnull=True)


# ------------------------------------------------------------------ #
# MODÈLE PRINCIPAL
# ------------------------------------------------------------------ #

class Utilisateur(AbstractUser):
    """
    Remplace le User Django standard.
    AbstractUser fournit déjà : username, email, password (hashé),
    first_name, last_name, is_active, last_login, date_joined.
    """

    # Clé primaire UUID (ne jamais exposer un ID entier incrémental)
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )

    # Email obligatoire et unique (utilisé pour la connexion)
    email = models.EmailField(unique=True)


    # --- Rôle et statut typés ---
    role = models.CharField(
        max_length=20,
        choices=RoleChoix.choices,
        default=RoleChoix.CLIENT
    )
    statut = models.CharField(
        max_length=20,
        choices=StatutChoix.choices,
        default=StatutChoix.EN_ATTENTE
    )

    # --- Sécurité ---
    email_verifie        = models.BooleanField(default=False)
    deux_facteurs_actif  = models.BooleanField(default=False)
    tentatives_connexion = models.PositiveIntegerField(default=0)
    verrouille_jusqua    = models.DateTimeField(null=True, blank=True)

    # --- RGPD : suppression douce ---
    # Quand deleted_at est renseigné, le compte est "supprimé" sans l'être
    deleted_at = models.DateTimeField(null=True, blank=True)

    # --- Managers ---
    # 'objects' filtre les supprimés (comportement par défaut)
    objects     = UtilisateurManager()
    # 'all_objects' donne accès à TOUT, utile pour l'admin
    all_objects = UserManager()

    REQUIRED_FIELDS = ['email', 'role']

    class Meta:
        verbose_name          = 'Utilisateur'
        verbose_name_plural   = 'Utilisateurs'

    def __str__(self):
        return f"{self.username} ({self.role})"

    # ---------------------------------------------------------------- #
    # MÉTHODES MÉTIER
    # ---------------------------------------------------------------- #

    @property
    def est_verrouille(self):
        """Renvoie True si le compte est bloqué temporairement."""
        return bool(
            self.verrouille_jusqua and self.verrouille_jusqua > timezone.now()
        )

    def incrementer_tentatives(self):
        """
        Incrémente le compteur de tentatives.
        Verrouille 15 min après 5 échecs consécutifs.
        """
        self.tentatives_connexion += 1
        if self.tentatives_connexion >= 5:
            self.verrouille_jusqua = timezone.now() + timedelta(minutes=15)
        self.save(update_fields=['tentatives_connexion', 'verrouille_jusqua'])

    def reinitialiser_tentatives(self):
        """Remet le compteur à zéro après une connexion réussie."""
        self.tentatives_connexion = 0
        self.verrouille_jusqua    = None
        self.save(update_fields=['tentatives_connexion', 'verrouille_jusqua'])

    def soft_delete(self):
        """
        Suppression douce conforme RGPD.
        Le compte n'est plus visible mais reste en base pour audit.
        """
        self.deleted_at = timezone.now()
        self.is_active  = False
        self.save(update_fields=['deleted_at', 'is_active'])