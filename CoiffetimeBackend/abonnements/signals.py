"""
signals.py — MIXO · Module Abonnements
Active automatiquement l'essai gratuit de 14 jours à l'inscription
d'un nouveau coiffeur, sans toucher au code de l'app authentification.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from authentification.models.utilisateur import Utilisateur
from .models import AbonnementUtilisateur

logger = logging.getLogger('mixo.abonnements')


@receiver(post_save, sender=Utilisateur)
def activer_essai_gratuit(sender, instance, created, **kwargs):
    """
    Quand un nouvel utilisateur avec le rôle COIFFEUR est créé,
    lui attribue automatiquement 14 jours d'essai premium gratuit.
    """
    if not created:
        return
    if getattr(instance, 'role', None) != 'COIFFEUR':
        return

    # Évite un doublon si le signal était déjà déclenché par un autre code
    if AbonnementUtilisateur.objects.filter(coiffeur=instance).exists():
        return

    try:
        AbonnementUtilisateur.creer_essai_gratuit(instance)
        logger.info("Essai gratuit créé pour le coiffeur %s", instance.username)
    except Exception as exc:  # noqa: BLE001 — ne doit jamais bloquer l'inscription
        logger.warning("Échec création essai gratuit pour %s : %s", instance.username, exc)
