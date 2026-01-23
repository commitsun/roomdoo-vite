<template>
  <div ref="containerRef" class="flex-1 overflow-y-auto p-4">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="messages.length === 0"
      class="flex flex-col items-center justify-center h-full text-center"
    >
      <MessageSquare :size="48" class="text-surface-300 mb-4" />
      <p class="text-surface-500">{{ t('chat.messages.empty') }}</p>
    </div>

    <!-- Messages grouped by AI sessions -->
    <div v-else>
      <template v-for="(block, blockIndex) in messageBlocks" :key="blockIndex">
        <!-- Internal Conversation Block -->
        <template v-if="block.type === 'internal_conversation' && block.internalSession">
          <InternalConversationBlock
            :session="block.internalSession"
            @send-message="handleInternalMessage"
          />
        </template>

        <!-- AI Session Block -->
        <template v-else-if="block.type === 'ai_session'">
          <!-- AI Assistant Indicator at start of session (only once per continuous AI session) -->
          <AIAssistantIndicator v-if="block.showIndicator" :is-active="true" />

          <!-- AI session with gradient background -->
          <div class="ai-controlled-section rounded-xl p-4 mt-2 mb-4">
            <template v-for="message in block.messages" :key="message.id">
              <!-- Date separator -->
              <div
                v-if="dateSeparators.has(getMessageIndex(message))"
                class="flex justify-center my-4"
              >
                <Tag severity="secondary" rounded class="text-xs px-3 py-1">
                  {{ dateSeparators.get(getMessageIndex(message)) }}
                </Tag>
              </div>

              <!-- System event indicator -->
              <SystemEventIndicator
                v-if="message.sender === 'system' && message.systemEventType"
                :event-type="message.systemEventType"
              />

              <!-- Regular message bubble -->
              <template v-else>
                <div
                  :data-message-index="getMessageIndex(message)"
                  :class="{ 'message-highlighted': isMessageHighlighted(message) }"
                >
                  <MessageBubble
                    :message="message"
                    :contact-image="contactImage"
                    :contact-name="contactName"
                    :show-status="true"
                    :search-query="searchQuery"
                  />
                </div>

                <!-- "Asked for Help" indicator (for AI help_needed messages) -->
                <SystemEventIndicator
                  v-if="shouldShowHelpIndicator(message)"
                  event-type="ai_asked_help"
                />
              </template>
            </template>
          </div>
        </template>

        <!-- Normal messages (hotel/guest without AI) -->
        <template v-else>
          <template v-for="message in block.messages" :key="message.id">
            <!-- Date separator -->
            <div
              v-if="dateSeparators.has(getMessageIndex(message))"
              class="flex justify-center my-4"
            >
              <Tag severity="secondary" rounded class="text-xs px-3 py-1">
                {{ dateSeparators.get(getMessageIndex(message)) }}
              </Tag>
            </div>

            <!-- System event indicator -->
            <SystemEventIndicator
              v-if="message.sender === 'system' && message.systemEventType"
              :event-type="message.systemEventType"
            />

            <!-- Regular message bubble -->
            <div
              v-else
              :data-message-index="getMessageIndex(message)"
              :class="{ 'message-highlighted': isMessageHighlighted(message) }"
            >
              <MessageBubble
                :message="message"
                :contact-image="contactImage"
                :contact-name="contactName"
                :show-status="true"
                :search-query="searchQuery"
              />
            </div>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, onMounted, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { MessageSquare, ChevronUp } from 'lucide-vue-next';

import type { Message, MessageBlock, InternalConversationSession } from '@/domain/entities/Chat';
import MessageBubble from '@/ui/components/chat/MessageBubble.vue';
import AIAssistantIndicator from '@/ui/components/chat/AIAssistantIndicator.vue';
import InternalConversationBlock from '@/ui/components/chat/InternalConversationBlock.vue';
import SystemEventIndicator from '@/ui/components/chat/SystemEventIndicator.vue';

