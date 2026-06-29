from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from ..models import Service, Avis, Horaire
from ..serializers.service_serializers import ServiceSerializer, AvisSerializer, HoraireSerializer

# --- LOGIQUE GÉNÉRIQUE POUR LES VUES ---

def generer_liste_create(request, model, serializer_class, user_field):
    if request.method == 'GET':
        objets = model.objects.all()
        serializer = serializer_class(objets, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(**{user_field: request.user})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_services(request):
    return generer_liste_create(request, Service, ServiceSerializer, 'createur')

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_service(request, pk):
    obj = get_object_or_404(Service, pk=pk)
    if request.method == 'GET':
        return Response(ServiceSerializer(obj).data)
    
    # Sécurité : Seul le créateur modifie
    if obj.createur != request.user:
        return Response({"error": "Interdit"}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    serializer = ServiceSerializer(obj, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Tu peux dupliquer cette logique pour Avis et Horaires




# la logique  pour avis

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_avis(request):
    if request.method == 'GET':
        coiffeur_id = request.query_params.get('coiffeur_id')
        if coiffeur_id:
            avis = Avis.objects.filter(coiffeur_id=coiffeur_id)
        else:
            avis = Avis.objects.all()
        serializer = AvisSerializer(avis, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # Vérification 1 : Seuls les clients peuvent laisser un avis
        if request.user.role != 'CLIENT':
            return Response(
                {"error": "Seuls les clients peuvent laisser des avis."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AvisSerializer(data=request.data)
        if serializer.is_valid():
            coiffeur = serializer.validated_data.get('coiffeur')

            # Vérification 2 : Empêcher l'auto-notation (comparaison des instances d'utilisateurs)
            if request.user == coiffeur:
                return Response(
                    {"error": "Action interdite : vous ne pouvez pas noter votre propre profil coiffeur."},
                    status=status.HTTP_403_FORBIDDEN
                )

            try:
                # Sauvegarde en injectant le client connecté
                serializer.save(client=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                # Capture les erreurs levées par la méthode clean() du modèle (ex: unique_together)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                return Response(
                    {"error": "Vous avez déjà laissé un avis pour ce coiffeur."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_avis(request, pk):
    # Utilisation de l'UUID pour la récupération
    avis = get_object_or_404(Avis, pk=pk)

    if request.method == 'GET':
        return Response(AvisSerializer(avis).data)

    # Sécurité : Seul l'auteur (le client) peut modifier ou supprimer son avis
    if avis.client != request.user:
        return Response(
            {"error": "Vous n'avez pas la permission d'agir sur cet avis."}, 
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'DELETE':
        avis.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Pour PUT et PATCH
    serializer = AvisSerializer(avis, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# View horaires

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def liste_horaires(request):
    if request.method == 'GET':
        # Filtrer par coiffeur si précisé (?coiffeur_id=...)
        coiffeur_id = request.query_params.get('coiffeur_id')
        if coiffeur_id:
            horaires = Horaire.objects.filter(coiffeur_id=coiffeur_id)
        else:
            horaires = Horaire.objects.all()
        serializer = HoraireSerializer(horaires, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        # Seuls les coiffeurs ou admins peuvent créer des horaires
        if request.user.role != 'COIFFEUR' and not request.user.is_staff:
            return Response({"error": "Seuls les coiffeurs peuvent définir leurs horaires."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        # Sécurité : un coiffeur ne peut créer des horaires que pour lui-même
        if request.user.role == 'COIFFEUR':
            data['coiffeur'] = request.user.id

        serializer = HoraireSerializer(data=data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_horaire(request, pk):
    horaire = get_object_or_404(Horaire, pk=pk)

    if request.method == 'GET':
        return Response(HoraireSerializer(horaire).data)

    # Sécurité : Un coiffeur ne peut modifier que ses propres horaires
    if horaire.coiffeur != request.user and not request.user.is_staff:
        return Response({"error": "Vous n'avez pas la permission de modifier cet horaire."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        horaire.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = HoraireSerializer(horaire, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)