"""Commande désactivée en Version 1."""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Module Abonnements désactivé en Version 1."

    def handle(self, *args, **options):
        self.stdout.write("Le module Abonnements est désactivé en Version 1.")
