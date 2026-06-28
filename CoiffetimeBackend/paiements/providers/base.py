"""
base.py — MIXO · Module Paiements
Interface abstraite commune à tous les providers de paiement mobile money.

⚠️ MODE TEST : aucune clé API réelle n'est disponible à ce stade.
Chaque provider concret simule un paiement réussi instantanément, dans un
format identique à ce que renverrait une vraie intégration. Pour brancher
une vraie API plus tard, il suffit de réécrire `initier()` dans le
provider concerné — AUCUN autre fichier du projet n'a besoin de changer
(vues, serializers, frontend) grâce à cette interface commune.
"""
from abc import ABC, abstractmethod
import uuid


class PaiementProviderBase(ABC):
    """Interface que chaque provider mobile money doit implémenter."""

    code_methode: str = None  # ex: 'AIRTEL_MONEY' — doit matcher Paiement.METHODE_CHOICES

    @abstractmethod
    def initier(self, montant, numero_telephone: str = None) -> dict:
        """
        Initie une transaction de paiement.

        @return dict {
            'succes': bool,
            'transaction_id': str,
            'statut': 'PAYE' | 'EN_ATTENTE' | 'ECHOUE',
            'message': str,
        }
        """
        raise NotImplementedError

    def generer_transaction_id(self) -> str:
        return f"{self.code_methode}-{uuid.uuid4().hex[:16].upper()}"
