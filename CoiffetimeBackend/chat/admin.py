from django.contrib import admin

from .models import ChatAuditLog, Conversation, ConversationParticipant, Message, NotificationChat


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'rendez_vous', 'client', 'coiffeur', 'last_message_at', 'statut')
    search_fields = ('client__username', 'coiffeur__username', 'rendez_vous__id')
    list_filter = ('statut', 'created_at')


@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'user', 'role_snapshot', 'last_read_at', 'is_typing')
    search_fields = ('user__username',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'created_at', 'is_system')
    search_fields = ('content', 'sender__username')
    list_filter = ('is_system', 'created_at')


@admin.register(NotificationChat)
class NotificationChatAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'recipient', 'type', 'statut', 'created_at', 'lu_at')
    search_fields = ('recipient__username',)
    list_filter = ('type', 'statut', 'created_at')


@admin.register(ChatAuditLog)
class ChatAuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'actor', 'conversation', 'created_at')
    search_fields = ('actor__username', 'action')
    list_filter = ('action', 'created_at')

