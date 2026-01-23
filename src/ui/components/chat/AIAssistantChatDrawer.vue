<template>
  <Drawer
    v-model:visible="isVisible"
    position="right"
    :header="t('chat.bookAI.drawer.title')"
    class="ai-chat-drawer"
  >
    <div class="flex flex-col h-full gap-2">
      <!-- New Chat -->
      <button class="drawer-action-item" @click="handleNewChat">
        <i class="pi pi-plus"></i>
        <span>{{ t('chat.bookAI.drawer.newChat') }}</span>
      </button>

      <!-- Search -->
      <button class="drawer-action-item" @click="isSearchActive = !isSearchActive">
        <i class="pi pi-search"></i>
        <span>{{ t('chat.bookAI.drawer.searchLabel') }}</span>
      </button>

      <!-- Search Input (expandable) -->
      <div v-if="isSearchActive" class="px-2 pb-2">
        <InputText
          v-model="searchQuery"
          :placeholder="t('chat.bookAI.drawer.search')"
          class="w-full"
          autofocus
        />
      </div>

      <!-- Conversations List -->
      <div class="flex-1 overflow-y-auto mt-4">
        <h4 class="text-sm font-semibold text-muted-color mb-2 px-2">
          {{ t('chat.bookAI.drawer.chats') }}
        </h4>

        <!-- Empty state -->
        <div v-if="sortedConversations.length === 0" class="text-center text-muted-color py-8">
          <i class="pi pi-comments text-3xl mb-2"></i>
          <p class="text-sm">{{ t('chat.bookAI.drawer.noChats') }}</p>
        </div>

        <!-- Conversation items -->
        <div
          v-for="conversation in sortedConversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{ 'is-active': conversation.id === currentConversationId }"
          @click="handleSelectConversation(conversation.id)"
        >
          <div class="conversation-title">{{ conversation.title }}</div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Drawer from 'primevue/drawer';
import InputText from 'primevue/inputtext';

import type { AIConversation } from '@/domain/entities/Chat';

export default defineComponent({
  name: 'AIAssistantChatDrawer',
  components: {
    Drawer,
    InputText,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    conversations: {
      type: Array as () => AIConversation[],
      default: () => [],
    },
    currentConversationId: {
      type: String as () => string | null,
      default: null,
    },
  },
  emits: ['update:visible', 'new-chat', 'select-conversation'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const searchQuery = ref('');
    const isSearchActive = ref(false);

    const isVisible = computed({
      get: () => props.visible,
      set: (value: boolean) => emit('update:visible', value),
    });

    const filteredConversations = computed(() => {
      if (searchQuery.value.trim().length === 0) {
        return props.conversations;
      }
      const query = searchQuery.value.toLowerCase();
      return props.conversations.filter((conv) => conv.title.toLowerCase().includes(query));
    });

    // Sort conversations with current one first
    const sortedConversations = computed(() => {
      const conversations = [...filteredConversations.value];
      if (props.currentConversationId === null) {
        return conversations;
      }
      // Move current conversation to the top
      const currentIndex = conversations.findIndex((c) => c.id === props.currentConversationId);
      if (currentIndex > 0) {
        const [current] = conversations.splice(currentIndex, 1);
        conversations.unshift(current);
      }
      return conversations;
    });

    const handleNewChat = (): void => {
      emit('new-chat');
      isVisible.value = false;
    };

    const handleSelectConversation = (id: string): void => {
      emit('select-conversation', id);
      isVisible.value = false;
    };

    // Clear search when drawer closes
    watch(isVisible, (visible) => {
      if (!visible) {
        searchQuery.value = '';
        isSearchActive.value = false;
      }
    });

    return {
      t,
      isVisible,
      searchQuery,
      isSearchActive,
      sortedConversations,
      handleNewChat,
      handleSelectConversation,
    };
  },
});
</script>

<style lang="scss" scoped>
.ai-chat-drawer {
  :deep(.p-drawer) {
    width: 320px !important;
  }
}

.drawer-action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--p-surface-700);
  font-size: 0.875rem;
  text-align: left;
  width: 100%;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--p-surface-100);
  }

  i {
    font-size: 1rem;
    color: var(--p-surface-500);
  }
}

.conversation-item {
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 0.25rem;

  &:hover {
    background-color: var(--p-surface-100);
  }

  &.is-active {
    background-color: var(--p-primary-50);
    border-left: 3px solid var(--p-primary-500);
  }
}

.conversation-title {
  font-weight: 500;
  color: var(--p-surface-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
