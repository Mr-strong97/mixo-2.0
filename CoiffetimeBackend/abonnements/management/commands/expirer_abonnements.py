"""
expirer_abonnements.py — MIXO · Module Abonnements
Commande de management Django — à planifier quotidiennement via cron :

    0 2 * * * cd /chemin/vers/CoiffetimeBackend && \
        ./venv/bin/python manage.py expirer_abonnements

Désactive tous les abonnements (essais ou plans payants) dont la
date_fin est dépassée.
"""
from django.core.management.base import BaseCommand
from abonnements.utils.trial_manager import verifier_et_expirer_abonnements


class Command(BaseCommand):
    help = "Désactive les abonnements (essais et plans payants) expirés."

    def handle(self, *args, **options):
        count = verifier_et_expirer_abonnements()
        if count:
            self.stdout.write(self.style.SUCCESS(f"{count} abonnement(s) expiré(s) et désactivé(s)."))
        else:
            self.stdout.write("Aucun abonnement à expirer.")
