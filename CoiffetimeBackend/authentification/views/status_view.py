"""
authentification/views/status_view.py
Vérifie le statut utilisateur + notifications non lues (depuis app notifications).
"""
from datetime import timedelta

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from avis.models import Avis
from paiements.models import Facture
from rendez_vous.models import RendezVous
from services.models import Service
from django.utils import timezone

from notifications.models import Notification, StatutNotification
from notifications.models import TypeNotification


def _compteurs_utilisateur(user, non_lues):
    now = timezone.now()
    compteurs = {
        "notifications": non_lues,
        "services": 0,
        "rdv": 0,
        "avis": 0,
        "factures": 0,
    }

    if user.role == "CLIENT":
        compteurs["rdv"] = RendezVous.objects.filter(
            client=user,
            statut__in=["EN_ATTENTE", "ACCEPTE"],
        ).count()
        compteurs["avis"] = Notification.objects.filter(
            utilisateur=user,
            statut=StatutNotification.NON_LU,
            type=TypeNotification.AVIS_DEMANDE,
        ).count()
        compteurs["factures"] = Facture.objects.filter(
            client=user,
            statut="GENEREE",
        ).count()
        compteurs["services"] = Service.objects.filter(
            actif=True,
            statut="actif",
            created_at__gte=now - timedelta(days=7),
        ).count()

    elif user.role == "COIFFEUR":
        compteurs["rdv"] = RendezVous.objects.filter(
            coiffeur=user,
            statut="EN_ATTENTE",
        ).count()
        compteurs["avis"] = Notification.objects.filter(
            utilisateur=user,
            statut=StatutNotification.NON_LU,
            type=TypeNotification.NOUVEL_AVIS,
        ).count()
        compteurs["factures"] = Facture.objects.filter(
            coiffeur=user,
            statut="GENEREE",
        ).count()
        compteurs["services"] = Service.objects.filter(coiffeur=user).exclude(
            statut="actif",
            actif=True,
        ).count()

    else:
        compteurs["rdv"] = RendezVous.objects.filter(
            statut__in=["EN_ATTENTE", "SUSPENDU"],
        ).count()
        compteurs["avis"] = Avis.objects.filter(signale=True).count()
        compteurs["factures"] = Facture.objects.filter(statut="GENEREE").count()
        compteurs["services"] = Service.objects.exclude(
            statut="actif",
            actif=True,
        ).count()

    return compteurs


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monStatut(request):
    """GET /api/auth/moi/statut/"""
    user     = request.user
    non_lues = Notification.objects.filter(
        utilisateur=user,
        statut=StatutNotification.NON_LU
    ).count()

    compteurs = _compteurs_utilisateur(user, non_lues)

    return Response({
        "id":            str(user.id),
        "username":      user.username,
        "role":          user.role,
        "statut":        user.statut,
        "motif_sanction": user.motif_sanction,
        "date_sanction": user.date_sanction.isoformat() if user.date_sanction else None,
        "conditions_reactivation": user.conditions_reactivation,
        "date_demande_reactivation": user.date_demande_reactivation.isoformat() if user.date_demande_reactivation else None,
        "email_verifie": user.email_verifie,
        "non_lues":      non_lues,
        "compteurs":     compteurs,
    })
