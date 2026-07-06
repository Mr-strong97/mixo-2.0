# Generated manually to persist the avatar preset selected by users.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentification', '0002_alter_client_telephone'),
    ]

    operations = [
        migrations.AddField(
            model_name='utilisateur',
            name='avatar_choice',
            field=models.CharField(blank=True, default='', max_length=30),
        ),
    ]
