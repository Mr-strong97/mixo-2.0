"""historique/serializers.py — MIXO · Sérialiseurs du module Historique"""
from rest_framework import serializers


class HistoriqueItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    titre = serializers.CharField()
    sous_titre = serializers.CharField(allow_blank=True, required=False)
    statut = serializers.CharField(allow_blank=True, required=False)
    date = serializers.DateTimeField()
    montant = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    note = serializers.IntegerField(required=False, allow_null=True)
    commentaire = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    reponse = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    lien = serializers.CharField(allow_blank=True, required=False)
    service = serializers.CharField(allow_blank=True, required=False)
    coiffeur = serializers.CharField(allow_blank=True, required=False)

