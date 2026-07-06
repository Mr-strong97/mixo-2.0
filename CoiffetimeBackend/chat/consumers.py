from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.shortcuts import get_object_or_404

from .models import Conversation
from .services import mark_conversation_read, send_message, set_typing_state


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        conversation = await self._get_conversation(user, self.conversation_id)
        if conversation is None:
            await self.close(code=4403)
            return

        self.conversation = conversation
        self.group_name = f'chat_{self.conversation_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self._mark_read(user, conversation)

    async def disconnect(self, code):
        if getattr(self, 'group_name', None):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get('action')
        user = self.scope.get('user')

        if action == 'typing':
            await self._set_typing(user, bool(content.get('is_typing', True)))
            await self.channel_layer.group_send(self.group_name, {
                'type': 'chat.typing',
                'user_id': str(user.id),
                'username': user.username,
                'is_typing': bool(content.get('is_typing', True)),
            })
            return

        if action == 'read':
            await self._mark_read(user, self.conversation)
            await self.channel_layer.group_send(self.group_name, {
                'type': 'chat.read',
                'user_id': str(user.id),
                'username': user.username,
            })
            return

        if action == 'message':
            content_text = (content.get('content') or '').strip()
            if not content_text:
                await self.send_json({'type': 'error', 'detail': 'Message vide.'})
                return
            message = await self._send_message(user, content_text)
            await self.channel_layer.group_send(self.group_name, {
                'type': 'chat.message',
                'message_id': str(message.id),
                'sender_id': str(user.id),
                'sender_username': user.username,
                'content': message.content,
                'created_at': message.created_at.isoformat(),
            })
            return

        await self.send_json({'type': 'error', 'detail': 'Action inconnue.'})

    async def chat_message(self, event):
        await self.send_json({'type': 'message', **event})

    async def chat_typing(self, event):
        await self.send_json({'type': 'typing', **event})

    async def chat_read(self, event):
        await self.send_json({'type': 'read', **event})

    @database_sync_to_async
    def _get_conversation(self, user, conversation_id):
        conversation = get_object_or_404(
            Conversation.objects.select_related('client', 'coiffeur'),
            pk=conversation_id,
        )
        return conversation if conversation.can_user_access(user) else None

    @database_sync_to_async
    def _set_typing(self, user, is_typing):
        return set_typing_state(conversation=self.conversation, user=user, is_typing=is_typing)

    @database_sync_to_async
    def _mark_read(self, user, conversation):
        return mark_conversation_read(conversation=conversation, user=user)

    @database_sync_to_async
    def _send_message(self, user, content):
        return send_message(conversation=self.conversation, sender=user, content=content)

