"""
administration/services.py — MIXO
Helpers de consolidation des données admin.
"""
from datetime import timedelta
from collections import defaultdict

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone

from authentification.models.audit_log import AuditLog
from authentification.models.utilisateur import RoleChoix, StatutChoix, Utilisateur
from avis.models import Avis
from notifications.models import Notification
from paiements.models import Paiement
from rendez_vous.models import RendezVous
from services.models import Service


def _safe_month_series(qs, date_field):
    data = (
        qs.annotate(mois=TruncMonth(date_field))
        .values('mois')
        .annotate(total=Count('id'))
        .order_by('mois')
    )
    return [
        {"mois": row['mois'].strftime('%b %Y'), "total": row['total']}
        for row in data if row.get('mois')
    ]


def construire_dashboard_admin():
    now = timezone.now()
    six_mois = now - timedelta(days=180)
    trente_jours = now - timedelta(days=30)
    sept_jours = now - timedelta(days=7)

    users_qs = Utilisateur.objects.all()
    services_qs = Service.objects.select_related('coiffeur', 'categorie').all()
    rdv_qs = RendezVous.objects.select_related('client', 'coiffeur', 'service').all()
    paiements_qs = Paiement.objects.select_related('rendez_vous').all()
    avis_qs = Avis.objects.select_related('client', 'coiffeur', 'rendez_vous').all()
    notifications_qs = Notification.objects.select_related('utilisateur').all()

    total_utilisateurs = users_qs.count()
    total_clients = users_qs.filter(role=RoleChoix.CLIENT).count()
    total_coiffeurs = users_qs.filter(role=RoleChoix.COIFFEUR).count()
    total_admins = users_qs.filter(role=RoleChoix.ADMIN).count()
    total_services = services_qs.count()
    total_rdv = rdv_qs.count()
    total_paiements = paiements_qs.count()
    total_avis = avis_qs.count()
    total_notifications = notifications_qs.count()

    recent_users = users_qs.order_by('-date_joined')[:5]
    recent_rdv = rdv_qs.order_by('-created_at')[:5]
    recent_paiements = paiements_qs.order_by('-created_at')[:5]
    recent_services = services_qs.order_by('-created_at')[:5]
    recent_avis = avis_qs.order_by('-created_at')[:5]

    services_populaires = list(
        services_qs.annotate(nb_favoris=Count('favoris_service', distinct=True))
        .order_by('-nb_favoris', '-created_at')[:5]
        .values('id', 'nom_prestation', 'nb_favoris')
    )
    services_reserves = list(
        services_qs.annotate(nb_reservations=Count('rendez_vous', distinct=True))
        .order_by('-nb_reservations', '-created_at')[:5]
        .values('id', 'nom_prestation', 'nb_reservations')
    )

    inscriptions_total = _safe_month_series(
        users_qs.filter(date_joined__gte=six_mois),
        'date_joined'
    )
    inscriptions_clients = _safe_month_series(
        users_qs.filter(role=RoleChoix.CLIENT, date_joined__gte=six_mois),
        'date_joined'
    )
    inscriptions_coiffeurs = _safe_month_series(
        users_qs.filter(role=RoleChoix.COIFFEUR, date_joined__gte=six_mois),
        'date_joined'
    )

    rendezvous_par_jour = list(
        rdv_qs.filter(created_at__gte=trente_jours)
        .annotate(jour=TruncDay('created_at'))
        .values('jour')
        .annotate(total=Count('id'))
        .order_by('jour')
    )
    rendezvous_par_jour = [
        {"jour": row['jour'].strftime('%d %b'), "total": row['total']}
        for row in rendezvous_par_jour if row.get('jour')
    ]

    rendezvous_par_mois = _safe_month_series(
        rdv_qs.filter(created_at__gte=six_mois),
        'created_at'
    )
    rdv_statuts = list(rdv_qs.values('statut').annotate(total=Count('id')))

    paiements_valides = paiements_qs.filter(statut='PAYE')
    paiements_echoues = paiements_qs.filter(statut='ECHOUE')
    paiements_par_mois = _safe_month_series(
        paiements_valides.filter(created_at__gte=six_mois),
        'created_at'
    )
    revenus = paiements_valides.aggregate(
        montant_total=Sum('montant_total'),
        commission=Sum('montant_commission'),
    )

    paiements_par_methode = list(
        paiements_valides.values('methode')
        .annotate(total=Count('id'), montant=Sum('montant_total'))
        .order_by('-total')
    )

    avis_par_mois = _safe_month_series(
        avis_qs.filter(created_at__gte=six_mois),
        'created_at'
    )
    notifications_par_mois = _safe_month_series(
        notifications_qs.filter(created_at__gte=six_mois),
        'created_at'
    )

    recent_activity = []
    for user in recent_users:
        recent_activity.append({
            'type': 'user',
            'label': 'Nouvel utilisateur',
            'username': user.username,
            'role': user.role,
            'created_at': user.date_joined,
        })
    for rdv in recent_rdv:
        recent_activity.append({
            'type': 'rdv',
            'label': 'Nouveau rendez-vous',
            'client': rdv.client.username if rdv.client_id else '—',
            'username': rdv.client.username if rdv.client_id else '—',
            'coiffeur': rdv.coiffeur.username if rdv.coiffeur_id else '—',
            'created_at': rdv.created_at,
        })
    for paiement in recent_paiements:
        recent_activity.append({
            'type': 'paiement',
            'label': 'Paiement traité',
            'username': paiement.rendez_vous.client.username if paiement.rendez_vous_id else '—',
            'statut': paiement.statut,
            'created_at': paiement.created_at,
        })
    for service in recent_services:
        recent_activity.append({
            'type': 'service',
            'label': 'Service publié',
            'username': service.coiffeur.username if service.coiffeur_id else '—',
            'nom': service.nom_prestation,
            'created_at': service.created_at,
        })
    for avis in recent_avis:
        recent_activity.append({
            'type': 'avis',
            'label': 'Nouvel avis',
            'username': avis.client.username if avis.client_id else '—',
            'note': avis.note,
            'created_at': avis.created_at,
        })
    recent_activity.sort(key=lambda item: item['created_at'], reverse=True)

    return {
        'totaux': {
            'utilisateurs': total_utilisateurs,
            'clients': total_clients,
            'coiffeurs': total_coiffeurs,
            'administrateurs': total_admins,
            'services': total_services,
            'rendez_vous': total_rdv,
            'paiements': total_paiements,
            'avis': total_avis,
            'notifications': total_notifications,
        },
        'recent_activity': recent_activity[:12],
        'recent_users': [
            {
                'id': str(u.id),
                'username': u.username,
                'role': u.role,
                'date_joined': u.date_joined,
                'last_login': u.last_login,
            }
            for u in recent_users
        ],
        'recent_rendez_vous': [
            {
                'id': str(r.id),
                'client': r.client.username if r.client_id else '—',
                'coiffeur': r.coiffeur.username if r.coiffeur_id else '—',
                'service': r.service_nom_snapshot,
                'statut': r.statut,
                'date_heure_debut': r.date_heure_debut,
            }
            for r in recent_rdv
        ],
        'recent_paiements': [
            {
                'id': str(p.id),
                'transaction_id': p.transaction_id,
                'methode': p.methode,
                'statut': p.statut,
                'montant_total': p.montant_total,
                'created_at': p.created_at,
            }
            for p in recent_paiements
        ],
        'recent_services': [
            {
                'id': str(s.id),
                'nom_prestation': s.nom_prestation,
                'coiffeur': s.coiffeur.username if s.coiffeur_id else '—',
                'statut': s.statut,
                'created_at': s.created_at,
            }
            for s in recent_services
        ],
        'recent_avis': [
            {
                'id': str(a.id),
                'client': a.client.username if a.client_id else '—',
                'coiffeur': a.coiffeur.username if a.coiffeur_id else '—',
                'note': a.note,
                'created_at': a.created_at,
            }
            for a in recent_avis
        ],
        'graphiques': {
            'utilisateurs': {
                'inscriptions_total': inscriptions_total,
                'inscriptions_clients': inscriptions_clients,
                'inscriptions_coiffeurs': inscriptions_coiffeurs,
                'repartition_roles': [
                    {'label': 'Clients', 'valeur': total_clients, 'couleur': '#0A66C2'},
                    {'label': 'Coiffeurs', 'valeur': total_coiffeurs, 'couleur': '#93C5FD'},
                    {'label': 'Administrateurs', 'valeur': total_admins, 'couleur': '#7C3AED'},
                ],
            },
            'services': {
                'populaires': services_populaires,
                'reserves': services_reserves,
            },
            'rendez_vous': {
                'par_jour': rendezvous_par_jour,
                'par_mois': rendezvous_par_mois,
                'par_statut': [
                    {'label': row['statut'], 'valeur': row['total'], 'couleur': {
                        'EN_ATTENTE': '#D97706',
                        'ACCEPTE': '#16A34A',
                        'REFUSE': '#DC2626',
                        'ANNULE': '#94A3B8',
                        'SUSPENDU': '#7C3AED',
                        'TERMINE': '#0A66C2',
                    }.get(row['statut'], '#6B7280')}
                    for row in rdv_statuts
                ],
            },
            'paiements': {
                'revenus': [
                    {'label': 'Revenus', 'valeur': float(revenus['montant_total'] or 0), 'couleur': '#0A66C2'},
                    {'label': 'Commission', 'valeur': float(revenus['commission'] or 0), 'couleur': '#7C3AED'},
                ],
                'par_mois': paiements_par_mois,
                'par_methode': [
                    {'label': row['methode'], 'valeur': row['total'], 'montant': float(row['montant'] or 0), 'couleur': '#1D4ED8'}
                    for row in paiements_par_methode
                ],
                'valide': paiements_valides.count(),
                'echoue': paiements_echoues.count(),
            },
            'avis': {
                'par_mois': avis_par_mois,
                'moyenne': round(float(avis_qs.aggregate(moy=Avg('note'))['moy'] or 0), 2),
                'total': total_avis,
            },
            'notifications': {
                'par_mois': notifications_par_mois,
                'total': total_notifications,
            },
        },
    }


def lister_sessions_utilisateur(user):
    tokens = []
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
        qs = OutstandingToken.objects.filter(user=user).order_by('-created_at')
        blacklisted = set(
            BlacklistedToken.objects.filter(token__user=user).values_list('token__jti', flat=True)
        )
        for token in qs[:10]:
            tokens.append({
                'jti': token.jti,
                'created_at': token.created_at,
                'expires_at': token.expires_at,
                'blacklisted': token.jti in blacklisted,
            })
    except Exception:
        pass
    return tokens


def revoquer_sessions_utilisateur(user, current_jti=None):
    revoked = 0
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
        qs = OutstandingToken.objects.filter(user=user)
        if current_jti:
            qs = qs.exclude(jti=current_jti)
        for token in qs:
            _, created = BlacklistedToken.objects.get_or_create(token=token)
            if created:
                revoked += 1
    except Exception:
        pass
    return revoked
