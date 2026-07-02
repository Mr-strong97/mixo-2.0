"""
rendez_vous/services.py — MIXO
Helpers métier partagés du module Rendez-vous.
"""
from notifications.services.notification_service import notifier, TypeNotification


def notifier_demande_avis(rdv):
    """Crée la notification d'invitation à laisser un avis pour un RDV terminé."""
    if not rdv or not getattr(rdv, 'client', None):
        return

    notifier(
        rdv.client,
        "Rendez-vous terminé",
        "Votre rendez-vous est maintenant terminé. Nous aimerions connaître votre expérience. Laissez un avis sur le service reçu.",
        TypeNotification.AVIS_DEMANDE,
        lien=f"/avis/laisser/{rdv.id}",
    )

