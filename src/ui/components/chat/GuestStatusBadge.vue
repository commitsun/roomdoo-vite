<template>
  <span :class="badgeClass">
    {{ label }}
  </span>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { GuestStatus } from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'GuestStatusBadge',
  props: {
    status: {
      type: String as PropType<GuestStatus>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const label = computed((): string => {
      const labels: Record<GuestStatus, string> = {
        arriving: t('chat.guestStatus.arriving'),
        in_house: t('chat.guestStatus.inHouse'),
        checked_out: t('chat.guestStatus.checkedOut'),
      };
      return labels[props.status];
    });

    // Base classes for all badges
    const baseClass =
      'inline-flex items-center text-[10px] leading-none px-2 py-1 rounded-full whitespace-nowrap font-bold';

    // Color classes per status
    const colorClasses: Record<GuestStatus, string> = {
      arriving: 'bg-[#E0F2FE] text-[#0369A1]',
      in_house: 'bg-[#FEE2E2] text-[#B91C1C]',
      checked_out: 'bg-gray-100 text-gray-600',
    };

    const badgeClass = computed((): string => {
      return `${baseClass} ${colorClasses[props.status]}`;
    });

    return {
      label,
      badgeClass,
    };
  },
});
</script>
