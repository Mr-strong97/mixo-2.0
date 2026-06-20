"""
portfolio_media.py — MIXO · Module Portfolio
Médias (photos/vidéos) du portfolio d'un coiffeur, visibles côté client.
"""
import uuid
from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur

EXTENSIONS_IMAGE = ['jpg', 'jpeg', 'png', 'webp']
EXTENSIONS_VIDEO = ['mp4', 'mov', 'webm']


class PortfolioMedia(models.Model):
    """Une réalisation (image ou vidéo) ajoutée par un coiffeur à son portfolio."""

    TYPE_CHOICES = [
        ('image', _('Image')),
        ('video', _('Vidéo')),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coiffeur            = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='portfolio',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    media               = models.FileField(
        upload_to='portfolio/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=EXTENSIONS_IMAGE + EXTENSIONS_VIDEO)],
        verbose_name=_("Fichier média"),
    )
    type                = models.CharField(max_length=10, choices=TYPE_CHOICES, default='image', verbose_name=_("Type"))
    titre               = models.CharField(max_length=150, blank=True, null=True, verbose_name=_("Titre"))
    mis_en_avant        = models.BooleanField(default=False, verbose_name=_("Mis en avant"))
    ordre               = models.PositiveIntegerField(default=0, verbose_name=_("Ordre d'affichage"))

    # ── Modération (Espace Admin) ────────────────────────────
    signale             = models.BooleanField(default=False, verbose_name=_("Signalé"))
    motif_signalement   = models.TextField(blank=True, null=True, verbose_name=_("Motif du signalement"))

    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['ordre', '-created_at']
        verbose_name = _("Média de portfolio")
        verbose_name_plural = _("Médias de portfolio")
        indexes = [
            models.Index(fields=['coiffeur', 'ordre']),
            models.Index(fields=['signale']),
        ]

    def __str__(self):
        return f"{self.coiffeur.username} — {self.titre or self.type} ({self.id})"
