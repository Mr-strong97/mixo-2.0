from django.db.models import Count, Q
from rest_framework import serializers

from authentification.models.utilisateur import Utilisateur
from rendez_vous.serializers.rendez_vous_serializers import RendezVousSerializer

from .models import ChatAuditLog, Conversation, ConversationParticipant, Message, NotificationChat


class ParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    photo = serializers.SerializerMethodField()
    avatar_choice = serializers.CharField(source='user.avatar_choice', read_only=True)

    class Meta:
        model = ConversationParticipant
        fields = ['id', 'user', 'username', 'email', 'role', 'photo', 'avatar_choice', 'last_read_at', 'is_typing', 'typing_at']
        read_only_fields = fields

    def get_photo(self, obj):
        photo = getattr(obj.user, 'photo', None)
        return photo.url if photo else None


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)
    sender_photo = serializers.SerializerMethodField()
    sender_avatar_choice = serializers.CharField(source='sender.avatar_choice', read_only=True)
    est_lu = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 'sender_role',
            'sender_photo', 'sender_avatar_choice', 'content', 'attachment', 'is_system',
            'created_at', 'updated_at', 'est_lu',
        ]
        read_only_fields = fields

    def get_sender_photo(self, obj):
        photo = getattr(obj.sender, 'photo', None)
        return photo.url if photo else None

    def get_est_lu(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        conversation = getattr(obj, 'conversation', None)
        if not user or not conversation:
            return False
        if getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False):
            return True
        participant = conversation.participants.filter(user=user).first()
        if not participant:
            return False
        partner = conversation.partner_for(user)
        if not partner or obj.sender_id == user.id:
            return True
        return bool(participant.last_read_at and obj.created_at <= participant.last_read_at)


class ConversationSummarySerializer(serializers.ModelSerializer):
    rendez_vous = RendezVousSerializer(read_only=True)
    client = serializers.SerializerMethodField()
    coiffeur = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    typing = serializers.SerializerMethodField()
    can_access = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'rendez_vous', 'client', 'coiffeur', 'last_message',
            'last_message_preview', 'last_message_at', 'unread_count',
            'typing', 'statut', 'created_at', 'updated_at', 'can_access',
        ]

    def _serialize_user(self, user):
        if not user:
            return None
        return {
            'id': str(user.id),
            'username': user.username,
            'role': user.role,
            'photo': user.photo.url if getattr(user, 'photo', None) else None,
            'avatar_choice': user.avatar_choice,
        }

    def get_client(self, obj):
        return self._serialize_user(obj.client)

    def get_coiffeur(self, obj):
        return self._serialize_user(obj.coiffeur)

    def get_last_message(self, obj):
        if not obj.last_message_at:
            return None
        return {
            'content': obj.last_message_preview,
            'created_at': obj.last_message_at,
            'sender_id': str(obj.last_message_sender_id) if obj.last_message_sender_id else None,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        if not user or not getattr(user, 'is_authenticated', False):
            return 0
        if getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False):
            return obj.messages.count()
        participant = obj.participants.filter(user=user).first()
        if not participant:
            return 0
        qs = obj.messages.exclude(sender=user)
        if participant.last_read_at:
            qs = qs.filter(created_at__gt=participant.last_read_at)
        return qs.count()

    def get_typing(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not getattr(user, 'is_authenticated', False):
            return []
        return [
            {
                'user_id': str(part.user_id),
                'username': part.user.username,
                'is_typing': part.typing_active,
            }
            for part in obj.participants.select_related('user').all()
            if part.user_id != user.id and part.typing_active
        ]

    def get_can_access(self, obj):
        request = self.context.get('request')
        return bool(request and obj.can_user_access(request.user))


class ConversationDetailSerializer(ConversationSummarySerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    messages = serializers.SerializerMethodField()

    class Meta(ConversationSummarySerializer.Meta):
        fields = ConversationSummarySerializer.Meta.fields + ['participants', 'messages']

    def get_messages(self, obj):
        request = self.context.get('request')
        qs = obj.messages.select_related('sender')
        return MessageSerializer(qs, many=True, context={'request': request}).data


class MessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=4000, allow_blank=False, trim_whitespace=True)
    attachment = serializers.FileField(required=False, allow_null=True)

    def validate_content(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Le message ne peut pas être vide.")
        return cleaned


class ConversationCreateSerializer(serializers.Serializer):
    rendez_vous_id = serializers.UUIDField()


class RendezVousChatSerializer(serializers.Serializer):
    id = serializers.CharField()
    date_heure_debut = serializers.DateTimeField()
    date_heure_fin = serializers.DateTimeField()
    statut = serializers.CharField()
    service = serializers.CharField()
    service_nom_snapshot = serializers.CharField()
    conversation_id = serializers.CharField(allow_null=True)
    can_chat = serializers.BooleanField()
    partner = serializers.DictField()


class ChatSummarySerializer(serializers.Serializer):
    conversations = ConversationSummarySerializer(many=True)
    unread_count = serializers.IntegerField()


class NotificationChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationChat
        fields = ['id', 'conversation', 'recipient', 'message', 'type', 'statut', 'payload', 'lu_at', 'created_at']


class ChatAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatAuditLog
        fields = ['id', 'action', 'actor', 'conversation', 'message', 'details', 'created_at']
