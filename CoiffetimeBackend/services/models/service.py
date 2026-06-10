"""
service.py — MIXO · Modèles du module Services
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from authentification.models.utilisateur import Utilisateur


class CategorieService(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom         = models.CharField(max_length=80, unique=True, verbose_name=_("Nom"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    icone       = models.CharField(max_length=10, blank=True, null=True, verbose_name=_("Icône (emoji)"))
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']
        verbose_name = _("Catégorie de service")
        verbose_name_plural = _("Catégories de services")

    def __str__(self):
        return self.nom


class Service(models.Model):
    STATUT_CHOICES = [
        ('actif',      _('Actif')),
        ('inactif',    _('Inactif')),
        ('en_attente', _('En attente de validation')),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coiffeur       = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='services_proposes',
        limit_choices_to={'role': 'COIFFEUR'},
        verbose_name=_("Coiffeur"),
    )
    categorie      = models.ForeignKey(
        CategorieService,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='services',
        verbose_name=_("Catégorie"),
    )
    nom_prestation = models.CharField(
        max_length=100,
        verbose_name=_("Nom de la prestation"),
    )
    description    = models.TextField(
        blank=True, null=True,
        verbose_name=_("Description"),
    )
    duree_minutes  = models.PositiveIntegerField(
        validators=[MinValueValidator(5), MaxValueValidator(480)],
        help_text=_("Durée en minutes. Min 5 min, max 8h."),
        verbose_name=_("Durée (minutes)"),
    )
    prix           = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name=_("Prix (€)"),
    )
    image          = models.ImageField(
        upload_to='services/images/%Y/%m/',
        blank=True, null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])],
        verbose_name=_("Image principale"),
    )
    ville          = models.CharField(
        max_length=100,
        blank=True, null=True,
        verbose_name=_("Ville"),
    )
    statut         = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='actif',
        verbose_name=_("Statut"),
    )
    actif          = models.BooleanField(default=True, verbose_name=_("Actif"))
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Service")
        verbose_name_plural = _("Services")
        indexes = [
            models.Index(fields=['coiffeur', 'statut']),
            models.Index(fields=['categorie', 'statut']),
            models.Index(fields=['actif']),
        ]

    def __str__(self):
        return f"{self.nom_prestation} — {self.coiffeur.username}"

    @property
    def est_actif(self):
        return self.statut == 'actif' and self.actif


class ServiceImage(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service    = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='galerie')
    image      = models.ImageField(
        upload_to='services/galerie/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = _("Image de service")
        verbose_name_plural = _("Images de service")

    def __str__(self):
        return f"Image — {self.service.nom_prestation}"