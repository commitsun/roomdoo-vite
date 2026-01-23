<template>
  <div class="flex flex-col gap-4 pt-3 pb-2 px-3 lg:px-5">
    <!-- Title row -->
    <div class="flex items-center justify-between">
      <div class="text-2xl font-medium leading-6 text-color">{{ t('sidebar.chat') }}</div>
      <Button
        text
        rounded
        severity="secondary"
        class="lg:hidden"
        aria-label="Toggle menu"
        @click="$emit('toggle-menu')"
      >
        <Menu :size="20" />
      </Button>
    </div>

    <!-- Search input -->
    <IconField class="w-full">
      <InputIcon class="pi pi-search" />
      <InputText
        v-model="searchQuery"
        :placeholder="t('chat.search.placeholder')"
        class="w-full"
        @input="handleSearch"
      />
    </IconField>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Menu } from 'lucide-vue-next';

export default defineComponent({
  name: 'ChatListHeader',
  components: {
    IconField,
    InputIcon,
    InputText,
    Button,
    Menu,
  },
  emits: ['search', 'toggle-menu'],
  setup(_, { emit }) {
    const { t } = useI18n();
    const searchQuery = ref('');

    const handleSearch = (): void => {
      emit('search', searchQuery.value);
    };

    return { t, searchQuery, handleSearch };
  },
});
</script>
