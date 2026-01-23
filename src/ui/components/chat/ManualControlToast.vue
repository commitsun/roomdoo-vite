<template>
  <div
    v-if="visible"
    class="manual-control-toast flex items-start gap-3 p-4 rounded-lg bg-[#FEFCE8] border border-[#FDE047] shadow-md max-w-md"
  >
    <!-- User icon -->
    <User :size="20" class="text-[#CA8A04] flex-shrink-0 mt-0.5" />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h4 class="text-[14px] font-semibold text-[#CA8A04] m-0 mb-1">
        {{ t('chat.manualControl.title') }}
      </h4>
      <p class="text-sm text-[#713F12] m-0 leading-5">
        {{ t('chat.manualControl.message') }}
      </p>
    </div>

    <!-- Close button -->
    <button
      type="button"
      class="flex-shrink-0 p-1 rounded hover:bg-[#FDE047] transition-colors"
      @click="dismiss"
    >
      <X :size="16" class="text-[#CA8A04]" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { User, X } from 'lucide-vue-next';

export default defineComponent({
  name: 'ManualControlToast',
  components: {
    User,
    X,
  },
  emits: ['dismiss'],
  setup(_, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);

    const dismiss = (): void => {
      visible.value = false;
      emit('dismiss');
    };

    return {
      t,
      visible,
      dismiss,
    };
  },
});
</script>
