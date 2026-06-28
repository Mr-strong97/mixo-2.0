from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import OperationalError
from django.db.models import Count, Avg, Exists, OuterRef

from ..models import Service, ServiceImage, CategorieService
from ..serializers.service_serializers import (
    ServiceSerializer,
    ServiceDetailSerializer,
    ServiceImageSerializer,
    CategorieServiceSerializer,
)

try:
    from authentification.models.audit_log import AuditLog
    AUDIT_ENABLED = True
except ImportError:
    AUDIT_ENABLED = False


class ServicePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


def _journal(request, action: str, ressource: str, succes: bool = True):
    if not AUDIT_ENABLED:
        return
    try:
        AuditLog.objects.create(
            utilisateur=request.user,
            action=action,
            ressource=ressource,
            ip_adresse=_get_ip(request),
            succes=succes,
        )
    except Exception:
        pass


def _get_ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def _is_coiffeur(user) -> bool:
    return getattr(user, 'role', None) == 'COIFFEUR'


def _is_owner(service, user) -> bool:
    return service.coiffeur == user or bool(user.is_staff)


def _verifier_proprietaire(request, service):
    if service.coiffeur_id != request.user.id and not request.user.is_staff:
        raise PermissionDenied("Vous n'êtes pas le propriétaire de ce service.")


