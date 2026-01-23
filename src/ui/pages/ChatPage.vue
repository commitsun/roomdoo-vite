<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- left panel: chat list (reads from store directly) -->
      <div class="chat-list-panel" :class="{ 'mobile-hidden': showConversation }">
        <ChatList @toggle-menu="handleToggleMenu" />
      </div>

      <!-- right panel: conversation or AI assistant -->
      <div class="conversation-panel" :class="{ 'mobile-hidden': !showConversation }">
        <!-- AI Assistant Panel -->
        <AIAssistantConversationPanel
          v-if="isAIAssistantSelected"
          :messages="aiAssistantMessagesList"
          :is-typing="isAITyping"
          :conversations="aiConversationsList"
          :current-conversation-id="currentAIConversationId"
          @send-message="handleSendAIMessage"
          @back-to-list="handleBackToList"
          @new-chat="handleNewAIChat"
          @select-conversation="handleSelectAIConversation"
        />

        <!-- Regular Conversation Panel -->
        <ConversationPanel
          v-else
          :chat="selectedChat"
          :messages="currentMessages"
          :is-loading="isLoadingMessages"
          :internal-sessions="internalSessionsMutable"
          @send-message="handleSendMessage"
          @toggle-bookai="handleToggleBookAI"
          @toggle-pin="handleTogglePin"
          @view-reservation="handleViewReservation"
          @search-in-chat="handleSearchInChat"
          @menu-action="handleMenuAction"
          @load-more="handleLoadMore"
          @back-to-list="handleBackToList"
          @send-proposed-response="handleSendProposedResponse"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useChatStore } from '@/infrastructure/stores/chat';
import ChatList from '@/ui/components/chat/ChatList.vue';
import ConversationPanel from '@/ui/components/chat/ConversationPanel.vue';
import AIAssistantConversationPanel from '@/ui/components/chat/AIAssistantConversationPanel.vue';

