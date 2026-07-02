"""
administration/views/reactivation_view.py
L'utilisateur suspendu envoie une demande.
L'admin l'accepte ou la refuse.
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from authentification.models.utilisateur import Utilisateur, StatutChoix
from authentification.models.audit_log   import AuditLog, ActionChoix
from notifications.models import TypeNotification
from notifications.services.notification_service import notifier, notifier_admins
from ..permissions import EstAdmin
from ..models import DemandeReactivation, StatutDemandeReactivation


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def demanderReactivation(request):
    """
    POST /api/auth/reactivation/demander/
    Accessible à l'utilisateur suspendu pour soumettre une demande.
    Body: { "message": "..." }
    """
    utilisateur = request.user

    if utilisateur.statut not in {StatutChoix.INACTIF, StatutChoix.BANNI}:
        return Response(
            {"detail": "Votre compte n'est ni suspendu ni banni."},
            status=status.HTTP_400_BAD_REQUEST
        )

    message = request.data.get('message', '').strip()
    if not message:
        return Response(
            {"detail": "Veuillez expliquer la raison de votre demande."},
            status=status.HTTP_400_BAD_REQUEST
        )

    demande, created = DemandeReactivation.objects.get_or_create(
        utilisateur=utilisateur,
        statut=StatutDemandeReactivation.EN_ATTENTE,
        defaults={'message': message},
    )
    if not created:
        demande.message = message
        demande.statut = StatutDemandeReactivation.EN_ATTENTE
        demande.motif_refus = ''
        demande.traite_par = None
        demande.reviewed_at = None
        demande.save(update_fields=['message', 'statut', 'motif_refus', 'traite_par', 'reviewed_at'])

    utilisateur.date_demande_reactivation = timezone.now()
    utilisateur.save(update_fields=['date_demande_reactivation'])

    notifier_admins(
        "Demande de réactivation",
        (
            f"Utilisateur : @{utilisateur.username} ({utilisateur.role})\n"
            f"Motif de sanction : {utilisateur.motif_sanction or '—'}\n"
            f"Demande : {message}\n"
            f"Date : {utilisateur.date_demande_reactivation:%d/%m/%Y à %H:%M}"
        ),
        TypeNotification.DEMANDE_REACTIVATION,
        lien='/admin/reactivations',
    )

    AuditLog.enregistrer(
        request, 'DEMANDE_REACTIVATION',
        utilisateur=utilisateur, succes=True,
        details={'message': message}
    )

    return Response({
        "message": "Votre demande de réactivation a été envoyée. L'équipe Mixo vous répondra dans les meilleurs délais."
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeDemandesReactivation(request):
    """GET /api/admin/reactivations/ — liste des demandes en attente."""
    demandes = DemandeReactivation.objects.select_related('utilisateur', 'traite_par').filter(
        statut=StatutDemandeReactivation.EN_ATTENTE,
        utilisateur__statut__in=[StatutChoix.INACTIF, StatutChoix.BANNI],
    ).order_by('-created_at')

    resultats = []
    for demande in demandes:
        utilisateur = demande.utilisateur
        resultats.append({
            "id": str(demande.id),
            "user_id": str(utilisateur.id),
            "username": utilisateur.username,
            "email": utilisateur.email,
            "role": utilisateur.role,
            "statut": utilisateur.statut,
            "motif_sanction": utilisateur.motif_sanction,
            "date_sanction": utilisateur.date_sanction.isoformat() if utilisateur.date_sanction else None,
            "conditions_reactivation": utilisateur.conditions_reactivation,
            "message": demande.message,
            "date_demande": demande.created_at.isoformat(),
        })

    return Response({"count": len(resultats), "resultats": resultats})


@api_view(['POST'])
@permission_classes([IsAuthenticated, EstAdmin])
def traiterDemandeReactivation(request, id):
    """POST /api/admin/reactivations/<uuid>/traiter/"""
    demande = get_object_or_404(DemandeReactivation.objects.select_related('utilisateur'), pk=id)
    action = request.data.get('action', '').strip().lower()
    motif_refus = request.data.get('motif_refus', '').strip()

    if demande.statut != StatutDemandeReactivation.EN_ATTENTE:
        return Response({"detail": "Cette demande a déjà été traitée."}, status=status.HTTP_400_BAD_REQUEST)

    utilisateur = demande.utilisateur
    if action == 'accepter':
        demande.accepter(admin_user=request.user)
        utilisateur.reinitialiser_sanction()
        utilisateur.statut = StatutChoix.ACTIF
        utilisateur.date_demande_reactivation = None
        utilisateur.save(update_fields=['statut', 'date_demande_reactivation'])
        notifier(
            utilisateur,
            "Réactivation acceptée",
            "Votre compte a été réactivé. Vous pouvez à nouveau accéder à Mixo.",
            TypeNotification.REACTIVATION_ACCEPTEE,
            lien='/login',
        )
        return Response({"message": "Demande acceptée.", "statut": "ACCEPTEE"})

    if action == 'refuser':
        if not motif_refus:
            return Response({"detail": "Le motif de refus est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)
        demande.refuser(motif_refus, admin_user=request.user)
        utilisateur.date_demande_reactivation = None
        utilisateur.save(update_fields=['date_demande_reactivation'])
        notifier(
            utilisateur,
            "Réactivation refusée",
            f"Votre demande de réactivation a été refusée. Motif : {motif_refus}",
            TypeNotification.REACTIVATION_REFUSEE,
            lien='/compte-suspendu',
        )
        return Response({"message": "Demande refusée.", "statut": "REFUSEE"})

    return Response({"detail": "Action invalide. Utiliser accepter ou refuser."}, status=status.HTTP_400_BAD_REQUEST)
