<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Empty state when no chat selected -->
    <div v-if="!chat" class="flex flex-col items-center justify-center h-full text-center p-6">
      <MessageCircle :size="64" class="text-surface-300 mb-4" />
      <h3 class="text-lg font-medium text-surface-700 mb-2">
        {{ t('chat.selectChat.title') }}
      </h3>
      <p class="text-surface-500">{{ t('chat.selectChat.description') }}</p>
    </div>

    <!-- Conversation content -->
    <Transition name="fade" mode="out-in">
      <div v-if="chat" :key="chat.id" class="conversation-content">
        <!-- Header -->
        <ConversationHeader
          :contact="chat.contact"
          :reservation-id="chat.reservationId"
          :is-pinned="chat.isPinned || false"
          :is-search-active="isSearchActive"
          :search-query="searchQuery"
          :search-results-total="searchResultsTotal"
          :current-search-index="currentSearchIndex"
          :book-a-i-enabled="chat.bookAIEnabled"
          @toggle-pin="$emit('toggle-pin')"
          @view-reservation="$emit('view-reservation')"
          @search="openSearch"
          @close-search="closeSearch"
          @update:search-query="searchQuery = $event"
          @prev-result="goToPrevResult"
          @next-result="goToNextResult"
          @menu-action="handleMenuAction"
          @back-to-list="$emit('back-to-list')"
        />

        <!-- Content area with gradient when BookAI is enabled -->
        <div class="conversation-body" :class="{ 'bookai-active': chat.bookAIEnabled }">
          <!-- 24-hour manual control toast -->
          <div v-if="showManualControlToast" class="px-4 pt-3 flex justify-end">
            <ManualControlToast @dismiss="dismissManualControlToast" />
          </div>

          <!-- Messages -->
          <MessageList
            ref="messageListRef"
            :messages="messages"
            :is-a-i-active="chat.bookAIEnabled"
            :is-loading="isLoading"
            :contact-image="chat.contact.image"
            :contact-name="chat.contact.name"
            :highlighted-message-index="highlightedMessageIndex"
            :search-query="isSearchActive ? searchQuery : ''"
            :internal-sessions="internalSessions"
            @load-more="$emit('load-more')"
          />

          <!-- Input -->
          <MessageInput
            :book-a-i-enabled="chat.bookAIEnabled"
            :disabled="isSending"
            :help-context="pendingHelpRequest"
            :internal-session="activeInternalSession"
            :remaining-hours="remainingHoursIn24Window"
            @send="handleSendMessage"
            @toggle-bookai="handleToggleBookAI"
            @internal-message="handleInternalMessage"
            @send-proposed-response="handleSendProposedResponse"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessageCircle } from 'lucide-vue-next';

import type {
  Chat,
  Message,
  AIHelpContext,
  InternalConversationSession,
} from '@/domain/entities/Chat';
import type { MessageSender } from '@/domain/types/ChatTypes';
import ConversationHeader from '@/ui/components/chat/ConversationHeader.vue';
import MessageList from '@/ui/components/chat/MessageList.vue';
import MessageInput from '@/ui/components/chat/MessageInput.vue';
import ManualControlToast from '@/ui/components/chat/ManualControlToast.vue';

