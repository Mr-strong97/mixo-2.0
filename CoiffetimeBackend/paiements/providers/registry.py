"""
registry.py — MIXO · Module Paiements
Registre central des providers — point d'extension unique pour ajouter
de futurs moyens de paiement (Carte Bancaire, PayPal, Stripe…) sans
toucher aux vues qui les consomment.
"""
from .airtel_money import AirtelMoneyProvider
from .orange_money import OrangeMoneyProvider
from .mpesa import MPesaProvider
from .africell_money import AfricellMoneyProvider

PROVIDERS = {
    'AIRTEL_MONEY':   AirtelMoneyProvider(),
    'ORANGE_MONEY':   OrangeMoneyProvider(),
    'MPESA':          MPesaProvider(),
    'AFRICELL_MONEY': AfricellMoneyProvider(),
    # 'CARTE_BANCAIRE': StripeProvider(),   ← futur, même interface
    # 'PAYPAL':         PayPalProvider(),   ← futur, même interface
}


def get_provider(methode: str):
    """Retourne l'instance provider pour une méthode donnée, ou None si inconnue."""
    return PROVIDERS.get(methode)
