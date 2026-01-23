import type { Chat, Message, ChatFilters } from '@/domain/entities/Chat';

/**
 * Repository interface for chat-related data operations.
 * Defines the contract for accessing and managing chat conversations.
 */
export interface ChatRepository {
  /**
   * Retrieves a list of chats optionally filtered by criteria
   * @param filters - Optional filter criteria for the chat list
   * @returns Promise resolving to an array of chats
   */
  getChats(filters?: ChatFilters): Promise<Chat[]>;

  /**
   * Retrieves a specific chat by its identifier
   * @param chatId - Unique identifier of the chat
   * @returns Promise resolving to the chat or null if not found
   */
  getChatById(chatId: string): Promise<Chat | null>;

  /**
   * Retrieves messages for a specific chat with pagination support
   * @param chatId - Unique identifier of the chat
   * @param limit - Maximum number of messages to retrieve (default: 50)
   * @param offset - Number of messages to skip for pagination (default: 0)
   * @returns Promise resolving to an array of messages
   */
  getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]>;

  /**
   * Sends a new message in a chat
   * @param chatId - Unique identifier of the chat
   * @param content - Text content of the message
   * @returns Promise resolving to the created message
   */
  sendMessage(chatId: string, content: string): Promise<Message>;

  /**
   * Toggles BookAI automation for a specific chat
   * @param chatId - Unique identifier of the chat
   * @param enabled - Whether to enable or disable BookAI
   * @returns Promise resolving when the operation completes
   */
  toggleBookAI(chatId: string, enabled: boolean): Promise<void>;

  /**
   * Marks all messages in a chat as read
   * @param chatId - Unique identifier of the chat
   * @returns Promise resolving when the operation completes
   */
  markAsRead(chatId: string): Promise<void>;
}
