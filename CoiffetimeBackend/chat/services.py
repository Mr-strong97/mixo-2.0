from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404

from authentification.models.utilisateur import Utilisateur
from notifications.models import Notification, TypeNotification
from rendez_vous.models import RendezVous

from .models import ChatAuditLog, Conversation, ConversationParticipant, Message, NotificationChat


ALLOWED_RDV_STATUSES_FOR_CHAT = {'EN_ATTENTE', 'ACCEPTE', 'TERMINE', 'SUSPENDU'}


def _is_admin(user):
    return getattr(user, 'is_authenticated', False) and (
        getattr(user, 'role', '') == 'ADMIN' or getattr(user, 'is_staff', False)
    )


def _chat_partner_for(user, rdv):
    if rdv.client_id == user.id:
        return rdv.coiffeur
    if rdv.coiffeur_id == user.id:
        return rdv.client
    return None


def _record_audit(action, actor=None, conversation=None, message=None, details=None):
    return ChatAuditLog.objects.create(
        action=action,
        actor=actor,
        conversation=conversation,
        message=message,
        details=details or {},
    )


def ensure_participants(conversation):
    ConversationParticipant.objects.get_or_create(
        conversation=conversation,
        user=conversation.client,
        defaults={'role_snapshot': conversation.client.role},
    )
    ConversationParticipant.objects.get_or_create(
        conversation=conversation,
        user=conversation.coiffeur,
        defaults={'role_snapshot': conversation.coiffeur.role},
    )


def get_or_create_conversation_from_rdv(*, user, rendez_vous_id):
    rdv = get_object_or_404(RendezVous.objects.select_related('client', 'coiffeur', 'service'), pk=rendez_vous_id)
    if not _is_admin(user) and user.id not in {rdv.client_id, rdv.coiffeur_id}:
        _record_audit('REJET_ACCES', actor=user, details={'rendez_vous_id': str(rdv.id), 'raison': 'pas_participant'})
        raise PermissionError("Vous n'êtes pas autorisé à ouvrir cette discussion.")
    if rdv.statut not in ALLOWED_RDV_STATUSES_FOR_CHAT and not hasattr(rdv, 'conversation'):
        raise PermissionError("La discussion n'est disponible que pour un rendez-vous lié à une réservation valide.")

    conversation, created = Conversation.objects.get_or_create(
        rendez_vous=rdv,
        defaults={
            'client': rdv.client,
            'coiffeur': rdv.coiffeur,
            'created_by': user,
        },
    )
    if conversation.client_id != rdv.client_id or conversation.coiffeur_id != rdv.coiffeur_id:
        conversation.client = rdv.client
        conversation.coiffeur = rdv.coiffeur
        conversation.save(update_fields=['client', 'coiffeur', 'updated_at'])

    ensure_participants(conversation)
    _record_audit('CONVERSATION_OUVERTE', actor=user, conversation=conversation, details={'created': created, 'rendez_vous_id': str(rdv.id)})
    return conversation


def list_user_conversations(user):
    qs = Conversation.objects.select_related(
        'rendez_vous', 'client', 'coiffeur', 'last_message_sender'
    ).prefetch_related('participants__user')
    return qs.for_user(user)


def list_user_rendez_vous(user):
    qs = RendezVous.objects.select_related('client', 'coiffeur', 'service')
    if _is_admin(user):
        qs = qs.all()
    elif getattr(user, 'role', '') == 'CLIENT':
        qs = qs.filter(client=user)
    elif getattr(user, 'role', '') == 'COIFFEUR':
        qs = qs.filter(coiffeur=user)
    else:
        qs = qs.none()
    return qs.order_by('-date_heure_debut')


def serialize_partner(user, rdv):
    partner = _chat_partner_for(user, rdv)
    if partner is None and _is_admin(user):
        partner = rdv.coiffeur or rdv.client
    return {
        'id': str(partner.id) if partner else None,
        'username': partner.username if partner else '—',
        'role': partner.role if partner else None,
        'photo': partner.photo.url if partner and getattr(partner, 'photo', None) else None,
        'avatar_choice': partner.avatar_choice if partner else '',
    }


