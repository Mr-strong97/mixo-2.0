"""
mpesa.py — MIXO · Provider Vodacom M-Pesa

⚠️ MODE TEST — simule un paiement réussi instantanément.
À CONNECTER : M-Pesa Open API (Vodacom) — STK Push / C2B.
"""
from .base import PaiementProviderBase


class MPesaProvider(PaiementProviderBase):
    code_methode = 'MPESA'

    def initier(self, montant, numero_telephone: str = None) -> dict:
        transaction_id = self.generer_transaction_id()
        return {
            'succes': True,
            'transaction_id': transaction_id,
            'statut': 'PAYE_EN_LIGNE',
            'message': f"[TEST] Paiement M-Pesa de {montant} CDF simulé avec succès.",
        }
