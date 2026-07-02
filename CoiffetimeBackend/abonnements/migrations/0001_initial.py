"""
0001_initial.py — MIXO · Abonnements
"""
import uuid
import django.core.validators
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
            name='AbonnementPlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nom', models.CharField(max_length=100, verbose_name='Nom du plan')),
                ('plan', models.CharField(
                    choices=[
                        ('ESSAI', 'Essai gratuit'),
                        ('STANDARD', 'Standard'),
                        ('PREMIUM', 'Premium'),
                        ('PRO', 'Pro'),
                    ],
                    max_length=20, unique=True, verbose_name='Type de plan',
                )),
                ('prix_mensuel', models.DecimalField(
                    decimal_places=2, default=0, max_digits=8,
                    validators=[django.core.validators.MinValueValidator(0)],
                    verbose_name='Prix mensuel (FC)',
                )),
                ('duree_mois', models.PositiveIntegerField(
                    default=1,
                    validators=[django.core.validators.MinValueValidator(1)],
                    verbose_name='Durée (mois)',
                )),
                ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
                ('avantages', models.TextField(blank=True, null=True, verbose_name='Avantages')),
                ('mise_en_avant_priorite', models.PositiveIntegerField(default=0, verbose_name='Priorité de mise en avant')),
                ('actif', models.BooleanField(default=True, verbose_name='Plan actif')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': "Plan d'abonnement",
                'verbose_name_plural': "Plans d'abonnement",
                'ordering': ['prix_mensuel'],
            },
        ),

        migrations.CreateModel(
            name='AbonnementUtilisateur',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date_debut', models.DateField(verbose_name='Date de début')),
                ('date_fin', models.DateField(verbose_name='Date de fin')),
                ('actif', models.BooleanField(default=True, verbose_name='Actif')),
                ('periode_essai', models.BooleanField(default=False, verbose_name="Période d'essai")),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('coiffeur', models.ForeignKey(
                    limit_choices_to={'role': 'COIFFEUR'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='abonnements',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Coiffeur',
                )),
                ('abonnement_plan', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='souscriptions',
                    to='abonnements.abonnementplan',
                    verbose_name='Plan souscrit',
                )),
            ],
            options={
                'verbose_name': 'Abonnement utilisateur',
                'verbose_name_plural': 'Abonnements utilisateurs',
                'ordering': ['-date_debut'],
            },
        ),

        migrations.AddIndex(
            model_name='abonnementutilisateur',
            index=models.Index(fields=['coiffeur', 'actif'], name='abonnements_coiffeu_idx'),
        ),
        migrations.AddIndex(
            model_name='abonnementutilisateur',
            index=models.Index(fields=['date_fin'], name='abonnements_datefin_idx'),
        ),
    ]
