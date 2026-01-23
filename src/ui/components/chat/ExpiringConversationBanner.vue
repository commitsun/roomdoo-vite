<template>
  <div
    class="expiring-banner flex items-center gap-3 px-4 py-3 bg-[#FEFCE8] border-b border-[#FDE047]"
  >
    <!-- Warning icon -->
    <AlertTriangle :size="20" class="text-[#CA8A04] flex-shrink-0" />

    <!-- Message -->
    <p class="text-sm text-[#713F12] m-0 leading-5">
      {{ bannerMessage }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertTriangle } from 'lucide-vue-next';

export default defineComponent({
  name: 'ExpiringConversationBanner',
  components: {
    AlertTriangle,
  },
  props: {
    remainingHours: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const bannerMessage = computed((): string => {
      if (props.remainingHours < 1) {
        return t('chat.expiringBanner.lessThanOneHour');
      }

      const hours = Math.floor(props.remainingHours);
      return t('chat.expiringBanner.message', { hours }, hours);
    });

    return {
      bannerMessage,
    };
  },
});
</script>
