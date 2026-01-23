<template>
  <div v-if="isActive" class="ai-divider">
    <div class="ai-divider__content">
      <img :src="BookAiIcon" alt="" class="h-5 w-5" />
      <span class="text-[12px] text-[#64748B]">BookAI está activo</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import BookAiIcon from '@/ui/assets/icons/book-ai-icon.svg';

export default defineComponent({
  name: 'AIAssistantIndicator',
  props: {
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    return { BookAiIcon };
  },
});
</script>

<style scoped>
.ai-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 1rem 0;
}

.ai-divider::before,
.ai-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #cbd5e1;
}

.ai-divider::before {
  margin-right: 1rem;
}

.ai-divider::after {
  margin-left: 1rem;
}

.ai-divider__content {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}
</style>
