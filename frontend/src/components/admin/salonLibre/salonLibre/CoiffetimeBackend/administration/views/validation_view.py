"""
administration/views/validation_view.py
Suspension : motif OBLIGATOIRE + email + notification.
Bannissement : motif OBLIGATOIRE + email, aucune réactivation.
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from authentification.models.utilisateur import Utilisateur, StatutChoix, RoleChoix
from authentification.models.audit_log   import AuditLog, ActionChoix
from authentification.services.email_service import (
    envoyer_email_suspension,
    envoyer_email_bannissement,
)
from ..permissions import EstAdmin
from ..serializers.admin_serializer import (
    UtilisateurAdminSerializer,
    ValiderCompteSerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeCompteEnAttente(request):
    qs = Utilisateur.objects.filter(role=RoleChoix.COIFFEUR, statut=StatutChoix.EN_ATTENTE).order_by('date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeCoiffeursActifs(request):
    qs = Utilisateur.objects.filter(role=RoleChoix.COIFFEUR, statut=StatutChoix.ACTIF).order_by('-date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeClients(request):
    statut = request.query_params.get('statut', StatutChoix.ACTIF).upper()
    qs = Utilisateur.objects.filter(role=RoleChoix.CLIENT, statut=statut).order_by('-date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def listeTousUtilisateurs(request):
    """GET /api/admin/comptes/tous/ — liste complète avec filtres."""
    statut = request.query_params.get('statut', '').upper()
    role   = request.query_params.get('role', '').upper()
    search = request.query_params.get('q', '').strip()

    qs = Utilisateur.objects.exclude(role=RoleChoix.ADMIN)
    if statut: qs = qs.filter(statut=statut)
    if role:   qs = qs.filter(role=role)
    if search:
        qs = qs.filter(username__icontains=search) | qs.filter(email__icontains=search)

    qs = qs.order_by('-date_joined')
    return Response({"count": qs.count(), "resultats": UtilisateurAdminSerializer(qs, many=True).data})


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
        utilisateur.statut = StatutChoix.ACTIF
        utilisateur.save(update_fields=['statut'])
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'validation'})
        return Response({"message": f"Compte @{utilisateur.username} activé.", "statut": "ACTIF"})

    utilisateur.statut = StatutChoix.BANNI
    utilisateur.save(update_fields=['statut'])
    AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                         succes=True, details={'cible': str(utilisateur.id), 'action': 'rejet', 'raison': raison})
    return Response({"message": f"Compte @{utilisateur.username} rejeté.", "statut": "BANNI"})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EstAdmin])
def suspendreUtilisateur(request, id):
    """
    PATCH /api/admin/comptes/{id}/suspendre/
    { "action": "suspendre"|"reactiver", "raison": "..." (OBLIGATOIRE pour suspendre/bannir) }
    """
    utilisateur = get_object_or_404(Utilisateur, id=id)
    action = request.data.get('action', '').strip()
    raison = request.data.get('raison', '').strip()
    duree  = request.data.get('duree', '').strip()

    if action not in ['suspendre', 'reactiver', 'bannir']:
        return Response({"detail": "Action invalide. Valeurs: suspendre | reactiver | bannir"},
                        status=status.HTTP_400_BAD_REQUEST)

    # ── Motif OBLIGATOIRE pour suspendre et bannir ──
    if action in ['suspendre', 'bannir'] and not raison:
        return Response(
            {"detail": "Le motif est obligatoire pour suspendre ou bannir un compte."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if action == 'suspendre':
        utilisateur.statut = StatutChoix.INACTIF
        utilisateur.save(update_fields=['statut'])
        envoyer_email_suspension(utilisateur, raison, duree)
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'suspension', 'raison': raison})
        return Response({"message": f"Compte @{utilisateur.username} suspendu.", "statut": "INACTIF"})

    elif action == 'bannir':
        utilisateur.statut = StatutChoix.BANNI
        utilisateur.save(update_fields=['statut'])
        envoyer_email_bannissement(utilisateur, raison)
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'bannissement', 'raison': raison})
        return Response({"message": f"Compte @{utilisateur.username} banni définitivement.", "statut": "BANNI"})

    else:  # reactiver
        utilisateur.statut = StatutChoix.ACTIF
        utilisateur.save(update_fields=['statut'])
        AuditLog.enregistrer(request, ActionChoix.MODIF_PROFIL, utilisateur=request.user,
                             succes=True, details={'cible': str(utilisateur.id), 'action': 'reactivation'})
        return Response({"message": f"Compte @{utilisateur.username} réactivé.", "statut": "ACTIF"})