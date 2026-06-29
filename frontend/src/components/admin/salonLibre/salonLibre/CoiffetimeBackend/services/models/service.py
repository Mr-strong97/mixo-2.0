import uuid
from django.db import models
from authentification.models.utilisateur import Utilisateur

class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom_prestation = models.CharField(max_length=100)
    nom_salon = models.CharField(max_length=150, default="Mon Salon")
    description = models.TextField(blank=True, null=True)
    duree_minutes = models.PositiveIntegerField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    createur = models.ForeignKey(
        Utilisateur, 
        on_delete=models.CASCADE, 
        related_name="services_crees",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.nom_prestation} ({self.nom_salon})"

# C'EST CETTE CLASSE QUI MANQUE PROBABLEMENT :
class CoiffeurService(models.Model):
    id_coiffeur_service = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE, 
        related_name="coiffeurs_lies"
    )
    coiffeur = models.ForeignKey(
        Utilisateur, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'COIFFEUR'}
    )

    class Meta:
        unique_together = ('service', 'coiffeur')
        verbose_name = "Service par Coiffeur"
        verbose_name_plural = "Services par Coiffeurs"