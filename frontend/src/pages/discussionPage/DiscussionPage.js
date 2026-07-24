/**
 * DiscussionPage.js — MIXO
 * Interface de messagerie liée aux rendez-vous réservés.
 */
import { Navbar } from '../../components/navbars/Navbar.js';
import { requireAuth } from '../../utils/AuthGuard.js';
import { showToast } from '../../utils/toast.js';
import { attachLiveRefresh, dispatchLiveEvent } from '../../utils/liveRefresh.js';
import { ChatAPI } from '../../api/ChatAPI.js';
import { renderAvatarMarkup } from '../../utils/avatar.js';

import '../../styles/chatStyles/DiscussionPage.css';

const CURRENT_USER_ID = () => localStorage.getItem('user_id');
const CURRENT_USER_NAME = () => localStorage.getItem('username') || 'Moi';
const CURRENT_USER_ROLE = () => (localStorage.getItem('user_role') || 'client').toLowerCase();

const escapeHtml = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const conversationPartner = (conversation) => {
    const role = CURRENT_USER_ROLE();
    if (!conversation) return null;
    if (role === 'admin') {
        return conversation.coiffeur || conversation.client || null;
    }
    return role === 'client' ? conversation.coiffeur : conversation.client;
};

const serviceLabel = (conversation) => conversation?.rendez_vous?.service_nom_snapshot || conversation?.last_message_preview || 'Discussion';

