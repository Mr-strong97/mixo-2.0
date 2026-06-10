import uuid
import django.db.models.deletion
import django.core.validators
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        # Dépend de l'app authentification — ajuste le nom si différent
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [

        # ── CategorieService ──────────────────────────────────────
        migrations.CreateModel(
            name='CategorieService',
            fields=[
                ('id',          models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('nom',         models.CharField(max_length=80, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at',  models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Catégorie de service',
                'verbose_name_plural': 'Catégories de services',
                'ordering': ['nom'],
            },
        ),

        # ── Service ───────────────────────────────────────────────
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id',             models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('nom_prestation', models.CharField(max_length=100)),
                ('description',    models.TextField(blank=True, null=True)),
                ('duree_minutes',  models.PositiveIntegerField(
                    validators=[django.core.validators.MinValueValidator(5)],
                    help_text='Durée minimale : 5 minutes.',
                )),
                ('prix', models.DecimalField(
                    max_digits=8, decimal_places=2,
                    validators=[django.core.validators.MinValueValidator(0.01)],
                )),
                ('image',      models.ImageField(blank=True, null=True, upload_to='services/images/')),
                ('statut',     models.CharField(
                    max_length=20,
                    choices=[
                        ('actif',      'Actif'),
                        ('inactif',    'Inactif'),
                        ('en_attente', 'En attente de validation'),
                    ],
                    default='actif',
                )),
                ('actif',      models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('coiffeur', models.ForeignKey(
                    to=settings.AUTH_USER_MODEL,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='services_proposes',
                    limit_choices_to={'role': 'COIFFEUR'},
                )),
                ('categorie', models.ForeignKey(
                    to='services.CategorieService',
                    on_delete=django.db.models.deletion.SET_NULL,
                    null=True, blank=True,
                    related_name='services',
                )),
            ],
            options={
                'verbose_name': 'Service',
                'verbose_name_plural': 'Services',
                'ordering': ['-created_at'],
            },
        ),

        # ── ServiceImage ──────────────────────────────────────────
        migrations.CreateModel(
            name='ServiceImage',
            fields=[
                ('id',         models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('image',      models.ImageField(upload_to='services/galerie/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('service', models.ForeignKey(
                    to='services.Service',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='galerie',
                )),
            ],
            options={
                'verbose_name': 'Image de service',
                'verbose_name_plural': 'Images de service',
                'ordering': ['created_at'],
            },
        ),
    ]