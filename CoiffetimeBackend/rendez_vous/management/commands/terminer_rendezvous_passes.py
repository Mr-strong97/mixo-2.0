"""
terminer_rendezvous_passes.py — MIXO · Module Rendez-vous
Commande de management — à planifier toutes les heures via cron :

    0 * * * * cd /chemin/vers/CoiffetimeBackend && \
        ./venv/bin/python manage.py terminer_rendezvous_passes

Marque automatiquement TERMINE tout rendez-vous ACCEPTE dont l'heure de
fin est dépassée, et notifie le client pour l'inviter à laisser un avis.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from rendez_vous.models import RendezVous
from notifications.services.notification_service import notifier, TypeNotification


class Command(BaseCommand):
    help = "Marque TERMINE les rendez-vous acceptés dont l'heure de fin est passée."

    def handle(self, *args, **options):
        qs = RendezVous.objects.filter(statut='ACCEPTE', date_heure_fin__lt=timezone.now())
        count = 0

        for rdv in qs:
            rdv.statut = 'TERMINE'
            rdv.save(update_fields=['statut', 'updated_at'])
            notifier(
                rdv.client, "Rendez-vous terminé",
                "Votre rendez-vous est terminé. Souhaitez-vous laisser un avis sur votre expérience ?",
                TypeNotification.AVIS_DEMANDE, lien=f"/avis/laisser/{rdv.id}",
            )
            count += 1

        if count:
            self.stdout.write(self.style.SUCCESS(f"{count} rendez-vous marqué(s) terminé(s)."))
        else:
            self.stdout.write("Aucun rendez-vous à clôturer.")
