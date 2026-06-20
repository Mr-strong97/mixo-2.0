"""0001_initial.py — MIXO · Portfolio"""
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
            name='PortfolioMedia',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('media', models.FileField(
                    upload_to='portfolio/%Y/%m/',
                    validators=[django.core.validators.FileExtensionValidator(
                        allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm']
                    )],
                    verbose_name='Fichier média',
                )),
                ('type', models.CharField(
                    choices=[('image', 'Image'), ('video', 'Vidéo')],
                    default='image', max_length=10, verbose_name='Type',
                )),
                ('titre', models.CharField(blank=True, max_length=150, null=True, verbose_name='Titre')),
                ('mis_en_avant', models.BooleanField(default=False, verbose_name='Mis en avant')),
                ('ordre', models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")),
                ('signale', models.BooleanField(default=False, verbose_name='Signalé')),
                ('motif_signalement', models.TextField(blank=True, null=True, verbose_name='Motif du signalement')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('coiffeur', models.ForeignKey(
                    limit_choices_to={'role': 'COIFFEUR'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='portfolio',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Coiffeur',
                )),
            ],
            options={
                'verbose_name': 'Média de portfolio',
                'verbose_name_plural': 'Médias de portfolio',
                'ordering': ['ordre', '-created_at'],
            },
        ),

        migrations.AddIndex(
            model_name='portfoliomedia',
            index=models.Index(fields=['coiffeur', 'ordre'], name='portfolio_coiffeur_ordre_idx'),
        ),
        migrations.AddIndex(
            model_name='portfoliomedia',
            index=models.Index(fields=['signale'], name='portfolio_signale_idx'),
        ),
    ]
