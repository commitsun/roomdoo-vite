<template>
  <div class="flex flex-col gap-3 px-3 lg:px-5 overflow-x-auto">
    <!-- Filtro de tipo -->
    <SelectButton
      v-model="selectedType"
      :options="typeOptions"
      optionLabel="label"
      optionValue="value"
      :allowEmpty="false"
      :pt="filterButtonsPT"
      @change="emitFilters"
    />

    <!-- Filtro de estado del huésped -->
    <SelectButton
      v-model="selectedStatus"
      :options="statusOptions"
      optionLabel="label"
      optionValue="value"
      :allowEmpty="true"
      :pt="filterButtonsPT"
      @change="emitFilters"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';

import type { ChatFilterType, GuestStatus } from '@/domain/types/ChatTypes';

export default defineComponent({
  name: 'ChatFilters',
  components: {
    SelectButton,
  },
  props: {
    filterType: {
      type: String as PropType<ChatFilterType>,
      default: 'all',
    },
    filterStatus: {
      type: String as PropType<GuestStatus | null>,
      default: null,
    },
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const selectedType = ref<ChatFilterType>(props.filterType);
    const selectedStatus = ref<GuestStatus | null>(props.filterStatus);

    const typeOptions = [
      { label: t('chat.filters.all'), value: 'all' },
      { label: t('chat.filters.alerts'), value: 'alerts' },
      { label: t('chat.filters.checkinPending'), value: 'checkin_pending' },
    ];

    const statusOptions = [
      { label: t('chat.guestStatus.arriving'), value: 'arriving' },
      { label: t('chat.guestStatus.inHouse'), value: 'in_house' },
      { label: t('chat.guestStatus.checkedOut'), value: 'checked_out' },
    ];

    const filterButtonsPT = {
      root: {
        class: 'flex gap-2 flex-wrap',
      },
      pcToggleButton: {
        root: ({ context }: { context: { active: boolean } }): { class: string } => ({
          class: context.active
            ? '!rounded-lg !border-0 !bg-gray-200 !p-1'
            : '!rounded-lg !border-0 !bg-gray-100 hover:!bg-gray-200 !p-1',
        }),
        content: ({ context }: { context: { active: boolean } }): { class: string } => ({
          class: context.active
            ? 'justify-center !text-[13px] !font-medium py-2 px-4 whitespace-nowrap !rounded-md !bg-white !text-primary-600 !shadow-sm'
            : 'justify-center !text-[13px] !font-medium py-2 px-4 whitespace-nowrap !rounded-md !bg-transparent !text-gray-500',
        }),
      },
    };

    const emitFilters = (): void => {
      emit('filter-change', {
        type: selectedType.value,
        status: selectedStatus.value,
      });
    };

    return {
      selectedType,
      selectedStatus,
      typeOptions,
      statusOptions,
      filterButtonsPT,
      emitFilters,
    };
  },
});
</script>
