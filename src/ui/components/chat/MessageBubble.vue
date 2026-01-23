<template>
  <div
    class="flex items-end gap-2 mb-3"
    :class="{
      'justify-start': message.sender === 'guest',
      'justify-end': message.sender !== 'guest',
    }"
  >
    <!-- Guest avatar (left side) -->
    <Avatar
      v-if="message.sender === 'guest'"
      :image="contactImage"
      :label="contactImage ? undefined : avatarLabel"
      shape="circle"
      size="normal"
      class="flex-shrink-0"
    />

    <!-- Message bubble using PrimeVue Card-like styling -->
    <div
      class="flex flex-col gap-1 max-w-[85%] lg:max-w-[70%] px-3.5 py-2.5 shadow-sm"
      :class="bubbleClasses"
    >
      <!-- AI indicator label (shown for both 'bookai' and 'ai_assisted' senders) -->
      <div
        v-if="message.sender === 'bookai' || message.sender === 'ai_assisted'"
        class="flex items-center gap-1.5 text-xs text-muted-color"
      >
        <Sparkles :size="12" />
        <span>{{
          message.sender === 'ai_assisted' ? t('chat.aiAssistedLabel') : t('chat.aiAssistant')
        }}</span>
      </div>

      <!-- Message content -->
      <p
        v-if="hasSearchHighlight"
        class="message-content m-0 whitespace-pre-wrap break-words"
        :class="textColorClass"
        v-html="highlightedContent"
      />
      <p v-else class="message-content m-0 whitespace-pre-wrap break-words" :class="textColorClass">
        {{ displayContent }}
      </p>

      <!-- Footer: timestamp and status -->
      <div class="flex items-center justify-end gap-1.5">
        <span class="text-xs text-muted-color">{{ formattedTime }}</span>
        <MessageStatusIcon
          v-if="showStatus && message.sender !== 'guest'"
          :message-status="message.status"
        />
      </div>

      <!-- Debug panel: show raw API values -->
      <div
        v-if="isDebugMode && message.debug"
        class="mt-2 p-2 bg-gray-900 text-white text-[11px] font-mono rounded"
        :class="hasSenderMismatch ? 'border-2 border-red-500 bg-red-950' : 'border border-gray-600'"
      >
        <div class="font-bold mb-1" :class="hasSenderMismatch ? 'text-red-400' : 'text-gray-400'">
          {{ hasSenderMismatch ? 'MISMATCH DETECTADO' : 'API DEBUG' }}
        </div>
        <div class="space-y-0.5">
          <div v-if="message.debug.sentAs">
            <span class="text-gray-400">Enviado como:</span>
            <span class="text-pink-300 font-bold ml-1">{{ message.debug.sentAs }}</span>
            <span class="text-gray-500 mx-1">-></span>
            <span class="text-gray-400">API devuelve:</span>
            <span
              :class="hasSenderMismatch ? 'text-red-400' : 'text-yellow-300'"
              class="font-bold ml-1"
              >{{ message.debug.rawSender }}</span
            >
            <span class="text-gray-500 mx-1">-></span>
            <span class="text-green-300 font-bold">{{ message.sender }}</span>
          </div>
          <div v-else>
            <span class="text-gray-400">Sender (API):</span>
            <span class="text-yellow-300 font-bold ml-1">{{ message.debug.rawSender }}</span>
            <span class="text-gray-500 mx-1">se mapea a</span>
            <span class="text-green-300 font-bold">{{ message.sender }}</span>
          </div>
          <div>
            <span class="text-gray-400">Leído:</span>
            <span
              :class="message.debug.rawReadStatus ? 'text-green-300' : 'text-orange-300'"
              class="ml-1"
            >
              {{ message.debug.rawReadStatus ? 'Sí' : 'No' }}
            </span>
          </div>
          <div>
            <span class="text-gray-400">Timestamp API:</span>
            <span class="text-cyan-300 ml-1">{{ message.debug.rawTimestamp }}</span>
          </div>
          <div v-if="message.debug.originalChatId">
            <span class="text-gray-400">Chat ID original:</span>
            <span class="text-purple-300 ml-1">{{ message.debug.originalChatId }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hotel/AI avatar (right side) -->
    <Avatar
      v-if="message.sender !== 'guest'"
      image="/app-images/bookai-avatar.png"
      shape="circle"
      size="normal"
      class="flex-shrink-0"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from 'lucide-vue-next';
import Avatar from 'primevue/avatar';

import type { Message } from '@/domain/entities/Chat';
import MessageStatusIcon from '@/ui/components/chat/MessageStatusIcon.vue';

export default defineComponent({
  name: 'MessageBubble',
  components: {
    Sparkles,
    Avatar,
    MessageStatusIcon,
  },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true,
    },
    showStatus: {
      type: Boolean,
      default: true,
    },
    contactImage: {
      type: String,
      default: undefined,
    },
    contactName: {
      type: String,
      default: undefined,
    },
    searchQuery: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { t } = useI18n();

    // Debug mode: show sender value on each message
    const isDebugMode = import.meta.env.ROOMDOO_DEBUG === 'true';

    // Detect sender mismatch: when sentAs !== rawSender (what we sent vs what API returned)
    const hasSenderMismatch = computed((): boolean => {
      const sentAs = props.message.debug?.sentAs;
      if (sentAs === undefined || sentAs === null || sentAs === '') {
        return false;
      }
      return sentAs !== props.message.debug?.rawSender;
    });

    const bubbleClasses = computed((): string => {
      const baseRadius = 'rounded-xl';

      switch (props.message.sender) {
        case 'guest':
          // White bubble (#FFFFFF), rounded except bottom-left
          return `bg-white ${baseRadius} rounded-bl-none`;
        case 'bookai':
        case 'ai_assisted':
          // Cream/amber bubble for AI (including AI-assisted), rounded except bottom-right
          return `bg-amber-50 ${baseRadius} rounded-br-none`;
        default: // hotel
          // Light gray bubble for hotel staff, rounded except bottom-right
          return `bg-[#F1F5F9] ${baseRadius} rounded-br-none`;
      }
    });

    // Text color for all messages
    const textColorClass = 'text-[#334155]';

    const avatarLabel = computed((): string => {
      const name = props.contactName;
      if (name === undefined || name === null || name === '') {
        return '?';
      }
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    });

    const formattedTime = computed((): string => {
      const date = new Date(props.message.timestamp);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    const displayContent = computed((): string => {
      if (props.message.aiRequestType === 'help_needed') {
        return t('chat.aiHelp.interventionRequired');
      }
      return props.message.content;
    });

    /**
     * Escape HTML special characters to prevent XSS
     */
    const escapeHtml = (text: string): string => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    /**
     * Highlight search query matches in the message content
     */
    const highlightedContent = computed((): string => {
      const content = displayContent.value;
      const query = props.searchQuery;

      if (query.length === 0) {
        return escapeHtml(content);
      }

      // Escape the content first
      const escapedContent = escapeHtml(content);
      // Escape regex special characters in query
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Create case-insensitive regex
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      // Replace with highlighted span
      return escapedContent.replace(regex, '<mark class="search-highlight">$1</mark>');
    });

    /**
     * Whether to use highlighted content (v-html) or plain text
     */
    const hasSearchHighlight = computed((): boolean => {
      return props.searchQuery.length > 0;
    });

    return {
      t,
      isDebugMode,
      hasSenderMismatch,
      bubbleClasses,
      textColorClass,
      avatarLabel,
      formattedTime,
      displayContent,
      highlightedContent,
      hasSearchHighlight,
    };
  },
});
</script>

<style lang="scss" scoped>
/* Message text typography */
.message-content {
  font-family: var(--p-font-family);
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  /* Search highlight styling */
  :deep(.search-highlight) {
    background-color: rgb(251, 191, 36);
    color: rgb(0, 0, 0);
    padding: 0 2px;
    border-radius: 2px;
  }
}
</style>
