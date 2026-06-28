"""
airtel_money.py — MIXO · Provider Airtel Money

⚠️ MODE TEST — simule un paiement réussi instantanément.
À CONNECTER : API Airtel Money Africa (OAuth2 + Collection API).
Quand les identifiants seront disponibles, remplacer le corps de
`initier()` par un appel HTTP réel vers l'endpoint Airtel, en conservant
exactement la même signature et le même format de retour.
"""
from .base import PaiementProviderBase


class AirtelMoneyProvider(PaiementProviderBase):
    code_methode = 'AIRTEL_MONEY'

    def initier(self, montant, numero_telephone: str = None) -> dict:
        # ── MODE TEST ────────────────────────────────────────────
        transaction_id = self.generer_transaction_id()
        return {
            'succes': True,
            'transaction_id': transaction_id,
            'statut': 'PAYE',
            'message': f"[TEST] Paiement Airtel Money de {montant}€ simulé avec succès.",
        }
