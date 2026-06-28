"""
0002_add_paiement_fk.py — MIXO · Rendez-vous
Ajoute le FK `paiement` sur RendezVous, maintenant que l'app `paiements`
existe. Cette séparation en 2 migrations évite toute dépendance
circulaire entre les apps rendez_vous ↔ paiements.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rendez_vous', '0001_initial'),
        ('paiements', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='rendezvous',
            name='paiement',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='rendez_vous_associe',
                to='paiements.paiement',
                verbose_name='Paiement',
            ),
        ),
    ]
