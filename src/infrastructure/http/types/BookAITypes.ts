/**
 * BookAI Chatter API Types
 *
 * Type definitions for all BookAI Chatter API endpoints.
 * These types represent the raw API responses and requests.
 */

// =============================================================================
// ENUMS & LITERALS
// =============================================================================

/**
 * Supported communication channels
 */
export type BookAIChannel = 'whatsapp' | string;

/**
 * Message sender types from BookAI API
 * - 'cliente' = guest message
 * - 'bookai' = AI assistant message
 * - 'user' = hotel staff message
 */
export type BookAIMessageSender = 'cliente' | 'bookai' | 'user';

// =============================================================================
// GET /v1/chatter/chats - List Chats
// =============================================================================

/**
 * Raw API response from BookAI Chatter /api/v1/chatter/chats endpoint
 * Represents a single chat conversation in the list
 */
export interface BookAIChatResponse {
  chat_id: string;
  reservation_id: string | null;
  reservation_status: string | null;
  room_number: string | null;
  checkin: string | null;
  checkout: string | null;
  channel: BookAIChannel;
  last_message: string;
  last_message_at: string;
  avatar: string | null;
  client_name: string;
  client_phone: string;
  bookai_enabled: boolean;
  unread_count: number;
  /** The help request content from AI, or null if no action needed */
  needs_action: string | null;
}

/**
 * Paginated response wrapper from BookAI API for chat list
 */
export interface BookAIChatsListResponse {
  items: BookAIChatResponse[];
  total: number;
  page: number;
  page_size: number;
}

// =============================================================================
// GET /v1/chatter/chats/{id}/messages - Get Chat Messages
// =============================================================================

/**
 * Single message from BookAI Chatter /api/v1/chatter/chats/{id}/messages endpoint
 */
export interface BookAIMessageResponse {
  chat_id: string;
  created_at: string;
  read_status: boolean;
  message: string;
  sender: BookAIMessageSender;
  original_chat_id: string;
}

/**
 * Paginated response wrapper from BookAI API for messages list
 */
export interface BookAIMessagesListResponse {
  chat_id: string;
  page: number;
  page_size: number;
  items: BookAIMessageResponse[];
}

// =============================================================================
// POST /v1/chatter/messages - Send Message
// =============================================================================

/**
 * Request body for POST /v1/chatter/messages
 */
export interface BookAISendMessageRequest {
  user_id: string;
  chat_id: string;
  message: string;
  channel: BookAIChannel;
  sender: 'user';
}

/**
 * Response from POST /v1/chatter/messages
 */
export interface BookAISendMessageResponse {
  status: string;
  chat_id: string;
  user_id: string;
}

// =============================================================================
// PATCH /v1/chatter/chats/{id}/read - Mark Chat as Read
// =============================================================================

/**
 * Response from PATCH /v1/chatter/chats/{id}/read
 */
export interface BookAIMarkReadResponse {
  chat_id: string;
  read_status: boolean;
}

// =============================================================================
// PATCH /v1/chatter/chats/{id}/bookai - Toggle BookAI
// =============================================================================

/**
 * Request body for PATCH /v1/chatter/chats/{id}/bookai
 */
export interface BookAIToggleRequest {
  bookai_enabled: boolean;
}

/**
 * Response from PATCH /v1/chatter/chats/{id}/bookai
 * Returns the updated chat object
 */
export type BookAIToggleResponse = BookAIChatResponse;
