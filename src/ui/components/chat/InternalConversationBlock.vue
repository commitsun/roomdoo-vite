<template>
  <div class="internal-conversation-block">
    <!-- Divider -->
    <div class="flex items-center justify-center gap-2 my-4">
      <div class="flex-1 h-px bg-amber-200"></div>
      <div
        class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full text-amber-700 text-xs font-medium"
      >
        <Sparkles :size="12" />
        <span>{{ t('chat.internalConversation.divider') }}</span>
      </div>
      <div class="flex-1 h-px bg-amber-200"></div>
    </div>

    <!-- Main container with amber gradient -->
    <div class="internal-conversation-container rounded-xl p-4">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-3">
        <div class="flex items-center justify-center w-8 h-8 bg-amber-200 rounded-full">
          <AlertTriangle :size="16" class="text-amber-700" />
        </div>
        <h4 class="text-base font-semibold text-amber-900 m-0">
          {{ t('chat.internalConversation.title') }}
        </h4>
      </div>

      <!-- Guest query context -->
      <div class="guest-query-context mb-4">
        <p class="text-xs text-surface-500 mb-1">{{ t('chat.internalConversation.guestAsked') }}</p>
        <p class="text-sm text-surface-700 m-0">{{ session.guestQuery }}</p>
      </div>

      <!-- AI help request context -->
      <div class="ai-help-request mb-4 p-3 bg-amber-50 rounded-lg border-l-3 border-amber-400">
        <p class="text-sm text-amber-800 m-0">{{ session.aiHelpRequest }}</p>
      </div>

      <!-- Conversation messages -->
      <div class="conversation-messages">
        <InternalMessageBubble
          v-for="message in session.messages"
          :key="message.id"
          :message="message"
        />
      </div>

      <!-- Resolution indicator (if resolved) -->
      <div
        v-if="session.status === 'resolved'"
        class="resolution-indicator mt-4 pt-3 border-t border-amber-200"
      >
        <div class="flex items-center gap-2 text-green-700">
          <CheckCircle :size="16" />
          <span class="text-sm font-medium">{{ t('chat.internalConversation.resolved') }}</span>
        </div>
      </div>

      <!-- Cancelled indicator (if cancelled) -->
      <div
        v-if="session.status === 'cancelled'"
        class="resolution-indicator mt-4 pt-3 border-t border-amber-200"
      >
        <div class="flex items-center gap-2 text-surface-500">
          <XCircle :size="16" />
          <span class="text-sm">{{ t('chat.internalConversation.cancelled') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles, AlertTriangle, CheckCircle, XCircle } from 'lucide-vue-next';

import type { InternalConversationSession } from '@/domain/entities/Chat';
import InternalMessageBubble from '@/ui/components/chat/InternalMessageBubble.vue';

export default defineComponent({
  name: 'InternalConversationBlock',
  components: {
    Sparkles,
    AlertTriangle,
    CheckCircle,
    XCircle,
    InternalMessageBubble,
  },
  props: {
    session: {
      type: Object as PropType<InternalConversationSession>,
      required: true,
    },
  },
  setup() {
    const { t } = useI18n();

    return {
      t,
    };
  },
});
</script>

<style lang="scss" scoped>
.internal-conversation-container {
  background: linear-gradient(180deg, rgba(254, 243, 199, 0.6) 0%, rgba(254, 249, 195, 0.4) 100%);
  border-left: 3px solid rgb(251, 191, 36);
}

.guest-query-context {
  padding-left: 0.75rem;
  border-left: 3px solid rgb(251, 191, 36);
}

.border-l-3 {
  border-left-width: 3px;
}
</style>
