<template>
  <div class="bg-surface-0">
    <!-- Search mode header -->
    <div v-if="isSearchActive" class="flex items-center gap-2 px-4 py-3 bg-surface-0 min-h-[72px]">
      <Button
        text
        rounded
        severity="secondary"
        class="flex-shrink-0"
        @click="$emit('close-search')"
        aria-label="Close search"
      >
        <ArrowLeft :size="20" />
      </Button>

      <div ref="searchInputWrapper" class="flex-1">
        <InputText
          :model-value="searchQuery"
          :placeholder="t('chat.search.inConversation')"
          class="w-full"
          @update:model-value="$emit('update:searchQuery', $event)"
        />
      </div>

      <span v-if="searchResultsTotal > 0" class="text-sm text-muted-color whitespace-nowrap">
        {{
          t('chat.search.resultsCount', {
            current: currentSearchIndex + 1,
            total: searchResultsTotal,
          })
        }}
      </span>
      <span v-else-if="searchQuery.length > 0" class="text-sm text-muted-color whitespace-nowrap">
        {{ t('chat.search.noResults') }}
      </span>

      <Button
        text
        rounded
        severity="secondary"
        :disabled="searchResultsTotal === 0"
        @click="$emit('prev-result')"
        aria-label="Previous result"
      >
        <ChevronUp :size="18" />
      </Button>
      <Button
        text
        rounded
        severity="secondary"
        :disabled="searchResultsTotal === 0"
        @click="$emit('next-result')"
        aria-label="Next result"
      >
        <ChevronDown :size="18" />
      </Button>
    </div>

    <!-- Normal header -->
    <div v-else class="flex items-center justify-between px-4 py-3 bg-surface-0 min-h-[72px]">
      <!-- Left: Back button (mobile only) + Avatar and info -->
      <div class="flex items-center gap-3">
        <!-- Back button for mobile -->
        <Button
          text
          rounded
          severity="secondary"
          class="lg:hidden flex-shrink-0"
          @click="$emit('back-to-list')"
          aria-label="Back to chat list"
        >
          <ArrowLeft :size="20" />
        </Button>

        <Avatar
          :label="contact.image ? undefined : avatarLabel"
          :image="contact.image"
          shape="circle"
          size="large"
          class="flex-shrink-0"
        />
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold truncate">{{ displayName }}</span>
            <span
              v-if="contact.language"
              :class="flagClass"
              class="w-5 h-4 rounded-sm flex-shrink-0"
            />
          </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <Button
          v-if="reservationId"
          size="small"
          severity="secondary"
          :label="t('chat.viewReservation')"
          class="hidden sm:flex"
          :pt="{
            root: {
              class: '!bg-slate-100 !border-slate-100 !rounded-md !py-1.5 !px-2 !gap-1.5',
            },
            label: {
              class: '!text-xs !font-normal',
            },
          }"
          @click="$emit('view-reservation')"
        />

        <Button text rounded severity="secondary" @click="$emit('search')">
          <Search :size="18" />
        </Button>

        <Button
          text
          rounded
          severity="secondary"
          @click="toggleMenu"
          aria-haspopup="true"
          aria-controls="conversation-menu"
        >
          <MoreVertical :size="18" />
        </Button>
        <Menu ref="menuRef" id="conversation-menu" :model="menuItems" popup />
      </div>
    </div>

    <!-- Header line: animated gradient when BookAI active, gray otherwise -->
    <div class="h-0.5" :class="bookAIEnabled ? 'bookai-gradient-line' : 'bg-gray-200'"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, nextTick, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import InputText from 'primevue/inputtext';
import { Search, MoreVertical, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-vue-next';

import type { ChatContact } from '@/domain/entities/Chat';

export default defineComponent({
  name: 'ConversationHeader',
  components: {
    Avatar,
    Button,
    Menu,
    InputText,
    Search,
    MoreVertical,
    ArrowLeft,
    ChevronUp,
    ChevronDown,
  },
  props: {
    contact: {
      type: Object as PropType<ChatContact>,
      required: true,
    },
    reservationId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isSearchActive: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: '',
    },
    searchResultsTotal: {
      type: Number,
      default: 0,
    },
    currentSearchIndex: {
      type: Number,
      default: 0,
    },
    bookAIEnabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'view-reservation',
    'search',
    'menu-action',
    'back-to-list',
    'close-search',
    'update:searchQuery',
    'prev-result',
    'next-result',
  ],
  setup(props, { emit }) {
    const { t } = useI18n();
    const menuRef = ref();
    const searchInputWrapper = ref<HTMLDivElement | null>(null);

    // Auto-focus input when search mode becomes active
    watch(
      () => props.isSearchActive,
      async (isActive) => {
        if (isActive) {
          await nextTick();
          // Find and focus the input element inside the wrapper
          const inputEl = searchInputWrapper.value?.querySelector('input');
          if (inputEl !== null && inputEl !== undefined) {
            inputEl.focus();
          }
        }
      },
    );

    const displayName = computed((): string => {
      if (
        props.contact.name !== undefined &&
        props.contact.name !== null &&
        props.contact.name !== ''
      ) {
        return props.contact.name;
      }
      if (
        props.contact.phone !== undefined &&
        props.contact.phone !== null &&
        props.contact.phone !== ''
      ) {
        return props.contact.phone;
      }
      return 'Unknown';
    });

    const avatarLabel = computed((): string => {
      const name = props.contact.name;
      if (name === undefined || name === null || name === '') {
        return '?';
      }
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    });

    const flagClass = computed((): string => {
      const lang =
        props.contact.language !== undefined &&
        props.contact.language !== null &&
        props.contact.language !== ''
          ? props.contact.language
          : 'es';
      const countryMap: Record<string, string> = {
        es: 'es',
        en: 'gb',
        de: 'de',
        fr: 'fr',
        it: 'it',
        pt: 'pt',
      };
      const country = countryMap[lang] !== undefined ? countryMap[lang] : 'es';
      return `fi fi-${country}`;
    });

    const menuItems = [
      { label: t('chat.menu.markUnread'), command: (): void => emit('menu-action', 'mark-unread') },
    ];

    const toggleMenu = (event: Event): void => {
      menuRef.value.toggle(event);
    };

    return {
      t,
      menuRef,
      searchInputWrapper,
      displayName,
      avatarLabel,
      flagClass,
      menuItems,
      toggleMenu,
    };
  },
});
</script>

<style scoped>
.bookai-gradient-line {
  background: linear-gradient(90deg, #3b82f6, #ec4899, #3b82f6);
  background-size: 200% 100%;
  animation: gradient-shift 2s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
