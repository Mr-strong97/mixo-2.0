"""
admin_services_views.py — MIXO · Extension Espace Admin
Supervision globale des services (tous coiffeurs confondus).

⚠️ Importe depuis l'app `services` existante — suppose que
services.serializers.service_serializers expose ServiceSerializer
et ServiceDetailSerializer (cf. corrections appliquées précédemment
dans ce projet).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q

from services.models import Service
from services.serializers.service_serializers import ServiceSerializer, ServiceDetailSerializer


class AdminServicePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_services(request):
    """
    GET /api/admin/services/
    Liste tous les services, tous coiffeurs confondus, avec filtres :
        ?search  ?statut  ?categorie_id  ?coiffeur_id
    """
    qs = Service.objects.select_related('coiffeur', 'categorie').all()

    search       = request.query_params.get('search', '').strip()
    statut       = request.query_params.get('statut', '').strip()
    categorie_id = request.query_params.get('categorie_id')
    coiffeur_id  = request.query_params.get('coiffeur_id')

    if search:
        qs = qs.filter(
            Q(nom_prestation__icontains=search) | Q(coiffeur__username__icontains=search)
        )
    if statut:
        qs = qs.filter(statut=statut)
    if categorie_id:
        qs = qs.filter(categorie_id=categorie_id)
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)

    paginator = AdminServicePagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = ServiceSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_detail_service(request, pk):
    """GET /api/admin/services/<uuid>/ — détail complet, vue admin."""
    service = get_object_or_404(Service.objects.select_related('coiffeur', 'categorie'), pk=pk)
    return Response(ServiceDetailSerializer(service, context={'request': request}).data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_suspendre_service(request, pk):
    """PATCH /api/admin/services/<uuid>/suspendre/ — passe le service en statut 'en_attente'."""
    service = get_object_or_404(Service, pk=pk)
    service.statut = 'en_attente'
    service.actif  = False
    service.save(update_fields=['statut', 'actif', 'updated_at'])
    return Response({"message": "Service suspendu.", "statut": service.statut})


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_supprimer_service(request, pk):
    """DELETE /api/admin/services/<uuid>/ — suppression définitive par un admin."""
    service = get_object_or_404(Service, pk=pk)
    service.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
