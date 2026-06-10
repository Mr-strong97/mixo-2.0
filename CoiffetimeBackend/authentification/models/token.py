"""
authentification/models/token.py
===================================
Gère les tokens applicatifs (reset mot de passe, vérification email…).
Ne remplace PAS les tokens JWT de SimpleJWT — ceux-là sont gérés par la lib.
"""
import uuid
import hashlib
import secrets

from django.db import models
from django.utils import timezone

from .utilisateur import Utilisateur


class TypeToken(models.TextChoices):
    RESET_MDP          = 'RESET_MDP',          'Réinitialisation mot de passe'
    VERIFICATION_EMAIL = 'VERIFICATION_EMAIL',  'Vérification email'
    DEUX_FACTEURS      = 'DEUX_FACTEURS',       'Authentification à deux facteurs'


class Token(models.Model):
    """
    Token à usage unique avec date d'expiration.
    Le token brut n'est JAMAIS stocké — seulement son hash SHA-256.
    """
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='tokens'
    )
    token_hash  = models.CharField(max_length=64, unique=True)
    type        = models.CharField(max_length=30, choices=TypeToken.choices)
    expire_le   = models.DateTimeField()
    utilise     = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Token applicatif'
        verbose_name_plural = 'Tokens applicatifs'
        ordering            = ['-created_at']

    def __str__(self):
        return f"Token {self.type} — {self.utilisateur.username}"

    @property
    def est_expire(self):
        return timezone.now() > self.expire_le

    @property
    def est_valide(self):
        return not self.utilise and not self.est_expire

    def consommer(self):
        """Marque le token comme utilisé (usage unique)."""
        self.utilise = True
        self.save(update_fields=['utilise'])

    # ---------------------------------------------------------------- #
    # MÉTHODE DE CLASSE : crée et stocke un token de manière sécurisée
    # ---------------------------------------------------------------- #

    @classmethod
    def creer(cls, utilisateur, type_token, duree_minutes=60):
        """
        Génère un token aléatoire, le hash et le persiste.
        Retourne le token brut (à envoyer par email/SMS) et l'objet Token.
        """
        from datetime import timedelta

        token_brut = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token_brut.encode()).hexdigest()

        token_obj = cls.objects.create(
            utilisateur=utilisateur,
            token_hash=token_hash,
            type=type_token,
            expire_le=timezone.now() + timedelta(minutes=duree_minutes),
        )
        # On retourne les deux : brut pour l'email, obj pour la BDD
        return token_brut, token_obj

    @classmethod
    def verifier(cls, token_brut, type_token):
        """
        Cherche un token valide depuis sa valeur brute.
        Retourne l'objet Token ou None.
        """
        token_hash = hashlib.sha256(token_brut.encode()).hexdigest()
        try:
            token = cls.objects.get(token_hash=token_hash, type=type_token)
            return token if token.est_valide else None
        except cls.DoesNotExist:
            return None