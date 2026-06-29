import uuid
from django.db import models
from django.core.exceptions import ValidationError
from authentification.models.utilisateur import Utilisateur

class Horaire(models.Model):
    # UUID comme clé primaire
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    JOURS = [
        (1, 'Lundi'), (2, 'Mardi'), (3, 'Mercredi'),
        (4, 'Jeudi'), (5, 'Vendredi'), (6, 'Samedi'), (7, 'Dimanche')
    ]
    
    coiffeur = models.ForeignKey(
        Utilisateur, 
        on_delete=models.CASCADE, 
        related_name="horaires",
        limit_choices_to={'role': 'COIFFEUR'}
    )
    jour_semaine = models.IntegerField(choices=JOURS)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()

    class Meta:
        # Empêche un coiffeur d'avoir deux plannings pour le même jour
        unique_together = ('coiffeur', 'jour_semaine')
        ordering = ['jour_semaine', 'heure_debut']

    def clean(self):
        # Validation : l'heure de fin doit être après l'heure de début
        if self.heure_debut and self.heure_fin and self.heure_debut >= self.heure_fin:
            raise ValidationError("L'heure de fin doit être après l'heure de début.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.coiffeur.nom} - {self.get_jour_semaine_display()} ({self.heure_debut}-{self.heure_fin})"