import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import type {
  Chat,
  Message,
  ChatFilters,
  AIConversation,
  InternalConversationSession,
} from '@/domain/entities/Chat';
import type { ChatFilterType, GuestStatus } from '@/domain/types/ChatTypes';
import { chatRepository } from '@/infrastructure/repositories/chatRepositoryFactory';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { i18n } from '@/infrastructure/plugins/i18n';

export const useChatStore = defineStore('chat', () => {
  // Polling configuration
  const CHAT_LIST_POLL_INTERVAL = 5000; // 5 seconds
  const MESSAGES_POLL_INTERVAL = 3000; // 3 seconds

  // State
  const chats = ref<Chat[]>([]);
  const currentChat = ref<Chat | null>(null);
  const error = ref<string | null>(null);
  const selectedChatId = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  const filters = ref<ChatFilters>({
    type: 'all',
    status: null,
    search: '',
  });
  const isLoadingChats = ref(false);
  const isLoadingMessages = ref(false);
  const isSendingMessage = ref(false);
  const bookAIGlobalEnabled = ref(true);

  // Polling state
  let chatsPollingInterval: ReturnType<typeof setInterval> | null = null;
  let messagesPollingInterval: ReturnType<typeof setInterval> | null = null;

  // AI Assistant State
  const isAIAssistantSelected = ref(false);
  const aiAssistantMessages = ref<Message[]>([]);
  const isAITyping = ref(false);
  const aiConversations = ref<AIConversation[]>([]);
  const currentAIConversationId = ref<string | null>(null);

  // Internal Conversation Sessions State
  const internalConversationSessions = ref<Map<string, InternalConversationSession>>(new Map());

  // Getters
  const filteredChats = computed(() => {
    let result = chats.value;

    // Filter by type
    if (filters.value.type === 'alerts') {
      result = result.filter((chat) => chat.unreadCount > 0);
    } else if (filters.value.type === 'checkin_pending') {
      result = result.filter((chat) => chat.guestStatus === 'arriving');
    }

    // Filter by guest status
    if (filters.value.status !== null) {
      result = result.filter((chat) => chat.guestStatus === filters.value.status);
    }

    // Filter by search
    if (filters.value.search.length > 0) {
      const search = filters.value.search.toLowerCase();
      result = result.filter(
        (chat) =>
          (chat.contact.name?.toLowerCase().includes(search) ?? false) ||
          (chat.contact.phone?.includes(search) ?? false) ||
          chat.lastMessage.content.toLowerCase().includes(search),
      );
    }

    // Sort by date (most recent first)
    return [...result].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  });

  /** Chats sorted by last_message_at descending */
  const sortedChats = computed(() =>
    [...chats.value].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  );

  const selectedChat = computed(() => {
    const chat = chats.value.find((c) => c.id === selectedChatId.value);
    return chat ?? null;
  });

  /** Total unread count across all chats */
  const unreadCount = computed(() => chats.value.reduce((sum, chat) => sum + chat.unreadCount, 0));

  // Legacy alias for backward compatibility
  const totalUnreadCount = unreadCount;

  // Actions

  /**
   * Fetches chats from the repository with optional filters
   */
  const fetchChats = async (filterOverrides?: Partial<ChatFilters>): Promise<void> => {
    isLoadingChats.value = true;
    error.value = null;
    try {
      const appliedFilters =
        filterOverrides !== undefined ? { ...filters.value, ...filterOverrides } : filters.value;
      chats.value = await chatRepository.getChats(appliedFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading chats';
      error.value = errorMessage;
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
    } finally {
      isLoadingChats.value = false;
    }
  };

  /**
   * Fetches messages for a specific chat from the repository
   */
  const fetchMessages = async (chatId: string): Promise<void> => {
    isLoadingMessages.value = true;
    error.value = null;
    try {
      messages.value = await chatRepository.getMessages(chatId);

      // Internal conversation sessions are not yet supported by the API
      // Clear any previous sessions when switching chats
      internalConversationSessions.value = new Map();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading messages';
      error.value = errorMessage;
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
      messages.value = [];
      internalConversationSessions.value = new Map();
    } finally {
      isLoadingMessages.value = false;
    }
  };

  /**
   * Silently polls chats without showing loading state
   * Used for real-time updates
   */
  const pollChats = async (): Promise<void> => {
    try {
      const newChats = await chatRepository.getChats(filters.value);
      // Smart merge: preserve order but update data
      chats.value = newChats;
    } catch {
      // Silent fail for polling - don't show error toast
      // eslint-disable-next-line no-console
      console.warn('[ChatStore::pollChats] Silent poll failed');
    }
  };

  /**
   * Silently polls messages for current chat without showing loading state
   * Used for real-time updates
   */
  const pollMessages = async (): Promise<void> => {
    if (currentChat.value === null) {
      return;
    }

    try {
      const newMessages = await chatRepository.getMessages(currentChat.value.id);
      // Only update if there are new messages
      if (newMessages.length !== messages.value.length) {
        messages.value = newMessages;
      } else if (newMessages.length > 0) {
        // Check if the last message is different (covers edits or status changes)
        const lastNew = newMessages[newMessages.length - 1];
        const lastOld = messages.value[messages.value.length - 1];
        if (lastNew.id !== lastOld.id || lastNew.status !== lastOld.status) {
          messages.value = newMessages;
        }
      }
    } catch {
      // Silent fail for polling - don't show error toast
      // eslint-disable-next-line no-console
      console.warn('[ChatStore::pollMessages] Silent poll failed');
    }
  };

  /**
   * Starts polling for chat list updates
   */
  const startChatsPolling = (): void => {
    if (chatsPollingInterval !== null) {
      return; // Already polling
    }
    // eslint-disable-next-line no-console
    console.log('[ChatStore::startChatsPolling] Starting chat list polling');
    chatsPollingInterval = setInterval(() => {
      void pollChats();
    }, CHAT_LIST_POLL_INTERVAL);
  };

  /**
   * Stops polling for chat list updates
   */
  const stopChatsPolling = (): void => {
    if (chatsPollingInterval !== null) {
      // eslint-disable-next-line no-console
      console.log('[ChatStore::stopChatsPolling] Stopping chat list polling');
      clearInterval(chatsPollingInterval);
      chatsPollingInterval = null;
    }
  };

  /**
   * Starts polling for messages in the current chat
   */
  const startMessagesPolling = (): void => {
    if (messagesPollingInterval !== null) {
      return; // Already polling
    }
    if (currentChat.value === null) {
      return; // No chat selected
    }
    // eslint-disable-next-line no-console
    console.log('[ChatStore::startMessagesPolling] Starting messages polling');
    messagesPollingInterval = setInterval(() => {
      void pollMessages();
    }, MESSAGES_POLL_INTERVAL);
  };

  /**
   * Stops polling for messages
   */
  const stopMessagesPolling = (): void => {
    if (messagesPollingInterval !== null) {
      // eslint-disable-next-line no-console
      console.log('[ChatStore::stopMessagesPolling] Stopping messages polling');
      clearInterval(messagesPollingInterval);
      messagesPollingInterval = null;
    }
  };

  /**
   * Stops all polling (cleanup function)
   */
  const stopAllPolling = (): void => {
    stopChatsPolling();
    stopMessagesPolling();
  };

  /**
   * Sends a message to the current chat via the repository
   */
  const sendMessage = async (content: string): Promise<void> => {
    const trimmedContent = content.trim();
    if (currentChat.value === null || trimmedContent.length === 0) {
      return;
    }

    isSendingMessage.value = true;
    error.value = null;
    try {
      const sentMessage = await chatRepository.sendMessage(currentChat.value.id, trimmedContent);
      messages.value.push(sentMessage);

      // Update last message in chat list
      const chat = chats.value.find((c) => c.id === currentChat.value?.id);
      if (chat !== undefined) {
        chat.lastMessage = sentMessage;
        chat.updatedAt = new Date();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending message';
      error.value = errorMessage;
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
    } finally {
      isSendingMessage.value = false;
    }
  };

  /**
   * Sends the AI's proposed response to the guest and resolves the internal conversation
   */
  const sendProposedResponse = async (content: string): Promise<void> => {
    const trimmedContent = content.trim();
    if (currentChat.value === null || trimmedContent.length === 0) {
      return;
    }

    isSendingMessage.value = true;
    error.value = null;
    try {
      // Send the message to the guest
      const sentMessage = await chatRepository.sendMessage(currentChat.value.id, trimmedContent);
      messages.value.push(sentMessage);

      // Update last message in chat list
      const chat = chats.value.find((c) => c.id === currentChat.value?.id);
      if (chat !== undefined) {
        chat.lastMessage = sentMessage;
        chat.updatedAt = new Date();
      }

      // Resolve the internal conversation session
      const lastMessage = messages.value.filter((m) => m.aiRequestType === 'help_needed').pop();
      if (lastMessage !== undefined) {
        const session = internalConversationSessions.value.get(lastMessage.id);
        if (session !== undefined) {
          session.status = 'resolved';
          session.resolvedAt = new Date();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending proposed response';
      error.value = errorMessage;
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
    } finally {
      isSendingMessage.value = false;
    }
  };

  /**
   * Marks the current chat as read via the repository
   */
  const markCurrentChatAsRead = async (): Promise<void> => {
    if (currentChat.value === null) {
      return;
    }

    try {
      await chatRepository.markAsRead(currentChat.value.id);
      // Update local state
      const chat = chats.value.find((c) => c.id === currentChat.value?.id);
      if (chat !== undefined) {
        chat.unreadCount = 0;
      }
      if (currentChat.value !== null) {
        currentChat.value.unreadCount = 0;
      }
    } catch {
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
    }
  };

  /**
   * Toggles BookAI for the current chat via the repository
   * Creates a system event for traceability when state changes
   */
  const toggleBookAI = async (enabled: boolean): Promise<void> => {
    if (currentChat.value === null) {
      return;
    }

    const chatId = currentChat.value.id;
    const previousState = currentChat.value.bookAIEnabled;
    try {
      // Optimistic update
      currentChat.value.bookAIEnabled = enabled;
      const chatInList = chats.value.find((c) => c.id === chatId);
      if (chatInList !== undefined) {
        chatInList.bookAIEnabled = enabled;
      }

      await chatRepository.toggleBookAI(chatId, enabled);

      // Create traceability system event
      const systemEvent: Message = {
        id: `system-${Date.now()}`,
        chatId: chatId,
        content: '',
        sender: 'system',
        status: 'read',
        timestamp: new Date(),
        systemEventType: enabled ? 'bookai_enabled' : 'bookai_disabled',
      };
      messages.value.push(systemEvent);
    } catch {
      // Revert optimistic update on error
      if (currentChat.value !== null) {
        currentChat.value.bookAIEnabled = previousState;
      }
      const chatInList = chats.value.find((c) => c.id === chatId);
      if (chatInList !== undefined) {
        chatInList.bookAIEnabled = previousState;
      }
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
    }
  };

  /**
   * Sets the current chat by ID, fetches messages, and marks as read
   */
  const setCurrentChat = async (chatId: string | null): Promise<void> => {
    // Stop previous messages polling when switching chats
    stopMessagesPolling();

    if (chatId === null) {
      currentChat.value = null;
      selectedChatId.value = null;
      messages.value = [];
      return;
    }

    const chat = chats.value.find((c) => c.id === chatId);
    if (chat === undefined) {
      return;
    }

    currentChat.value = chat;
    selectedChatId.value = chatId;

    // Fetch messages and mark as read
    await fetchMessages(chatId);
    await markCurrentChatAsRead();

    // Start polling for new messages
    startMessagesPolling();
  };

  // Legacy action for backward compatibility
  const selectChat = setCurrentChat;

  const setFilters = (newFilters: Partial<ChatFilters>): void => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const setFilterType = (type: ChatFilterType): void => {
    filters.value.type = type;
  };

  const setFilterStatus = (status: GuestStatus | null): void => {
    filters.value.status = status;
  };

  const setSearch = (search: string): void => {
    filters.value.search = search;
  };

  const toggleGlobalBookAI = (): void => {
    bookAIGlobalEnabled.value = !bookAIGlobalEnabled.value;
  };

  // AI Assistant Actions

  /** Special chat ID for AI Assistant conversations */
  const AI_ASSISTANT_CHAT_ID = 'ai-assistant';

  /**
   * Helper to get translated string
   */
  const t = (key: string): string => {
    return i18n.global.t(key) as string;
  };

  /**
   * Fetches AI assistant messages from the API
   */
  const fetchAIAssistantMessages = async (): Promise<void> => {
    isLoadingMessages.value = true;
    error.value = null;
    try {
      const fetchedMessages = await chatRepository.getMessages(AI_ASSISTANT_CHAT_ID);
      aiAssistantMessages.value = fetchedMessages;

      // If no messages, show welcome message
      if (fetchedMessages.length === 0) {
        aiAssistantMessages.value = [
          {
            id: 'ai-welcome-1',
            chatId: AI_ASSISTANT_CHAT_ID,
            content: t('chat.bookAI.responses.welcome'),
            sender: 'bookai',
            status: 'read',
            timestamp: new Date(),
          },
        ];
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error loading AI assistant messages';
      error.value = errorMessage;
      // Show welcome message on error as fallback
      aiAssistantMessages.value = [
        {
          id: 'ai-welcome-1',
          chatId: AI_ASSISTANT_CHAT_ID,
          content: t('chat.bookAI.responses.welcome'),
          sender: 'bookai',
          status: 'read',
          timestamp: new Date(),
        },
      ];
    } finally {
      isLoadingMessages.value = false;
    }
  };

  /**
   * Selects the AI assistant view and loads messages from API
   */
  const selectAIAssistant = async (): Promise<void> => {
    // Deselect any current chat
    currentChat.value = null;
    selectedChatId.value = null;
    messages.value = [];
    isAIAssistantSelected.value = true;

    // Fetch messages from API
    await fetchAIAssistantMessages();
  };

  /**
   * Creates a new AI conversation (clears current messages and starts fresh)
   */
  const createNewAIConversation = async (): Promise<void> => {
    currentAIConversationId.value = null;
    // Clear messages and show welcome
    aiAssistantMessages.value = [
      {
        id: `ai-welcome-${Date.now()}`,
        chatId: AI_ASSISTANT_CHAT_ID,
        content: t('chat.bookAI.responses.welcome'),
        sender: 'bookai',
        status: 'read',
        timestamp: new Date(),
      },
    ];
  };

  /**
   * Loads an existing AI conversation by ID
   * With single chat model, this just refreshes messages from API
   */
  const loadAIConversation = async (_conversationId: string): Promise<void> => {
    await fetchAIAssistantMessages();
  };

  /**
   * Deselects the AI assistant view
   */
  const deselectAIAssistant = (): void => {
    isAIAssistantSelected.value = false;
  };

  /**
   * Sends a message to the AI assistant via the API
   */
  const sendAIAssistantMessage = async (content: string): Promise<void> => {
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return;
    }

    isSendingMessage.value = true;
    error.value = null;

    // Add user message optimistically
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      chatId: AI_ASSISTANT_CHAT_ID,
      content: trimmedContent,
      sender: 'hotel',
      status: 'sent',
      timestamp: new Date(),
    };
    aiAssistantMessages.value.push(userMessage);

    // Show AI typing indicator while waiting for response
    isAITyping.value = true;

    try {
      // Send message to API
      await chatRepository.sendMessage(AI_ASSISTANT_CHAT_ID, trimmedContent);

      // Poll for AI response (the API will process and add AI response)
      // Wait a bit then fetch updated messages
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Fetch updated messages which should include AI response
      const updatedMessages = await chatRepository.getMessages(AI_ASSISTANT_CHAT_ID);
      aiAssistantMessages.value = updatedMessages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending message to AI';
      error.value = errorMessage;
      useTextMessagesStore().addTextMessage(
        'Error de conexion',
        'No ha sido posible conectarse al API',
      );
    } finally {
      isSendingMessage.value = false;
      isAITyping.value = false;
    }
  };

  // Alias for component compatibility
  const currentMessages = computed(() => messages.value);

  return {
    // State (readonly)
    chats: readonly(chats),
    currentChat: readonly(currentChat),
    selectedChatId: readonly(selectedChatId),
    messages: readonly(messages),
    currentMessages, // Alias for ChatPage.vue
    filters: readonly(filters),
    isLoadingChats: readonly(isLoadingChats),
    isLoadingMessages: readonly(isLoadingMessages),
    isSendingMessage: readonly(isSendingMessage),
    bookAIGlobalEnabled: readonly(bookAIGlobalEnabled),
    error: readonly(error),

    // AI Assistant State (readonly)
    isAIAssistantSelected: readonly(isAIAssistantSelected),
    aiAssistantMessages: readonly(aiAssistantMessages),
    isAITyping: readonly(isAITyping),
    aiConversations: readonly(aiConversations),
    currentAIConversationId: readonly(currentAIConversationId),

    // Internal Conversation Sessions (readonly)
    internalConversationSessions: readonly(internalConversationSessions),

    // Getters
    filteredChats,
    sortedChats,
    selectedChat,
    unreadCount,
    totalUnreadCount, // Legacy alias

    // Actions
    fetchChats,
    fetchMessages,
    sendMessage,
    sendProposedResponse,
    markCurrentChatAsRead,
    toggleBookAI,
    setCurrentChat,
    selectChat, // Legacy alias
    setFilters,
    setFilterType,
    setFilterStatus,
    setSearch,
    toggleGlobalBookAI,

    // AI Assistant Actions
    selectAIAssistant,
    deselectAIAssistant,
    sendAIAssistantMessage,
    createNewAIConversation,
    loadAIConversation,

    // Polling Actions
    startChatsPolling,
    stopChatsPolling,
    startMessagesPolling,
    stopMessagesPolling,
    stopAllPolling,
  };
});
