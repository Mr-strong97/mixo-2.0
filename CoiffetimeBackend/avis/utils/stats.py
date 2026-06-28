"""
stats.py — MIXO · Module Avis
Calcul de la note moyenne et de la répartition des notes d'un coiffeur.
"""
from django.db.models import Avg, Count
from ..models import Avis


def calculer_stats_avis(coiffeur) -> dict:
    qs = Avis.objects.filter(coiffeur=coiffeur)
    total = qs.count()

    if total == 0:
        return {
            'note_moyenne': 0,
            'total': 0,
            'repartition': {str(i): 0 for i in range(1, 6)},
        }

    note_moyenne = qs.aggregate(moy=Avg('note'))['moy'] or 0

    repartition = {str(i): 0 for i in range(1, 6)}
    for ligne in qs.values('note').annotate(nb=Count('id')):
        repartition[str(ligne['note'])] = ligne['nb']

    return {
        'note_moyenne': round(note_moyenne, 2),
        'total': total,
        'repartition': repartition,
    }
