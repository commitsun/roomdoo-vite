<template>
  <div
    class="book-ai-item flex items-center gap-2 p-4 cursor-pointer hover:bg-emphasis transition-all"
    :class="{ 'is-selected': isSelected }"
    @click="$emit('click')"
  >
    <!-- AI Avatar with gradient ring -->
    <div class="relative flex-shrink-0">
      <!-- Gradient ring container -->
      <div class="p-[3px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-500">
        <img
          src="/app-images/bookai-avatar.png"
          alt="BookAI"
          class="w-12 h-12 rounded-full border-2 border-white object-cover"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-color font-medium leading-6">{{ t('chat.bookAI.assistant') }}</span>
        <Sparkles :size="14" class="text-muted-color" />
      </div>
      <p class="text-sm text-muted-color m-0 truncate">{{ t('chat.bookAI.subtitle') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from 'lucide-vue-next';

export default defineComponent({
  name: 'BookAIAssistantItem',
  components: {
    Sparkles,
  },
  props: {
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup() {
    const { t } = useI18n();
    return { t };
  },
});
</script>

<style lang="scss" scoped>
.book-ai-item {
  border-left: 3px solid transparent;

  &.is-selected {
    background-color: var(--p-surface-50);
    border-left-color: var(--p-primary-500);
  }
}
</style>
