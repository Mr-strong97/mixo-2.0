import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone

from authentification.models.utilisateur import Utilisateur
from rendez_vous.models import RendezVous


class ConversationQuerySet(models.QuerySet):
    def for_user(self, user):
        if not user or not getattr(user, 'is_authenticated', False):
            return self.none()
        if getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False):
            return self
        return self.filter(participants__user=user)

    def active(self):
        return self.filter(archived_at__isnull=True)


class ConversationManager(models.Manager.from_queryset(ConversationQuerySet)):
    pass


class Conversation(models.Model):
    class Statut(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ARCHIVED = 'ARCHIVED', 'Archivée'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rendez_vous = models.OneToOneField(
        RendezVous,
        on_delete=models.CASCADE,
        related_name='conversation',
    )
    client = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='chat_conversations_client',
    )
    coiffeur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='chat_conversations_coiffeur',
    )
    created_by = models.ForeignKey(
        Utilisateur,
        on_delete=models.SET_NULL,
        related_name='chat_conversations_created',
        null=True,
        blank=True,
    )
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.ACTIVE)
    last_message_preview = models.CharField(max_length=255, blank=True, default='')
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_message_sender = models.ForeignKey(
        Utilisateur,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True,
        blank=True,
    )
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ConversationManager()

    class Meta:
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['last_message_at']),
            models.Index(fields=['client', 'last_message_at']),
            models.Index(fields=['coiffeur', 'last_message_at']),
        ]

    def __str__(self):
        return f"Conversation {self.rendez_vous_id}"

    def partner_for(self, user):
        if user_id := getattr(user, 'id', None):
            if user_id == self.client_id:
                return self.coiffeur
            if user_id == self.coiffeur_id:
                return self.client
        return None

    def participant_for(self, user):
        return self.participants.filter(user=user).select_related('user').first()

    def is_admin_visible(self, user):
        return getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False)

    def can_user_access(self, user):
        if not getattr(user, 'is_authenticated', False):
            return False
        return self.is_admin_visible(user) or user.id in {self.client_id, self.coiffeur_id}

    def update_last_message(self, message):
        preview = (message.content or '').strip().replace('\n', ' ')
        self.last_message_preview = preview[:252]
        self.last_message_at = message.created_at
        self.last_message_sender = message.sender
        self.save(update_fields=['last_message_preview', 'last_message_at', 'last_message_sender', 'updated_at'])

    def expiration_at(self):
        base = self.last_message_at or self.created_at
        return base + timedelta(days=7)


class ConversationParticipant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='chat_participations')
    role_snapshot = models.CharField(max_length=20, blank=True, default='')
    last_read_at = models.DateTimeField(null=True, blank=True)
    is_typing = models.BooleanField(default=False)
    typing_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('conversation', 'user')]
        indexes = [
            models.Index(fields=['conversation', 'user']),
            models.Index(fields=['user', 'last_read_at']),
        ]

    def __str__(self):
        return f"{self.user} in {self.conversation_id}"

    @property
    def typing_active(self):
        return bool(self.is_typing and self.typing_at and self.typing_at >= timezone.now() - timedelta(seconds=10))


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='chat_messages_sent')
    content = models.TextField()
    attachment = models.FileField(upload_to='chat/%Y/%m/', null=True, blank=True)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
        ]

    def __str__(self):
        return f"Message {self.id}"

    @property
    def has_attachment(self):
        return bool(self.attachment)


class NotificationChat(models.Model):
    class Statut(models.TextChoices):
        NON_LU = 'NON_LU', 'Non lu'
        LU = 'LU', 'Lu'

    class Type(models.TextChoices):
        NOUVEAU_MESSAGE = 'NOUVEAU_MESSAGE', 'Nouveau message'
        CONVERSATION_OUVERTE = 'CONVERSATION_OUVERTE', 'Conversation ouverte'
        SAISIE = 'SAISIE', 'Saisie'
        ARCHIVAGE = 'ARCHIVAGE', 'Archivage'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='chat_notifications')
    recipient = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='chat_notifications')
    message = models.ForeignKey(Message, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_notifications')
    type = models.CharField(max_length=40, choices=Type.choices, default=Type.NOUVEAU_MESSAGE)
    statut = models.CharField(max_length=10, choices=Statut.choices, default=Statut.NON_LU)
    payload = models.JSONField(default=dict, blank=True)
    lu_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'statut', '-created_at']),
            models.Index(fields=['conversation', 'recipient']),
        ]

    def __str__(self):
        return f"{self.type} -> {self.recipient_id}"

    def marquer_lue(self):
        if self.statut == self.Statut.LU:
            return
        self.statut = self.Statut.LU
        self.lu_at = timezone.now()
        self.save(update_fields=['statut', 'lu_at'])


class ChatAuditLog(models.Model):
    class Action(models.TextChoices):
        MESSAGE_ENVOYE = 'MESSAGE_ENVOYE', 'Message envoyé'
        MESSAGE_LU = 'MESSAGE_LU', 'Message lu'
        CONVERSATION_OUVERTE = 'CONVERSATION_OUVERTE', 'Conversation ouverte'
        TYPING = 'TYPING', 'Saisie'
        NETTOYAGE = 'NETTOYAGE', 'Nettoyage'
        ARCHIVAGE = 'ARCHIVAGE', 'Archivage'
        REJET_ACCES = 'REJET_ACCES', 'Accès refusé'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=32, choices=Action.choices)
    actor = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_audit_logs')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    message = models.ForeignKey(Message, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['action', '-created_at'])]
