"""
africell_money.py — MIXO · Provider Africell Money

⚠️ MODE TEST — simule un paiement réussi instantanément.
À CONNECTER : API Africell Money (selon documentation fournie par Africell).
"""
from .base import PaiementProviderBase


class AfricellMoneyProvider(PaiementProviderBase):
    code_methode = 'AFRICELL_MONEY'

    def initier(self, montant, numero_telephone: str = None) -> dict:
        transaction_id = self.generer_transaction_id()
        return {
            'succes': True,
            'transaction_id': transaction_id,
            'statut': 'PAYE_EN_LIGNE',
            'message': f"[TEST] Paiement Africell Money de {montant} CDF simulé avec succès.",
        }
