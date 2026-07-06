"""dashboard_coiffeur/services.py — MIXO · Agrégation du dashboard coiffeur"""
from datetime import timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from avis.models import Avis
from paiements.models import Paiement
from rendez_vous.models import RendezVous
from services.models import Service
from authentification.models.utilisateur import Utilisateur


def _service_image_value(service):
    image = getattr(service, 'image', None)
    if not image:
        return None
    return image.url if hasattr(image, 'url') else image


def _date_range(start, end):
    return [start + timedelta(days=i) for i in range((end - start).days + 1)]


def construire_dashboard_coiffeur(coiffeur):
    now = timezone.localdate()
    start_week = now - timedelta(days=now.weekday())
    start_month = now.replace(day=1)
    start_chart = now - timedelta(days=13)

    rdv_qs = RendezVous.objects.select_related('client', 'service', 'paiement').filter(coiffeur=coiffeur)
    paiement_qs = Paiement.objects.select_related('rendez_vous', 'rendez_vous__client', 'rendez_vous__service').filter(
        rendez_vous__coiffeur=coiffeur,
        statut__in=['PAYE_EN_LIGNE', 'PAYE_SUR_PLACE', 'PAYE'],
    )
    avis_qs = Avis.objects.select_related('client', 'rendez_vous', 'rendez_vous__service').filter(coiffeur=coiffeur)
    service_qs = Service.objects.select_related('categorie').filter(coiffeur=coiffeur)

    total_rdv = rdv_qs.count()
    rdv_today = rdv_qs.filter(date_heure_debut__date=now).count()
    rdv_week = rdv_qs.filter(date_heure_debut__date__gte=start_week).count()
    total_services = service_qs.count()
    total_clients = rdv_qs.values('client_id').distinct().count()

    revenus_total = paiement_qs.aggregate(total=Sum('montant_total'))['total'] or Decimal('0.00')
    revenus_jour = paiement_qs.filter(created_at__date=now).aggregate(total=Sum('montant_total'))['total'] or Decimal('0.00')
    revenus_semaine = paiement_qs.filter(created_at__date__gte=start_week).aggregate(total=Sum('montant_total'))['total'] or Decimal('0.00')
    revenus_mois = paiement_qs.filter(created_at__date__gte=start_month).aggregate(total=Sum('montant_total'))['total'] or Decimal('0.00')

    stats_avis = avis_qs.aggregate(note_moyenne=Avg('note'), total=Count('id'))
    note_moyenne = round(float(stats_avis['note_moyenne'] or 0), 2)
    total_avis = stats_avis['total'] or 0

    recent_rdv = [
        {
            'id': str(rdv.id),
            'client_username': rdv.client.username,
            'service_nom': rdv.service_nom_snapshot,
            'date_heure_debut': rdv.date_heure_debut,
            'date_heure_fin': rdv.date_heure_fin,
            'statut': rdv.statut,
        }
        for rdv in rdv_qs.order_by('-date_heure_debut')[:8]
    ]

    recent_avis = [
        {
            'id': str(avis.id),
            'client_username': avis.client.username,
            'service_nom': avis.rendez_vous.service_nom_snapshot,
            'note': avis.note,
            'commentaire': avis.commentaire or '',
            'reponse_coiffeur': avis.reponse_coiffeur or '',
            'created_at': avis.created_at,
        }
        for avis in avis_qs.order_by('-created_at')[:8]
    ]

    top_services = [
        {
            'id': str(service.id),
            'nom_prestation': service.nom_prestation,
            'total_reservations': getattr(service, 'total_reservations', 0),
            'note_moyenne': round(float(getattr(service, 'note_moyenne', 0) or 0), 2),
            'revenu_total': getattr(service, 'revenu_total', None),
            'image': _service_image_value(service),
        }
        for service in service_qs.annotate(
            total_reservations=Count('rendez_vous'),
            note_moyenne=Avg('rendez_vous__avis__note'),
        ).order_by('-total_reservations', '-created_at')[:5]
    ]

    top_services_revenus = [
        {
            'id': str(service.id),
            'nom_prestation': service.nom_prestation,
            'total_reservations': getattr(service, 'total_reservations', 0),
            'note_moyenne': round(float(getattr(service, 'note_moyenne', 0) or 0), 2),
            'revenu_total': getattr(service, 'revenu_total', None),
            'image': _service_image_value(service),
        }
        for service in service_qs.annotate(
            revenu_total=Sum('rendez_vous__paiements__montant_total'),
            note_moyenne=Avg('rendez_vous__avis__note'),
            total_reservations=Count('rendez_vous'),
        ).order_by('-revenu_total', '-created_at')[:5]
    ]

    chart_rdv = []
    chart_revenus = []
    chart_avis = []

    for day in _date_range(start_chart, now):
        chart_rdv.append({
            'date': day.isoformat(),
            'total': rdv_qs.filter(date_heure_debut__date=day).count(),
        })
        chart_revenus.append({
            'date': day.isoformat(),
            'total': float(paiement_qs.filter(created_at__date=day).aggregate(total=Sum('montant_total'))['total'] or 0),
        })
        chart_avis.append({
            'date': day.isoformat(),
            'total': avis_qs.filter(created_at__date=day).count(),
        })

    return {
        'indicateurs': {
            'total_rendezvous': total_rdv,
            'rendezvous_aujourdhui': rdv_today,
            'rendezvous_semaine': rdv_week,
            'total_services': total_services,
            'total_clients': total_clients,
            'revenus_generes': float(revenus_total),
            'nombre_avis': total_avis,
            'note_moyenne': note_moyenne,
        },
        'revenus': {
            'jour': float(revenus_jour),
            'semaine': float(revenus_semaine),
            'mois': float(revenus_mois),
            'total': float(revenus_total),
        },
        'rendezvous_recents': recent_rdv,
        'avis_recents': recent_avis,
        'services_populaires': top_services,
        'services_plus_rentables': top_services_revenus,
        'graphiques': {
            'rendezvous': chart_rdv,
            'revenus': chart_revenus,
            'avis': chart_avis,
        },
    }


def construire_stats_globales_coiffeurs():
    rdv_qs = RendezVous.objects.select_related('coiffeur').all()
    avis_qs = Avis.objects.select_related('coiffeur').all()
    service_qs = Service.objects.select_related('coiffeur').all()

    coiffeurs = []
    for coiffeur in Utilisateur.objects.filter(role='COIFFEUR').select_related('profil_coiffeur'):
        coiffeur_rdv = rdv_qs.filter(coiffeur=coiffeur)
        coiffeur_avis = avis_qs.filter(coiffeur=coiffeur)
        coiffeur_services = service_qs.filter(coiffeur=coiffeur)
        coiffeur_paiements = Paiement.objects.filter(
            rendez_vous__coiffeur=coiffeur,
            statut__in=['PAYE_EN_LIGNE', 'PAYE_SUR_PLACE', 'PAYE'],
        )
        coiffeurs.append({
            'id': str(coiffeur.id),
            'username': coiffeur.username,
            'total_rendezvous': coiffeur_rdv.count(),
            'total_services': coiffeur_services.count(),
            'total_clients': coiffeur_rdv.values('client_id').distinct().count(),
            'revenus': float(coiffeur_paiements.aggregate(total=Sum('montant_total'))['total'] or 0),
            'avis': coiffeur_avis.count(),
            'note_moyenne': round(float(coiffeur_avis.aggregate(avg=Avg('note'))['avg'] or 0), 2),
        })
    return coiffeurs
