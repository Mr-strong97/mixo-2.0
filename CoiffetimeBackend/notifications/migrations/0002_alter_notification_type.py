from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(
                choices=[
                    ('INFO', 'Information'),
                    ('SUCCES', 'Succès'),
                    ('AVERTISSEMENT', 'Avertissement'),
                    ('DANGER', 'Danger'),
                    ('SYSTEME', 'Système'),
                    ('RDV_DEMANDE_ENVOYEE', 'Demande envoyée'),
                    ('RDV_NOUVELLE_DEMANDE', 'Nouvelle demande'),
                    ('RDV_ACCEPTE', 'Rendez-vous accepté'),
                    ('RDV_REFUSE', 'Rendez-vous refusé'),
                    ('RDV_ANNULE', 'Rendez-vous annulé'),
                    ('RDV_MODIFIE', 'Rendez-vous modifié'),
                    ('PAIEMENT_VALIDE', 'Paiement validé'),
                    ('PAIEMENT_RECU', 'Paiement reçu'),
                    ('PAIEMENT_ECHOUE', 'Paiement échoué'),
                    ('PAIEMENT_ECHEC_ADMIN', 'Échec paiement'),
                    ('AVIS_DEMANDE', 'Demande d’avis'),
                    ('AVIS_REPONSE_COIFFEUR', 'Réponse du coiffeur'),
                    ('NOUVEL_AVIS', 'Nouvel avis'),
                    ('NOUVEL_UTILISATEUR', 'Nouvel utilisateur'),
                    ('SIGNALEMENT', 'Signalement'),
                    ('ALERTE_SYSTEME', 'Alerte système'),
                ],
                default='INFO',
                max_length=32,
            ),
        ),
    ]
