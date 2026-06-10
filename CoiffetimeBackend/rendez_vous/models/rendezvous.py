import uuid
from django.db import models
from django.core.exceptions import ValidationError
from authentification.models.utilisateur import Utilisateur

class RendezVous(models.Model):
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('CONFIRME', 'Confirmé'),
        ('ANNULE', 'Annulé'),
        ('TERMINE', 'Terminé'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="reservations_faites", limit_choices_to={'role': 'CLIENT'})
    coiffeur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="reservations_recues", limit_choices_to={'role': 'COIFFEUR'})
    date_heure = models.DateTimeField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_creation = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Règle de sécurité : Un coiffeur ne peut pas prendre rendez-vous avec lui-même
        if self.client_id and self.coiffeur_id and self.client_id == self.coiffeur_id:
            raise ValidationError("Un coiffeur ne peut pas réserver un créneau avec lui-même.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-date_heure']