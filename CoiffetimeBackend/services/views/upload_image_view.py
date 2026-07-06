"""
services/views/upload_image_view.py
Upload une image vers le stockage média local et renvoie son URL.
"""
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from django.utils.text import get_valid_filename
from pathlib import Path


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def uploaderImageService(request):
    """
    POST /api/services/upload-image/
    Form-data: { "image": <fichier> }
    """
    fichier = request.FILES.get('image')

    if not fichier:
        return Response({"detail": "Aucun fichier fourni."}, status=status.HTTP_400_BAD_REQUEST)

    # Limite de taille (5 Mo par exemple)
    if fichier.size > 5 * 1024 * 1024:
        return Response({"detail": "Image trop volumineuse (max 5 Mo)."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        nom_fichier = get_valid_filename(Path(fichier.name).name)
        chemin = default_storage.save(f"services/uploads/{nom_fichier}", ContentFile(fichier.read()))
        url = default_storage.url(chemin)
    except Exception as e:
        return Response({"detail": f"Échec de l'upload : {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({
        "url": url,
        "path": chemin,
    }, status=status.HTTP_201_CREATED)
