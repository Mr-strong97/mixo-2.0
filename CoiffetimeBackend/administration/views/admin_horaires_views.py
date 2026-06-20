"""
admin_horaires_views.py — MIXO · Extension Espace Admin
Supervision des horaires et détection d'anomalies.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from planning.models import Horaire, DisponibiliteException
from planning.serializers.horaire_serializers import HoraireSerializer
from planning.serializers.disponibilite_serializers import DisponibiliteExceptionSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_horaires(request):
    """
    GET /api/admin/horaires/
    Liste tous les horaires, filtrable par ?coiffeur_id.
    """
    qs = Horaire.objects.select_related('coiffeur').all()
    coiffeur_id = request.query_params.get('coiffeur_id')
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)
    return Response(HoraireSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_anomalies_horaires(request):
    """
    GET /api/admin/horaires/anomalies/
    Détecte les créneaux suspects :
      - heure_fin <= heure_debut (ne devrait jamais arriver grâce à la
        validation du serializer, mais utile pour détecter des données
        importées ou corrompues directement en base)
      - chevauchements de créneaux pour un même coiffeur, le même jour
    """
    anomalies = []

    # 1) Créneaux avec heure_fin <= heure_debut
    incoherents = Horaire.objects.filter(actif=True).select_related('coiffeur')
    for h in incoherents:
        if h.heure_fin <= h.heure_debut:
            anomalies.append({
                'type':       'heures_incoherentes',
                'horaire_id': str(h.id),
                'coiffeur':   h.coiffeur.username,
                'jour':       h.get_jour_semaine_display(),
                'detail':     f"{h.heure_debut} → {h.heure_fin}",
            })

    # 2) Chevauchements — comparaison par coiffeur + jour
    par_coiffeur_jour = {}
    for h in Horaire.objects.filter(actif=True).select_related('coiffeur').order_by('coiffeur_id', 'jour_semaine', 'heure_debut'):
        cle = (h.coiffeur_id, h.jour_semaine)
        par_coiffeur_jour.setdefault(cle, []).append(h)

    for (coiffeur_id, jour), creneaux in par_coiffeur_jour.items():
        for i in range(len(creneaux) - 1):
            actuel, suivant = creneaux[i], creneaux[i + 1]
            if actuel.heure_fin > suivant.heure_debut:
                anomalies.append({
                    'type':     'chevauchement',
                    'coiffeur': actuel.coiffeur.username,
                    'jour':     actuel.get_jour_semaine_display(),
                    'detail':   f"{actuel.heure_debut}-{actuel.heure_fin} chevauche {suivant.heure_debut}-{suivant.heure_fin}",
                })

    return Response({'total_anomalies': len(anomalies), 'anomalies': anomalies})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_liste_disponibilites(request):
    """
    GET /api/admin/disponibilites/
    Liste toutes les exceptions de disponibilité, filtrable par ?coiffeur_id.
    """
    qs = DisponibiliteException.objects.select_related('coiffeur').all()
    coiffeur_id = request.query_params.get('coiffeur_id')
    if coiffeur_id:
        qs = qs.filter(coiffeur_id=coiffeur_id)
    return Response(DisponibiliteExceptionSerializer(qs, many=True).data)