export default defineComponent({
  name: 'ConversationPanel',
  components: {
    MessageCircle,
    ConversationHeader,
    MessageList,
    MessageInput,
    ManualControlToast,
  },
  props: {
    chat: {
      type: Object as PropType<Chat | null>,
      default: null,
    },
    messages: {
      type: Array as PropType<Message[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    internalSessions: {
      type: Object as PropType<Map<string, InternalConversationSession>>,
      default: () => new Map(),
    },
  },
  emits: [
    'send-message',
    'toggle-bookai',
    'toggle-pin',
    'view-reservation',
    'search-in-chat',
    'menu-action',
    'load-more',
    'back-to-list',
    'send-proposed-response',
  ],
  setup(props, { emit }) {
    const { t } = useI18n();
    const isSending = ref(false);
    const messageListRef = ref<InstanceType<typeof MessageList> | null>(null);

    // 24-hour toast dismiss state (session-based, per chat)
    const dismissedToastChatIds = ref<Set<string>>(new Set());

    // Calculate hours since the last guest message
    const hoursSinceLastGuestMessage = computed((): number | null => {
      if (props.messages.length === 0) {
        return null;
      }

      // Find the last guest message
      const guestMessages = props.messages.filter((msg) => msg.sender === 'guest');
      if (guestMessages.length === 0) {
        return null;
      }

      const lastGuestMessage = guestMessages[guestMessages.length - 1];
      const lastGuestMessageTime = new Date(lastGuestMessage.timestamp).getTime();
      const now = Date.now();

      return (now - lastGuestMessageTime) / (1000 * 60 * 60);
    });

    // Check if 24 hours have passed since the last guest message
    const isOver24HoursSinceLastGuestMessage = computed((): boolean => {
      const hours = hoursSinceLastGuestMessage.value;
      return hours !== null && hours >= 24;
    });

    // Calculate remaining hours in the 24-hour WhatsApp window (null if no guest messages)
    const remainingHoursIn24Window = computed((): number | null => {
      const hours = hoursSinceLastGuestMessage.value;
      if (hours === null) {
        return null;
      }
      const remaining = 24 - hours;
      return remaining > 0 ? remaining : 0;
    });

    // Show toast when 24 hours have passed and user hasn't dismissed it for this chat
    const showManualControlToast = computed((): boolean => {
      if (props.chat === null) {
        return false;
      }
      return (
        isOver24HoursSinceLastGuestMessage.value && !dismissedToastChatIds.value.has(props.chat.id)
      );
    });

    // Dismiss the toast for the current chat
    const dismissManualControlToast = (): void => {
      if (props.chat !== null) {
        dismissedToastChatIds.value.add(props.chat.id);
      }
    };

    // Search state
    const isSearchActive = ref(false);
    const searchQuery = ref('');
    const searchResults = ref<number[]>([]); // Indices of matching messages
    const currentSearchIndex = ref(0);

    // Computed: total search results
    const searchResultsTotal = computed(() => searchResults.value.length);

    // Computed: currently highlighted message index (in the original messages array)
    const highlightedMessageIndex = computed(() => {
      if (searchResults.value.length === 0) {
        return -1;
      }
      return searchResults.value[currentSearchIndex.value];
    });

    // Scroll to highlighted message
    const scrollToHighlightedMessage = (): void => {
      if (messageListRef.value !== null && highlightedMessageIndex.value >= 0) {
        messageListRef.value.scrollToMessage(highlightedMessageIndex.value);
      }
    };

    // Close search mode
    const closeSearch = (): void => {
      isSearchActive.value = false;
      searchQuery.value = '';
      searchResults.value = [];
      currentSearchIndex.value = 0;
    };

    // Open search mode
    const openSearch = (): void => {
      isSearchActive.value = true;
      searchQuery.value = '';
      searchResults.value = [];
      currentSearchIndex.value = 0;
    };

    // Navigate to previous result
    const goToPrevResult = (): void => {
      if (searchResults.value.length === 0) {
        return;
      }
      currentSearchIndex.value =
        currentSearchIndex.value > 0
          ? currentSearchIndex.value - 1
          : searchResults.value.length - 1;
      scrollToHighlightedMessage();
    };

    // Navigate to next result
    const goToNextResult = (): void => {
      if (searchResults.value.length === 0) {
        return;
      }
      currentSearchIndex.value =
        currentSearchIndex.value < searchResults.value.length - 1
          ? currentSearchIndex.value + 1
          : 0;
      scrollToHighlightedMessage();
    };

    // Search in messages
    const performSearch = (query: string): void => {
      if (query.length === 0) {
        searchResults.value = [];
        currentSearchIndex.value = 0;
        return;
      }

      const lowerQuery = query.toLowerCase();
      const results: number[] = [];

      props.messages.forEach((msg, index) => {
        if (msg.content.toLowerCase().includes(lowerQuery)) {
          results.push(index);
        }
      });

      searchResults.value = results;
      // Jump to last result (most recent message)
      currentSearchIndex.value = results.length > 0 ? results.length - 1 : 0;

      // Scroll to result
      scrollToHighlightedMessage();
    };

    // Watch searchQuery changes
    watch(searchQuery, (newQuery) => {
      performSearch(newQuery);
    });

    // Reset search when chat changes
    watch(
      () => props.chat?.id,
      () => {
        closeSearch();
      },
    );

    // Detect if the last message is an AI help request (but not if there's an internal session for it)
    const pendingHelpRequest = computed((): AIHelpContext | null => {
      if (props.messages.length === 0) {
        return null;
      }
      const lastMessage = props.messages[props.messages.length - 1];
      if (
        lastMessage.sender === 'bookai' &&
        lastMessage.aiRequestType === 'help_needed' &&
        lastMessage.aiHelpContext !== undefined
      ) {
        // Don't show the help panel if there's an internal conversation session for this message
        if (props.internalSessions.has(lastMessage.id)) {
          return null;
        }
        return lastMessage.aiHelpContext;
      }
      return null;
    });

    // Find active internal session based on the last help_needed message
    const activeInternalSession = computed(() => {
      if (props.messages.length === 0) {
        return null;
      }
      const lastMessage = props.messages[props.messages.length - 1];
      if (lastMessage.sender === 'bookai' && lastMessage.aiRequestType === 'help_needed') {
        const session = props.internalSessions.get(lastMessage.id);
        if (session !== undefined && session.status === 'active') {
          return session;
        }
      }
      return null;
    });

    const handleSendMessage = async (message: string, sender?: MessageSender): Promise<void> => {
      isSending.value = true;
      try {
        emit('send-message', message, sender);
      } finally {
        // Reset after a short delay to allow UI feedback
        setTimeout(() => {
          isSending.value = false;
        }, 300);
      }
    };

    const handleToggleBookAI = (enabled: boolean): void => {
      emit('toggle-bookai', enabled);
    };

    const handleMenuAction = (action: string): void => {
      emit('menu-action', action);
    };

    const handleInternalMessage = (payload: { content: string; withAI: boolean }): void => {
      // TODO: Implement sending message to internal conversation
      // For now, just log it
      // eslint-disable-next-line no-console
      console.log('[ConversationPanel] Internal message:', payload);
    };

    const handleSendProposedResponse = (content: string): void => {
      emit('send-proposed-response', content);
    };

    return {
      t,
      isSending,
      messageListRef,
      pendingHelpRequest,
      activeInternalSession,
      // 24-hour window
      showManualControlToast,
      dismissManualControlToast,
      remainingHoursIn24Window,
      // Search
      isSearchActive,
      searchQuery,
      searchResultsTotal,
      currentSearchIndex,
      highlightedMessageIndex,
      openSearch,
      closeSearch,
      goToPrevResult,
      goToNextResult,
      // Handlers
      handleSendMessage,
      handleToggleBookAI,
      handleMenuAction,
      handleInternalMessage,
      handleSendProposedResponse,
    };
  },
});
</script>

<style lang="scss" scoped>
.conversation-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conversation-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: white;

  &.bookai-active {
    background-image: url('/app-images/internal-chat-bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
}

/* Smooth fade transition when switching chats */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