def _annoter_stats_services(qs, request=None):
    try:
        qs = qs.annotate(
            nb_favoris_agg=Count('favoris_service', distinct=True),
            nb_avis_agg=Count('rendez_vous__avis', distinct=True),
            note_moyenne_agg=Avg('rendez_vous__avis__note'),
        )
    except OperationalError:
        qs = qs.annotate(
            nb_avis_agg=Count('rendez_vous__avis', distinct=True),
            note_moyenne_agg=Avg('rendez_vous__avis__note'),
        )
    if request and getattr(request.user, 'is_authenticated', False) and getattr(request.user, 'role', None) == 'CLIENT':
        try:
            from favoris.models import Favori
            qs = qs.annotate(
                est_favori_agg=Exists(
                    Favori.objects.filter(client=request.user, service_id=OuterRef('pk'))
                )
            )
        except Exception:
            pass
    return qs


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_categories(request):
    if request.method == 'GET':
        categories = CategorieService.objects.all()
        return Response(CategorieServiceSerializer(categories, many=True).data)

    if not request.user.is_staff:
        return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)

    serializer = CategorieServiceSerializer(data=request.data)
    if serializer.is_valid():
        categorie = serializer.save()
        _journal(request, 'CREATE_CATEGORIE', f'CategorieService:{categorie.id}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_categorie(request, pk):
    categorie = get_object_or_404(CategorieService, pk=pk)

    if request.method == 'GET':
        return Response(CategorieServiceSerializer(categorie).data)

    if not request.user.is_staff:
        return Response({"error": "Réservé aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        _journal(request, 'DELETE_CATEGORIE', f'CategorieService:{categorie.id}')
        categorie.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CategorieServiceSerializer(categorie, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        _journal(request, 'UPDATE_CATEGORIE', f'CategorieService:{categorie.id}')
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def liste_services(request):
    if request.method == 'GET':
        qs = Service.objects.select_related('coiffeur', 'categorie').prefetch_related('galerie')
        if not _is_coiffeur(request.user) and not request.user.is_staff:
            qs = qs.filter(statut='actif', actif=True)

        coiffeur_id = request.query_params.get('coiffeur_id')
        categorie_id = request.query_params.get('categorie_id')
        statut = request.query_params.get('statut')
        search = request.query_params.get('search', '').strip()
        prix_max = request.query_params.get('prix_max')
        ville = request.query_params.get('ville', '').strip()

        if coiffeur_id:
            qs = qs.filter(coiffeur_id=coiffeur_id)
        if categorie_id:
            qs = qs.filter(categorie_id=categorie_id)
        if statut and (_is_coiffeur(request.user) or request.user.is_staff):
            qs = qs.filter(statut=statut)
        if search:
            qs = qs.filter(nom_prestation__icontains=search)
        if prix_max:
            try:
                qs = qs.filter(prix__lte=float(prix_max))
            except ValueError:
                pass
        if ville:
            qs = qs.filter(ville__icontains=ville)
        qs = _annoter_stats_services(qs, request)

        paginator = ServicePagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ServiceSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    if not _is_coiffeur(request.user):
        _journal(request, 'CREATE_SERVICE_DENIED', 'Service', succes=False)
        return Response({"detail": "Seuls les coiffeurs peuvent créer des services."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ServiceSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        service = serializer.save(coiffeur=request.user)
        _journal(request, 'CREATE_SERVICE', f'Service:{service.id}')
        return Response(ServiceDetailSerializer(service, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_services(request):
    if not _is_coiffeur(request.user):
        return Response({"error": "Réservé aux coiffeurs."}, status=status.HTTP_403_FORBIDDEN)

    qs = Service.objects.filter(coiffeur=request.user).select_related('categorie').prefetch_related('galerie')
    search = request.query_params.get('search', '').strip()
    statut = request.query_params.get('statut', '').strip()
    categorie_id = request.query_params.get('categorie_id')

    if search:
        qs = qs.filter(nom_prestation__icontains=search)
    if statut:
        qs = qs.filter(statut=statut)
    if categorie_id:
        qs = qs.filter(categorie_id=categorie_id)
    qs = _annoter_stats_services(qs, request)

    paginator = ServicePagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = ServiceSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_services(request):
    qs = Service.objects.filter(coiffeur=request.user)
    total = qs.count()
    actifs = qs.filter(statut='actif', actif=True).count()
    desactives = total - actifs

    reservations_liees = 0
    top_prestations = []

    try:
        from rendez_vous.models import RendezVous
        reservations_liees = RendezVous.objects.filter(service__coiffeur=request.user).count()
        top_qs = qs.annotate(nb_reservations=Count('rendez_vous')).order_by('-nb_reservations')[:3]
        for s in top_qs:
            top_prestations.append({
                'id': str(s.id),
                'nom_prestation': s.nom_prestation,
                'image': request.build_absolute_uri(s.image.url) if s.image else None,
                'nb_reservations': getattr(s, 'nb_reservations', 0),
            })
    except Exception:
        for s in qs.order_by('-created_at')[:3]:
            top_prestations.append({
                'id': str(s.id),
                'nom_prestation': s.nom_prestation,
                'image': request.build_absolute_uri(s.image.url) if s.image else None,
                'nb_reservations': 0,
            })

    return Response({
        'total': total,
        'actifs': actifs,
        'desactives': desactives,
        'reservations_liees': reservations_liees,
        'top_prestations': top_prestations,
    })


@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def detail_service(request, pk):
    service = get_object_or_404(_annoter_stats_services(
        Service.objects.select_related('coiffeur', 'categorie').prefetch_related('galerie'),
        request,
    ), pk=pk)

    if request.method == 'GET':
        if not _is_owner(service, request.user) and service.statut != 'actif':
            return Response({"error": "Ce service n'est pas disponible."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ServiceDetailSerializer(service, context={'request': request}).data)

    _verifier_proprietaire(request, service)

    if request.method == 'DELETE':
        service_id = str(service.id)
        service.delete()
        _journal(request, 'DELETE_SERVICE', f'Service:{service_id}')
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial = request.method == 'PATCH'
    serializer = ServiceSerializer(service, data=request.data, partial=partial, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        _journal(request, 'UPDATE_SERVICE', f'Service:{service.id}')
        return Response(ServiceDetailSerializer(service, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activer_service(request, pk):
    service = get_object_or_404(Service, pk=pk)
    _verifier_proprietaire(request, service)
    service.statut = 'actif'
    service.actif = True
    service.save(update_fields=['statut', 'actif', 'updated_at'])
    _journal(request, 'ACTIVER_SERVICE', f'Service:{service.id}')
    return Response({"message": "Service activé.", "statut": service.statut, "actif": service.actif})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def desactiver_service(request, pk):
    service = get_object_or_404(Service, pk=pk)
    _verifier_proprietaire(request, service)
    service.statut = 'inactif'
    service.actif = False
    service.save(update_fields=['statut', 'actif', 'updated_at'])
    _journal(request, 'DESACTIVER_SERVICE', f'Service:{service.id}')
    return Response({"message": "Service désactivé.", "statut": service.statut, "actif": service.actif})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def galerie_service(request, pk):
    service = get_object_or_404(Service, pk=pk)

    if request.method == 'GET':
        images = service.galerie.all()
        return Response(ServiceImageSerializer(images, many=True).data)

    _verifier_proprietaire(request, service)

    if service.galerie.count() >= 8:
        return Response({"error": "Limite de 8 images par service atteinte."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ServiceImageSerializer(data=request.data)
    if serializer.is_valid():
        image = serializer.save(service=service)
        _journal(request, 'ADD_IMAGE_GALERIE', f'Service:{service.id}/Image:{image.id}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_image_service(request, service_pk, image_pk):
    service = get_object_or_404(Service, pk=service_pk)
    image = get_object_or_404(ServiceImage, pk=image_pk, service=service)
    _verifier_proprietaire(request, service)
    _journal(request, 'DELETE_IMAGE_GALERIE', f'Service:{service.id}/Image:{image.id}')
    image.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
