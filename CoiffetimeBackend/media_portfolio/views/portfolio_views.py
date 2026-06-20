from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mon_portfolio(request):
    return Response([])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reordonner_portfolio(request):
    return Response({"message": "OK"})


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_media(request, pk):
    return Response({"id": pk})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_public(request, coiffeur_id):
    return Response([])
