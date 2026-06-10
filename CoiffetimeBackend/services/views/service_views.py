"""
service_views.py — MIXO · Vues du module Services

Sécurité :
  - JWT via IsAuthenticated (globallement dans settings.py)
  - Contrôle de rôle granulaire (IsCoiffeur, IsOwnerService, IsClientReadOnly)
  - Vérification explicite du propriétaire sur chaque mutation
  - Journalisation automatique de toutes les actions sensibles

Performance :
  - select_related + prefetch_related systématiques
  - Pagination côté serveur (20 résultats par page)
  - Index DB déclarés dans le modèle (voir service.py)
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from ..models import Service, ServiceImage, CategorieService
from ..serializers.service_serializers import (
    ServiceSerializer,
    ServiceDetailSerializer,
    ServiceImageSerializer,
    CategorieServiceSerializer,
)

# Import du modèle AuditLog — adapte le chemin à ton architecture
try:
    from authentification.models.audit_log import AuditLog
    AUDIT_ENABLED = True
except ImportError:
    AUDIT_ENABLED = False


# ══════════════════════════════════════════════════════════════
#  HELPERS INTERNES
# ══════════════════════════════════════════════════════════════

class ServicePagination(PageNumberPagination):
    """Pagination standard : 20 services par page, max 100."""
    page_size            = 20
    page_size_query_param = 'page_size'
    max_page_size        = 100


def _journal(request, action: str, ressource: str, succes: bool = True):
    """Enregistre une entrée dans l'AuditLog si disponible."""
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
        pass  # La journalisation ne doit jamais bloquer l'action principale


def _get_ip(request) -> str:
    """Extrait l'adresse IP réelle depuis les headers proxy."""
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def _is_coiffeur(user) -> bool:
    return getattr(user, 'role', None) == 'COIFFEUR'


def _is_owner(service, user) -> bool:
    """Vérifie que l'utilisateur est le propriétaire du service OU admin."""
    return service.coiffeur == user or bool(user.is_staff)


