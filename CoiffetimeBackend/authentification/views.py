from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Coiffeur
from .serializers import CoiffeurSerializer

@api_view(['GET'])
def listerTousLesCoiffeurs(request):
    """
    Récupère la liste de tous les coiffeurs inscrits.
    """
    tousLesCoiffeurs = Coiffeur.objects.all()
    transformateur = CoiffeurSerializer(tousLesCoiffeurs, many=True)
    
    return Response(transformateur.data)