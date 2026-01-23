<template>
  <div class="flex flex-col h-full bg-surface-0">
    <!-- Header -->
    <div class="ai-assistant-header">
      <!-- Back button (mobile only) -->
      <button class="back-button lg:hidden" @click="$emit('back-to-list')">
        <ChevronLeft :size="24" />
      </button>

      <!-- Avatar and info -->
      <div class="flex items-center gap-3 flex-1">
        <Avatar
          image="/app-images/bookai-avatar.png"
          shape="circle"
          size="large"
          class="flex-shrink-0"
        />
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-color m-0">{{ t('chat.bookAI.assistant') }}</h2>
            <Sparkles :size="16" class="text-primary" />
          </div>
          <p class="text-sm text-muted-color m-0">{{ t('chat.bookAI.subtitle') }}</p>
        </div>
      </div>

      <!-- Drawer toggle button -->
      <button class="drawer-toggle-button" @click="isDrawerVisible = true">
        <History :size="20" />
      </button>
    </div>

    <!-- Chat History Drawer -->
    <AIAssistantChatDrawer
      v-model:visible="isDrawerVisible"
      :conversations="conversations"
      :current-conversation-id="currentConversationId"
      @new-chat="$emit('new-chat')"
      @select-conversation="(id) => $emit('select-conversation', id)"
    />

    <!-- Messages -->
    <div ref="messageContainerRef" class="flex-1 overflow-y-auto p-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <!-- Messages -->
      <div v-else>
        <div v-for="message in messages" :key="message.id" class="mb-4">
          <MessageBubble
            :message="message"
            :contact-image="
              message.sender === 'bookai' ? '/app-images/bookai-avatar.png' : undefined
            "
            :contact-name="message.sender === 'bookai' ? 'BookAI' : undefined"
            :show-status="false"
          />
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="typing-indicator">
          <Avatar
            image="/app-images/bookai-avatar.png"
            shape="circle"
            size="normal"
            class="flex-shrink-0"
          />
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <Card class="m-2 lg:m-3">
      <template #content>
        <div class="flex flex-col gap-2">
          <Textarea
            v-model="messageText"
            :placeholder="t('chat.bookAI.inputPlaceholder')"
            :disabled="disabled || isTyping"
            :autoResize="true"
            rows="2"
            fluid
            @keydown="handleKeydown"
          />
          <div class="flex justify-end">
            <Button
              :disabled="disabled || !messageText.trim() || isTyping"
              size="small"
              icon="pi pi-send"
              @click="sendMessage"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';
import Card from 'primevue/card';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { ChevronLeft, Sparkles, History } from 'lucide-vue-next';

import type { Message, AIConversation } from '@/domain/entities/Chat';
import MessageBubble from '@/ui/components/chat/MessageBubble.vue';
import AIAssistantChatDrawer from '@/ui/components/chat/AIAssistantChatDrawer.vue';

export default defineComponent({
  name: 'AIAssistantConversationPanel',
  components: {
    Avatar,
    Card,
    Textarea,
    Button,
    ProgressSpinner,
    ChevronLeft,
    Sparkles,
    History,
    MessageBubble,
    AIAssistantChatDrawer,
  },
  props: {
    messages: {
      type: Array as PropType<Message[]>,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    conversations: {
      type: Array as PropType<AIConversation[]>,
      default: () => [],
    },
    currentConversationId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ['send-message', 'back-to-list', 'new-chat', 'select-conversation'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const messageText = ref('');
    const messageContainerRef = ref<HTMLElement | null>(null);
    const isDrawerVisible = ref(false);

    const scrollToBottom = async (smooth = false): Promise<void> => {
      await nextTick();
      if (messageContainerRef.value) {
        messageContainerRef.value.scrollTo({
          top: messageContainerRef.value.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    };

    const sendMessage = (): void => {
      const text = messageText.value.trim();
      if (!text) {
        return;
      }
      emit('send-message', text);
      messageText.value = '';
    };

    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    };

    // Auto-scroll when messages change
    watch(
      () => props.messages.length,
      (newLength, oldLength) => {
        const isAddingMessage = oldLength > 0 && newLength > oldLength;
        void scrollToBottom(isAddingMessage);
      },
    );

    // Scroll when typing indicator appears
    watch(
      () => props.isTyping,
      (typing) => {
        if (typing) {
          void scrollToBottom(true);
        }
      },
    );

    return {
      t,
      messageText,
      messageContainerRef,
      isDrawerVisible,
      sendMessage,
      handleKeydown,
    };
  },
});
</script>

<style lang="scss" scoped>
.ai-assistant-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-bottom: 1px solid var(--p-surface-200);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--p-surface-600);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--p-surface-100);
  }
}

.drawer-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--p-surface-600);
  transition:
    background-color 0.2s,
    color 0.2s;
  margin-left: 0.5rem;

  &:hover {
    background-color: var(--p-surface-100);
    color: var(--p-primary-500);
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.75rem 1rem;
  background: var(--p-surface-100);
  border-radius: 1rem;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--p-surface-400);
    animation: typing-bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }
}

@keyframes typing-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// Message container scrollbar styling
.flex-1.overflow-y-auto {
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
</style>
