"""
admin_rendezvous_views.py — MIXO
Supervision globale des rendez-vous, avec actions administratives.
"""
from datetime import timedelta
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from authentification.models.audit_log import AuditLog, ActionChoix
from rendez_vous.models import RendezVous
from rendez_vous.services import notifier_demande_avis
from ..serializers.admin_rendezvous_serializers import (
    AdminRendezVousDetailSerializer,
    AdminRendezVousListSerializer,
    AdminRendezVousUpdateSerializer,
)


class AdminRendezVousPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


def _log(request, action, rendezvous, succes=True, details=None):
    AuditLog.enregistrer(
        request,
        action,
        utilisateur=request.user,
        succes=succes,
        details={
            'rendez_vous': str(rendezvous.id),
            **(details or {}),
        },
    )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_rendezvous(request):
    """
    GET /api/admin/extended/rendez-vous/
    Filtres :
        ?statut
        ?coiffeur_id
        ?client_id
        ?service_id
        ?date
        ?search
    """
    qs = RendezVous.objects.select_related('client', 'coiffeur', 'service', 'paiement').all()

    statut = request.query_params.get('statut', '').strip()
    coiffeur_id = request.query_params.get('coiffeur_id', '').strip()
    client_id = request.query_params.get('client_id', '').strip()
    service_id = request.query_params.get('service_id', '').strip()
    date = request.query_params.get('date', '').strip()
    search = request.query_params.get('search', '').strip()

    if statut:
        qs = qs.filter(statut=statut)
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)
    if client_id:
        qs = qs.filter(client_id=client_id)
    if service_id:
        qs = qs.filter(service_id=service_id)
    if date:
        qs = qs.filter(date_heure_debut__date=date)
    if search:
        qs = qs.filter(
            Q(client__username__icontains=search)
            | Q(coiffeur__username__icontains=search)
            | Q(service_nom_snapshot__icontains=search)
        )

    qs = qs.order_by('-date_heure_debut')
    paginator = AdminRendezVousPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(AdminRendezVousListSerializer(page, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_detail_rendezvous(request, pk):
    rdv = get_object_or_404(
        RendezVous.objects.select_related('client', 'coiffeur', 'service', 'paiement'),
        pk=pk,
    )
    return Response(AdminRendezVousDetailSerializer(rdv, context={'request': request}).data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
@transaction.atomic
def admin_modifier_rendezvous(request, pk):
    rdv = get_object_or_404(
        RendezVous.objects.select_related('client', 'coiffeur', 'service', 'paiement'),
        pk=pk,
    )
    ancien = {
        'statut': rdv.statut,
        'date_heure_debut': rdv.date_heure_debut.isoformat() if rdv.date_heure_debut else None,
        'date_heure_fin': rdv.date_heure_fin.isoformat() if rdv.date_heure_fin else None,
        'service': str(rdv.service_id) if rdv.service_id else None,
    }

    ancien_statut = rdv.statut
    serializer = AdminRendezVousUpdateSerializer(rdv, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated = serializer.save()
    if 'date_heure_debut' in serializer.validated_data and 'date_heure_fin' not in serializer.validated_data:
        updated.date_heure_fin = updated.date_heure_debut + timedelta(minutes=updated.service_duree_snapshot or 30)
        updated.save(update_fields=['date_heure_fin', 'updated_at'])

    nouveau = {
        'statut': updated.statut,
        'date_heure_debut': updated.date_heure_debut.isoformat() if updated.date_heure_debut else None,
        'date_heure_fin': updated.date_heure_fin.isoformat() if updated.date_heure_fin else None,
        'service': str(updated.service_id) if updated.service_id else None,
    }
    if ancien_statut != 'TERMINE' and updated.statut == 'TERMINE':
        notifier_demande_avis(updated)
    _log(request, ActionChoix.ADMIN_RDV_MODIF, updated, details={'ancien': ancien, 'nouveau': nouveau})
    return Response(AdminRendezVousDetailSerializer(updated, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
@transaction.atomic
def admin_annuler_rendezvous(request, pk):
    rdv = get_object_or_404(RendezVous.objects.select_related('client', 'coiffeur', 'service'), pk=pk)
    ancien = {'statut': rdv.statut}
    rdv.statut = 'ANNULE'
    rdv.save(update_fields=['statut', 'updated_at'])
    _log(request, ActionChoix.ADMIN_RDV_ANNULE, rdv, details={'ancienne_valeur': ancien, 'nouvelle_valeur': {'statut': rdv.statut}, 'motif': request.data.get('motif', '')})
    return Response({
        'message': 'Rendez-vous annulé.',
        'rendez_vous': AdminRendezVousDetailSerializer(rdv, context={'request': request}).data,
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
@transaction.atomic
def admin_suspendre_rendezvous(request, pk):
    rdv = get_object_or_404(RendezVous.objects.select_related('client', 'coiffeur', 'service'), pk=pk)
    motif = request.data.get('motif', '').strip()
    ancien = {'statut': rdv.statut}
    rdv.statut = 'SUSPENDU'
    rdv.save(update_fields=['statut', 'updated_at'])
    _log(request, ActionChoix.ADMIN_RDV_SUSPEND, rdv, details={'ancienne_valeur': ancien, 'nouvelle_valeur': {'statut': rdv.statut}, 'action': 'suspension', 'motif': motif})
    return Response({
        'message': 'Rendez-vous suspendu.',
        'rendez_vous': AdminRendezVousDetailSerializer(rdv, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_rendezvous(request):
    qs = RendezVous.objects.all()
    par_statut = {row['statut']: row['n'] for row in qs.values('statut').annotate(n=Count('id'))}
    return Response({
        'total': qs.count(),
        'en_attente': par_statut.get('EN_ATTENTE', 0),
        'acceptes': par_statut.get('ACCEPTE', 0),
        'refuses': par_statut.get('REFUSE', 0),
        'annules': par_statut.get('ANNULE', 0),
        'suspendus': par_statut.get('SUSPENDU', 0),
        'termines': par_statut.get('TERMINE', 0),
    })
