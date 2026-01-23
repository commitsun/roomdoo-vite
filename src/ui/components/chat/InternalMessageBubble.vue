<template>
  <div
    class="flex items-end gap-2 mb-3"
    :class="{
      'justify-start': message.sender === 'internal_ai',
      'justify-end': message.sender === 'staff',
    }"
  >
    <!-- AI avatar (left side) -->
    <Avatar
      v-if="message.sender === 'internal_ai'"
      image="/app-images/bookai-avatar.png"
      shape="circle"
      size="normal"
      class="flex-shrink-0"
    />

    <!-- Message bubble -->
    <div
      class="flex flex-col gap-1 max-w-[85%] lg:max-w-[70%] px-3.5 py-2.5 shadow-sm"
      :class="bubbleClasses"
    >
      <!-- Proposed response indicator -->
      <div
        v-if="message.isProposedGuestResponse"
        class="flex items-center gap-1.5 text-xs text-amber-700 font-medium mb-1"
      >
        <Send :size="12" />
        <span>{{ t('chat.internalConversation.proposedResponse') }}</span>
      </div>

      <!-- AI label for internal AI messages -->
      <div
        v-if="message.sender === 'internal_ai' && !message.isProposedGuestResponse"
        class="flex items-center gap-1.5 text-xs text-muted-color"
      >
        <Sparkles :size="12" />
        <span>{{ t('chat.bookAI.assistant') }}</span>
      </div>

      <!-- Message content -->
      <p class="message-content m-0 text-color whitespace-pre-wrap break-words">
        {{ message.content }}
      </p>

      <!-- Timestamp -->
      <div class="flex items-center justify-end">
        <span class="text-xs text-muted-color">{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Staff avatar (right side) -->
    <Avatar
      v-if="message.sender === 'staff'"
      icon="pi pi-user"
      shape="circle"
      size="normal"
      class="flex-shrink-0 bg-sky-100 text-sky-600"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles, Send } from 'lucide-vue-next';
import Avatar from 'primevue/avatar';

import type { InternalConversationMessage } from '@/domain/entities/Chat';

export default defineComponent({
  name: 'InternalMessageBubble',
  components: {
    Sparkles,
    Send,
    Avatar,
  },
  props: {
    message: {
      type: Object as PropType<InternalConversationMessage>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const bubbleClasses = computed((): string => {
      const baseRadius = 'rounded-xl';

      if (props.message.sender === 'internal_ai') {
        // Cream/amber bubble for AI, rounded except bottom-left
        if (props.message.isProposedGuestResponse === true) {
          // Slightly different styling for proposed responses
          return `bg-amber-100 border border-amber-200 ${baseRadius} rounded-bl-none`;
        }
        return `bg-amber-50 ${baseRadius} rounded-bl-none`;
      }

      // Staff messages: white bubble, rounded except bottom-right
      return `bg-white ${baseRadius} rounded-br-none`;
    });

    const formattedTime = computed((): string => {
      const date = new Date(props.message.timestamp);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    return {
      t,
      bubbleClasses,
      formattedTime,
    };
  },
});
</script>

<style lang="scss" scoped>
.message-content {
  font-family: var(--p-font-family);
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
