"""0003_legacy_schema_fix.py — compatibilité avec l'ancien schéma rendez_vous.

La base SQLite du workspace contient encore l'ancien couple de colonnes
`date_heure` / `date_creation`. Cette migration aligne la table sur le
modèle Python actuel sans casser les données existantes.
"""
from datetime import timedelta

from django.db import migrations, models
from django.utils import timezone


def _table_columns(connection, table_name):
    with connection.cursor() as cursor:
        return {column.name for column in connection.introspection.get_table_description(cursor, table_name)}


def backfill_legacy_schema(apps, schema_editor):
    RendezVous = apps.get_model('rendez_vous', 'RendezVous')
    table_name = RendezVous._meta.db_table
    columns = _table_columns(schema_editor.connection, table_name)

    # On ne change la structure que si la base est encore sur l'ancien schéma.
    if 'date_heure' in columns and 'date_heure_debut' not in columns:
        schema_editor.execute(
            f'ALTER TABLE "{table_name}" RENAME COLUMN "date_heure" TO "date_heure_debut"'
        )
        columns.discard('date_heure')
        columns.add('date_heure_debut')

    if 'date_creation' in columns and 'created_at' not in columns:
        schema_editor.execute(
            f'ALTER TABLE "{table_name}" RENAME COLUMN "date_creation" TO "created_at"'
        )
        columns.discard('date_creation')
        columns.add('created_at')

    column_sql = {
        'service_id': 'char(32) NULL',
        'service_nom_snapshot': 'varchar(100) NOT NULL DEFAULT \'\'',
        'service_prix_snapshot': 'decimal NOT NULL DEFAULT 0',
        'service_duree_snapshot': 'integer unsigned NOT NULL DEFAULT 0',
        'date_heure_fin': 'datetime NULL',
        'updated_at': 'datetime NOT NULL DEFAULT CURRENT_TIMESTAMP',
    }

    for field_name, sql_type in column_sql.items():
        if field_name not in columns:
            schema_editor.execute(
                f'ALTER TABLE "{table_name}" ADD COLUMN "{field_name}" {sql_type}'
            )
            columns.add(field_name)

    for rdv in RendezVous.objects.filter(date_heure_fin__isnull=True).iterator():
        rdv.date_heure_fin = rdv.date_heure_debut + timedelta(minutes=60)
        rdv.save(update_fields=['date_heure_fin'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('rendez_vous', '0002_add_paiement_fk'),
    ]

    operations = [
        migrations.RunPython(backfill_legacy_schema, noop_reverse),
    ]
