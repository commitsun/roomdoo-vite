<template>
  <div class="flex justify-center my-4">
    <span class="system-event-tag">
      <ChevronUp v-if="eventType === 'ai_asked_help'" :size="14" />
      <ToggleLeft v-else-if="eventType === 'bookai_disabled'" :size="14" />
      <ToggleRight v-else-if="eventType === 'bookai_enabled'" :size="14" />
      {{ eventText }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronUp, ToggleLeft, ToggleRight } from 'lucide-vue-next';

import type { SystemEventType } from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'SystemEventIndicator',
  components: {
    ChevronUp,
    ToggleLeft,
    ToggleRight,
  },
  props: {
    eventType: {
      type: String as PropType<SystemEventType>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const eventText = computed((): string => {
      switch (props.eventType) {
        case 'ai_asked_help':
          return t('chat.systemEvents.aiAskedHelp');
        case 'bookai_disabled':
          return t('chat.systemEvents.bookaiDisabled');
        case 'bookai_enabled':
          return t('chat.systemEvents.bookaiEnabled');
        default:
          return '';
      }
    });

    return {
      eventText,
    };
  },
});
</script>

<style lang="scss" scoped>
.system-event-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #fef3c7; // amber-100
  color: #92400e; // amber-800
}
</style>
