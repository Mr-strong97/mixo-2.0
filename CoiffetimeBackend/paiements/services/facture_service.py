"""
facture_service.py — MIXO · Génération de factures
"""
from decimal import Decimal

from django.db import transaction

from paiements.models import Facture, Paiement
from notifications.services.notification_service import notifier, notifier_admins, TypeNotification


@transaction.atomic
def generer_facture_depuis_paiement(paiement: Paiement, preuve_paiement: str = '') -> Facture:
    """
    Crée ou réutilise la facture associée à un paiement validé.
    """
    if not paiement.est_valide:
        raise ValueError("Le paiement doit être validé pour générer une facture.")

    facture, created = Facture.objects.get_or_create(
        paiement=paiement,
        defaults={
            'numero_facture': Facture.generer_numero(),
            'client': paiement.rendez_vous.client,
            'coiffeur': paiement.rendez_vous.coiffeur,
            'service': paiement.rendez_vous.service_nom_snapshot,
            'montant': paiement.montant_total,
            'mode_paiement': paiement.get_methode_display() or 'Paiement manuel',
            'statut': 'PAYEE',
            'devise': 'CDF',
            'preuve_paiement': preuve_paiement or '',
        },
    )

    if not created:
        updates = []
        if facture.statut != 'PAYEE':
            facture.statut = 'PAYEE'
            updates.append('statut')
        if preuve_paiement and facture.preuve_paiement != preuve_paiement:
            facture.preuve_paiement = preuve_paiement
            updates.append('preuve_paiement')
        if updates:
            facture.save(update_fields=updates + ['updated_at'])

    rdv = paiement.rendez_vous
    titre = "Facture générée"
    message = (
        f"Votre facture {facture.numero_facture} pour « {rdv.service_nom_snapshot} » "
        f"de {paiement.montant_total} CDF est disponible."
    )
    notifier(
        rdv.client,
        titre,
        message,
        TypeNotification.FACTURE_GENEREE,
        lien=f"/factures/{facture.id}",
    )
    notifier(
        rdv.coiffeur,
        titre,
        f"La facture {facture.numero_facture} liée au rendez-vous de {rdv.client.username} a été générée.",
        TypeNotification.FACTURE_GENEREE,
        lien=f"/factures/{facture.id}",
    )
    notifier_admins(
        "Copie de preuve de paiement",
        f"Preuve de paiement disponible pour la facture {facture.numero_facture} du rendez-vous {rdv.id}.",
        TypeNotification.FACTURE_ADMIN,
        lien=f"/admin/extended/paiements/{paiement.id}/",
    )
    return facture
