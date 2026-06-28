"""
notification_service.py — MIXO · Pont vers le module Notifications existant

⚠️ Ce fichier N'EST PAS un remplacement de ton app `notifications` —
il fournit un point d'entrée UNIQUE, défensif, que les nouveaux modules
(rendezvous, paiements, avis) utilisent pour créer des notifications,
sans jamais faire planter le flux métier principal si le modèle
Notification réel a des noms de champs différents.

Si la création échoue (champ manquant, modèle absent…), l'erreur est
journalisée en warning et SILENCIEUSEMENT ignorée — créer un rendez-vous
ou valider un paiement ne doit JAMAIS dépendre du succès d'une notif.

📌 Si ton modèle Notification a des noms de champs différents de
   (utilisateur, titre, message, type, lien, lu), partage-le moi pour
   un raccord exact remplaçant les noms ci-dessous.
"""
import logging

from notifications.models import Notification, StatutNotification, TypeNotification

logger = logging.getLogger('mixo.notifications_ext')


def notifier(utilisateur, titre: str, message: str, type_notif: str = TypeNotification.SYSTEME, lien: str = None):
    """
    Crée une notification pour `utilisateur`. Échoue silencieusement
    (avec un warning en log) si le modèle Notification réel diverge.

    @param utilisateur  instance Utilisateur (destinataire)
    @param titre        court intitulé affiché en gras
    @param message      corps du message
    @param type_notif   une valeur de TypeNotification (string)
    @param lien         route frontend optionnelle (ex: '/rendez-vous/<uuid>')
    """
    if not utilisateur:
        return
    try:
        Notification.objects.create(
            utilisateur=utilisateur,
            titre=titre,
            message=message,
            type=type_notif,
            lien=lien,
            statut=StatutNotification.NON_LU,
        )
    except Exception as exc:  # noqa: BLE001 — ne doit jamais bloquer le flux métier
        logger.warning(
            "Notification non créée (utilisateur=%s, type=%s) : %s",
            getattr(utilisateur, 'username', utilisateur), type_notif, exc,
        )
