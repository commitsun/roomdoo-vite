<template>
  <div class="chat-list-container">
    <!-- Fixed Header Section -->
    <div class="chat-list-fixed">
      <!-- Header -->
      <ChatListHeader @search="handleSearch" @toggle-menu="$emit('toggle-menu')" />

      <!-- Filters -->
      <ChatFilters
        :filter-type="filters.type"
        :filter-status="filters.status"
        @filter-change="handleFilterChange"
      />
    </div>

    <!-- Scrollable Chat List -->
    <div class="chat-list-scroll">
      <!-- BookAI Assistant Item -->
      <BookAIAssistantItem :is-selected="isAIAssistantSelected" @click="handleSelectAIAssistant" />

      <!-- Loading state -->
      <div v-if="isLoading" class="p-4 space-y-3">
        <Skeleton v-for="i in 5" :key="i" height="72px" class="mb-2" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="chats.length === 0"
        class="flex flex-col items-center justify-center flex-1 p-6 text-center"
      >
        <i class="pi pi-comments text-4xl text-muted-color mb-4"></i>
        <p class="text-muted-color">{{ t('chat.empty.noChats') }}</p>
      </div>

      <!-- Chat items -->
      <template v-else>
        <ChatListItem
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :is-selected="chat.id === selectedChatId"
          @select="handleSelectChat"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import Skeleton from 'primevue/skeleton';

import { useChatStore } from '@/infrastructure/stores/chat';
import type { ChatFilterType, GuestStatus } from '@/domain/types/ChatTypes';
import ChatListHeader from '@/ui/components/chat/ChatListHeader.vue';
import ChatFilters from '@/ui/components/chat/ChatFilters.vue';
import ChatListItem from '@/ui/components/chat/ChatListItem.vue';
import BookAIAssistantItem from '@/ui/components/chat/BookAIAssistantItem.vue';

export default defineComponent({
  name: 'ChatList',
  components: {
    Skeleton,
    ChatListHeader,
    ChatFilters,
    ChatListItem,
    BookAIAssistantItem,
  },
  emits: ['toggle-menu'],
  setup() {
    const { t } = useI18n();
    const chatStore = useChatStore();

    // Read directly from store
    const { filteredChats, selectedChatId, filters, isLoadingChats, isAIAssistantSelected } =
      storeToRefs(chatStore);

    const handleSelectChat = (chatId: string): void => {
      // Deselect AI assistant if it was selected
      chatStore.deselectAIAssistant();

      // Select chat directly in store (no navigation = no glitch)
      void chatStore.selectChat(chatId);

      // Update URL without navigation using history.replaceState
      // This makes the URL shareable/reloadable without causing re-renders
      window.history.replaceState(null, '', `/chat/${chatId}`);
    };

    const handleFilterChange = (newFilters: {
      type: ChatFilterType;
      status: GuestStatus | null;
    }): void => {
      chatStore.setFilterType(newFilters.type);
      chatStore.setFilterStatus(newFilters.status);
    };

    const handleSearch = (query: string): void => {
      chatStore.setSearch(query);
    };

    const handleSelectAIAssistant = (): void => {
      // Select AI assistant in store
      void chatStore.selectAIAssistant();

      // Update URL without navigation using history.replaceState (same as regular chats)
      window.history.replaceState(null, '', '/chat/assistant');
    };

    return {
      t,
      chats: filteredChats,
      selectedChatId,
      filters,
      isLoading: isLoadingChats,
      isAIAssistantSelected,
      handleSelectChat,
      handleFilterChange,
      handleSearch,
      handleSelectAIAssistant,
    };
  },
});
</script>

<style lang="scss" scoped>
.chat-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.chat-list-fixed {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 0.5rem;
}

.chat-list-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  overflow-anchor: auto;
  overscroll-behavior: contain;

  // Custom scrollbar styling
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

  // Firefox scrollbar
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}
</style>
