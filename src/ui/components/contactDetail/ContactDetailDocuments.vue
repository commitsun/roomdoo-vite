<template>
  <section
    class="documents-form"
    :class="{ 'documents-form--empty': (modelValue.documents?.length ?? 0) === 0 && !hasDraftDoc }"
  >
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
      <div
        class="documents-form__group-grid"
        :class="{
          'documents-form__group-grid-error':
            mergedErrors[origIdx]?.country ||
            mergedErrors[origIdx]?.category ||
            mergedErrors[origIdx]?.number,
        }"
      >
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
            :invalid="!!mergedErrors[origIdx]?.country"
            @update:modelValue="
              (id: string | null) => setDocCountry(origIdx, id ? Number(id) : null)
            "
            @blur="checkDuplicateFor(origIdx)"
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
            v-if="mergedErrors[origIdx]?.country"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(mergedErrors[origIdx]?.country) }}
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
            :invalid="!!mergedErrors[origIdx]?.category"
            @blur="checkDuplicateFor(origIdx)"
          />
          <div
            class="flex mt-2 gap-1 items-center"
            v-if="!doc.country?.id && !mergedErrors[origIdx]?.category"
          >
            <Info :size="13" color="#2563eb" />
            <Message size="small" severity="info" variant="simple">
              {{ t('contacts.selectCountryFirst') }}
            </Message>
          </div>
          <Message
            v-if="mergedErrors[origIdx]?.category"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(mergedErrors[origIdx]?.category) }}
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
            :invalid="
              !!mergedErrors[origIdx]?.number &&
              mergedErrors[origIdx]?.number !== 'contacts.errors.duplicateDocument'
            "
            @blur="onNumberBlur(origIdx)"
          />
          <Message
            v-if="
              mergedErrors[origIdx]?.number &&
              mergedErrors[origIdx]?.number !== 'contacts.errors.duplicateDocument'
            "
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(mergedErrors[origIdx]?.number, { document: doc.category?.name ?? '' }) }}
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

      <div
        class="flex gap-1 items-center mt-2"
        v-if="mergedErrors[origIdx]?.number === 'contacts.errors.duplicateDocument'"
      >
        <CircleAlert :size="16" color="#dc2626" />
        <Message size="small" severity="error" variant="simple">
          {{ t('contacts.duplicateDocument') }}
        </Message>
      </div>

      <div class="mt-2 flex gap-1 items-center" v-else-if="duplicatesByIdx[origIdx]">
        <CircleAlert :size="16" color="#dc2626" />
        <Message size="small" severity="error" variant="simple">
          {{ t('contacts.isDuplicated', { name: duplicatesByIdx[origIdx]?.name }) }}
          <span
            class="underline text-sm text-blue-600 hover:text-blue-800 visited:text-purple-600 cursor-pointer font-bold"
            @click="confirmChangeContactFor(origIdx)"
          >
            {{ t('contacts.seeContact') }}
          </span>
        </Message>
      </div>
    </div>
    <div v-if="showAddError" class="documents-form__global-error mt-2 flex gap-1 items-center">
      <CircleAlert :size="16" color="#dc2626" />
      <Message size="small" severity="error" variant="simple">
        {{ t('contacts.errors.completeMandatoryToAddDocument') }}
      </Message>
    </div>

    <ConfirmDialog :style="{ maxWidth: '350px' }" />
  </section>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { IdCard, Info, CircleAlert } from 'lucide-vue-next';
import CountryFlag from 'vue-country-flag-next';

import type { ContactDetail } from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';

type DocumentRowError = { country?: string; category?: string; number?: string };