export default defineComponent({
  name: 'ChatPage',
  components: {
    ChatList,
    ConversationPanel,
    AIAssistantConversationPanel,
  },
  emits: ['showMenu', 'open-reservation-drawer'],
  setup(_, { emit }) {
    const route = useRoute();
    const chatStore = useChatStore();

    // store refs (only what ConversationPanel needs)
    const {
      selectedChat,
      currentMessages,
      isLoadingMessages,
      isAIAssistantSelected,
      aiAssistantMessages,
      isAITyping,
      aiConversations,
      currentAIConversationId,
      internalConversationSessions,
    } = storeToRefs(chatStore);

    // mobile navigation state: show conversation when a chat or AI assistant is selected
    const showConversation = computed((): boolean => {
      return selectedChat.value !== null || isAIAssistantSelected.value;
    });

    // Create mutable copies for component props (components expect arrays, not readonly)
    const aiAssistantMessagesList = computed(() => [...aiAssistantMessages.value]);
    const aiConversationsList = computed(() =>
      aiConversations.value.map((conv) => ({
        ...conv,
        messages: [...conv.messages],
      })),
    );
    // Create mutable Map copy for internal sessions
    const internalSessionsMutable = computed(() => {
      const mutableMap = new Map();
      internalConversationSessions.value.forEach((session, key) => {
        mutableMap.set(key, {
          ...session,
          messages: [...session.messages],
        });
      });
      return mutableMap;
    });

    // load chats on mount and start polling
    onMounted(async (): Promise<void> => {
      await chatStore.fetchChats();

      // Start polling for chat list updates
      chatStore.startChatsPolling();

      // if chatId in URL, select it (handle 'assistant' as special case)
      const chatIdParam = route.params.chatId as string | undefined;
      if (chatIdParam === 'assistant') {
        await chatStore.selectAIAssistant();
      } else if (chatIdParam !== undefined) {
        await chatStore.selectChat(chatIdParam);
      }
    });

    // cleanup polling on unmount
    onUnmounted(() => {
      chatStore.stopAllPolling();
    });

    // watch route changes for chat selection (e.g., browser back/forward)
    watch(
      () => route.params.chatId,
      async (newChatId): Promise<void> => {
        if (newChatId === 'assistant') {
          // Handle AI assistant route
          await chatStore.selectAIAssistant();
        } else if (newChatId !== undefined && typeof newChatId === 'string') {
          // Handle regular chat route
          chatStore.deselectAIAssistant();
          await chatStore.selectChat(newChatId);
        } else {
          // user navigated back to /chat without a chatId - deselect both
          chatStore.deselectAIAssistant();
          await chatStore.selectChat(null);
        }
      },
    );

    // handlers
    const handleSendAIMessage = async (message: string): Promise<void> => {
      await chatStore.sendAIAssistantMessage(message);
    };

    const handleNewAIChat = async (): Promise<void> => {
      await chatStore.createNewAIConversation();
    };

    const handleSelectAIConversation = async (conversationId: string): Promise<void> => {
      await chatStore.loadAIConversation(conversationId);
    };

    const handleSendMessage = async (message: string): Promise<void> => {
      await chatStore.sendMessage(message);
    };

    const handleToggleBookAI = (enabled: boolean): void => {
      void chatStore.toggleBookAI(enabled);
    };

    const handleTogglePin = (): void => {
      // TODO: implement pin toggle
    };

    const handleViewReservation = (): void => {
      if (selectedChat.value?.reservationId !== undefined) {
        // TODO: map reservationId (e.g., 'F-HAO2100001') to actual folioId via API
        // for now using hardcoded folioId for mock data
        const folioId = 1;

        // emit event to ChatLayout to open the reservation drawer
        emit('open-reservation-drawer', folioId);
      }
    };

    const handleSearchInChat = (): void => {
      // TODO: implement in-chat search
    };

    const handleMenuAction = (_action: string): void => {
      // TODO: handle menu actions
    };

    const handleLoadMore = (): void => {
      // TODO: implement infinite scroll for messages
    };

    const handleBackToList = (): void => {
      // clear selected chat or AI assistant to go back to list on mobile
      if (isAIAssistantSelected.value) {
        chatStore.deselectAIAssistant();
      } else {
        void chatStore.selectChat(null);
      }

      // Update URL to remove chatId (back to /chat)
      window.history.replaceState(null, '', '/chat');
    };

    const handleToggleMenu = (): void => {
      emit('showMenu');
    };

    const handleSendProposedResponse = async (content: string): Promise<void> => {
      // Send the AI's proposed response to the guest
      await chatStore.sendProposedResponse(content);
    };

    return {
      // state (only for ConversationPanel)
      selectedChat,
      currentMessages,
      isLoadingMessages,
      showConversation,
      internalSessionsMutable,

      // AI Assistant state
      isAIAssistantSelected,
      aiAssistantMessagesList,
      isAITyping,
      aiConversationsList,
      currentAIConversationId,

      // handlers
      handleSendAIMessage,
      handleNewAIChat,
      handleSelectAIConversation,
      handleSendMessage,
      handleToggleBookAI,
      handleTogglePin,
      handleViewReservation,
      handleSearchInChat,
      handleMenuAction,
      handleLoadMore,
      handleBackToList,
      handleToggleMenu,
      handleSendProposedResponse,
    };
  },
});
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100%;
  background-color: #f8fafc;
}

.chat-container {
  display: flex;
  height: 100%;
}

.chat-list-panel {
  width: 100%;
  flex-shrink: 0;
  background-color: white;
  display: flex;
  border-right: 1px solid var(--p-surface-200);

  /* mobile: hide when conversation is shown */
  &.mobile-hidden {
    display: none;
  }

  @media (min-width: 1024px) {
    width: 360px;
    display: flex !important; /* always show on desktop */
  }
}

.conversation-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  width: 100%;

  /* mobile: hide when no conversation is selected */
  &.mobile-hidden {
    display: none;
  }

  @media (min-width: 1024px) {
    display: flex !important; /* always show on desktop */
  }
}

@media (min-width: 1024px) {
  .chat-page {
    padding: 18px;
  }

  .chat-container {
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .chat-list-panel {
    width: 400px;
  }
}
</style>
