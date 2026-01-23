<template>
  <span :class="iconClass">
    <Check v-if="messageStatus === 'sent'" :size="size" />
    <CheckCheck v-else :size="size" />
  </span>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { Check, CheckCheck } from 'lucide-vue-next';

import type { MessageStatus } from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'MessageStatusIcon',
  components: {
    Check,
    CheckCheck,
  },
  props: {
    messageStatus: {
      type: String as PropType<MessageStatus>,
      required: true,
    },
    size: {
      type: Number,
      default: 14,
    },
  },
  setup(props) {
    const iconClass = computed((): string => {
      // sent y delivered = gris, read = azul
      if (props.messageStatus === 'read') {
        return 'text-blue-500';
      }
      return 'text-gray-400';
    });

    return {
      iconClass,
    };
  },
});
</script>

<style lang="scss" scoped>
span {
  display: inline-flex;
  align-items: center;
}
</style>
