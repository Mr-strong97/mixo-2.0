"""
authentification/serializers/firebase_auth_serializer.py
=========================================================
Validation légère des payloads Firebase.
"""
from rest_framework import serializers

from ..firebase_auth import verifier_token_firebase
from ..firebase_init import ensure_firebase_app
from ..models.utilisateur import RoleChoix


class FirebaseSessionSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=False, allow_blank=False, trim_whitespace=True)

    def _extract_token(self):
        for key in ("id_token", "idToken", "token", "firebase_token"):
            value = self.initial_data.get(key)
            if value:
                return str(value).strip()
        return ""

    def validate(self, attrs):
        token = self._extract_token()
        if not token:
            raise serializers.ValidationError({"id_token": "Token Firebase requis."})

        try:
            ensure_firebase_app()
            self.context["firebase_claims"] = verifier_token_firebase(token, check_revoked=False)
        except RuntimeError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc
        except Exception as exc:
            raise serializers.ValidationError({
                "id_token": f"Token Firebase invalide ou expiré. Détail: {exc}"
            }) from exc

        attrs["id_token"] = token
        return attrs

    @property
    def firebase_claims(self):
        return self.context.get("firebase_claims", {})


class FirebaseInscriptionSerializer(FirebaseSessionSerializer):
    username = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=RoleChoix.choices, required=False, default=RoleChoix.CLIENT)
    avatar_choice = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')

    def validate_username(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Nom d'utilisateur requis.")
        return cleaned
