from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from administration.permissions import EstAdmin

from .models import Conversation
from .serializers import (
    ConversationCreateSerializer,
    ConversationDetailSerializer,
    ConversationSummarySerializer,
    MessageCreateSerializer,
    MessageSerializer,
)
from .services import (
    cleanup_expired_messages,
    get_or_create_conversation_from_rdv,
    list_user_conversations,
    list_user_rendez_vous,
    mark_conversation_read,
    send_message,
    set_typing_state,
    unread_count_for_user,
    serialize_partner,
)


def _conversation_or_404(user, pk):
    if getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False):
        return get_object_or_404(
            Conversation.objects.select_related('rendez_vous', 'client', 'coiffeur', 'last_message_sender').prefetch_related('participants__user'),
            pk=pk,
        )
    return get_object_or_404(
        Conversation.objects.select_related('rendez_vous', 'client', 'coiffeur', 'last_message_sender').prefetch_related('participants__user'),
        pk=pk,
        participants__user=user,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_summary(request):
    conversations = list_user_conversations(request.user)
    serializer = ConversationSummarySerializer(conversations, many=True, context={'request': request})
    return Response({
        'conversations': serializer.data,
        'unread_count': unread_count_for_user(request.user),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_rendez_vous_chat(request):
    rdvs = list_user_rendez_vous(request.user)
    results = []
    for rdv in rdvs:
        conversation = getattr(rdv, 'conversation', None)
        results.append({
            'id': str(rdv.id),
            'date_heure_debut': rdv.date_heure_debut,
            'date_heure_fin': rdv.date_heure_fin,
            'statut': rdv.statut,
            'service': str(rdv.service_id) if rdv.service_id else None,
            'service_nom_snapshot': rdv.service_nom_snapshot,
            'conversation_id': str(conversation.id) if conversation else None,
            'can_chat': rdv.statut in {'EN_ATTENTE', 'ACCEPTE', 'TERMINE', 'SUSPENDU'} or conversation is not None,
            'partner': serialize_partner(request.user, rdv),
        })
    return Response(results)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ouvrir_depuis_rendez_vous(request):
    if getattr(request.user, 'role', '') not in {'CLIENT', 'COIFFEUR', 'ADMIN'} and not getattr(request.user, 'is_staff', False):
        return Response({'detail': "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)
    serializer = ConversationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    rendez_vous_id = serializer.validated_data['rendez_vous_id']
    try:
        conversation = get_or_create_conversation_from_rdv(user=request.user, rendez_vous_id=rendez_vous_id)
    except PermissionError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)

    return Response(ConversationDetailSerializer(conversation, context={'request': request}).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lister_conversations(request):
    conversations = list_user_conversations(request.user)
    return Response(ConversationSummarySerializer(conversations, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_conversation(request, pk):
    conversation = _conversation_or_404(request.user, pk)
    try:
        mark_conversation_read(conversation=conversation, user=request.user)
    except PermissionError:
        pass
    return Response(ConversationDetailSerializer(conversation, context={'request': request}).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def messages_conversation(request, pk):
    conversation = _conversation_or_404(request.user, pk)
    if request.method == 'GET':
        page = int(request.query_params.get('page', 1) or 1)
        page_size = min(max(int(request.query_params.get('page_size', 50) or 50), 1), 100)
        qs = conversation.messages.select_related('sender')
        paginator = Paginator(qs, page_size)
        current = paginator.get_page(page)
        serializer = MessageSerializer(current.object_list, many=True, context={'request': request})
        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'page': current.number,
            'pages': paginator.num_pages,
            'has_next': current.has_next(),
            'has_previous': current.has_previous(),
        })

    if request.method == 'POST':
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        attachment = request.FILES.get('attachment')
        try:
            message = send_message(
                conversation=conversation,
                sender=request.user,
                content=serializer.validated_data['content'],
                attachment=attachment,
            )
            return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)
        except PermissionError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marquer_lu(request, pk):
    conversation = _conversation_or_404(request.user, pk)
    try:
        mark_conversation_read(conversation=conversation, user=request.user)
        return Response({'detail': 'Conversation marquée comme lue.'})
    except PermissionError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def typing(request, pk):
    conversation = _conversation_or_404(request.user, pk)
    is_typing = bool(request.data.get('is_typing', True))
    try:
        set_typing_state(conversation=conversation, user=request.user, is_typing=is_typing)
        return Response({'detail': 'Statut de saisie mis à jour.'})
    except PermissionError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EstAdmin])
def admin_conversations(request):
    conversations = Conversation.objects.select_related('rendez_vous', 'client', 'coiffeur', 'last_message_sender').prefetch_related('participants__user')
    return Response(ConversationSummarySerializer(conversations, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, EstAdmin])
def nettoyer(request):
    result = cleanup_expired_messages(days=7)
    return Response({'detail': 'Nettoyage effectué.', **result})
