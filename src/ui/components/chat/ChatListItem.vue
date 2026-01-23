<template>
  <div
    class="chat-list-item flex items-center gap-2 p-4 cursor-pointer"
    :class="{ 'is-selected': isSelected }"
    @click="$emit('select', chat.id)"
  >
    <!-- Avatar with WhatsApp badge -->
    <div class="relative flex-shrink-0">
      <!-- WhatsApp badge (bottom-right) -->
      <div
        class="absolute bottom-0 right-0 w-4 h-4 bg-white dark:bg-surface-950 rounded-full flex items-center justify-center z-10"
      >
        <div
          class="w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style="background-color: #25d366"
        >
          <i class="pi pi-whatsapp text-white text-[9px]"></i>
        </div>
      </div>
      <Avatar
        :label="chat.contact.image ? undefined : avatarLabel"
        :image="chat.contact.image"
        shape="circle"
        size="large"
        class="text-base font-medium"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-1.5 min-w-0 flex-1">
          <div class="text-color font-medium leading-6 truncate">{{ displayName }}</div>
          <GuestStatusBadge
            v-if="chat.guestStatus"
            :status="chat.guestStatus"
            class="flex-shrink-0"
          />
        </div>
        <div class="text-sm text-muted-color leading-5 flex-shrink-0 ml-2">{{ formattedTime }}</div>
      </div>

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 min-w-0 flex-1">
          <MessageStatusIcon
            v-if="chat.lastMessage.sender !== 'guest'"
            :message-status="chat.lastMessage.status"
            class="flex-shrink-0"
          />
          <div class="text-muted-color text-sm leading-5 line-clamp-1">{{ truncatedMessage }}</div>
        </div>

        <!-- Right side badges -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <!-- BookAI icon for AI-handled messages -->
          <img
            v-if="handledByAI"
            src="/app-images/bookai-icon.svg"
            alt="BookAI"
            class="w-5 h-5 flex-shrink-0"
          />
          <!-- Orange alert badge when AI needs help -->
          <Badge v-if="needsHelp" value="!" class="needs-help-badge" />
          <!-- Unread count badge -->
          <Badge v-if="chat.unreadCount > 0" :value="chat.unreadCount" class="unread-badge" />
        </div>
      </div>

      <!-- Debug panel -->
      <div
        v-if="isDebugMode && chat.debug"
        class="mt-2 bg-gray-100 text-[10px] font-mono rounded border border-gray-300"
      >
        <button
          class="w-full px-2 py-1 flex items-center justify-between text-gray-600 font-medium hover:bg-gray-200 rounded-t"
          @click.stop="debugExpanded = !debugExpanded"
        >
          <span>API DEBUG</span>
          <ChevronDown
            :size="12"
            :class="{ 'rotate-180': debugExpanded }"
            class="transition-transform"
          />
        </button>
        <div v-if="debugExpanded" class="px-2 pb-2 pt-1 space-y-0.5 border-t border-gray-300">
          <div>
            <span class="text-gray-500">chat_id:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.chatId }}</span>
          </div>
          <div>
            <span class="text-gray-500">channel:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.channel }}</span>
          </div>
          <div>
            <span class="text-gray-500">reservation_status:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.reservationStatus ?? 'null' }}</span>
            <span class="text-gray-400 mx-1">→</span>
            <span class="text-blue-600">{{ chat.guestStatus }}</span>
          </div>
          <div>
            <span class="text-gray-500">reservation_id:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.reservationId ?? 'null' }}</span>
          </div>
          <div>
            <span class="text-gray-500">room_number:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.roomNumber ?? 'null' }}</span>
          </div>
          <div>
            <span class="text-gray-500">bookai_enabled:</span>
            <span
              :class="chat.debug.bookaiEnabled ? 'text-green-600' : 'text-gray-400'"
              class="ml-1"
            >
              {{ chat.debug.bookaiEnabled }}
            </span>
          </div>
          <div>
            <span class="text-gray-500">checkin:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.checkin ?? 'null' }}</span>
          </div>
          <div>
            <span class="text-gray-500">checkout:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.checkout ?? 'null' }}</span>
          </div>
          <div>
            <span class="text-gray-500">unread_count:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.unreadCount }}</span>
          </div>
          <div>
            <span class="text-gray-500">last_message_at:</span>
            <span class="text-gray-800 ml-1">{{ chat.debug.lastMessageAt }}</span>
          </div>
          <div v-if="chat.debug.needsAction">
            <span class="text-gray-500">needs_action:</span>
            <span class="text-orange-600 ml-1">{{ chat.debug.needsAction }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';

import type { Chat } from '@/domain/entities/Chat';
import GuestStatusBadge from '@/ui/components/chat/GuestStatusBadge.vue';
import MessageStatusIcon from '@/ui/components/chat/MessageStatusIcon.vue';

export default defineComponent({
  name: 'ChatListItem',
  components: {
    Avatar,
    Badge,
    ChevronDown,
    GuestStatusBadge,
    MessageStatusIcon,
  },
  props: {
    chat: {
      type: Object as PropType<Chat>,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select'],
  setup(props) {
    // Debug mode: show raw API values
    const isDebugMode = import.meta.env.ROOMDOO_DEBUG === 'true';
    const debugExpanded = ref(false);

    const displayName = computed((): string => {
      if (
        props.chat.contact.name !== undefined &&
        props.chat.contact.name !== null &&
        props.chat.contact.name !== ''
      ) {
        return props.chat.contact.name;
      }
      if (
        props.chat.contact.phone !== undefined &&
        props.chat.contact.phone !== null &&
        props.chat.contact.phone !== ''
      ) {
        return props.chat.contact.phone;
      }
      return 'Unknown';
    });

    const avatarLabel = computed((): string => {
      const name = props.chat.contact.name;
      if (name === undefined || name === null || name === '') {
        return '?';
      }
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    });

    const truncatedMessage = computed((): string => {
      const content = props.chat.lastMessage.content;
      return content.length > 35 ? content.substring(0, 35) + '...' : content;
    });

    const formattedTime = computed((): string => {
      const date = new Date(props.chat.lastMessage.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return '1d';
      } else if (diffDays < 7) {
        return `${diffDays}d`;
      } else {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      }
    });

    // Show orange alert when AI needs help
    const needsHelp = computed((): boolean => {
      return props.chat.lastMessage?.aiRequestType === 'help_needed';
    });

    // Show BookAI icon when message was handled by AI
    const handledByAI = computed((): boolean => {
      const sender = props.chat.lastMessage?.sender;
      return sender === 'bookai' || sender === 'ai_assisted';
    });

    return {
      isDebugMode,
      debugExpanded,
      displayName,
      avatarLabel,
      truncatedMessage,
      formattedTime,
      needsHelp,
      handledByAI,
    };
  },
});
</script>

<style lang="scss" scoped>
.chat-list-item {
  border-left: 3px solid transparent;

  &:hover {
    background-color: var(--p-surface-100);
  }

  &.is-selected {
    background-color: #eff6ff;
    border-left-color: var(--p-primary-500);
  }
}

:deep(.needs-help-badge) {
  background-color: #f97316;
  color: white;
}

:deep(.unread-badge) {
  background-color: #1d4ed8;
  color: white;
}
</style>
