"""
administration/views/validation_view.py
Importe Notification depuis l'app notifications (pas depuis authentification).
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from authentification.models.utilisateur import Utilisateur, StatutChoix, RoleChoix
from authentification.models.audit_log   import AuditLog, ActionChoix
from authentification.services.email_service import (
    envoyer_email_suspension,
    envoyer_email_bannissement,
)
# ✅ Import depuis l'app notifications dédiée
from notifications.models import Notification, TypeNotification

from ..permissions import EstAdmin
from ..serializers.admin_serializer import (
    UtilisateurAdminSerializer,
    ValiderCompteSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeCompteEnAttente(request):
    qs = Utilisateur.objects.filter(
        role=RoleChoix.COIFFEUR, statut=StatutChoix.EN_ATTENTE
    ).order_by('date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeCoiffeursActifs(request):
    qs = Utilisateur.objects.filter(
        role=RoleChoix.COIFFEUR, statut=StatutChoix.ACTIF
    ).order_by('-date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeClients(request):
    statut = request.query_params.get('statut', StatutChoix.ACTIF).upper()
    qs = Utilisateur.objects.filter(
        role=RoleChoix.CLIENT, statut=statut
    ).order_by('-date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeTousUtilisateurs(request):
    statut = request.query_params.get('statut', '').upper()
    role   = request.query_params.get('role', '').upper()
    search = request.query_params.get('q', '').strip()

    qs = Utilisateur.objects.exclude(role=RoleChoix.ADMIN)
    if statut: qs = qs.filter(statut=statut)
    if role:   qs = qs.filter(role=role)
    if search: qs = qs.filter(
        Q(username__icontains=search) | Q(email__icontains=search)
    )

    return Response({
        "count":    qs.count(),
        "resultats": UtilisateurAdminSerializer(qs.order_by('-date_joined'), many=True).data
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EstAdmin])
def validerOuRejeterCompte(request, id):
    utilisateur = get_object_or_404(Utilisateur, id=id)
    serializer  = ValiderCompteSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    action = serializer.validated_data['action']
    raison = serializer.validated_data.get('raison', '')

    if action == 'valider':
        utilisateur.reinitialiser_sanction()
        utilisateur.statut = StatutChoix.ACTIF
        utilisateur.save(update_fields=['statut'])
        Notification.creer(
            utilisateur=utilisateur,
            titre="✅ Compte activé !",
            message="Votre compte Mixo a été validé. Bienvenue !",
            type=TypeNotification.SUCCES,
            lien='/home'
        )
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'validation'})
        return Response({"message": f"@{utilisateur.username} activé.", "statut": "ACTIF"})

    utilisateur.enregistrer_sanction(raison or 'Non conforme.', StatutChoix.BANNI)
    Notification.creer(
        utilisateur=utilisateur,
        titre="Compte rejeté",
        message=f"Votre inscription a été refusée. Motif : {raison or 'Non conforme.'}",
        type=TypeNotification.DANGER
    )
    AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                         succes=True, details={'cible': str(utilisateur.id), 'action': 'rejet', 'raison': raison})
    return Response({"message": f"@{utilisateur.username} rejeté.", "statut": "BANNI"})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EstAdmin])
def suspendreUtilisateur(request, id):
    utilisateur = get_object_or_404(Utilisateur, id=id)
    action = request.data.get('action', '').strip()
    raison = request.data.get('raison', '').strip()
    duree  = request.data.get('duree', '').strip()

    if action not in ['suspendre', 'reactiver', 'bannir']:
        return Response({"detail": "Action invalide."}, status=status.HTTP_400_BAD_REQUEST)

    if action in ['suspendre', 'bannir'] and not raison:
        return Response(
            {"detail": "Le motif est obligatoire pour suspendre ou bannir un compte."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if action == 'suspendre':
        utilisateur.enregistrer_sanction(raison, StatutChoix.INACTIF, conditions=duree)
        msg = (
            f"Votre compte a été suspendu le {utilisateur.date_sanction:%d/%m/%Y à %H:%M}."
            f"\nMotif : {raison}"
        )
        if duree: msg += f" | Durée : {duree}"
        Notification.creer(
            utilisateur=utilisateur,
            titre="⚠️ Compte suspendu",
            message=msg,
            type=TypeNotification.AVERTISSEMENT,
            lien='/compte-suspendu'
        )
        envoyer_email_suspension(utilisateur, raison, duree)
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'suspension', 'raison': raison})
        return Response({"message": f"@{utilisateur.username} suspendu.", "statut": "INACTIF"})

    elif action == 'bannir':
        utilisateur.enregistrer_sanction(raison, StatutChoix.BANNI)
        Notification.creer(
            utilisateur=utilisateur,
            titre="⛔ Compte banni",
            message=(
                f"Votre compte Mixo a été définitivement banni le "
                f"{utilisateur.date_sanction:%d/%m/%Y à %H:%M}.\nMotif : {raison}"
            ),
            type=TypeNotification.DANGER
        )
        envoyer_email_bannissement(utilisateur, raison)
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'bannissement', 'raison': raison})
        return Response({"message": f"@{utilisateur.username} banni.", "statut": "BANNI"})

    else:  # reactiver
        utilisateur.reinitialiser_sanction()
        utilisateur.statut = StatutChoix.ACTIF
        utilisateur.save(update_fields=['statut'])
        Notification.creer(
            utilisateur=utilisateur,
            titre="✅ Compte réactivé",
            message="Votre compte Mixo a été réactivé. Vous pouvez vous reconnecter.",
            type=TypeNotification.SUCCES,
            lien='/login'
        )
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'reactivation'})
        return Response({"message": f"@{utilisateur.username} réactivé.", "statut": "ACTIF"})
