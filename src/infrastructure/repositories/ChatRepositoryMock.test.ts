import { describe, it, expect, beforeEach } from 'vitest';

import { ChatRepositoryMock } from '@/infrastructure/repositories/ChatRepositoryMock';

describe('ChatRepositoryMock', () => {
  let repo: ChatRepositoryMock;

  beforeEach(() => {
    repo = new ChatRepositoryMock();
  });

  describe('getChats', () => {
    it('returns mock chats', async () => {
      const chats = await repo.getChats();

      expect(chats).toBeDefined();
      expect(Array.isArray(chats)).toBe(true);
      expect(chats.length).toBeGreaterThan(0);
    });

    it('filters by search term', async () => {
      const chats = await repo.getChats({ type: 'all', status: null, search: 'María' });

      expect(chats.length).toBeGreaterThan(0);
      chats.forEach((chat) => {
        expect(chat.contact.name?.toLowerCase()).toContain('maría');
      });
    });
  });

  describe('getChatById', () => {
    it('returns a chat by ID', async () => {
      const chats = await repo.getChats();
      const firstChat = chats[0];

      const chat = await repo.getChatById(firstChat.id);

      expect(chat).toBeDefined();
      expect(chat?.id).toBe(firstChat.id);
    });

    it('returns null for non-existent chat', async () => {
      const chat = await repo.getChatById('non-existent-id');

      expect(chat).toBeNull();
    });
  });

  describe('getMessages', () => {
    it('returns messages for a chat', async () => {
      const chats = await repo.getChats();
      const firstChat = chats[0];

      const messages = await repo.getMessages(firstChat.id);

      expect(messages).toBeDefined();
      expect(Array.isArray(messages)).toBe(true);
    });

    it('returns empty array for chat without messages', async () => {
      const messages = await repo.getMessages('non-existent-chat');

      expect(messages).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('creates a new message', async () => {
      const chats = await repo.getChats();
      const firstChat = chats[0];

      const message = await repo.sendMessage(firstChat.id, 'Test message');

      expect(message).toBeDefined();
      expect(message.content).toBe('Test message');
      expect(message.sender).toBe('hotel');
      expect(message.status).toBe('sent');
      expect(message.chatId).toBe(firstChat.id);
    });
  });

  describe('toggleBookAI', () => {
    it('toggles BookAI state', async () => {
      const chats = await repo.getChats();
      const firstChat = chats[0];
      const initialState = firstChat.bookAIEnabled;

      await repo.toggleBookAI(firstChat.id, !initialState);

      const updatedChat = await repo.getChatById(firstChat.id);
      expect(updatedChat?.bookAIEnabled).toBe(!initialState);
    });
  });

  describe('markAsRead', () => {
    it('sets unread count to zero', async () => {
      const chats = await repo.getChats();
      const chatWithUnread = chats.find((c) => c.unreadCount > 0);

      if (chatWithUnread) {
        await repo.markAsRead(chatWithUnread.id);

        const updatedChat = await repo.getChatById(chatWithUnread.id);
        expect(updatedChat?.unreadCount).toBe(0);
      }
    });
  });
});
