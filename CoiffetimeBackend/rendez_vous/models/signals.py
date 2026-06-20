from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .rendezvous import RendezVous
from notifications.models import Notification, TypeNotification


@receiver(pre_save, sender=RendezVous)
def memoriser_statut_precedent(sender, instance, **kwargs):
    """
    Conserve le statut précédent pour détecter une vraie transition
    au moment du post_save.
    """
    if not instance.pk:
        instance._statut_precedent = None
        return

    instance._statut_precedent = (
        sender.objects.filter(pk=instance.pk)
        .values_list('statut', flat=True)
        .first()
    )

@receiver(post_save, sender=RendezVous)
def gestion_flux_notifications(sender, instance, created, **kwargs):
    """
    Gère la communication entre le client et le coiffeur.
    """
    
    # --- PHASE 1 : LA RÉSERVATION (Action du Client) ---
    if created:
        Notification.creer(
            utilisateur=instance.coiffeur,
            titre="Nouvelle demande de RDV",
            message=(
                f"Le client {instance.client.username} souhaite réserver pour "
                f"le {instance.date_heure.strftime('%d/%m/%Y à %H:%M')}."
            ),
            type=TypeNotification.INFO,
            lien='/notifications',
        )
        Notification.creer(
            utilisateur=instance.client,
            titre="Demande envoyée",
            message=(
                f"Votre demande pour le {instance.date_heure.strftime('%d/%m/%Y')} "
                "a bien été envoyée. En attente de validation par le coiffeur."
            ),
            type=TypeNotification.INFO,
            lien='/notifications',
        )
        return

    statut_precedent = getattr(instance, '_statut_precedent', None)
    if statut_precedent == instance.statut:
        return

    # --- PHASE 2 : LA RÉPONSE (Action du Coiffeur) ---
    if instance.statut == 'CONFIRME':
        Notification.creer(
            utilisateur=instance.client,
            titre="Rendez-vous validé !",
            message=(
                f"Le coiffeur {instance.coiffeur.username} a accepté votre rendez-vous. "
                "À très bientôt au salon !"
            ),
            type=TypeNotification.SUCCES,
            lien='/notifications',
        )
    elif instance.statut == 'ANNULE':
        Notification.creer(
            utilisateur=instance.client,
            titre="Rendez-vous décliné",
            message=(
                f"Désolé, le coiffeur ne peut pas vous recevoir le "
                f"{instance.date_heure.strftime('%d/%m/%Y')}."
            ),
            type=TypeNotification.AVERTISSEMENT,
            lien='/notifications',
        )
