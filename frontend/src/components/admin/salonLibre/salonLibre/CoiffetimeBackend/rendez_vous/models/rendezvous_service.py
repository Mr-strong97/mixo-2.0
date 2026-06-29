import uuid
from django.db import models
from services.models.service import Service
from .rendezvous import RendezVous

class RendezVousService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rendezvous = models.ForeignKey(RendezVous, on_delete=models.CASCADE, related_name="services_associes")
    service = models.ForeignKey(Service, on_delete=models.PROTECT) # On ne supprime pas un service lié à un RDV passé

    class Meta:
        verbose_name = "Service du Rendez-vous"