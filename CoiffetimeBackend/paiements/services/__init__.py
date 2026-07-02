"""Services métier pour le module paiements."""

from .facture_service import generer_facture_depuis_paiement

__all__ = ['generer_facture_depuis_paiement']
