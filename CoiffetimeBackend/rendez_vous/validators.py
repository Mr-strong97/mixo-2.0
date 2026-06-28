"""
validators.py — MIXO · Module Rendez-vous
Vérifications automatiques avant création d'un rendez-vous :
  - service actif et appartenant bien au coiffeur ciblé
  - créneau dans les horaires de travail du coiffeur
  - pas d'exception d'indisponibilité ce jour-là (sauf ouverture exceptionnelle)
  - pas de chevauchement avec un autre rendez-vous déjà EN_ATTENTE/ACCEPTE
"""
from planning.models import Horaire, DisponibiliteException


class IndisponibiliteError(Exception):
    """Levée quand le créneau demandé n'est pas réservable, avec un message clair."""
    pass


def verifier_service(service, coiffeur):
    if service is None:
        raise IndisponibiliteError("Ce service n'existe plus.")
    if service.coiffeur_id != coiffeur.id:
        raise IndisponibiliteError("Ce service n'appartient pas à ce coiffeur.")
    if not (service.statut == 'actif' and service.actif):
        raise IndisponibiliteError("Ce service n'est plus disponible à la réservation.")


def verifier_horaires_et_exceptions(coiffeur, date_heure_debut, date_heure_fin):
    jour_semaine = date_heure_debut.weekday()  # 0=Lundi … 6=Dimanche, cohérent avec Horaire.JOUR_CHOICES
    date_jour = date_heure_debut.date()

    exception = DisponibiliteException.objects.filter(coiffeur=coiffeur, date=date_jour).first()

    if exception and not exception.disponible:
        raise IndisponibiliteError(
            f"Le coiffeur est indisponible ce jour-là ({exception.get_categorie_display()})."
        )

    if exception and exception.disponible:
        # Ouverture exceptionnelle déclarée : on ne vérifie pas les horaires habituels.
        return

    creneau_valide = Horaire.objects.filter(
        coiffeur=coiffeur,
        jour_semaine=jour_semaine,
        actif=True,
        heure_debut__lte=date_heure_debut.time(),
        heure_fin__gte=date_heure_fin.time(),
    ).exists()

    if not creneau_valide:
        raise IndisponibiliteError("Ce créneau est en dehors des horaires de travail du coiffeur.")


def verifier_conflits(coiffeur, date_heure_debut, date_heure_fin, exclure_id=None):
    from .models import RendezVous

    qs = RendezVous.objects.filter(
        coiffeur=coiffeur,
        statut__in=['EN_ATTENTE', 'ACCEPTE'],
        date_heure_debut__lt=date_heure_fin,
        date_heure_fin__gt=date_heure_debut,
    )
    if exclure_id:
        qs = qs.exclude(id=exclure_id)

    if qs.exists():
        raise IndisponibiliteError("Ce créneau est déjà réservé.")


def verifier_disponibilite_complete(service, coiffeur, date_heure_debut, date_heure_fin, exclure_id=None):
    """
    Point d'entrée unique — lève IndisponibiliteError au premier problème
    rencontré, avec un message explicite destiné au frontend.
    """
    verifier_service(service, coiffeur)
    verifier_horaires_et_exceptions(coiffeur, date_heure_debut, date_heure_fin)
    verifier_conflits(coiffeur, date_heure_debut, date_heure_fin, exclure_id=exclure_id)
