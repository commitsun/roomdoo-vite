import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock bookaiApi instance
vi.mock('@/infrastructure/http/bookaiAxios', () => {
  return {
    bookaiApi: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

// Mock user store
vi.mock('@/infrastructure/stores/user', () => {
  return {
    useUserStore: vi.fn(() => ({
      user: { id: 123 },
    })),
  };
});

import { bookaiApi } from '@/infrastructure/http/bookaiAxios';
import { ChatRepositoryImpl } from '@/infrastructure/repositories/ChatRepositoryImpl';
import type {
  BookAIChatResponse,
  BookAIMessageResponse,
} from '@/infrastructure/http/types/BookAITypes';

describe('ChatRepositoryImpl', () => {
  let repo: ChatRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ChatRepositoryImpl();
  });

  describe('getChats', () => {
    it('calls GET /v1/chatter/chats with pagination params', async () => {
      const mockChats: BookAIChatResponse[] = [
        {
          chat_id: 'chat-1',
          reservation_id: 'res-1',
          reservation_status: 'confirmed',
          room_number: '101',
          checkin: '2026-01-07',
          checkout: '2026-01-10',
          channel: 'whatsapp',
          last_message: 'Hello',
          last_message_at: '2026-01-07T10:00:00Z',
          avatar: null,
          client_name: 'John Doe',
          client_phone: '+34666555444',
          bookai_enabled: true,
          unread_count: 2,
          needs_action: null,
        },
      ];

      vi.mocked(bookaiApi.get).mockResolvedValue({
        data: { items: mockChats, page: 1, page_size: 100 },
      });

      const result = await repo.getChats();

      expect(bookaiApi.get).toHaveBeenCalledTimes(1);
      const calledUrl: string = vi.mocked(bookaiApi.get).mock.calls[0][0];
      expect(calledUrl).toContain('/v1/chatter/chats');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('page_size=100');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chat-1');
      expect(result[0].contact.name).toBe('John Doe');
    });
  });

  describe('getMessages', () => {
    it('calls GET /v1/chatter/chats/{chatId}/messages with pagination', async () => {
      const mockMessages: BookAIMessageResponse[] = [
        {
          chat_id: 'chat-1',
          created_at: '2026-01-07T10:00:00Z',
          read_status: true,
          message: 'Hello there',
          sender: 'cliente',
          original_chat_id: 'chat-1',
        },
        {
          chat_id: 'chat-1',
          created_at: '2026-01-07T10:01:00Z',
          read_status: false,
          message: 'Hi! How can I help?',
          sender: 'user',
          original_chat_id: 'chat-1',
        },
      ];

      vi.mocked(bookaiApi.get).mockResolvedValue({
        data: { items: mockMessages, chat_id: 'chat-1', page: 1, page_size: 20 },
      });

      const result = await repo.getMessages('chat-1', 20, 0);

      expect(bookaiApi.get).toHaveBeenCalledTimes(1);
      const calledUrl: string = vi.mocked(bookaiApi.get).mock.calls[0][0];
      expect(calledUrl).toContain('/v1/chatter/chats/chat-1/messages');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('page_size=20');
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Hello there');
      expect(result[0].sender).toBe('guest');
      expect(result[1].sender).toBe('hotel'); // 'user' maps to 'hotel'
    });

    it('converts offset to page correctly', async () => {
      vi.mocked(bookaiApi.get).mockResolvedValue({
        data: { items: [], chat_id: 'chat-1', page: 3, page_size: 20 },
      });

      await repo.getMessages('chat-1', 20, 40); // offset 40, pageSize 20 = page 3

      const calledUrl: string = vi.mocked(bookaiApi.get).mock.calls[0][0];
      expect(calledUrl).toContain('page=3');
    });
  });

  describe('sendMessage', () => {
    it('calls POST /v1/chatter/messages with correct body', async () => {
      // First call getChats to populate channel cache
      const mockChats: BookAIChatResponse[] = [
        {
          chat_id: 'chat-1',
          reservation_id: null,
          reservation_status: null,
          room_number: null,
          checkin: null,
          checkout: null,
          channel: 'whatsapp',
          last_message: 'Test',
          last_message_at: '2026-01-07T10:00:00Z',
          avatar: null,
          client_name: 'Test User',
          client_phone: '+34666555444',
          bookai_enabled: true,
          unread_count: 0,
          needs_action: null,
        },
      ];

      vi.mocked(bookaiApi.get).mockResolvedValue({
        data: { items: mockChats, page: 1, page_size: 100 },
      });
      vi.mocked(bookaiApi.post).mockResolvedValue({
        data: { status: 'sent', chat_id: 'chat-1', user_id: '123' },
      });

      // Populate cache
      await repo.getChats();

      const result = await repo.sendMessage('chat-1', 'Hello world');

      expect(bookaiApi.post).toHaveBeenCalledWith('/v1/chatter/messages', {
        user_id: '123',
        chat_id: 'chat-1',
        message: 'Hello world',
        channel: 'whatsapp',
      });
      expect(result.content).toBe('Hello world');
      expect(result.sender).toBe('hotel');
      expect(result.status).toBe('sent');
    });
  });

  describe('markAsRead', () => {
    it('calls PATCH /v1/chatter/chats/{chatId}/read', async () => {
      vi.mocked(bookaiApi.patch).mockResolvedValue({
        data: { chat_id: 'chat-1', read_status: true },
      });

      await repo.markAsRead('chat-1');

      expect(bookaiApi.patch).toHaveBeenCalledWith('/v1/chatter/chats/chat-1/read');
    });
  });

  describe('toggleBookAI', () => {
    it('calls PATCH /v1/chatter/chats/{chatId}/bookai with body', async () => {
      vi.mocked(bookaiApi.patch).mockResolvedValue({ data: {} });

      await repo.toggleBookAI('chat-1', false);

      expect(bookaiApi.patch).toHaveBeenCalledWith('/v1/chatter/chats/chat-1/bookai', {
        bookai_enabled: false,
      });
    });

    it('sends true when enabling BookAI', async () => {
      vi.mocked(bookaiApi.patch).mockResolvedValue({ data: {} });

      await repo.toggleBookAI('chat-1', true);

      expect(bookaiApi.patch).toHaveBeenCalledWith('/v1/chatter/chats/chat-1/bookai', {
        bookai_enabled: true,
      });
    });
  });
});
