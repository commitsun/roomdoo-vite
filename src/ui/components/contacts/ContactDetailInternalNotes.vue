<template>
  <section class="internal-notes-form">
    <div class="internal-notes-form__field internal-note-form__field--full">
      <label class="internal-notes-form__label" for="internalNotes">{{
        t('contacts.notesAndObservations')
      }}</label>
      <Textarea
        :style="{ background: '#FEFCE8', border: '1px solid #CA8A04' }"
        v-model="internalNotesData.internalNotes"
        rows="5"
      />
    </div>
    <div class="internal-notes-form__field internal-notes-form__field--full">
      <label class="internal-notes-form__label" for="tagsInput">{{ t('contacts.tags') }}</label>
      <MultiSelect
        v-model="internalNotesData.tags"
        display="chip"
        :options="[...tags]"
        optionLabel="name"
        filter
        placeholder="Select Tags"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type Ref, ref, onMounted, type PropType, computed, reactive } from 'vue';
import Textarea from 'primevue/textarea';
import type { ContactDetail } from '@/domain/entities/Contact';
import type { Tag } from '@/domain/entities/Tag';
import Chip from 'primevue/chip';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import { useTagsStore } from '@/infrastructure/stores/tags';
import { useI18n } from 'vue-i18n';

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
  emits: ['update:modelValue'],
  setup(props) {
    const { t } = useI18n();

    const tagsStore = useTagsStore();

    const internalNotesData = reactive({
      internalNotes: '',
      tags: [] as Tag[],
    });
    const tags = computed(() => tagsStore.tags);

    onMounted(() => {
      internalNotesData.internalNotes = props.modelValue.internalNotes || '';
      internalNotesData.tags = props.modelValue.tags ? [...props.modelValue.tags] : [];
    });
    return {
      internalNotesData,
      tags,
      t,
    };
  },
});
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

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
  &__label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
  :deep(.p-textarea) {
    width: 100%;
    resize: none;
  }
}
</style>
