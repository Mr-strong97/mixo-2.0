"""0001_initial.py — MIXO · Horaires"""
import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [

        migrations.CreateModel(
            name='Horaire',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('jour_semaine', models.PositiveSmallIntegerField(
                    choices=[
                        (0, 'Lundi'), (1, 'Mardi'), (2, 'Mercredi'),
                        (3, 'Jeudi'), (4, 'Vendredi'), (5, 'Samedi'), (6, 'Dimanche'),
                    ],
                    verbose_name='Jour de la semaine',
                )),
                ('heure_debut', models.TimeField(verbose_name='Heure de début')),
                ('heure_fin', models.TimeField(verbose_name='Heure de fin')),
                ('actif', models.BooleanField(default=True, verbose_name='Créneau actif')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('coiffeur', models.ForeignKey(
                    limit_choices_to={'role': 'COIFFEUR'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='horaires',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Coiffeur',
                )),
            ],
            options={
                'verbose_name': 'Horaire',
                'verbose_name_plural': 'Horaires',
                'ordering': ['jour_semaine', 'heure_debut'],
            },
        ),

        migrations.CreateModel(
            name='DisponibiliteException',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField(verbose_name='Date concernée')),
                ('disponible', models.BooleanField(default=False, verbose_name='Disponible ce jour-là')),
                ('categorie', models.CharField(
                    choices=[
                        ('conge', 'Congé'), ('maladie', 'Maladie'), ('ferie', 'Jour férié'),
                        ('fermeture_exceptionnelle', 'Fermeture exceptionnelle'),
                        ('ouverture_exceptionnelle', 'Ouverture exceptionnelle'),
                        ('autre', 'Autre'),
                    ],
                    default='autre', max_length=30, verbose_name='Catégorie',
                )),
                ('motif', models.CharField(blank=True, max_length=255, null=True, verbose_name='Motif')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('coiffeur', models.ForeignKey(
                    limit_choices_to={'role': 'COIFFEUR'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='disponibilite_exceptions',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Coiffeur',
                )),
            ],
            options={
                'verbose_name': 'Disponibilité exceptionnelle',
                'verbose_name_plural': 'Disponibilités exceptionnelles',
                'ordering': ['-date'],
            },
        ),

        migrations.AddIndex(
            model_name='horaire',
            index=models.Index(fields=['coiffeur', 'jour_semaine'], name='horaires_coiffeur_jour_idx'),
        ),
        migrations.AddIndex(
            model_name='disponibiliteexception',
            index=models.Index(fields=['coiffeur', 'date'], name='dispo_except_coiffeur_date_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='disponibiliteexception',
            unique_together={('coiffeur', 'date')},
        ),
    ]
