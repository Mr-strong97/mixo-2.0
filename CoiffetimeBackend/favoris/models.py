"""
favoris/models.py — MIXO · Favoris client
"""
import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Favori(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favoris_client',
        limit_choices_to={'role': 'CLIENT'},
        verbose_name=_("Client"),
    )
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.CASCADE,
        related_name='favoris_service',
        verbose_name=_("Service"),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Favori")
        verbose_name_plural = _("Favoris")
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['client', 'service'], name='uniq_favori_client_service'),
        ]
        indexes = [
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['service', 'created_at']),
        ]

    def __str__(self):
        return f"{self.client.username} ♥ {self.service.nom_prestation}"

