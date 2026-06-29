"""
administration/views/dashboard_view.py
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..permissions import EstAdmin
from ..services import construire_dashboard_admin


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def statistiquesDashboard(request):
    """GET /api/admin/dashboard/ — tableau de bord global de la plateforme."""
    return Response(construire_dashboard_admin())
