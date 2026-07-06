# Generated manually to persist the avatar preset selected at signup.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentification', '0004_utilisateur_firebase_uid'),
    ]

    operations = [
        migrations.AddField(
            model_name='utilisateur',
            name='avatar_choice',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
    ]
