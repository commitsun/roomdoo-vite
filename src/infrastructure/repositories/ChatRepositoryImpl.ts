import type { Chat, ChatFilters, Message, MessageDebugInfo } from '@/domain/entities/Chat';
import type { ChatRepository } from '@/domain/repositories/ChatRepository';
import { trackSentMessage } from '@/infrastructure/debug/sentMessagesTracker';
import { bookaiApi } from '@/infrastructure/http/bookaiAxios';
import type {
  BookAIChatsListResponse,
  BookAIMessagesListResponse,
  BookAISendMessageRequest,
  BookAISendMessageResponse,
  BookAIToggleRequest,
} from '@/infrastructure/http/types/BookAITypes';
import {
  mapBookAIChatsToChats,
  mapBookAIMessagesToMessages,
} from '@/infrastructure/mappers/chatMapper';
import { useUserStore } from '@/infrastructure/stores/user';

/** Default page size for paginated requests */
const DEFAULT_PAGE_SIZE = 20;

/** Check if debug mode is enabled */
const isDebugMode = import.meta.env.ROOMDOO_DEBUG === 'true';

/**
 * Converts limit/offset pagination to page/page_size format
 * @param limit - Maximum number of items to retrieve
 * @param offset - Number of items to skip
 * @returns Object with page and page_size
 */
function convertToPageParams(limit?: number, offset?: number): { page: number; page_size: number } {
  const pageSize = limit ?? DEFAULT_PAGE_SIZE;
  const page = offset !== undefined && offset > 0 ? Math.floor(offset / pageSize) + 1 : 1;

  return { page, page_size: pageSize };
}

/**
 * In-memory cache for chat channel information
 * Required for sendMessage which needs the channel from the chat
 */
const chatChannelCache = new Map<string, string>();

export class ChatRepositoryImpl implements ChatRepository {
  async getChats(_filters?: ChatFilters): Promise<Chat[]> {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('page_size', '100');

    const url = `/v1/chatter/chats?${params.toString()}`;
    const { data } = await bookaiApi.get<BookAIChatsListResponse>(url);
    const chats = data.items;

    // Cache channel information for each chat
    chats.forEach((chat) => {
      chatChannelCache.set(chat.chat_id, chat.channel);
    });

    return mapBookAIChatsToChats(chats);
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    // The API doesn't have a direct endpoint for single chat
    // Fetch all chats and find the one we need
    const chats = await this.getChats();
    const chat = chats.find((c) => c.id === chatId);

    if (chat === undefined) {
      return null;
    }

    return chat;
  }

  async getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    const { page, page_size } = convertToPageParams(limit, offset);

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(page_size));

    const encodedChatId = encodeURIComponent(chatId);
    const url = `/v1/chatter/chats/${encodedChatId}/messages?${params.toString()}`;
    const { data } = await bookaiApi.get<BookAIMessagesListResponse>(url);
    const messages = data.items;

    return mapBookAIMessagesToMessages(messages);
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const userStore = useUserStore();
    const userId = userStore.user?.id;

    if (userId === undefined) {
      throw new Error('User not authenticated');
    }

    // Get channel from cache or fetch chat to get it
    let channel = chatChannelCache.get(chatId);
    if (channel === undefined) {
      const chat = await this.getChatById(chatId);
      if (chat === null) {
        throw new Error(`Chat not found: ${chatId}`);
      }
      // After getChatById, channel should be in cache from getChats call
      channel = chatChannelCache.get(chatId) ?? 'whatsapp';
    }

    const senderToSend = 'user';
    const requestBody: BookAISendMessageRequest = {
      user_id: String(userId),
      chat_id: chatId,
      message: content,
      channel,
      sender: senderToSend,
    };

    const now = new Date();

    // Track sent message for debug comparison (before API call)
    if (isDebugMode) {
      trackSentMessage({ chatId, content, sentAs: senderToSend, timestamp: now });
    }

    const { data: _response } = await bookaiApi.post<BookAISendMessageResponse>(
      '/v1/chatter/messages',
      requestBody,
    );

    // Map the response to a Message entity
    const sentMessage: Message = {
      id: `${chatId}-${Date.now()}`,
      chatId,
      content,
      sender: 'hotel',
      status: 'sent',
      timestamp: now,
    };

    // Add debug info when debug mode is enabled
    if (isDebugMode) {
      const debugInfo: MessageDebugInfo = {
        rawSender: 'hotel',
        rawReadStatus: false,
        rawTimestamp: now.toISOString(),
        sentAs: 'user',
      };
      sentMessage.debug = debugInfo;
    }

    return sentMessage;
  }

  async toggleBookAI(chatId: string, enabled: boolean): Promise<void> {
    const requestBody: BookAIToggleRequest = {
      bookai_enabled: enabled,
    };

    const encodedChatId = encodeURIComponent(chatId);
    await bookaiApi.patch(`/v1/chatter/chats/${encodedChatId}/bookai`, requestBody);
  }

  async markAsRead(chatId: string): Promise<void> {
    const encodedChatId = encodeURIComponent(chatId);
    await bookaiApi.patch(`/v1/chatter/chats/${encodedChatId}/read`);
  }
}
