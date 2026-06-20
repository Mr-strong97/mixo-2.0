"""
trial_manager.py — MIXO · Module Abonnements
Logique métier centralisée : statut d'abonnement, expiration, accès premium.
"""
from django.utils import timezone
from ..models import AbonnementUtilisateur


def abonnement_courant(coiffeur):
    """
    Retourne l'AbonnementUtilisateur actif le plus récent du coiffeur
    (essai ou plan payant), ou None s'il n'en a aucun.
    """
    return (
        AbonnementUtilisateur.objects
        .filter(coiffeur=coiffeur, actif=True)
        .order_by('-date_debut')
        .first()
    )


def est_premium_actif(coiffeur) -> bool:
    """
    Vrai si le coiffeur a un abonnement (essai ou payant) actif et non expiré.
    Utilisé pour conditionner les avantages premium (mise en avant, etc.).
    """
    abo = abonnement_courant(coiffeur)
    if not abo:
        return False
    if abo.est_expire:
        return False
    return True


def verifier_et_expirer_abonnements() -> int:
    """
    Parcourt tous les abonnements actifs dont la date de fin est dépassée
    et les désactive. Retourne le nombre d'abonnements désactivés.

    Conçu pour être appelé :
      - via la management command `expirer_abonnements` (cron quotidien)
      - paresseusement, à la demande, dans les vues de lecture de statut
    """
    today = timezone.localdate()
    qs = AbonnementUtilisateur.objects.filter(actif=True, date_fin__lt=today)
    count = qs.count()
    qs.update(actif=False)
    return count


def statut_abonnement_dict(coiffeur) -> dict:
    """Représentation sérialisable du statut d'abonnement, prête pour l'API."""
    abo = abonnement_courant(coiffeur)
    if not abo:
        return {
            'a_abonnement':   False,
            'periode_essai':  False,
            'plan':           None,
            'jours_restants': 0,
            'expire':         True,
            'date_fin':       None,
        }
    return {
        'a_abonnement':   True,
        'periode_essai':  abo.periode_essai,
        'plan':           abo.abonnement_plan.plan if abo.abonnement_plan else None,
        'plan_nom':       abo.abonnement_plan.nom if abo.abonnement_plan else 'Essai gratuit',
        'jours_restants': abo.jours_restants,
        'expire':         abo.est_expire,
        'date_fin':       abo.date_fin.isoformat(),
    }
