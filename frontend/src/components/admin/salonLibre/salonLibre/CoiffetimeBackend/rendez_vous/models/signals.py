from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.rendezvous import RendezVous
from .models.notification import Notification

@receiver(post_save, sender=RendezVous)
def gestion_flux_notifications(sender, instance, created, **kwargs):
    """
    Gère la communication entre le client et le coiffeur.
    """
    
    # --- PHASE 1 : LA RÉSERVATION (Action du Client) ---
    if created:
        # 1. Notification pour le COIFFEUR (Pour l'alerter)
        Notification.objects.create(
            utilisateur=instance.coiffeur,
            titre="Nouvelle demande de RDV",
            message=f"Le client {instance.client.username} souhaite réserver pour le {instance.date_heure.strftime('%d/%m/%Y à %H:%M')}.",
            type_notification="ACTION_COIFFEUR",
            statut="NON_LU"
        )
        
        # 2. Notification pour le CLIENT (Accusé de réception)
        Notification.objects.create(
            utilisateur=instance.client,
            titre="Demande envoyée",
            message=f"Votre demande pour le {instance.date_heure.strftime('%d/%m/%Y')} a bien été envoyée. En attente de validation par le coiffeur.",
            type_notification="INFO_CLIENT",
            statut="NON_LU"
        )

    # --- PHASE 2 : LA RÉPONSE (Action du Coiffeur) ---
    else:
        # On vérifie si le statut a été modifié par le coiffeur
        if instance.statut == 'CONFIRME':
            Notification.objects.create(
                utilisateur=instance.client,
                titre="Rendez-vous Validé !",
                message=f"Le coiffeur {instance.coiffeur.username} a accepté votre rendez-vous. À très bientôt au salon !",
                type_notification="RECONSTRATION_CLIENT",
                statut="NON_LU"
            )
        
        elif instance.statut == 'ANNULE':
            Notification.objects.create(
                utilisateur=instance.client,
                titre="Rendez-vous Décliné",
                message=f"Désolé, le coiffeur ne peut pas vous recevoir le {instance.date_heure.strftime('%d/%m/%Y')}.",
                type_notification="INFO_CLIENT",
                statut="NON_LU"
            )