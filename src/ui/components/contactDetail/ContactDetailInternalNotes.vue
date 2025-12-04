<template>
  <section class="internal-notes-form">
    <div class="internal-notes-form__grid">
      <div class="internal-notes-form__field internal-note-form__field--full">
        <label class="internal-notes-form__label" for="internalNotes">{{
          t('contacts.notesAndObservations')
        }}</label>
        <Textarea
          :style="{ background: '#FEFCE8', border: '1px solid #CA8A04' }"
          v-model="modelValue.internalNotes"
          rows="5"
          :placeholder="t('contacts.internalNotesPlaceholder')"
        />
      </div>
      <div class="internal-notes-form__field internal-notes-form__field--full">
        <label class="internal-notes-form__label" for="tagsInput">{{ t('contacts.tags') }}</label>
        <MultiSelect
          class="w-full"
          v-model="modelValue.tags"
          display="chip"
          :options="[...tags]"
          optionLabel="name"
          filter
          :showToggleAll="false"
          :placeholder="t('contacts.select')"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import { useI18n } from 'vue-i18n';

import { useTagsStore } from '@/infrastructure/stores/tags';
import type { ContactDetail } from '@/domain/entities/Contact';

export default defineComponent({
  components: {
    Textarea,
    Chip,
    Select,
    MultiSelect,
  },
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail>,
      required: true,
    },
  },
  setup() {
    const { t } = useI18n();
    const tagsStore = useTagsStore();
    const tags = computed(() => tagsStore.tags);
    return {
      tags,
      t,
    };
  },
});
</script>
<style scoped lang="scss">
.internal-notes-form {
  position: relative;
  padding-top: 1rem;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    inset-inline: -1.1rem;
    height: 1px;
    background: #e2e8f0;
  }
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    min-width: 0;
  }
  &__field {
    min-width: 0;

    :deep(.p-select) {
      width: 100%;
    }
  }
  &__field--full {
    grid-column: 1 / -1;
  }
  &__label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
  :deep(.p-textarea) {
    width: 100%;
    resize: none;
    font-size: 12px;
  }
  :deep(.p-multiselect) {
    width: 100%;
  }
  :deep(.p-multiselect .p-multiselect-label-container) {
    overflow: visible;
  }
  :deep(.p-multiselect .p-multiselect-label) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 12px;
    min-height: 30px;
  }
  :deep(.p-multiselect .p-multiselect-token) {
    margin: 0;
  }
}
@media (min-width: 1024px) {
  .internal-notes-form {
    &::before {
      inset-inline: 0;
      background: #ffffff;
    }
    :deep(.p-multiselect) {
      width: 50%;
    }
    :deep(.p-multiselect .p-multiselect-label) {
      font-size: 14px;
      min-height: 35px;
    }
    :deep(.p-textarea) {
      font-size: 14px;
    }
  }
}
</style>