# ══════════════════════════════════════════════════════════════
#  CATÉGORIES
# ══════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_categories(request):
    """
    GET  → liste toutes les catégories (tous rôles authentifiés)
    POST → crée une catégorie (admin uniquement)
    """
    if request.method == 'GET':
        categories = CategorieService.objects.all()
        return Response(CategorieServiceSerializer(categories, many=True).data)

    if not request.user.is_staff:
        return Response(
            {"error": "Réservé aux administrateurs."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = CategorieServiceSerializer(data=request.data)
    if serializer.is_valid():
        categorie = serializer.save()
        _journal(request, 'CREATE_CATEGORIE', f'CategorieService:{categorie.id}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_categorie(request, pk):
    """
    GET    → détail (tous rôles authentifiés)
    PATCH  → modifier (admin)
    DELETE → supprimer (admin)
    """
    categorie = get_object_or_404(CategorieService, pk=pk)

    if request.method == 'GET':
        return Response(CategorieServiceSerializer(categorie).data)

    if not request.user.is_staff:
        return Response(
            {"error": "Réservé aux administrateurs."},
            status=status.HTTP_403_FORBIDDEN,
        )

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


# ══════════════════════════════════════════════════════════════
#  SERVICES — LISTE & CRÉATION
# ══════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_services(request):
    """
    GET  → liste paginée des services avec filtres :
             ?coiffeur_id  ?categorie_id  ?statut  ?search  ?prix_max  ?ville
           Sans filtre, retourne uniquement les services actifs pour les clients.
    POST → créer un service (coiffeur uniquement)
    """
    if request.method == 'GET':
        # Base queryset optimisée
        qs = (
            Service.objects
            .select_related('coiffeur', 'categorie')
            .prefetch_related('galerie')
        )

        # Les clients ne voient que les services actifs
        if not _is_coiffeur(request.user) and not request.user.is_staff:
            qs = qs.filter(statut='actif', actif=True)

        # ── Filtres ──────────────────────────────────────────
        coiffeur_id  = request.query_params.get('coiffeur_id')
        categorie_id = request.query_params.get('categorie_id')
        statut       = request.query_params.get('statut')
        search       = request.query_params.get('search', '').strip()
        prix_max     = request.query_params.get('prix_max')
        ville        = request.query_params.get('ville', '').strip()

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

        # ── Pagination ──────────────────────────────────────
        paginator = ServicePagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ServiceSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    # ── POST : création ─────────────────────────────────────
    if not _is_coiffeur(request.user):
        _journal(request, 'CREATE_SERVICE_DENIED', 'Service', succes=False)
        return Response(
            {"error": "Seuls les coiffeurs peuvent créer des services."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = ServiceSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        service = serializer.save(coiffeur=request.user)
        _journal(request, 'CREATE_SERVICE', f'Service:{service.id}')
        return Response(
            ServiceSerializer(service, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════════════════════
#  SERVICES — MES SERVICES (coiffeur connecté)
# ══════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_services(request):
    """
    GET /api/services/mes-services/
    Retourne les services du coiffeur connecté (tous statuts).
    Réservé aux coiffeurs.
    """
    if not _is_coiffeur(request.user):
        return Response(
            {"error": "Réservé aux coiffeurs."},
            status=status.HTTP_403_FORBIDDEN,
        )

    qs = (
        Service.objects
        .filter(coiffeur=request.user)
        .select_related('categorie')
        .prefetch_related('galerie')
    )

    paginator = ServicePagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = ServiceSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


# ══════════════════════════════════════════════════════════════
#  SERVICES — DÉTAIL, MISE À JOUR, SUPPRESSION
# ══════════════════════════════════════════════════════════════

@api_view(['GET', 'PATCH', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_service(request, pk):
    """
    GET         → détail enrichi avec galerie (tous rôles)
    PATCH / PUT → modifier (propriétaire ou admin)
    DELETE      → supprimer (propriétaire ou admin)
    """
    service = get_object_or_404(
        Service.objects
        .select_related('coiffeur', 'categorie')
        .prefetch_related('galerie'),
        pk=pk,
    )

    if request.method == 'GET':
        # Les clients ne peuvent voir que les services actifs
        if not _is_owner(service, request.user) and not service.est_actif:
            return Response(
                {"error": "Ce service n'est pas disponible."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ServiceDetailSerializer(service, context={'request': request}).data)

    # ── Vérification propriété ───────────────────────────────
    if not _is_owner(service, request.user):
        _journal(request, 'UNAUTHORIZED_SERVICE_ACCESS', f'Service:{service.id}', succes=False)
        return Response(
            {"error": "Vous n'êtes pas autorisé à modifier ce service."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == 'DELETE':
        service_id = str(service.id)
        service.delete()
        _journal(request, 'DELETE_SERVICE', f'Service:{service_id}')
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH / PUT
    partial = request.method == 'PATCH'
    serializer = ServiceSerializer(
        service, data=request.data, partial=partial, context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        _journal(request, 'UPDATE_SERVICE', f'Service:{service.id}')
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════════════════════
#  TOGGLE STATUT : ACTIVER / DÉSACTIVER
# ══════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activer_service(request, pk):
    """POST /api/services/<uuid>/activer/ — propriétaire ou admin"""
    service = get_object_or_404(Service, pk=pk)

    if not _is_owner(service, request.user):
        return Response({"error": "Interdit."}, status=status.HTTP_403_FORBIDDEN)

    service.statut = 'actif'
    service.actif  = True
    service.save(update_fields=['statut', 'actif', 'updated_at'])
    _journal(request, 'ACTIVER_SERVICE', f'Service:{service.id}')
    return Response({"message": "Service activé.", "statut": service.statut, "actif": service.actif})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def desactiver_service(request, pk):
    """POST /api/services/<uuid>/desactiver/ — propriétaire ou admin"""
    service = get_object_or_404(Service, pk=pk)

    if not _is_owner(service, request.user):
        return Response({"error": "Interdit."}, status=status.HTTP_403_FORBIDDEN)

    service.statut = 'inactif'
    service.actif  = False
    service.save(update_fields=['statut', 'actif', 'updated_at'])
    _journal(request, 'DESACTIVER_SERVICE', f'Service:{service.id}')
    return Response({"message": "Service désactivé.", "statut": service.statut, "actif": service.actif})


# ══════════════════════════════════════════════════════════════
#  GALERIE D'IMAGES
# ══════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def galerie_service(request, pk):
    """
    GET  → liste les images (tous rôles authentifiés)
    POST → ajoute une image (propriétaire uniquement, multipart/form-data)
    """
    service = get_object_or_404(Service, pk=pk)

    if request.method == 'GET':
        images = service.galerie.all()
        return Response(ServiceImageSerializer(images, many=True).data)

    if not _is_owner(service, request.user):
        return Response({"error": "Interdit."}, status=status.HTTP_403_FORBIDDEN)

    # Limite : max 8 images par service
    if service.galerie.count() >= 8:
        return Response(
            {"error": "Limite de 8 images par service atteinte."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = ServiceImageSerializer(data=request.data)
    if serializer.is_valid():
        image = serializer.save(service=service)
        _journal(request, 'ADD_IMAGE_GALERIE', f'Service:{service.id}/Image:{image.id}')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_image_service(request, service_pk, image_pk):
    """DELETE /api/services/<uuid>/galerie/<uuid>/delete/ — propriétaire ou admin"""
    service = get_object_or_404(Service, pk=service_pk)
    image   = get_object_or_404(ServiceImage, pk=image_pk, service=service)

    if not _is_owner(service, request.user):
        return Response({"error": "Interdit."}, status=status.HTTP_403_FORBIDDEN)

    _journal(request, 'DELETE_IMAGE_GALERIE', f'Service:{service.id}/Image:{image.id}')
    image.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)