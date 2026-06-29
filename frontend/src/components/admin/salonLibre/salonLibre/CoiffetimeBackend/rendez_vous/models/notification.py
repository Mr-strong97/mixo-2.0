import uuid
from django.db import models
from authentification.models.utilisateur import Utilisateur

class Notification(models.Model):
    # UUID pour la sécurité des identifiants
    id_notif = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relation vers l'utilisateur (Client ou Coiffeur)
    utilisateur = models.ForeignKey(
        Utilisateur, 
        on_delete=models.CASCADE, 
        related_name="notifications"
    )
    
    titre = models.CharField(max_length=150)
    message = models.TextField()
    
    # Statut : 'LU' ou 'NON_LU'
    statut = models.CharField(max_length=20, default='NON_LU')
    
    # Type : 'RENDEZ_VOUS', 'AVIS', 'SYSTEME'
    type_notification = models.CharField(max_length=50)
    
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Notification"

    def __str__(self):
        return f"{self.titre} - {self.utilisateur.username}"