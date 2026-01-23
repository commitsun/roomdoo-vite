import type { Chat, ChatFilters, Message } from '@/domain/entities/Chat';
import type { ChatRepository } from '@/domain/repositories/ChatRepository';
import {
  getMockChats,
  getMockChatById,
  getMockMessages,
  mockMessages,
} from '@/infrastructure/mocks/chatMocks';

/**
 * Restores Date objects from JSON-serialized chat data
 */
function restoreChatDates(chat: Chat): Chat {
  return {
    ...chat,
    updatedAt: new Date(chat.updatedAt),
    lastMessage: {
      ...chat.lastMessage,
      timestamp: new Date(chat.lastMessage.timestamp),
    },
  };
}

/**
 * Mock implementation of ChatRepository for development and testing.
 * Uses static mock data instead of making real API calls.
 */
export class ChatRepositoryMock implements ChatRepository {
  private chats: Chat[];

  constructor() {
    // Deep clone mock chats and restore Date objects
    const rawChats = JSON.parse(JSON.stringify(getMockChats())) as Chat[];
    this.chats = rawChats.map(restoreChatDates);
  }

  async getChats(filters?: ChatFilters): Promise<Chat[]> {
    // Simulate network delay
    await this.delay(200);

    let result = [...this.chats];

    // Apply filters if provided
    if (filters?.status !== null && filters?.status !== undefined) {
      result = result.filter((chat) => chat.guestStatus === filters.status);
    }

    if (filters?.search !== undefined && filters.search !== null && filters.search.length > 0) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (chat) =>
          (chat.contact.name?.toLowerCase().includes(search) ?? false) ||
          (chat.contact.phone?.includes(search) ?? false),
      );
    }

    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return result;
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    await this.delay(100);

    const chat = this.chats.find((c) => c.id === chatId) ?? getMockChatById(chatId);
    return chat ?? null;
  }

  async getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    await this.delay(150);

    const messages = getMockMessages(chatId);
    const start = offset ?? 0;
    const end = limit !== undefined && limit > 0 ? start + limit : undefined;

    const result = messages.slice(start, end);
    return result;
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    await this.delay(300);

    const newMessage: Message = {
      id: `mock-${Date.now()}`,
      chatId,
      content,
      sender: 'hotel',
      status: 'sent',
      timestamp: new Date(),
    };

    // Add to mock messages
    if (mockMessages[chatId] === undefined) {
      mockMessages[chatId] = [];
    }
    mockMessages[chatId].push(newMessage);

    // Update chat's last message
    const chat = this.chats.find((c) => c.id === chatId);
    if (chat !== undefined) {
      chat.lastMessage = newMessage;
      chat.updatedAt = new Date();
    }

    return newMessage;
  }

  async toggleBookAI(chatId: string, enabled: boolean): Promise<void> {
    await this.delay(200);

    const chat = this.chats.find((c) => c.id === chatId);
    if (chat !== undefined) {
      chat.bookAIEnabled = enabled;
    }
  }

  async markAsRead(chatId: string): Promise<void> {
    await this.delay(100);

    const chat = this.chats.find((c) => c.id === chatId);
    if (chat !== undefined) {
      chat.unreadCount = 0;
    }
  }

  /**
   * Simulates network delay for realistic UX
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
