from django.urls import path

from . import views

urlpatterns = [
    path('summary/', views.conversation_summary, name='chat-summary'),
    path('conversations/', views.lister_conversations, name='chat-conversations'),
    path('conversations/admin/', views.admin_conversations, name='chat-conversations-admin'),
    path('conversations/from-rdv/', views.ouvrir_depuis_rendez_vous, name='chat-open-from-rdv'),
    path('rendez-vous/', views.mes_rendez_vous_chat, name='chat-rendez-vous'),
    path('conversations/<uuid:pk>/', views.detail_conversation, name='chat-conversation-detail'),
    path('conversations/<uuid:pk>/messages/', views.messages_conversation, name='chat-conversation-messages'),
    path('conversations/<uuid:pk>/read/', views.marquer_lu, name='chat-conversation-read'),
    path('conversations/<uuid:pk>/typing/', views.typing, name='chat-conversation-typing'),
    path('maintenance/nettoyer/', views.nettoyer, name='chat-nettoyer'),
]

