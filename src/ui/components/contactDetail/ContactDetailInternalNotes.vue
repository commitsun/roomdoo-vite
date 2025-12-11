<template>
  <section class="internal-notes">
    <div class="grid">
      <div class="field full">
        <label class="label" for="internalNotes">
          {{ t('contacts.notesAndObservations') }}
        </label>
        <Textarea
          :style="{ background: '#FEFCE8', border: '1px solid #CA8A04' }"
          v-model="modelValue.internalNotes"
          rows="5"
          :placeholder="t('contacts.internalNotesPlaceholder')"
          class="w-full resize-none text-[12px]! lg:text-[14px]!"
        />
      </div>
      <div class="field full">
        <label class="label" for="tagsInput">
          {{ t('contacts.tags') }}
        </label>
        <MultiSelect
          v-model="modelValue.tags"
          :options="[...tags]"
          optionLabel="name"
          filter
          :placeholder="t('contacts.select')"
          class="w-full text-[12px]! lg:text-[14px]! lg:w-1/2"
        >
          <template #value="{ value }">
            <span v-if="Array.isArray(value) && value.length">
              {{ t('contacts.tagsSelected', { count: value.length }) }}
            </span>
          </template>
        </MultiSelect>
        <div
          v-if="Array.isArray(modelValue.tags) && modelValue.tags.length"
          class="mt-5 flex flex-wrap gap-2"
        >
          <Chip
            v-for="tag in modelValue.tags"
            :key="tag.id ?? tag.name"
            :label="tag.name"
            removable
            @remove="removeTag(tag)"
          />
        </div>
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
  setup(props) {
    const { t } = useI18n();
    const tagsStore = useTagsStore();
    const tags = computed(() => tagsStore.tags);

    const removeTag = (tag: { id?: number | string; name: string }): void => {
      if (!Array.isArray(props.modelValue.tags)) {
        return;
      }

      const index = props.modelValue.tags.findIndex(
        (tagItem) => (tagItem.id ?? tagItem.name) === (tag.id ?? tag.name),
      );
      if (index !== -1) {
        props.modelValue.tags.splice(index, 1);
      }
    };
    return {
      tags,
      t,
      removeTag,
    };
  },
});
</script>

<style scoped lang="scss">
.internal-notes {
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
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    min-width: 0;
  }
  .field {
    min-width: 0;
  }
  .full {
    grid-column: 1 / -1;
  }
  .label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
}
@media (min-width: 1024px) {
  .internal-notes {
    &::before {
      inset-inline: 0;
      background: #ffffff;
    }
  }
}
</style>