export default defineComponent({
  name: 'MessageList',
  components: {
    ProgressSpinner,
    Tag,
    MessageSquare,
    ChevronUp,
    MessageBubble,
    AIAssistantIndicator,
    InternalConversationBlock,
    SystemEventIndicator,
  },
  props: {
    messages: {
      type: Array as PropType<Message[]>,
      required: true,
    },
    isAIActive: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    contactImage: {
      type: String,
      default: undefined,
    },
    contactName: {
      type: String,
      default: undefined,
    },
    highlightedMessageIndex: {
      type: Number,
      default: -1,
    },
    searchQuery: {
      type: String,
      default: '',
    },
    internalSessions: {
      type: Map as unknown as PropType<Map<string, InternalConversationSession>>,
      default: () => new Map(),
    },
  },
  emits: ['load-more', 'internal-message'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const containerRef = ref<HTMLElement | null>(null);
    const scrollTimeout = ref<number | null>(null);

    /**
     * Format a date for the date separator tag.
     * Returns "Today", "Yesterday", or the formatted date.
     */
    const formatDateSeparator = (date: Date): string => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate(),
      );

      if (dateOnly.getTime() === todayOnly.getTime()) {
        return t('chat.dateSeparator.today');
      } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return t('chat.dateSeparator.yesterday');
      } else {
        return date.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }
    };

    /**
     * Check if two dates are on different calendar days.
     */
    const isDifferentDay = (date1: Date, date2: Date): boolean => {
      return (
        date1.getFullYear() !== date2.getFullYear() ||
        date1.getMonth() !== date2.getMonth() ||
        date1.getDate() !== date2.getDate()
      );
    };

    /**
     * Get unique dates from messages for date separators.
     * Returns a Map of message index -> formatted date label.
     */
    const dateSeparators = computed((): Map<number, string> => {
      const separators = new Map<number, string>();
      let lastDate: Date | null = null;

      props.messages.forEach((message, index) => {
        const messageDate = new Date(message.timestamp);
        if (lastDate === null || isDifferentDay(lastDate, messageDate)) {
          separators.set(index, formatDateSeparator(messageDate));
          lastDate = messageDate;
        }
      });

      return separators;
    });

    /**
     * Check if a message should show the "Asked for Help" indicator after it.
     */
    const shouldShowHelpIndicator = (message: Message): boolean => {
      return message.aiRequestType === 'help_needed';
    };

    /**
     * Group messages into blocks based on AI sessions and internal conversations.
     * - An AI session starts when an 'ai' message appears
     * - An AI session ends when a 'hotel' message appears (human takes over)
     * - Guest messages belong to the current block (ai_session or normal)
     * - Internal conversations are inserted after their trigger message
     * - The AI indicator is shown only once per continuous AI session (resets when hotel takes over)
     */
    const messageBlocks = computed((): MessageBlock[] => {
      const blocks: MessageBlock[] = [];
      let currentBlock: MessageBlock = { type: 'normal', messages: [] };
      let inAISession = false;
      let aiIndicatorShown = false; // Track if we've shown the indicator in this continuous session

      const pushCurrentBlock = (): void => {
        if (currentBlock.messages.length > 0) {
          blocks.push(currentBlock);
        }
      };

      const startAISession = (): void => {
        pushCurrentBlock();
        // Show indicator only for the first ai_session block in a continuous session
        currentBlock = {
          type: 'ai_session',
          messages: [],
          showIndicator: !aiIndicatorShown,
        };
        aiIndicatorShown = true;
        inAISession = true;
      };

      const endAISession = (): void => {
        pushCurrentBlock();
        currentBlock = { type: 'normal', messages: [] };
        inAISession = false;
        // Reset indicator flag when hotel takes manual control
        aiIndicatorShown = false;
      };

      const insertInternalConversation = (messageId: string): void => {
        const session = props.internalSessions.get(messageId);
        // Only show InternalConversationBlock for resolved/cancelled sessions (historical)
        // Active sessions are shown in MessageInput's internal-conversation-panel instead
        if (session && session.status !== 'active') {
          pushCurrentBlock();
          blocks.push({
            type: 'internal_conversation',
            messages: [],
            internalSession: session,
          });
          // Continue ai_session without showing indicator again
          currentBlock = {
            type: inAISession ? 'ai_session' : 'normal',
            messages: [],
            showIndicator: false,
          };
        }
      };

      for (const message of props.messages) {
        if (message.sender === 'bookai') {
          // AI message: start or continue AI session
          if (!inAISession) {
            startAISession();
          }

          // Add all AI messages to the block (including help_needed)
          currentBlock.messages.push(message);

          // Check if this message has an internal conversation (for historical sessions)
          if (message.aiRequestType === 'help_needed') {
            insertInternalConversation(message.id);
          }
        } else if (message.sender === 'hotel') {
          // Hotel message: end AI session if active
          if (inAISession) {
            endAISession();
          }
          currentBlock.messages.push(message);
        } else if (message.sender === 'system') {
          // System event: add to current block (traceability event)
          currentBlock.messages.push(message);
        } else {
          // Guest message: add to current block
          currentBlock.messages.push(message);
        }
      }

      // Push final block
      pushCurrentBlock();

      return blocks;
    });

    /**
     * Handle messages sent from internal conversation input
     */
    const handleInternalMessage = (payload: { content: string; withAI: boolean }): void => {
      emit('internal-message', payload);
    };

    const scrollToBottom = async (smooth = false): Promise<void> => {
      // Clear any pending scroll
      if (scrollTimeout.value !== null) {
        clearTimeout(scrollTimeout.value);
      }

      await nextTick();

      // Use requestAnimationFrame to ensure DOM is painted
      scrollTimeout.value = window.setTimeout(() => {
        if (containerRef.value) {
          containerRef.value.scrollTo({
            top: containerRef.value.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto',
          });
        }
        scrollTimeout.value = null;
      }, 0);
    };

    /**
     * Scroll to a specific message by its index in the messages array.
     * Used for search navigation.
     */
    const scrollToMessage = async (messageIndex: number): Promise<void> => {
      await nextTick();

      if (containerRef.value === null) {
        return;
      }

      // Find the message element by data attribute
      const messageElement = containerRef.value.querySelector(
        `[data-message-index="${messageIndex}"]`,
      );

      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    /**
     * Get the flat index of a message within the messageBlocks structure.
     * This is needed to match the original message index to the rendered elements.
     */
    const getMessageIndex = (message: Message): number => {
      return props.messages.findIndex((m) => m.id === message.id);
    };

    /**
     * Check if a message should be highlighted (search result)
     */
    const isMessageHighlighted = (message: Message): boolean => {
      if (props.highlightedMessageIndex < 0) {
        return false;
      }
      return getMessageIndex(message) === props.highlightedMessageIndex;
    };

    // Auto-scroll when messages change (smooth for new messages)
    watch(
      () => props.messages.length,
      (newLength, oldLength) => {
        // Smooth scroll only when adding messages (not when switching chats)
        const isAddingMessage = oldLength > 0 && newLength > oldLength;
        void scrollToBottom(isAddingMessage);
      },
    );

    // Watch for chat switch (messages array reference changes)
    watch(
      () => props.messages,
      () => {
        // Instant scroll when switching chats
        void scrollToBottom(false);
      },
    );

    // Initial scroll
    onMounted(() => {
      void scrollToBottom(false);
    });

    return {
      t,
      containerRef,
      messageBlocks,
      dateSeparators,
      scrollToMessage,
      getMessageIndex,
      isMessageHighlighted,
      shouldShowHelpIndicator,
      handleInternalMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
// Ensure smooth rendering when switching chats
.flex-1.overflow-y-auto {
  // Hardware acceleration for smooth scrolling
  will-change: scroll-position;
  transform: translateZ(0);

  // Optimize scroll performance
  overflow-anchor: auto;

  // Smooth scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.25);
    }
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.ai-controlled-section {
  margin-bottom: 1rem;
}

// Highlighted message during search
.message-highlighted {
  position: relative;
  animation: highlight-pulse 1.5s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 16px;
    background: rgba(251, 191, 36, 0.25);
    z-index: -1;
  }
}

@keyframes highlight-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
