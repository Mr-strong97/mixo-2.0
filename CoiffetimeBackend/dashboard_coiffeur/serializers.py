"""dashboard_coiffeur/serializers.py — MIXO · Sérialiseurs du tableau de bord"""
from rest_framework import serializers


class DashboardCardSerializer(serializers.Serializer):
    label = serializers.CharField()
    valeur = serializers.IntegerField()
    icone = serializers.CharField(required=False, allow_blank=True)


class DashboardServiceSerializer(serializers.Serializer):
    id = serializers.CharField()
    nom_prestation = serializers.CharField()
    total_reservations = serializers.IntegerField(required=False)
    note_moyenne = serializers.FloatField(required=False, allow_null=True)
    revenu_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    image = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class DashboardRendezVousSerializer(serializers.Serializer):
    id = serializers.CharField()
    client_username = serializers.CharField()
    service_nom = serializers.CharField()
    date_heure_debut = serializers.DateTimeField()
    date_heure_fin = serializers.DateTimeField(required=False)
    statut = serializers.CharField()


class DashboardAvisSerializer(serializers.Serializer):
    id = serializers.CharField()
    client_username = serializers.CharField()
    service_nom = serializers.CharField()
    note = serializers.IntegerField()
    commentaire = serializers.CharField(allow_blank=True, allow_null=True)
    reponse_coiffeur = serializers.CharField(allow_blank=True, allow_null=True)
    created_at = serializers.DateTimeField()

