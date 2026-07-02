"""
admin_abonnements_views.py — MIXO · Module Abonnements désactivé
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status


def _module_desactive():
    return Response(
        {
            "detail": "Le module Abonnements est désactivé dans la Version 1 de Mixo.",
            "resultats": [],
            "count": 0,
        },
        status=status.HTTP_410_GONE,
    )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_abonnements(request):
    return _module_desactive()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_abonnements(request):
    return Response({
        "essais_actifs": 0,
        "payants_actifs": 0,
        "expires": 0,
        "total": 0,
        "message": "Les abonnements sont désactivés en Version 1.",
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_liste_plans(request):
    return _module_desactive()


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_detail_plan(request, pk):
    return _module_desactive()
