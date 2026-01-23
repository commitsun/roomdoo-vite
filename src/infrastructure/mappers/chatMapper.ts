import type {
  Chat,
  ChatContact,
  Message,
  AIRequestType,
  MessageDebugInfo,
  ChatDebugInfo,
} from '@/domain/entities/Chat';
import type { GuestStatus, MessageSender, MessageStatus } from '@/domain/types/ChatTypes';
import { findSentAs } from '@/infrastructure/debug/sentMessagesTracker';
import type {
  BookAIChatResponse,
  BookAIMessageResponse,
  BookAIMessageSender,
} from '@/infrastructure/http/types/BookAITypes';

/** Check if debug mode is enabled */
const isDebugMode = import.meta.env.ROOMDOO_DEBUG === 'true';

/**
 * Maps BookAI reservation_status to domain GuestStatus
 */
export function mapReservationStatusToGuestStatus(reservationStatus: string | null): GuestStatus {
  if (reservationStatus === null || reservationStatus === undefined) {
    return 'arriving';
  }

  const statusMap: Record<string, GuestStatus> = {
    pre_arrival: 'arriving',
    pending: 'arriving',
    confirmed: 'arriving',
    in_house: 'in_house',
    checked_in: 'in_house',
    post_checkout: 'checked_out',
    checked_out: 'checked_out',
    cancelled: 'checked_out',
  };

  return statusMap[reservationStatus.toLowerCase()] ?? 'arriving';
}

/**
 * Maps BookAI chat response to domain Chat entity
 */
export function mapBookAIChatToChat(apiChat: BookAIChatResponse): Chat {
  const contact: ChatContact = {
    id: apiChat.chat_id,
    name: apiChat.client_name || undefined,
    phone: apiChat.client_phone || undefined,
    image:
      apiChat.avatar !== null && apiChat.avatar !== undefined && apiChat.avatar !== ''
        ? apiChat.avatar
        : undefined,
  };

  const timestamp = apiChat.last_message_at ? new Date(apiChat.last_message_at) : new Date();

  // Map needs_action to aiRequestType for the "needs help" badge
  // needs_action is a string (the help request content) or null
  const aiRequestType: AIRequestType | undefined =
    apiChat.needs_action !== null && apiChat.needs_action.trim() !== '' ? 'help_needed' : undefined;

  const lastMessage: Message = {
    id: `msg-${apiChat.chat_id}-last`,
    chatId: apiChat.chat_id,
    content: apiChat.last_message || '',
    sender: 'guest',
    status: 'delivered',
    timestamp,
    aiRequestType,
  };

  const chat: Chat = {
    id: apiChat.chat_id,
    contact,
    guestStatus: mapReservationStatusToGuestStatus(apiChat.reservation_status),
    lastMessage,
    unreadCount: apiChat.unread_count,
    bookAIEnabled: apiChat.bookai_enabled,
    reservationId:
      apiChat.reservation_id !== null &&
      apiChat.reservation_id !== undefined &&
      apiChat.reservation_id !== ''
        ? apiChat.reservation_id
        : undefined,
    isPinned: false,
    updatedAt: timestamp,
  };

  // Add debug info when debug mode is enabled
  if (isDebugMode) {
    const debugInfo: ChatDebugInfo = {
      chatId: apiChat.chat_id,
      reservationId: apiChat.reservation_id,
      reservationStatus: apiChat.reservation_status,
      roomNumber: apiChat.room_number,
      checkin: apiChat.checkin,
      checkout: apiChat.checkout,
      channel: apiChat.channel,
      lastMessageAt: apiChat.last_message_at,
      bookaiEnabled: apiChat.bookai_enabled,
      unreadCount: apiChat.unread_count,
      needsAction: apiChat.needs_action,
      clientName: apiChat.client_name,
      clientPhone: apiChat.client_phone,
    };
    chat.debug = debugInfo;
  }

  return chat;
}

/**
 * Maps array of BookAI chats to domain Chat entities
 */
export function mapBookAIChatsToChats(apiChats: BookAIChatResponse[]): Chat[] {
  return apiChats.map(mapBookAIChatToChat);
}

/**
 * Maps BookAI message sender to domain MessageSender
 * API sender types:
 * - 'cliente' -> 'guest' (guest/customer message)
 * - 'bookai' -> 'bookai' (AI assistant message)
 * - 'user' -> 'hotel' (hotel staff message)
 */
export function mapBookAISenderToMessageSender(sender: BookAIMessageSender): MessageSender {
  const senderMap: Record<BookAIMessageSender, MessageSender> = {
    cliente: 'guest',
    bookai: 'bookai',
    user: 'hotel',
  };

  return senderMap[sender] ?? 'guest';
}

/**
 * Maps BookAI read_status boolean to domain MessageStatus
 */
export function mapReadStatusToMessageStatus(readStatus: boolean): MessageStatus {
  return readStatus ? 'read' : 'delivered';
}

/**
 * Maps BookAI message response to domain Message entity
 */
export function mapBookAIMessageToMessage(apiMessage: BookAIMessageResponse): Message {
  const message: Message = {
    id: `${apiMessage.chat_id}-${apiMessage.created_at}`,
    chatId: apiMessage.chat_id,
    content: apiMessage.message,
    sender: mapBookAISenderToMessageSender(apiMessage.sender),
    status: mapReadStatusToMessageStatus(apiMessage.read_status),
    timestamp: new Date(apiMessage.created_at),
  };

  // Add debug info when debug mode is enabled
  if (isDebugMode) {
    const debugInfo: MessageDebugInfo = {
      rawSender: apiMessage.sender,
      rawReadStatus: apiMessage.read_status,
      rawTimestamp: apiMessage.created_at,
    };

    // Include original_chat_id if different from chat_id
    if (apiMessage.original_chat_id && apiMessage.original_chat_id !== apiMessage.chat_id) {
      debugInfo.originalChatId = apiMessage.original_chat_id;
    }

    // Try to find the original sender from our tracking (for messages we sent)
    const trackedSentAs = findSentAs(apiMessage.chat_id, apiMessage.created_at, apiMessage.message);
    if (trackedSentAs !== null && trackedSentAs !== '') {
      debugInfo.sentAs = trackedSentAs;
    }

    message.debug = debugInfo;
  }

  return message;
}

/**
 * Maps array of BookAI messages to domain Message entities
 */
export function mapBookAIMessagesToMessages(apiMessages: BookAIMessageResponse[]): Message[] {
  return apiMessages.map(mapBookAIMessageToMessage);
}
