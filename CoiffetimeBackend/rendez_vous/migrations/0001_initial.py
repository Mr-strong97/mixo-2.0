"""0001_initial.py — MIXO · Rendez-vous (sans le FK paiement — cf. 0002)"""
import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('services', '0001_initial'),
    ]

    operations = [

        migrations.CreateModel(
            name='RendezVous',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('service_nom_snapshot', models.CharField(max_length=100, verbose_name='Nom du service (figé)')),
                ('service_prix_snapshot', models.DecimalField(decimal_places=2, max_digits=8, verbose_name='Prix (figé)')),
                ('service_duree_snapshot', models.PositiveIntegerField(verbose_name='Durée en minutes (figée)')),
                ('date_heure_debut', models.DateTimeField(verbose_name='Début')),
                ('date_heure_fin', models.DateTimeField(verbose_name='Fin')),
                ('statut', models.CharField(
                    choices=[
                        ('EN_ATTENTE', 'En attente'), ('ACCEPTE', 'Accepté'),
                        ('REFUSE', 'Refusé'), ('ANNULE', 'Annulé'), ('TERMINE', 'Terminé'),
                    ],
                    default='EN_ATTENTE', max_length=20, verbose_name='Statut',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('client', models.ForeignKey(
                    limit_choices_to={'role': 'CLIENT'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='rendez_vous_client',
                    to=settings.AUTH_USER_MODEL, verbose_name='Client',
                )),
                ('coiffeur', models.ForeignKey(
                    limit_choices_to={'role': 'COIFFEUR'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='rendez_vous_coiffeur',
                    to=settings.AUTH_USER_MODEL, verbose_name='Coiffeur',
                )),
                ('service', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='rendez_vous',
                    to='services.service', verbose_name='Service',
                )),
            ],
            options={
                'verbose_name': 'Rendez-vous',
                'verbose_name_plural': 'Rendez-vous',
                'ordering': ['-date_heure_debut'],
            },
        ),

        migrations.AddIndex(
            model_name='rendezvous',
            index=models.Index(fields=['coiffeur', 'statut'], name='rdv_coiffeur_statut_idx'),
        ),
        migrations.AddIndex(
            model_name='rendezvous',
            index=models.Index(fields=['client', 'statut'], name='rdv_client_statut_idx'),
        ),
        migrations.AddIndex(
            model_name='rendezvous',
            index=models.Index(fields=['date_heure_debut'], name='rdv_date_debut_idx'),
        ),
    ]
