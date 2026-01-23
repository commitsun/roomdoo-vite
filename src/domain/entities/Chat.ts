import type {
  GuestStatus,
  MessageStatus,
  MessageSender,
  ChatFilterType,
  SystemEventType,
} from '@/domain/types/ChatTypes';

/**
 * Contact information for a chat participant
 */
export interface ChatContact {
  /** Unique identifier for the contact (phone number or chat ID) */
  id: string;
  /** Full name of the contact */
  name?: string;
  /** Phone number in international format */
  phone?: string;
  /** URL to contact's profile image */
  image?: string;
  /** ISO language code (e.g., 'es-ES', 'en-US') */
  language?: string;
}

/**
 * Context for AI help request when BookAI needs operator assistance
 */
export interface AIHelpContext {
  /** The original guest query that AI couldn't answer */
  originalQuery: string;
  /** The specific information AI is requesting from the operator */
  requestedInfo: string;
}

/**
 * Types of AI message requests
 * - help_needed: AI needs operator input to respond
 * - suggestion: AI has a suggestion but wants confirmation
 * - auto_response: AI responded automatically
 */
export type AIRequestType = 'help_needed' | 'suggestion' | 'auto_response';

/**
 * Debug information from the raw API response for messages
 * Only populated when ROOMDOO_DEBUG=true
 */
export interface MessageDebugInfo {
  /** Raw sender value from API (e.g., 'bookai', 'user', 'guest') */
  rawSender: string;
  /** Raw read_status from API */
  rawReadStatus: boolean;
  /** Raw created_at timestamp from API */
  rawTimestamp: string;
  /** Original chat_id from API */
  originalChatId?: string;
  /** Sender value sent to API when message was created from frontend (e.g., 'user') */
  sentAs?: string;
}

/**
 * Debug information from the raw API response for chats
 * Only populated when ROOMDOO_DEBUG=true
 */
export interface ChatDebugInfo {
  /** Raw chat_id from API */
  chatId: string;
  /** Raw reservation_id from API */
  reservationId: string | null;
  /** Raw reservation_status from API */
  reservationStatus: string | null;
  /** Raw room_number from API */
  roomNumber: string | null;
  /** Raw checkin date from API */
  checkin: string | null;
  /** Raw checkout date from API */
  checkout: string | null;
  /** Raw channel from API */
  channel: string;
  /** Raw last_message_at from API */
  lastMessageAt: string;
  /** Raw bookai_enabled from API */
  bookaiEnabled: boolean;
  /** Raw unread_count from API */
  unreadCount: number;
  /** Raw needs_action from API (AI help request content) */
  needsAction: string | null;
  /** Raw client_name from API */
  clientName: string;
  /** Raw client_phone from API */
  clientPhone: string;
}

/**
 * Individual message within a chat
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** Reference to the parent chat */
  chatId: string;
  /** Text content of the message */
  content: string;
  /** Who sent the message */
  sender: MessageSender;
  /** Current delivery status */
  status: MessageStatus;
  /** When the message was sent */
  timestamp: Date;
  /** Whether the message contains an attached image */
  hasImage?: boolean;
  /** Type of AI request (only for AI messages) */
  aiRequestType?: AIRequestType;
  /** Context for AI help request (only when aiRequestType is 'help_needed') */
  aiHelpContext?: AIHelpContext;
  /** Type of system event (only for system messages) */
  systemEventType?: SystemEventType;
  /** Debug information from raw API (only when ROOMDOO_DEBUG=true) */
  debug?: MessageDebugInfo;
}

/**
 * Chat conversation between hotel and guest
 */
export interface Chat {
  /** Unique identifier for the chat */
  id: string;
  /** Contact information of the guest */
  contact: ChatContact;
  /** Current status of the guest */
  guestStatus: GuestStatus;
  /** Most recent message in the conversation */
  lastMessage: Message;
  /** Number of unread messages */
  unreadCount: number;
  /** Whether BookAI automation is enabled for this chat */
  bookAIEnabled: boolean;
  /** Associated reservation ID if applicable */
  reservationId?: string;
  /** Whether this chat is pinned to the top of the list */
  isPinned?: boolean;
  /** Last time this chat was updated */
  updatedAt: Date;
  /** Debug information from raw API (only when ROOMDOO_DEBUG=true) */
  debug?: ChatDebugInfo;
}

/**
 * Filter criteria for chat list queries
 */
export interface ChatFilters {
  /** Type of chat filter to apply */
  type: ChatFilterType;
  /** Filter by guest status (null = all statuses) */
  status: GuestStatus | null;
  /** Text search query for contact name or message content */
  search: string;
}

/**
 * Block of messages grouped by AI session status
 * Used for rendering messages with visual separation between AI and human-controlled sessions
 */
export interface MessageBlock {
  /** Type of block: normal (human-controlled), ai_session, or internal_conversation */
  type: 'normal' | 'ai_session' | 'internal_conversation';
  /** Messages within this block (for normal and ai_session types) */
  messages: Message[];
  /** Internal conversation session (only for internal_conversation type) */
  internalSession?: InternalConversationSession;
  /** Whether to show the AI indicator at the start of this block (only for first ai_session after hotel takes control) */
  showIndicator?: boolean;
}

/**
 * AI Assistant conversation thread
 * Represents a single conversation session with the internal AI assistant
 */
export interface AIConversation {
  /** Unique identifier for the conversation */
  id: string;
  /** Title of the conversation (auto-generated from first message or topic) */
  title: string;
  /** Messages in this conversation */
  messages: Message[];
  /** When the conversation was created */
  createdAt: Date;
  /** When the conversation was last updated */
  updatedAt: Date;
}

/**
 * Sender type for internal conversation messages
 */
export type InternalConversationSender = 'staff' | 'internal_ai';

/**
 * Status of an internal conversation session
 */
export type InternalConversationStatus = 'active' | 'resolved' | 'cancelled';

/**
 * Individual message within an internal conversation session
 */
export interface InternalConversationMessage {
  /** Unique identifier for the message */
  id: string;
  /** Text content of the message */
  content: string;
  /** Who sent the message (staff or internal AI) */
  sender: InternalConversationSender;
  /** When the message was sent */
  timestamp: Date;
  /** Whether this message is a proposed response to send to the guest */
  isProposedGuestResponse?: boolean;
}

/**
 * Internal conversation session between hotel staff and the internal AI assistant.
 * Represents a multi-turn embedded conversation that appears inline within the guest chat view.
 */
export interface InternalConversationSession {
  /** Unique identifier for the session */
  id: string;
  /** Reference to the parent chat */
  chatId: string;
  /** ID of the message that triggered this internal conversation */
  triggerMessageId: string;
  /** The original guest query that triggered the help request */
  guestQuery: string;
  /** The AI's request for help from the hotel staff */
  aiHelpRequest: string;
  /** Messages in this internal conversation */
  messages: InternalConversationMessage[];
  /** Current status of the session */
  status: InternalConversationStatus;
  /** When the session started */
  startedAt: Date;
  /** When the session was resolved (if applicable) */
  resolvedAt?: Date;
}