export default defineComponent({
  components: {
    Select,
    InputText,
    Button,
    Message,
    IdCard,
    Info,
    CircleAlert,
    CountryFlag,
    ConfirmDialog,
  },
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail>,
      required: true,
    },
    errors: {
      type: Array as PropType<Array<DocumentRowError>>,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'deleteDocumentId', 'changeContactForm'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const confirm = useConfirm();
    const countriesStore = useCountriesStore();
    const documentTypesStore = useDocumentTypesStore();
    const contactsStore = useContactsStore();

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

    const duplicatesByIdx = ref<Record<number, { id: number; name: string } | null>>({});

    const localErrors = ref<Array<DocumentRowError>>([]);
    const showAddError = ref(false);

    const mergedErrors = computed(() => {
      const maxLen = Math.max(props.errors.length, localErrors.value.length);
      return Array.from({ length: maxLen }, (_, idx) => ({
        ...(props.errors[idx] ?? {}),
        ...(localErrors.value[idx] ?? {}),
      }));
    });

    const clearLocalError = (idx: number, field: keyof DocumentRowError): void => {
      const current = localErrors.value[idx];
      if (current === undefined || current === null) {
        return;
      }

      const next = { ...current };
      delete next[field];

      const arr = [...localErrors.value];
      arr[idx] = next;
      localErrors.value = arr;

      const anyError = localErrors.value.some(
        (e) =>
          Boolean(e) &&
          ((typeof e.country === 'string' && e.country.length > 0) ||
            (typeof e.category === 'string' && e.category.length > 0) ||
            (typeof e.number === 'string' && e.number.length > 0)),
      );
      if (!anyError) {
        showAddError.value = false;
      }
    };

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
      const docs = props.modelValue.documents ?? [];

      const draftIdx = docs.findIndex(
        (d) => !d.id && (d.country?.id === null || !d.category?.id || !(d.name ?? '').trim()),
      );

      if (draftIdx !== -1) {
        const draft = docs[draftIdx];
        const errs: DocumentRowError = {};
        if (draft.country?.id === 0) {
          errs.country = 'contacts.errors.issueCountryRequired';
        }
        if (!draft.category?.id) {
          errs.category = 'contacts.errors.documentTypeRequired';
        }
        if (!(draft.name ?? '').trim()) {
          errs.number = 'contacts.errors.documentNumberRequired';
        }

        const nextLocal = [...localErrors.value];
        nextLocal[draftIdx] = { ...(nextLocal[draftIdx] ?? {}), ...errs };
        localErrors.value = nextLocal;

        showAddError.value = true;
        return;
      }

      showAddError.value = false;

      patchDocuments((currentDocs) => [
        ...currentDocs,
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
      localErrors.value.splice(origIdx, 1);
      duplicatesByIdx.value = {};
    };

    const setDocCountry = (idx: number, id: number | null): void => {
      const country = id !== null ? countries.value.find((c) => c.id === id) : undefined;
      patchDocuments((docs) => {
        const next = [...docs];
        const d = { ...next[idx], country: country ?? undefined };
        next[idx] = d;
        return next;
      });
      if (id !== null) {
        clearLocalError(idx, 'country');
      }
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
      if (id !== null) {
        clearLocalError(idx, 'category');
      }
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

    const checkDuplicateFor = async (origIdx: number): Promise<void> => {
      const docs = props.modelValue.documents ?? [];
      const doc = docs[origIdx];
      if (doc === null) {
        return;
      }

      const countryId = doc.country?.id ?? null;
      const categoryId = doc.category?.id ?? null;
      const number = (doc.name ?? '').trim();

      if (countryId === null || !categoryId || !number) {
        duplicatesByIdx.value[origIdx] = null;
        return;
      }

      const dup = await contactsStore.checkContactDuplicateByDocument(
        categoryId,
        number,
        countryId,
      );
      const currentId = (props.modelValue as ContactDetail)?.id as number | undefined;
      if (dup && dup.id !== currentId) {
        duplicatesByIdx.value[origIdx] = { id: dup.id, name: dup.name };
      } else {
        duplicatesByIdx.value[origIdx] = null;
      }
    };

    const onNumberBlur = (origIdx: number): void => {
      const docs = props.modelValue.documents ?? [];
      const doc = docs[origIdx];
      if ((doc.name ?? '').trim()) {
        clearLocalError(origIdx, 'number');
      }
      void checkDuplicateFor(origIdx);
    };

    const confirmChangeContactFor = (origIdx: number): void => {
      const dup = duplicatesByIdx.value[origIdx];
      if (!dup) {
        return;
      }

      confirm.require({
        message: t('contacts.confirmMessage'),
        header: t('contacts.confirmTitle'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: { label: t('contacts.cancel'), severity: 'secondary', outlined: true },
        acceptProps: { label: t('contacts.seeContact') },
        accept: () => {
          emit('changeContactForm', dup.id);
        },
      });
    };

    watch(
      () => props.modelValue.documents,
      (newDocs, oldDocs) => {
        if (!newDocs || !oldDocs) {
          return;
        }

        newDocs.forEach((newDoc, idx) => {
          const oldDoc = oldDocs[idx];
          if (newDoc?.country?.id !== oldDoc?.country?.id) {
            setDocCategory(idx, null);
          }
        });
      },
      { deep: true },
    );

    return {
      t,
      countries,
      documentTypes,
      countryById,
      hasDraftDoc,
      docsView,
      duplicatesByIdx,
      startAddDocument,
      removeDraftsOrDelete,
      setDocCountry,
      setDocCategory,
      docTypesFor,
      checkDuplicateFor,
      confirmChangeContactFor,
      mergedErrors,
      showAddError,
      onNumberBlur,
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
    &-error {
      border-color: #dc2626;
    }
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
  .documents-form--empty {
    display: grid;
    place-items: center;
    padding-top: 0;

    &::before {
      display: none;
    }
  }

  .documents-form--empty .documents-form__no-documents-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
