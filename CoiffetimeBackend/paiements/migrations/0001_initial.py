"""0001_initial.py — MIXO · Paiements"""
import uuid
import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('rendez_vous', '0001_initial'),
    ]

    operations = [

        migrations.CreateModel(
            name='Paiement',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('montant_total', models.DecimalField(
                    decimal_places=2, max_digits=10,
                    validators=[django.core.validators.MinValueValidator(Decimal('0.01'))],
                    verbose_name='Montant total (€)',
                )),
                ('montant_commission', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Commission plateforme (€)')),
                ('montant_coiffeur', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Part coiffeur (€)')),
                ('statut', models.CharField(
                    choices=[
                        ('EN_ATTENTE', 'En attente'), ('PAYE', 'Payé'),
                        ('ECHOUE', 'Échoué'), ('REMBOURSE', 'Remboursé'),
                    ],
                    default='EN_ATTENTE', max_length=20, verbose_name='Statut',
                )),
                ('methode', models.CharField(
                    choices=[
                        ('AIRTEL_MONEY', 'Airtel Money'), ('ORANGE_MONEY', 'Orange Money'),
                        ('MPESA', 'M-Pesa'), ('AFRICELL_MONEY', 'Africell Money'),
                    ],
                    max_length=20, verbose_name='Méthode',
                )),
                ('transaction_id', models.CharField(max_length=100, unique=True, verbose_name='ID transaction')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('rendez_vous', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='paiements',
                    to='rendez_vous.rendezvous',
                    verbose_name='Rendez-vous',
                )),
            ],
            options={
                'verbose_name': 'Paiement',
                'verbose_name_plural': 'Paiements',
                'ordering': ['-created_at'],
            },
        ),

        migrations.AddIndex(
            model_name='paiement',
            index=models.Index(fields=['rendez_vous', 'statut'], name='paiement_rdv_statut_idx'),
        ),
        migrations.AddIndex(
            model_name='paiement',
            index=models.Index(fields=['statut'], name='paiement_statut_idx'),
        ),
    ]
