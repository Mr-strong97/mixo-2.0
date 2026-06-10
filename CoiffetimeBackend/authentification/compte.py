"""
authentification/compte.py
============================
Validateurs de sécurité réutilisables.
"""
import re
from django.core.exceptions import ValidationError


def validerMotDePasse(motDePasse: str):
    """
    Vérifie la robustesse du mot de passe.
    Règles :
      - Entre 8 et 128 caractères (OWASP recommande au moins 8, pas de max strict)
      - Au moins une majuscule, une minuscule, un chiffre, un symbole
    """
    if not (8 <= len(motDePasse) <= 128):
        raise ValidationError(
            "Le mot de passe doit contenir entre 8 et 128 caractères."
        )

    if not re.match(
        r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]{8,}$",
        motDePasse
    ):
        raise ValidationError(
            "Le mot de passe doit contenir au moins : "
            "une majuscule, une minuscule, un chiffre et un symbole (@$!%*?&-_#)."
        )