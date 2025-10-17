<template>
  <section class="documents-form">
    <div class="documents-form__no-documents" v-if="model.documents.length === 0 && !hasDraftDoc">
      <IdCard :size="40" color="#64748B" />
      <span class="documents-form__no-documents-text">{{ t('contacts.noDocuments') }}</span>
      <Button
        :label="t('contacts.addDocument')"
        icon="pi pi-plus"
        severity="primary"
        variant="outlined"
        @click="startAddDocument"
      />
    </div>
    <div class="documents-form__title" v-if="model.documents.length > 0">
      <div class="documents-form__title-text">{{ t('contacts.allDocuments') }}</div>
      <Button
        :label="t('contacts.addDocument')"
        icon="pi pi-plus"
        severity="primary"
        variant="outlined"
        @click="startAddDocument"
      />
    </div>
    <div v-for="(doc, idx) in model.documents" :key="doc.id ?? idx" class="documents-form__group">
      <div class="documents-form__group-grid">
        {{ t('contacts.mandatoryFieldsText') }}
        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-country-${idx}`"
            >{{ t('contacts.issueCountry') }} *</label
          >
          <Select
            :id="`doc-country-${idx}`"
            v-model="(doc.country ?? (doc.country = { id: 0, name: '', code: '' })).id"
            :options="[...countries]"
            optionLabel="name"
            optionValue="id"
            class="documents-form__control"
          />
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-type-${idx}`"
            >{{ t('contacts.documentType') }} *</label
          >
          <Select
            :id="`doc-type-${idx}`"
            v-model="
              (doc.category ?? (doc.category = { id: 0, name: '', code: '', countries: [] })).id
            "
            :options="[...documentTypes]"
            optionLabel="name"
            optionValue="id"
            class="documents-form__control"
          />
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-number-${idx}`"
            >{{ t('contacts.documentNumber') }} *</label
          >
          <InputText
            :id="`doc-number-${idx}`"
            v-model="doc.name"
            class="documents-form__control"
            autocomplete="off"
          />
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-support-${idx}`">{{
            t('contacts.supportNumber')
          }}</label>
          <InputText
            :id="`doc-support-${idx}`"
            v-model="doc.supportNumber"
            class="documents-form__control"
            autocomplete="off"
          />
        </div>
        <div class="documents-form__cancel">
          <Button
            :label="t('contacts.remove')"
            icon="pi pi-trash"
            text
            severity="secondary"
            @click="cancelAddDocument"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, type PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import type { ContactDetail } from '@/domain/entities/Contact';
import { IdCard, Trash2 } from 'lucide-vue-next';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';

export default defineComponent({
  components: {
    Select,
    InputText,
    Button,
    IdCard,
    Trash2,
  },
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail | null>,
      required: true,
    },
  },
  emits: ['updateDocuments'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const documentTypesStore = useDocumentTypesStore();

    const model = ref({
      documents: props.modelValue?.documents ? [...props.modelValue.documents] : [],
    });

    const documentsData = reactive({
      documents: [] as Document[],
    });

    const countries = computed(() => countriesStore.countries);

    const documentTypes = computed(() => documentTypesStore.documentTypes);

    const hasDraftDoc = computed(() => {
      return model.value.documents.some((doc) => !doc.id);
    });

    const canSaveDraft = computed(() => {
      const draftDoc = model.value.documents.find((doc) => !doc.id);
      if (!draftDoc) return false;
      return !!(draftDoc.name && draftDoc.category?.id && draftDoc.country?.id);
    });

    const startAddDocument = () => {
      if (hasDraftDoc.value) return;
      model.value.documents.push({
        id: 0,
        name: '',
        supportNumber: '',
        category: { id: 0, name: '', code: '', countries: [] },
        country: { id: 0, name: '', code: '' },
      });
    };

    const cancelAddDocument = () => {
      model.value.documents = model.value.documents.filter((doc) => doc.id);
    };

    watch(
      () => props.modelValue,
      (newContact) => {
        console.log('ContactDetailDocuments: modelValue changed', newContact);
        model.value.documents = newContact?.documents ? [...newContact.documents] : [];
      }
    );

    return {
      countries,
      documentTypes,
      model,
      hasDraftDoc,
      canSaveDraft,
      documentsData,
      t,
      startAddDocument,
      cancelAddDocument,
    };
  },
});
</script>

<style scoped lang="scss">
.documents-form {
  position: relative;
  padding-top: 1.2rem;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    inset-inline: -1.1rem;
    height: 1px;
    background: #e2e8f0;
  }

  &__no-documents {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    padding-top: 32px;
    padding-bottom: 40px;
    &-text {
      margin-bottom: 16px;
      margin-top: 8px;
      color: #334155;
    }
  }
  &__title {
    font-size: 14px;
    color: #475569;
    margin-bottom: 16px;
    &-text {
      font-weight: 600;
      margin-bottom: 8px;
    }
  }

  &__group + &__group {
    margin-top: 12px;
    padding-top: 12px;
  }

  &__group-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 16px;
  }

  &__field {
    :deep(.p-iftalabel) {
      display: block;
      width: 100%;
    }
    .documents-form__control {
      width: 100%;
    }
    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-dropdown),
    :deep(.p-inputwrapper) {
      width: 100%;
      font-size: 12px !important;
      height: 30px;
    }
    :deep(.p-select .p-select-label) {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }
  &__actions-left,
  &__actions-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  &__label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
  &__cancel {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  }
}
@media (min-width: 1024px) {
  .documents-form {
    width: 680px !important;
  }
}
</style>