def unread_count_for_user(user):
    if _is_admin(user):
        return Conversation.objects.filter(last_message_at__gte=timezone.now() - timedelta(days=7)).count()
    qs = NotificationChat.objects.filter(recipient=user, statut=NotificationChat.Statut.NON_LU)
    return qs.count()


@transaction.atomic
def send_message(*, conversation, sender, content, attachment=None):
    if not conversation.can_user_access(sender) and not _is_admin(sender):
        raise PermissionError("Accès refusé à cette conversation.")

    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        content=content,
        attachment=attachment,
    )
    conversation.update_last_message(message)
    ensure_participants(conversation)

    for participant in conversation.participants.exclude(user=sender).select_related('user'):
        NotificationChat.objects.create(
            conversation=conversation,
            recipient=participant.user,
            message=message,
            type=NotificationChat.Type.NOUVEAU_MESSAGE,
            payload={'preview': conversation.last_message_preview},
        )
        Notification.creer(
            participant.user,
            f"Nouveau message de {sender.username}",
            conversation.last_message_preview,
            TypeNotification.CHAT_MESSAGE,
            lien=f"/discussion/{conversation.rendez_vous_id}",
        )

    _record_audit('MESSAGE_ENVOYE', actor=sender, conversation=conversation, message=message, details={'content_length': len(content)})
    return message


@transaction.atomic
def mark_conversation_read(*, conversation, user):
    participant = conversation.participants.filter(user=user).first()
    if not participant and not _is_admin(user):
        raise PermissionError("Vous n'êtes pas autorisé à modifier cette conversation.")

    now = timezone.now()
    if participant:
        participant.last_read_at = now
        participant.is_typing = False
        participant.typing_at = None
        participant.save(update_fields=['last_read_at', 'is_typing', 'typing_at', 'updated_at'])

    NotificationChat.objects.filter(conversation=conversation, recipient=user, statut=NotificationChat.Statut.NON_LU).update(
        statut=NotificationChat.Statut.LU,
        lu_at=now,
    )
    _record_audit('MESSAGE_LU', actor=user, conversation=conversation, details={})
    return conversation


@transaction.atomic
def set_typing_state(*, conversation, user, is_typing):
    participant = conversation.participants.filter(user=user).first()
    if not participant and not _is_admin(user):
        raise PermissionError("Vous n'êtes pas autorisé à modifier cette conversation.")
    now = timezone.now()
    if participant:
        participant.is_typing = bool(is_typing)
        participant.typing_at = now if is_typing else None
        participant.save(update_fields=['is_typing', 'typing_at', 'updated_at'])
    _record_audit('TYPING', actor=user, conversation=conversation, details={'is_typing': bool(is_typing)})
    return participant


def cleanup_expired_messages(days=7):
    threshold = timezone.now() - timedelta(days=days)
    deleted_messages = 0
    deleted_notifications = 0
    deleted_attachments = 0

    qs = Message.objects.filter(created_at__lt=threshold).select_related('conversation')
    for message in qs.iterator():
        if message.attachment:
            try:
                storage_name = message.attachment.name
                if storage_name and default_storage.exists(storage_name):
                    default_storage.delete(storage_name)
                    deleted_attachments += 1
            except Exception:
                pass
        deleted_messages += 1
        message.delete()

    orphan_notifications = NotificationChat.objects.filter(
        Q(conversation__messages__isnull=True) | Q(conversation__last_message_at__lt=threshold),
        created_at__lt=threshold,
    ).distinct()
    deleted_notifications = orphan_notifications.count()
    orphan_notifications.delete()

    for conversation in Conversation.objects.filter(last_message_at__lt=threshold).select_related('rendez_vous'):
        if conversation.messages.exists():
            continue
        _record_audit('ARCHIVAGE', conversation=conversation, details={'raison': 'expiration_7_jours'})
        conversation.archived_at = timezone.now()
        conversation.statut = Conversation.Statut.ARCHIVED
        conversation.save(update_fields=['archived_at', 'statut', 'updated_at'])

    _record_audit(
        'NETTOYAGE',
        details={
            'threshold': threshold.isoformat(),
            'deleted_messages': deleted_messages,
            'deleted_notifications': deleted_notifications,
            'deleted_attachments': deleted_attachments,
        },
    )
    return {
        'deleted_messages': deleted_messages,
        'deleted_notifications': deleted_notifications,
        'deleted_attachments': deleted_attachments,
    }
