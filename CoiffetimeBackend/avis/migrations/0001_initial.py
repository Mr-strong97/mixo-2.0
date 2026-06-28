"""0001_initial.py — MIXO · Avis"""
import uuid
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('rendez_vous', '0001_initial'),
    ]

    operations = [

        migrations.CreateModel(
            name='Avis',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('note', models.PositiveSmallIntegerField(
                    validators=[
                        django.core.validators.MinValueValidator(1),
                        django.core.validators.MaxValueValidator(5),
                    ],
                    verbose_name='Note (1 à 5)',
                )),
                ('commentaire', models.TextField(blank=True, null=True, verbose_name='Commentaire')),
                ('reponse_coiffeur', models.TextField(blank=True, null=True, verbose_name='Réponse du coiffeur')),
                ('signale', models.BooleanField(default=False, verbose_name='Signalé')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(
                    limit_choices_to={'role': 'CLIENT'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='avis_donnes',
                    to=settings.AUTH_USER_MODEL, verbose_name='Client',
                )),
                ('coiffeur', models.ForeignKey(
                    limit_choices_to={'role': 'COIFFEUR'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='avis_recus',
                    to=settings.AUTH_USER_MODEL, verbose_name='Coiffeur',
                )),
                ('rendez_vous', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='avis',
                    to='rendez_vous.rendezvous', verbose_name='Rendez-vous',
                )),
            ],
            options={
                'verbose_name': 'Avis',
                'verbose_name_plural': 'Avis',
                'ordering': ['-created_at'],
            },
        ),

        migrations.AddIndex(
            model_name='avis',
            index=models.Index(fields=['coiffeur', 'note'], name='avis_coiffeur_note_idx'),
        ),
        migrations.AddIndex(
            model_name='avis',
            index=models.Index(fields=['signale'], name='avis_signale_idx'),
        ),
    ]
