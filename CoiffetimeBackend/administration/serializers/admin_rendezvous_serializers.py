"""
admin_rendezvous_serializers.py — MIXO
Sérialiseurs dédiés à la supervision admin des rendez-vous.
"""
from rest_framework import serializers

from rendez_vous.models import RendezVous
from rendez_vous.serializers.rendez_vous_serializers import RendezVousSerializer


class AdminRendezVousListSerializer(RendezVousSerializer):
    client_email = serializers.CharField(source='client.email', read_only=True)
    coiffeur_email = serializers.CharField(source='coiffeur.email', read_only=True)
    service_name = serializers.CharField(source='service_nom_snapshot', read_only=True)

    class Meta(RendezVousSerializer.Meta):
        fields = RendezVousSerializer.Meta.fields + [
            'client_email', 'coiffeur_email', 'service_name',
        ]


class AdminRendezVousUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RendezVous
        fields = [
            'service',
            'date_heure_debut',
            'date_heure_fin',
            'statut',
        ]

    def validate(self, attrs):
        debut = attrs.get('date_heure_debut')
        fin = attrs.get('date_heure_fin')
        if debut and fin and fin <= debut:
            raise serializers.ValidationError("La fin doit être postérieure au début.")
        return attrs


class AdminRendezVousDetailSerializer(RendezVousSerializer):
    client_detail = serializers.SerializerMethodField()
    coiffeur_detail = serializers.SerializerMethodField()
    service_detail = serializers.SerializerMethodField()
    paiement_detail = serializers.SerializerMethodField()
    historique = serializers.SerializerMethodField()

    class Meta(RendezVousSerializer.Meta):
        fields = RendezVousSerializer.Meta.fields + [
            'client_detail', 'coiffeur_detail', 'service_detail',
            'paiement_detail', 'historique',
        ]

    def get_client_detail(self, obj):
        client = getattr(obj, 'client', None)
        if not client:
            return None
        return {
            'id': str(client.id),
            'username': client.username,
            'email': client.email,
            'role': client.role,
            'statut': client.statut,
            'date_joined': client.date_joined,
            'last_login': client.last_login,
        }

    def get_coiffeur_detail(self, obj):
        coiffeur = getattr(obj, 'coiffeur', None)
        if not coiffeur:
            return None
        profil = getattr(coiffeur, 'profil_coiffeur', None)
        return {
            'id': str(coiffeur.id),
            'username': coiffeur.username,
            'email': coiffeur.email,
            'role': coiffeur.role,
            'statut': coiffeur.statut,
            'specialite': getattr(profil, 'specialite', ''),
            'telephone': getattr(profil, 'telephone', ''),
            'adresse': getattr(profil, 'adresse', ''),
            'note_moyenne': getattr(profil, 'note_moyenne', 0),
            'est_verifie': getattr(profil, 'est_verifie', False),
        }

    def get_service_detail(self, obj):
        service = getattr(obj, 'service', None)
        if not service:
            return {
                'id': None,
                'nom_prestation': obj.service_nom_snapshot,
                'prix': obj.service_prix_snapshot,
                'duree_minutes': obj.service_duree_snapshot,
            }
        return {
            'id': str(service.id),
            'nom_prestation': service.nom_prestation,
            'description': service.description,
            'prix': service.prix,
            'duree_minutes': service.duree_minutes,
            'statut': service.statut,
            'actif': service.actif,
        }

    def get_paiement_detail(self, obj):
        paiement = getattr(obj, 'paiement', None)
        if not paiement:
            return None
        return {
            'id': str(paiement.id),
            'montant_total': paiement.montant_total,
            'montant_commission': paiement.montant_commission,
            'montant_coiffeur': paiement.montant_coiffeur,
            'statut': paiement.statut,
            'methode': paiement.methode,
            'transaction_id': paiement.transaction_id,
            'created_at': paiement.created_at,
        }

    def get_historique(self, obj):
        try:
            from authentification.models.audit_log import AuditLog
        except Exception:
            return []

        clés = [str(obj.id), f"RendezVous:{obj.id}", f"RDV:{obj.id}"]
        qs = AuditLog.objects.select_related('utilisateur').filter(
            details__icontains=str(obj.id)
        ).order_by('-created_at')[:10]

        result = []
        for log in qs:
            result.append({
                'id': str(log.id),
                'username': log.utilisateur.username if log.utilisateur else 'Anonyme',
                'action': log.action,
                'succes': log.succes,
                'details': log.details,
                'created_at': log.created_at,
            })
        return result
