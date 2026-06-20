"""
administration/views/reactivation_view.py
L'utilisateur suspendu envoie une demande.
L'admin l'accepte ou la refuse.
"""
from django.db import models
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers

from authentification.models.utilisateur import Utilisateur, StatutChoix
from authentification.models.audit_log   import AuditLog, ActionChoix
from ..permissions import EstAdmin


# ── Modèle inline (ajouter dans administration/models.py) ──────
# class DemandeReactivation(models.Model):
#     utilisateur  = models.ForeignKey('authentification.Utilisateur', on_delete=models.CASCADE)
#     message      = models.TextField()
#     statut       = models.CharField(max_length=20, default='EN_ATTENTE')  # EN_ATTENTE|ACCEPTE|REFUSE
#     cree_le      = models.DateTimeField(auto_now_add=True)
#     traite_le    = models.DateTimeField(null=True)
#     raison_refus = models.TextField(blank=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def demanderReactivation(request):
    """
    POST /api/auth/reactivation/demander/
    Accessible à l'utilisateur suspendu pour soumettre une demande.
    Body: { "message": "..." }
    """
    utilisateur = request.user

    if utilisateur.statut != StatutChoix.INACTIF:
        return Response(
            {"detail": "Votre compte n'est pas suspendu."},
            status=status.HTTP_400_BAD_REQUEST
        )

    message = request.data.get('message', '').strip()
    if not message:
        return Response(
            {"detail": "Veuillez expliquer la raison de votre demande."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # En attendant le modèle DemandeReactivation, on log dans AuditLog
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
    # Utilisateurs suspendus ayant soumis une demande (via AuditLog)
    from authentification.models.audit_log import AuditLog
    demandes = AuditLog.objects.filter(
        action='DEMANDE_REACTIVATION'
    ).select_related('utilisateur').order_by('-created_at')

    resultats = []
    for d in demandes:
        if d.utilisateur and d.utilisateur.statut == StatutChoix.INACTIF:
            resultats.append({
                "id":           d.id,
                "user_id":      str(d.utilisateur.id),
                "username":     d.utilisateur.username,
                "email":        d.utilisateur.email,
                "message":      d.details.get('message', ''),
                "date_demande": d.created_at.isoformat(),
            })

    return Response({"count": len(resultats), "resultats": resultats})
