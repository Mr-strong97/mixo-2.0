"""historique/services.py — MIXO · Construction de l'historique client"""
from datetime import datetime

from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date

from avis.models import Avis
from paiements.models import Paiement
from rendez_vous.models import RendezVous


def _parse_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    return parse_date(str(value))


def _date_matches(dt, date_filter):
    if not date_filter:
        return True
    return getattr(dt, 'date', lambda: None)() == date_filter


def construire_historique_client(client, params):
    type_f = (params.get('type') or '').lower().strip()
    statut_f = (params.get('statut') or '').upper().strip()
    search = (params.get('search') or '').strip().lower()
    date_f = _parse_date(params.get('date'))

    items = []

    rdv_qs = RendezVous.objects.select_related('service', 'coiffeur', 'paiement').filter(client=client)
    if statut_f:
        rdv_qs = rdv_qs.filter(statut=statut_f)
    if date_f:
        rdv_qs = rdv_qs.filter(date_heure_debut__date=date_f)
    if search:
        rdv_qs = rdv_qs.filter(
            Q(service_nom_snapshot__icontains=search) |
            Q(coiffeur__username__icontains=search) |
            Q(statut__icontains=search)
        )

    if type_f in ('', 'rdv', 'rendez-vous', 'rendezvous'):
        for rdv in rdv_qs:
            items.append({
                'id': f'rdv-{rdv.id}',
                'type': 'RDV',
                'titre': f"Rendez-vous {rdv.get_statut_display().lower()}",
                'sous_titre': rdv.service_nom_snapshot,
                'statut': rdv.statut,
                'date': rdv.date_heure_debut,
                'montant': rdv.service_prix_snapshot,
                'note': None,
                'commentaire': None,
                'reponse': None,
                'lien': f"/rendez-vous/{rdv.id}",
                'service': rdv.service_nom_snapshot,
                'coiffeur': getattr(rdv.coiffeur, 'username', ''),
            })

    paiements_qs = Paiement.objects.select_related('rendez_vous', 'rendez_vous__coiffeur').filter(rendez_vous__client=client)
    if statut_f:
        paiements_qs = paiements_qs.filter(statut=statut_f)
    if date_f:
        paiements_qs = paiements_qs.filter(created_at__date=date_f)
    if search:
        paiements_qs = paiements_qs.filter(
            Q(transaction_id__icontains=search) |
            Q(rendez_vous__service_nom_snapshot__icontains=search) |
            Q(rendez_vous__coiffeur__username__icontains=search)
        )

    if type_f in ('', 'paiement', 'payments', 'payment'):
        for paiement in paiements_qs:
            items.append({
                'id': f'pay-{paiement.id}',
                'type': 'PAIEMENT',
                'titre': f"Paiement {paiement.get_statut_display().lower()}",
                'sous_titre': paiement.rendez_vous.service_nom_snapshot,
                'statut': paiement.statut,
                'date': paiement.created_at,
                'montant': paiement.montant_total,
                'note': None,
                'commentaire': None,
                'reponse': None,
                'lien': f"/paiement/{paiement.rendez_vous_id}",
                'service': paiement.rendez_vous.service_nom_snapshot,
                'coiffeur': getattr(paiement.rendez_vous.coiffeur, 'username', ''),
            })

    avis_qs = Avis.objects.select_related('rendez_vous', 'coiffeur').filter(client=client)
    if date_f:
        avis_qs = avis_qs.filter(created_at__date=date_f)
    if search:
        avis_qs = avis_qs.filter(
            Q(commentaire__icontains=search) |
            Q(reponse_coiffeur__icontains=search) |
            Q(rendez_vous__service_nom_snapshot__icontains=search)
        )

    if type_f in ('', 'avis', 'review', 'reviews'):
        for avis in avis_qs:
            items.append({
                'id': f'avis-{avis.id}',
                'type': 'AVIS',
                'titre': f"Avis {avis.note}/5",
                'sous_titre': avis.rendez_vous.service_nom_snapshot,
                'statut': 'POSTE',
                'date': avis.created_at,
                'montant': None,
                'note': avis.note,
                'commentaire': avis.commentaire or '',
                'reponse': avis.reponse_coiffeur or '',
                'lien': f"/avis/{avis.id}",
                'service': avis.rendez_vous.service_nom_snapshot,
                'coiffeur': getattr(avis.coiffeur, 'username', ''),
            })

    items.sort(key=lambda item: item['date'], reverse=True)
    return items


def resumer_historique(items):
    stats = {'rdv': 0, 'paiements': 0, 'avis': 0}
    for item in items:
        if item['type'] == 'RDV':
            stats['rdv'] += 1
        elif item['type'] == 'PAIEMENT':
            stats['paiements'] += 1
        elif item['type'] == 'AVIS':
            stats['avis'] += 1
    return stats

