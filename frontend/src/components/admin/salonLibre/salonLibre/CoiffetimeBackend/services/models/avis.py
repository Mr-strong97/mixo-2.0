import uuid
from django.db import models
from django.core.exceptions import ValidationError
from authentification.models.utilisateur import Utilisateur

class Avis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Seul un utilisateur avec le rôle CLIENT peut être enregistré comme auteur
    client = models.ForeignKey(
        Utilisateur, 
        on_delete=models.CASCADE, 
        related_name="avis_donnes", 
        limit_choices_to={'role': 'CLIENT'}
    )
    
    # Seul un utilisateur avec le rôle COIFFEUR peut recevoir l'avis
    coiffeur = models.ForeignKey(
        Utilisateur, 
        on_delete=models.CASCADE, 
        related_name="avis_recus", 
        limit_choices_to={'role': 'COIFFEUR'}
    )
    
    note = models.PositiveIntegerField()
    commentaire = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """
        Validation personnalisée pour empêcher l'auto-notation 
        et vérifier les rôles au niveau logique.
        """
        # 1. Empêcher l'auto-notation (ton cas d'ID identique)
        if self.client_id and self.coiffeur_id and self.client_id == self.coiffeur_id:
            raise ValidationError("Erreur : Un utilisateur ne peut pas laisser un avis sur son propre profil.")

    def save(self, *args, **kwargs):
        # On force l'exécution de clean() avant de sauvegarder en base
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Avis de {self.client} pour {self.coiffeur} - {self.note}/5"

    class Meta:
        verbose_name = "Avis"
        verbose_name_plural = "Avis"
        # Empêche un client de noter deux fois le même coiffeur (optionnel mais recommandé)
        unique_together = ('client', 'coiffeur')