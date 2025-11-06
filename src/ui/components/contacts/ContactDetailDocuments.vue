<template>
  <section class="documents-form">
    <div
      class="documents-form__no-documents-container"
      v-if="(modelValue.documents?.length ?? 0) === 0 && !hasDraftDoc"
    >
      <div class="documents-form__no-documents">
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
    </div>

    <div class="documents-form__title" v-if="modelValue.documents?.length ?? 0">
      <div class="documents-form__title-text">{{ t('contacts.allDocuments') }}</div>
      <Button
        :label="t('contacts.addDocument')"
        icon="pi pi-plus"
        severity="primary"
        variant="outlined"
        @click="startAddDocument"
      />
    </div>
    <div
      v-for="({ doc, origIdx }, i) in docsView"
      :key="doc.id ?? `draft-${origIdx}`"
      class="documents-form__group"
    >
      <div class="documents-form__group-grid">
        <div class="documents-form__field--full">
          {{ t('contacts.mandatoryFieldsText') }}
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-country-${origIdx}`">
            {{ t('contacts.issueCountry') }} *
          </label>
          <Select
            :id="`doc-country-${origIdx}`"
            :modelValue="doc.country?.id ?? null"
            :options="[...countries]"
            optionLabel="name"
            optionValue="id"
            class="documents-form__control"
            :placeholder="t('contacts.select')"
            filter
            :invalid="!!errors[origIdx]?.country"
            @update:modelValue="
              (id: string | null) => setDocCountry(origIdx, id ? Number(id) : null)
            "
          >
            <template #value="{ value }">
              <div v-if="value" class="flex items-center w-full gap-1">
                <CountryFlag
                  :country="countryById.get(value)?.code?.toLowerCase() || ''"
                  size="small"
                  shadow
                />
                <span class="whitespace-nowrap">{{ countryById.get(value)?.name }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <CountryFlag
                  :country="option.code?.toLowerCase()"
                  size="normal"
                  shadow
                  style="margin-bottom: 1px"
                />
                <div>{{ option.name }}</div>
              </div>
            </template>
          </Select>
          <Message
            v-if="errors[origIdx]?.country"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(errors[origIdx]?.country) }}
          </Message>
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-type-${origIdx}`">
            {{ t('contacts.documentType') }} *
          </label>
          <Select
            :id="`doc-type-${origIdx}`"
            :modelValue="doc.category?.id ?? null"
            :options="[...docTypesFor(doc)]"
            optionLabel="name"
            optionValue="id"
            class="documents-form__control"
            :placeholder="t('contacts.select')"
            @update:modelValue="(id: number | null) => setDocCategory(origIdx, id as number | null)"
            :disabled="!doc.country?.id"
            :invalid="!!errors[origIdx]?.category"
          />
          <div
            class="flex mt-2 gap-1 items-center"
            v-if="!doc.country?.id && !errors[origIdx]?.category"
          >
            <Info :size="13" color="#2563eb" />
            <Message size="small" severity="info" variant="simple">
              {{ t('contacts.selectCountryFirst') }}
            </Message>
          </div>
          <Message
            v-if="errors[origIdx]?.category"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(errors[origIdx]?.category) }}
          </Message>
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-number-${origIdx}`">
            {{ t('contacts.documentNumber') }} *
          </label>
          <InputText
            :id="`doc-number-${origIdx}`"
            v-model="doc.name"
            class="documents-form__control"
            autocomplete="off"
            :placeholder="t('contacts.documentNumberPlaceholder')"
            :invalid="!!errors[origIdx]?.number"
          />
          <Message
            v-if="errors[origIdx]?.number"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(errors[origIdx]?.number) }}
          </Message>
        </div>

        <div class="documents-form__field">
          <label class="documents-form__label" :for="`doc-support-${origIdx}`">
            {{ t('contacts.supportNumber') }}
          </label>
          <InputText
            :id="`doc-support-${origIdx}`"
            v-model="doc.supportNumber"
            class="documents-form__control"
            autocomplete="off"
            :placeholder="t('contacts.supportNumberPlaceholder')"
          />
        </div>

        <div class="documents-form__cancel">
          <Button
            :label="t('contacts.remove')"
            icon="pi pi-trash"
            text
            severity="secondary"
            @click="removeDraftsOrDelete(origIdx)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { IdCard, Info } from 'lucide-vue-next';
import CountryFlag from 'vue-country-flag-next';

import type { ContactDetail } from '@/domain/entities/Contact';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';

export default defineComponent({
  components: {
    Select,
    InputText,
    Button,
    Message,
    IdCard,
    Info,
    CountryFlag,
  },
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail>,
      required: true,
    },
    errors: {
      type: Array as PropType<Array<{ country?: string; category?: string; number?: string }>>,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'deleteDocumentId'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const documentTypesStore = useDocumentTypesStore();

    const countries = computed(() => countriesStore.countries);
    const documentTypes = computed(() => documentTypesStore.documentTypes);

    const countryById = computed(() => {
      const m = new Map<number, { id: number; name: string; code: string }>();
      countries.value.forEach((c) => m.set(c.id, c));
      return m;
    });

    const hasDraftDoc = computed(() => (props.modelValue.documents ?? []).some((d) => !d.id));

    const docsView = computed(() => {
      const docs = props.modelValue.documents ?? [];
      return docs
        .map((doc, origIdx) => ({ doc, origIdx }))
        .slice()
        .reverse();
    });

    const patchDocuments = (
      updater: (
        docs: NonNullable<ContactDetail['documents']>,
      ) => NonNullable<ContactDetail['documents']>,
    ): void => {
      const docs = props.modelValue.documents ?? [];
      const next = updater(docs);
      emit('update:modelValue', { ...props.modelValue, documents: next });
    };

    const startAddDocument = (): void => {
      patchDocuments((docs) => [
        ...docs,
        {
          id: 0,
          name: '',
          supportNumber: '',
          category: { id: 0, name: '', code: '', countries: [], isValidableDocument: false },
          country: { id: 0, name: '', code: '' },
        },
      ]);
    };

    const removeDraftsOrDelete = (origIdx: number): void => {
      patchDocuments((docs) => docs.filter((_, i) => i !== origIdx));
    };

    const setDocCountry = (idx: number, id: number | null): void => {
      const country = id !== null ? countries.value.find((c) => c.id === id) : undefined;
      patchDocuments((docs) => {
        const next = [...docs];
        const d = { ...next[idx], country: country ?? undefined };
        next[idx] = d;
        return next;
      });
    };

    const setDocCategory = (idx: number, id: number | null): void => {
      const defaultCategory = {
        id: 0,
        name: '',
        code: '',
        countries: [],
        isValidableDocument: false,
      };
      const catRaw = documentTypes.value.find((c) => c.id === id) ?? defaultCategory;
      const cat = { ...catRaw, countries: [...catRaw.countries] };
      patchDocuments((docs) => {
        const next = [...docs];
        const d = { ...next[idx], category: cat };
        next[idx] = d;
        return next;
      });
    };

    const docTypesFor = (doc: PersonalDocument): typeof documentTypes.value => {
      if (!doc.country) {
        return [];
      }
      return documentTypes.value.filter(
        (documentType) =>
          documentType.countries.some((c) => c.id === doc.country?.id) ||
          documentType.countries.length === 0,
      );
    };

    return {
      t,
      countries,
      documentTypes,
      countryById,
      hasDraftDoc,
      docsView,
      startAddDocument,
      removeDraftsOrDelete,
      setDocCountry,
      setDocCategory,
      docTypesFor,
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
    gap: 16px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 16px;
  }

  &__field {
    .documents-form__control {
      width: 100%;
    }
    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-select-label),
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
    width: 100%;
    height: 100%;
    margin: auto;
    &::before {
      inset-inline: 0;
      background: #ffffff;
    }
    &__no-documents-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &__no-documents {
      width: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    &__title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__group {
      width: 100%;
    }
    &__group-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 12px;
      align-items: start;
    }
    &__field {
      grid-column: auto / span 1;
      :deep(.p-inputtext),
      :deep(.p-select),
      :deep(.p-select-label),
      :deep(.p-datepicker),
      :deep(.p-inputwrapper) {
        font-size: 14px !important;
        height: 35px;
      }
    }
    &__field--full,
    &__cancel {
      grid-column: 1 / -1;
    }
  }
}
</style>
