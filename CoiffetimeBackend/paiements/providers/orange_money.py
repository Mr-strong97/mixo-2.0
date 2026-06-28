"""
orange_money.py — MIXO · Provider Orange Money

⚠️ MODE TEST — simule un paiement réussi instantanément.
À CONNECTER : Orange Money Web Payment API (OAuth2 + Webpayment).
"""
from .base import PaiementProviderBase


class OrangeMoneyProvider(PaiementProviderBase):
    code_methode = 'ORANGE_MONEY'

    def initier(self, montant, numero_telephone: str = None) -> dict:
        transaction_id = self.generer_transaction_id()
        return {
            'succes': True,
            'transaction_id': transaction_id,
            'statut': 'PAYE',
            'message': f"[TEST] Paiement Orange Money de {montant}€ simulé avec succès.",
        }
