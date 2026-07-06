from django.core.management.base import BaseCommand

from chat.services import cleanup_expired_messages


class Command(BaseCommand):
    help = "Supprime les messages chat expirés de plus de 7 jours."

    def handle(self, *args, **options):
        result = cleanup_expired_messages(days=7)
        self.stdout.write(self.style.SUCCESS(
            f"Nettoyage chat terminé: {result['deleted_messages']} messages, "
            f"{result['deleted_notifications']} notifications, "
            f"{result['deleted_attachments']} pièces jointes."
        ))

