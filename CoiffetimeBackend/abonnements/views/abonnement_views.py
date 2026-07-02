"""
abonnement_views.py — MIXO · Module Abonnements désactivé en Version 1
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_plans(request):
    return _module_desactive()


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_plan(request, pk):
    return _module_desactive()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mon_statut_abonnement(request):
    return Response({
        "a_abonnement": False,
        "periode_essai": False,
        "expire": False,
        "plan": None,
        "plan_nom": "Version 1 gratuite",
        "jours_restants": None,
        "message": "Les abonnements sont désactivés en Version 1.",
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mon_historique_abonnements(request):
    return _module_desactive()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def souscrire_plan(request, plan_id):
    return _module_desactive()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def annuler_abonnement(request):
    return _module_desactive()
