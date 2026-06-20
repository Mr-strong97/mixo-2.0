"""
0002_seed_plans.py — MIXO · Abonnements
Insère les 4 plans par défaut : Essai, Standard, Premium, Pro.
"""
import uuid
from django.db import migrations

PLANS = [
    {
        'nom': 'Essai gratuit',
        'plan': 'ESSAI',
        'prix_mensuel': 0,
        'duree_mois': 1,
        'description': "14 jours de visibilité premium offerts à tout nouveau coiffeur.",
        'avantages': "Mise en avant dans les recherches\nGalerie illimitée\nStatistiques de base",
        'mise_en_avant_priorite': 1,
    },
    {
        'nom': 'Standard',
        'plan': 'STANDARD',
        'prix_mensuel': 9.99,
        'duree_mois': 1,
        'description': "Pour les coiffeurs qui démarrent leur activité.",
        'avantages': "Jusqu'à 10 services actifs\nGalerie 8 photos par service\nStatistiques de base",
        'mise_en_avant_priorite': 1,
    },
    {
        'nom': 'Premium',
        'plan': 'PREMIUM',
        'prix_mensuel': 19.99,
        'duree_mois': 1,
        'description': "Visibilité renforcée pour développer sa clientèle.",
        'avantages': "Services illimités\nMise en avant prioritaire\nStatistiques avancées\nBadge Premium",
        'mise_en_avant_priorite': 2,
    },
    {
        'nom': 'Pro',
        'plan': 'PRO',
        'prix_mensuel': 39.99,
        'duree_mois': 1,
        'description': "Pour les salons établis qui veulent maximiser leur visibilité.",
        'avantages': "Tout Premium inclus\nMise en avant maximale\nSupport prioritaire\nBadge Pro Certifié",
        'mise_en_avant_priorite': 3,
    },
]


def seed_plans(apps, schema_editor):
    AbonnementPlan = apps.get_model('abonnements', 'AbonnementPlan')
    for data in PLANS:
        AbonnementPlan.objects.get_or_create(
            plan=data['plan'],
            defaults={**data, 'id': uuid.uuid4(), 'actif': True},
        )


def supprimer_plans(apps, schema_editor):
    AbonnementPlan = apps.get_model('abonnements', 'AbonnementPlan')
    AbonnementPlan.objects.filter(plan__in=[p['plan'] for p in PLANS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('abonnements', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_plans, supprimer_plans),
    ]