export const DiscussionPage = (params = {}) => {
    if (!requireAuth()) return document.createElement('div');

    const page = document.createElement('div');
    page.className = 'chat-page';
    page.appendChild(Navbar());

    const main = document.createElement('main');
    main.className = 'chat-main';
    main.innerHTML = `
        <section class="chat-hero">
            <div>
                <p class="chat-kicker">Discussion</p>
                <h1>Échange sécurisé entre client et coiffeur</h1>
                <p>Les messages sont liés à un rendez-vous ou à une réservation valide, avec conservation limitée à 7 jours.</p>
            </div>
            <div class="chat-hero-card">
                <i data-lucide="shield-check"></i>
                <span>Conversations sécurisées</span>
            </div>
        </section>

        <section class="chat-shell">
            <aside class="chat-sidebar">
                <div class="chat-sidebar-head">
                    <div>
                        <h2>Conversations</h2>
                        <span id="chat-summary-count">Chargement…</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary chat-icon-btn" id="chat-refresh" aria-label="Actualiser les conversations">
                        <i data-lucide="refresh-cw"></i>
                    </button>
                </div>
                <div id="chat-conversation-list" class="chat-list"></div>
                <div class="chat-sidebar-foot">
                    <h3>Rendez-vous disponibles</h3>
                    <div id="chat-rdv-list" class="chat-rdv-list"></div>
                </div>
            </aside>

            <section class="chat-panel">
                <div id="chat-panel-empty" class="chat-empty">
                    <span class="chat-icon-circle"><i data-lucide="message-circle-more"></i></span>
                    <h2>Sélectionnez une conversation</h2>
                    <p>Ouvrez une discussion existante ou démarrez une conversation depuis un rendez-vous confirmé.</p>
                    <div class="chat-empty-divider" aria-hidden="true">
                        <span></span>
                        <i data-lucide="shield"></i>
                        <span></span>
                    </div>
                </div>

                <div id="chat-panel-active" class="chat-active" style="display:none;">
                    <header class="chat-panel-head">
                        <div class="chat-partner">
                            <button type="button" class="btn btn-outline-secondary btn-sm chat-back-btn" id="chat-back-btn">
                                <i data-lucide="arrow-left"></i>
                                Retour
                            </button>
                            <div class="chat-avatar" id="chat-partner-avatar">MX</div>
                            <div>
                                <h2 id="chat-partner-name">—</h2>
                                <p id="chat-partner-meta">—</p>
                            </div>
                        </div>
                        <div class="chat-panel-actions">
                            <a href="#" class="btn btn-outline-primary btn-sm" id="chat-go-rdv">
                                <i data-lucide="calendar-range"></i>
                                Rendez-vous
                            </a>
                        </div>
                    </header>

                    <div class="chat-info-strip" id="chat-info-strip"></div>

                    <div class="chat-messages" id="chat-messages"></div>

                    <div class="chat-typing" id="chat-typing" style="display:none;"></div>

                    <form class="chat-composer" id="chat-form">
                        <textarea id="chat-input" class="chat-input" rows="2" placeholder="Écrire un message..."></textarea>
                        <div class="chat-composer-actions">
                            <span class="chat-helper">Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne.</span>
                            <button type="submit" class="btn btn-primary chat-send-btn" id="chat-send-btn" aria-label="Envoyer le message">
                                <i data-lucide="send"></i>
                                <span class="chat-send-label">Envoyer</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </section>
    `;

    page.appendChild(main);

    const els = {
        summaryCount: main.querySelector('#chat-summary-count'),
        conversationList: main.querySelector('#chat-conversation-list'),
        rdvList: main.querySelector('#chat-rdv-list'),
        empty: main.querySelector('#chat-panel-empty'),
        active: main.querySelector('#chat-panel-active'),
        partnerAvatar: main.querySelector('#chat-partner-avatar'),
        partnerName: main.querySelector('#chat-partner-name'),
        partnerMeta: main.querySelector('#chat-partner-meta'),
        infoStrip: main.querySelector('#chat-info-strip'),
        messages: main.querySelector('#chat-messages'),
        typing: main.querySelector('#chat-typing'),
        form: main.querySelector('#chat-form'),
        input: main.querySelector('#chat-input'),
        sendBtn: main.querySelector('#chat-send-btn'),
        rdvLink: main.querySelector('#chat-go-rdv'),
        refresh: main.querySelector('#chat-refresh'),
        backBtn: main.querySelector('#chat-back-btn'),
    };

    const state = {
        conversations: [],
        conversationId: null,
        conversation: null,
        messages: [],
        rendezVous: [],
        summaryUnread: 0,
        loading: false,
        sending: false,
        typingTimer: null,
        selectedRendezVousId: params.rendez_vous_id || null,
        mobileMode: 'list',
    };
    let chatSocket = null;

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const applyResponsiveMode = () => {
        const mobile = isMobile();
        page.classList.toggle('chat-is-chat', mobile && state.mobileMode === 'chat');
        page.classList.toggle('chat-is-list', mobile && state.mobileMode === 'list');
    };

    const setMobileMode = (mode) => {
        state.mobileMode = mode;
        applyResponsiveMode();
    };

    const updateBadge = () => {
        dispatchLiveEvent('mixo:badges-updated', {
            discussion: state.summaryUnread || 0,
        });
    };

    const disconnectRealtime = () => {
        if (chatSocket) {
            try {
                chatSocket.onopen = null;
                chatSocket.onmessage = null;
                chatSocket.onerror = null;
                chatSocket.onclose = null;
                chatSocket.close();
            } catch {}
            chatSocket = null;
        }
    };

    const connectRealtime = (conversationId) => {
        disconnectRealtime();
        if (!conversationId) return;

        try {
            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const base = `${proto}//${window.location.host}/ws/chat/${conversationId}/`;
            chatSocket = new WebSocket(base);

            chatSocket.onmessage = async () => {
                if (!state.conversationId) return;
                try {
                    await refreshConversation(state.conversationId);
                    await refreshSummary();
                } catch {}
            };

            chatSocket.onerror = () => {
                disconnectRealtime();
            };
        } catch {
            disconnectRealtime();
        }
    };

    const renderConversationList = () => {
        if (!state.conversations.length) {
            els.conversationList.innerHTML = `
                <div class="chat-empty-list">
                    <span class="chat-icon-circle chat-icon-circle--sm"><i data-lucide="inbox"></i></span>
                    <p>Aucune conversation pour le moment.</p>
                </div>`;
            return;
        }

        els.conversationList.innerHTML = state.conversations.map((conversation) => {
            const partner = conversationPartner(conversation) || {};
            const unread = Number(conversation.unread_count || 0);
            const active = conversation.id === state.conversationId ? 'is-active' : '';
            const last = conversation.last_message || {};
            return `
                <button type="button" class="chat-card ${active}" data-conversation-id="${conversation.id}">
                    <div class="chat-card-avatar">
                        ${renderAvatarMarkup(partner, { size: 'md' })}
                    </div>
                    <div class="chat-card-body">
                        <div class="chat-card-head">
                            <strong>${escapeHtml(partner.username || 'Conversation')}</strong>
                            <span>${last.created_at ? formatDate(last.created_at) : ''}</span>
                        </div>
                        <p>${escapeHtml(conversation.last_message_preview || 'Aucun message.')}</p>
                    </div>
                    <div class="chat-card-meta">
                        ${unread > 0 ? `<span class="chat-unread">${unread > 9 ? '9+' : unread}</span>` : ''}
                    </div>
                </button>
            `;
        }).join('');

        els.conversationList.querySelectorAll('[data-conversation-id]').forEach((btn) => {
            btn.addEventListener('click', () => openConversation(btn.dataset.conversationId));
        });
    };

    const renderRendezVousList = () => {
        if (!state.rendezVous.length) {
            els.rdvList.innerHTML = `
                <div class="chat-rdv-empty">
                    <p>Aucun rendez-vous disponible.</p>
                    <span>Les conversations s’affichent automatiquement après une réservation valide.</span>
                </div>`;
            return;
        }

        els.rdvList.innerHTML = state.rendezVous.map((rdv) => {
            const canChat = rdv.can_chat || rdv.conversation_id;
            return `
                <article class="chat-rdv-card ${canChat ? '' : 'is-muted'}">
                    <div>
                        <strong>${escapeHtml(rdv.service_nom_snapshot || 'Rendez-vous')}</strong>
                        <p>${formatDate(rdv.date_heure_debut)} · ${escapeHtml(rdv.statut)}</p>
                        <span>${escapeHtml(rdv.partner?.username || 'Participant')}</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary" data-open-rdv="${rdv.id}" ${canChat ? '' : 'disabled'}>
                        <i data-lucide="message-square"></i>
                        Ouvrir
                    </button>
                </article>
            `;
        }).join('');

        els.rdvList.querySelectorAll('[data-open-rdv]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const rdvId = btn.dataset.openRdv;
                await openConversationFromRdv(rdvId);
            });
        });
    };

    const renderMessages = () => {
        if (!state.messages.length) {
            els.messages.innerHTML = `
                <div class="chat-message-empty">
                    <span class="chat-icon-circle chat-icon-circle--sm"><i data-lucide="sparkles"></i></span>
                    <p>La discussion est prête. Envoyez le premier message.</p>
                </div>`;
            return;
        }

        const currentUserId = CURRENT_USER_ID();
        els.messages.innerHTML = state.messages.map((message) => {
            const mine = String(message.sender) === String(currentUserId);
            return `
                <article class="chat-message ${mine ? 'is-me' : 'is-them'}">
                    <div class="chat-message-avatar">
                        ${renderAvatarMarkup({
                            username: message.sender_username || 'MX',
                            photo: message.sender_photo,
                            avatar_choice: message.sender_avatar_choice,
                        }, { size: 'sm' })}
                    </div>
                    <div class="chat-message-bubble">
                        <div class="chat-message-meta">
                            <strong>${escapeHtml(mine ? 'Vous' : message.sender_username || 'Utilisateur')}</strong>
                            <span>${formatDate(message.created_at)}</span>
                            <span class="chat-message-read">${message.est_lu ? 'Lu' : 'Non lu'}</span>
                        </div>
                        <p>${escapeHtml(message.content)}</p>
                    </div>
                </article>
            `;
        }).join('');

        els.messages.scrollTop = els.messages.scrollHeight;
    };

    const renderActiveConversation = () => {
        const conversation = state.conversation;
        if (!conversation) {
            els.empty.style.display = 'flex';
            els.active.style.display = 'none';
            setMobileMode('list');
            return;
        }

        const partner = conversationPartner(conversation) || {};
        els.empty.style.display = 'none';
        els.active.style.display = 'flex';
        if (isMobile()) setMobileMode('chat');
        els.partnerAvatar.innerHTML = renderAvatarMarkup(partner, { size: 'md' });
        els.partnerName.textContent = partner.username || 'Conversation';
        els.partnerMeta.textContent = `${partner.role || ''}${partner.role ? ' · ' : ''}${conversation.rendez_vous?.service_nom_snapshot || 'Rendez-vous'}`;
        els.infoStrip.innerHTML = `
            <div><strong>Service</strong><span>${escapeHtml(serviceLabel(conversation))}</span></div>
            <div><strong>Date</strong><span>${formatDate(conversation.rendez_vous?.date_heure_debut)}</span></div>
            <div><strong>Statut</strong><span>${escapeHtml(conversation.rendez_vous?.statut_label || conversation.rendez_vous?.statut || '—')}</span></div>
        `;
        const typingUsers = Array.isArray(conversation.typing) ? conversation.typing.filter((item) => item?.is_typing) : [];
        if (typingUsers.length) {
            els.typing.style.display = 'block';
            els.typing.textContent = `${typingUsers.map((item) => item.username).join(', ')} est en train d’écrire…`;
        } else {
            els.typing.style.display = 'none';
            els.typing.textContent = '';
        }
        els.rdvLink.href = '#';
        els.rdvLink.onclick = (event) => {
            event.preventDefault();
            const rdvId = conversation.rendez_vous?.id;
            if (!rdvId) return;
            const role = CURRENT_USER_ROLE();
            const path = role === 'coiffeur' ? `/coiffeur/rendez-vous/${rdvId}` : `/rendez-vous/${rdvId}`;
            if (window.navigate) window.navigate(path);
            else window.location.href = path;
        };
        renderMessages();
    };

    const refreshSummary = async () => {
        const data = await ChatAPI.getSummary();
        state.conversations = data.conversations || [];
        state.summaryUnread = Number(data.unread_count || 0);
        els.summaryCount.textContent = `${state.summaryUnread} non lu${state.summaryUnread > 1 ? 's' : ''} · ${state.conversations.length} conversation${state.conversations.length > 1 ? 's' : ''}`;
        updateBadge();
        renderConversationList();
    };

    const refreshRendezVous = async () => {
        try {
            state.rendezVous = await ChatAPI.getRendezVous();
            renderRendezVousList();
        } catch {
            state.rendezVous = [];
            renderRendezVousList();
        }
    };

    const refreshConversation = async (conversationId = state.conversationId) => {
        if (!conversationId) return;
        const data = await ChatAPI.getConversation(conversationId);
        state.conversation = data;
        state.messages = data.messages || [];
        state.conversationId = data.id;
        connectRealtime(state.conversationId);
        renderConversationList();
        renderActiveConversation();
    };

    const openConversation = async (conversationId) => {
        if (!conversationId) return;
        state.loading = true;
        try {
            state.conversationId = conversationId;
            if (isMobile()) setMobileMode('chat');
            await refreshConversation(conversationId);
            await ChatAPI.markRead(conversationId);
            await refreshSummary();
            renderActiveConversation();
        } catch (error) {
            showToast(error.response?.data?.detail || 'Impossible d’ouvrir cette conversation.', 'error');
        } finally {
            state.loading = false;
        }
    };

    const openConversationFromRdv = async (rendezVousId) => {
        if (!rendezVousId) return;
        state.loading = true;
        try {
            if (isMobile()) setMobileMode('chat');
            const conversation = await ChatAPI.openFromRendezVous(rendezVousId);
            state.conversationId = conversation.id;
            state.conversation = conversation;
            state.messages = conversation.messages || [];
            connectRealtime(state.conversationId);
            await refreshSummary();
            await refreshRendezVous();
            renderActiveConversation();
            showToast('Discussion ouverte avec succès.', 'success');
        } catch (error) {
            showToast(error.response?.data?.detail || 'Impossible d’ouvrir la discussion.', 'error');
        } finally {
            state.loading = false;
        }
    };

    const loadInitial = async () => {
        try {
            await Promise.all([refreshSummary(), refreshRendezVous()]);
            if (params.rendez_vous_id) {
                await openConversationFromRdv(params.rendez_vous_id);
            } else if (!state.conversationId && state.conversations.length) {
                await openConversation(state.conversations[0].id);
            } else {
                renderActiveConversation();
            }
        } catch (error) {
            showToast(error.response?.data?.detail || 'Impossible de charger la messagerie.', 'error');
        } finally {
            if (window.lucide) window.lucide.createIcons();
        }
    };

    const onInput = () => {
        if (!state.conversationId) return;
        if (state.typingTimer) clearTimeout(state.typingTimer);
        ChatAPI.setTyping(state.conversationId, true).catch(() => {});
        state.typingTimer = setTimeout(() => {
            ChatAPI.setTyping(state.conversationId, false).catch(() => {});
        }, 1300);
    };

    els.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const content = els.input.value.trim();
        if (!content || !state.conversationId) return;
        els.sendBtn.disabled = true;
        state.sending = true;
        try {
            await ChatAPI.sendMessage(state.conversationId, content);
            els.input.value = '';
            if (state.typingTimer) clearTimeout(state.typingTimer);
            await ChatAPI.setTyping(state.conversationId, false).catch(() => {});
            await refreshConversation(state.conversationId);
            await refreshSummary();
        } catch (error) {
            showToast(error.response?.data?.detail || 'Impossible d’envoyer le message.', 'error');
        } finally {
            state.sending = false;
            els.sendBtn.disabled = false;
            els.input.focus();
        }
    });

    els.input.addEventListener('input', onInput);
    els.input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            els.form.requestSubmit();
        }
    });

    els.refresh.addEventListener('click', async () => {
        await loadInitial();
        showToast('Conversation mise à jour.', 'info');
    });

    els.backBtn.addEventListener('click', () => {
        setMobileMode('list');
    });

    attachLiveRefresh(async () => {
        await refreshSummary();
        await refreshRendezVous();
        if (state.conversationId) {
            await refreshConversation(state.conversationId);
        }
    }, { intervalMs: 5000 });

    window.addEventListener('resize', applyResponsiveMode);

    window.__mixoPageCleanup = (() => {
        const previous = window.__mixoPageCleanup;
        return () => {
            if (typeof previous === 'function') previous();
            if (state.typingTimer) clearTimeout(state.typingTimer);
            disconnectRealtime();
            window.removeEventListener('resize', applyResponsiveMode);
        };
    })();

    loadInitial();
    applyResponsiveMode();

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
    }, 0);

    return page;
};