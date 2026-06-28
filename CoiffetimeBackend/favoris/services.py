"""favoris/services.py — MIXO · Logique métier des favoris"""
from django.db import IntegrityError, transaction
from django.db.utils import OperationalError

from services.models import Service
from .models import Favori


def lister_favoris_client(client):
    try:
        return Favori.objects.select_related('service', 'service__coiffeur', 'service__categorie').filter(client=client)
    except OperationalError:
        return Favori.objects.none()


def compter_favoris_client(client):
    try:
        return Favori.objects.filter(client=client).count()
    except OperationalError:
        return 0


@transaction.atomic
def ajouter_favori(client, service: Service):
    try:
        favori, created = Favori.objects.get_or_create(client=client, service=service)
    except OperationalError:
        return None, False
    return favori, created


@transaction.atomic
def retirer_favori(client, service: Service):
    try:
        deleted, _ = Favori.objects.filter(client=client, service=service).delete()
    except OperationalError:
        return False
    return deleted > 0


@transaction.atomic
def basculer_favori(client, service: Service):
    try:
        favori = Favori.objects.filter(client=client, service=service).first()
    except OperationalError:
        return {'ajoute': False, 'favori': None}
    if favori:
        favori.delete()
        return {'ajoute': False, 'favori': None}
    try:
        favori = Favori.objects.create(client=client, service=service)
    except IntegrityError:
        favori = Favori.objects.get(client=client, service=service)
    except OperationalError:
        return {'ajoute': False, 'favori': None}
    return {'ajoute': True, 'favori': favori}
