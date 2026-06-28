"""
throttles.py — MIXO · Module Paiements
Limitation du débit sur l'initiation de paiement — protège contre les
tentatives répétées abusives (brute-force de transaction, spam de
demandes de paiement).

⚠️ Nécessite que 'paiement_initiation' soit déclaré dans
DEFAULT_THROTTLE_RATES de settings.py (cf. instructions d'intégration) —
sinon DRF utilise un throttle "open" par défaut sans limite réelle.
"""
from rest_framework.throttling import UserRateThrottle


class PaiementInitiationThrottle(UserRateThrottle):
    scope = 'paiement_initiation'
    rate = '10/hour'
