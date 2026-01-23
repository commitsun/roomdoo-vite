<template>
  <section class="documents-form" :class="{ 'is-empty': !hasDocuments && !hasDraftDoc }">
    <div class="no-documents-container" v-if="!hasDocuments && !hasDraftDoc">
      <div class="no-documents">
        <IdCard :size="40" color="#64748B" stroke-width="1.5" />
        <span class="no-documents-text">{{ t('contacts.noDocuments') }}</span>
        <Button
          :label="t('contacts.addDocument')"
          icon="pi pi-plus"
          severity="primary"
          variant="outlined"
          @click="startAddDocument"
        />
      </div>
    </div>

    <div class="documents-header" v-if="hasDocuments">
      <div class="documents-header-title">{{ t('contacts.allDocuments') }}</div>
      <Button
        :label="t('contacts.addDocument')"
        icon="pi pi-plus"
        severity="primary"
        variant="outlined"
        @click="startAddDocument"
      />
    </div>
    <div
      v-for="{ doc, index } in docsView"
      :key="doc.id ?? `draft-${index}`"
      class="document-group"
    >
      <div
        class="document-grid"
        :class="{
          'document-grid-error':
            getRowErrors(index).country ||
            getRowErrors(index).category ||
            getRowErrors(index).number,
        }"
      >
        <div class="field-full">
          {{ t('contacts.mandatoryFieldsText') }}
        </div>

        <div class="field">
          <label class="field-label" :for="`doc-country-${index}`">
            {{ t('contacts.issueCountry') }} *
          </label>
          <Select
            :id="`doc-country-${index}`"
            :modelValue="doc.country?.id ?? null"
            :options="[...countries]"
            optionLabel="name"
            optionValue="id"
            :placeholder="t('contacts.select')"
            filter
            :invalid="!!getRowErrors(index).country"
            @update:modelValue="(id: string | null) => setDocCountry(index, id ? Number(id) : null)"
            @blur="checkDuplicateFor(index)"
            class="w-full flex items-center h-[30px] lg:h-[35px]"
            overlayClass="max-w-[280px] lg:max-w-md"
            :pt="{
              label: {
                class: 'text-[12px]! lg:text-[14px]! ',
              },
            }"
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
            v-if="getRowErrors(index).country"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(getRowErrors(index).country!) }}
          </Message>
        </div>

        <div class="field">
          <label class="field-label" :for="`doc-type-${index}`">
            {{ t('contacts.documentType') }} *
          </label>
          <Select
            :id="`doc-type-${index}`"
            :modelValue="doc.category?.id ?? null"
            :options="[...docTypesFor(doc)]"
            optionLabel="name"
            optionValue="id"
            :placeholder="t('contacts.select')"
            @update:modelValue="(id: number | null) => setDocCategory(index, id as number | null)"
            :disabled="!doc.country?.id"
            :invalid="!!getRowErrors(index).category"
            @blur="checkDuplicateFor(index)"
            class="w-full flex items-center h-[30px] lg:h-[35px]"
            overlayClass="max-w-[280px] lg:max-w-md"
            :pt="{
              label: {
                class: 'text-[12px]! lg:text-[14px]! ',
              },
            }"
          />
          <div
            class="flex mt-2 gap-1 items-center"
            v-if="!doc.country?.id && !getRowErrors(index).category"
          >
            <Info :size="13" color="#2563eb" />
            <Message size="small" severity="info" variant="simple">
              {{ t('contacts.selectCountryFirst') }}
            </Message>
          </div>
          <Message
            v-if="getRowErrors(index).category"
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{ t(getRowErrors(index).category!) }}
          </Message>
        </div>

        <div class="field">
          <label class="field-label" :for="`doc-number-${index}`">
            {{ t('contacts.documentNumber') }} *
          </label>
          <InputText
            :id="`doc-number-${index}`"
            v-model="doc.name"
            class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
            autocomplete="off"
            :placeholder="t('contacts.documentNumberPlaceholder')"
            :invalid="
              !!getRowErrors(index).number &&
              getRowErrors(index).number !== 'contacts.errors.duplicateDocument'
            "
            @input="
              () => {
                duplicatesByIndex[index] = null;
              }
            "
            @blur="onNumberBlur(index)"
          />
          <Message
            v-if="
              getRowErrors(index).number &&
              getRowErrors(index).number !== 'contacts.errors.duplicateDocument'
            "
            size="small"
            severity="error"
            variant="simple"
            class="mt-2"
          >
            {{
              t(getRowErrors(index).number!, {
                document: getDocumentLabel(doc),
              })
            }}
          </Message>
        </div>

        <div class="field">
          <label class="field-label" :for="`doc-support-${index}`">
            {{ t('contacts.supportNumber') }}
          </label>
          <InputText
            :id="`doc-support-${index}`"
            v-model="doc.supportNumber"
            autocomplete="off"
            :placeholder="t('contacts.supportNumberPlaceholder')"
            class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
          />
        </div>

        <div class="document-remove">
          <Button
            :label="t('contacts.remove')"
            icon="pi pi-trash"
            text
            severity="secondary"
            @click="removeDraftsOrDelete(index)"
          />
        </div>
      </div>
      <div class="mt-2 flex gap-1 items-center" v-if="duplicatesByIndex[index]">
        <CircleAlert :size="16" color="#dc2626" />
        <Message size="small" severity="error" variant="simple">
          {{ t('contacts.isDuplicated', { name: duplicatesByIndex[index]?.name }) }}
          <span
            class="underline text-sm text-blue-600 hover:text-blue-800 visited:text-purple-600 cursor-pointer font-bold"
            @click="confirmChangeContactFor(index)"
          >
            {{ t('contacts.seeContact') }}
          </span>
        </Message>
      </div>
      <div
        class="flex gap-1 items-center mt-2"
        v-if="getRowErrors(index).number === 'contacts.errors.duplicateDocument'"
      >
        <CircleAlert :size="16" color="#dc2626" />
        <Message size="small" severity="error" variant="simple">
          {{ t('contacts.duplicateDocument') }}
        </Message>
      </div>
    </div>

    <div v-if="showAddError" class="global-error mt-2 flex gap-1 items-center">
      <CircleAlert :size="16" color="#dc2626" />
      <Message size="small" severity="error" variant="simple">
        {{ t('contacts.errors.completeMandatoryToAddDocument') }}
      </Message>
    </div>

    <ConfirmDialog group="documents" :style="{ maxWidth: '350px' }" />
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
  emits: ['update:modelValue', 'deleteDocumentId', 'changeContactForm', 'update:hasDuplicates'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const confirm = useConfirm();
    const countriesStore = useCountriesStore();
    const documentTypesStore = useDocumentTypesStore();
    const contactsStore = useContactsStore();

    const countries = computed(() => countriesStore.countries);
    const documentTypes = computed(() => documentTypesStore.documentTypes);

    const documents = computed(() => props.modelValue.documents ?? []);
    const hasDocuments = computed(() => documents.value.length > 0);

    const countryById = computed(() => {
      const m = new Map<number, { id: number; name: string; code: string }>();
      countries.value.forEach((c) => m.set(c.id, c));
      return m;
    });

    const hasDraftDoc = computed(() => documents.value.some((d) => !d.id));

    const docsView = computed(() =>
      documents.value
        .map((doc, index) => ({ doc, index }))
        .slice()
        .reverse(),
    );

    const duplicatesByIndex = ref<Record<number, { id: number; name: string } | null>>({});
    const localErrors = ref<Array<DocumentRowError>>([]);
    const showAddError = ref(false);

    const mergedErrors = computed(() => {
      const maxLen = Math.max(props.errors.length, localErrors.value.length);
      return Array.from({ length: maxLen }, (_, index) => ({
        ...(props.errors[index] ?? {}),
        ...(localErrors.value[index] ?? {}),
      }));
    });

    const getRowErrors = (index: number): DocumentRowError => mergedErrors.value[index] ?? {};

    const clearLocalError = (index: number, field: keyof DocumentRowError): void => {
      const current = localErrors.value[index];
      if (current === undefined || current === null) {
        return;
      }

      const next = { ...current };
      delete next[field];

      const arr = [...localErrors.value];
      arr[index] = next;
      localErrors.value = arr;

      const anyError = localErrors.value.some(
        (e) =>
          (typeof e?.country === 'string' && e.country.trim().length > 0) ||
          (typeof e?.category === 'string' && e.category.trim().length > 0) ||
          (typeof e?.number === 'string' && e.number.trim().length > 0),
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
      const currentDocs = documents.value;
      const next = updater(currentDocs);
      emit('update:modelValue', { ...props.modelValue, documents: next });
    };

    const startAddDocument = (): void => {
      const draftIdx = documents.value.findIndex(
        (d) => !d.id && (d.country?.id === null || !d.category?.id || !(d.name ?? '').trim()),
      );

      if (draftIdx !== -1) {
        const draft = documents.value[draftIdx];
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
          category: {
            id: 0,
            name: '',
            code: '',
            countries: [],
            isValidableDocument: false,
            shortCode: '',
          },
          country: { id: 0, name: '', code: '' },
        },
      ]);
    };

    const removeDraftsOrDelete = (index: number): void => {
      patchDocuments((docs) => docs.filter((_, i) => i !== index));
      localErrors.value.splice(index, 1);
      duplicatesByIndex.value = {};
    };

    const setDocCountry = (index: number, id: number | null): void => {
      const country = id !== null ? countries.value.find((c) => c.id === id) : undefined;
      patchDocuments((docs) => {
        const next = [...docs];
        const d = { ...next[index], country: country ?? undefined };
        next[index] = d;
        return next;
      });
      if (id !== null) {
        clearLocalError(index, 'country');
      }
    };

    const setDocCategory = (index: number, id: number | null): void => {
      const defaultCategory = {
        id: 0,
        name: '',
        code: '',
        countries: [],
        isValidableDocument: false,
        shortCode: '',
      };
      const catRaw = documentTypes.value.find((c) => c.id === id) ?? defaultCategory;
      const cat = { ...catRaw, countries: [...catRaw.countries] };
      patchDocuments((docs) => {
        const next = [...docs];
        const d = { ...next[index], category: cat };
        next[index] = d;
        return next;
      });
      if (id !== null) {
        clearLocalError(index, 'category');
      }
      // Clear duplicate when category changes
      duplicatesByIndex.value[index] = null;
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

    const getDocumentLabel = (doc: PersonalDocument): string =>
      doc.category?.shortCode || doc.category?.name || '';

    const checkDuplicateFor = async (index: number): Promise<void> => {
      const doc = documents.value[index];
      if (doc === null) {
        return;
      }

      const countryId = doc.country?.id ?? null;
      const categoryId = doc.category?.id ?? null;
      const number = (doc.name ?? '').trim();

      if (countryId === null || !categoryId || !number) {
        duplicatesByIndex.value[index] = null;
        return;
      }

      const dup = await contactsStore.checkContactDuplicateByDocument(
        categoryId,
        number,
        countryId,
      );
      const currentId = (props.modelValue as ContactDetail)?.id as number | undefined;
      if (dup && dup.id !== currentId) {
        duplicatesByIndex.value[index] = { id: dup.id, name: dup.name };
      } else {
        duplicatesByIndex.value[index] = null;
      }
    };

    const onNumberBlur = (index: number): void => {
      const doc = documents.value[index];
      if ((doc.name ?? '').trim()) {
        clearLocalError(index, 'number');
      }
      void checkDuplicateFor(index);
    };

    const confirmChangeContactFor = (index: number): void => {
      const dup = duplicatesByIndex.value[index];
      if (!dup) {
        return;
      }

      confirm.require({
        group: 'documents',
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

        newDocs.forEach((newDoc, index) => {
          const oldDoc = oldDocs[index];
          if (newDoc?.country?.id !== oldDoc?.country?.id) {
            setDocCategory(index, null);
          }
        });
      },
      { deep: true },
    );

    const hasDuplicates = computed(() => {
      return Object.values(duplicatesByIndex.value).some(
        (dup) => dup !== null && dup !== undefined,
      );
    });

    watch(
      hasDuplicates,
      (newValue) => {
        emit('update:hasDuplicates', newValue);
      },
      { immediate: true },
    );

    return {
      t,
      countries,
      documentTypes,
      countryById,
      documents,
      hasDocuments,
      hasDraftDoc,
      docsView,
      duplicatesByIndex,
      startAddDocument,
      removeDraftsOrDelete,
      setDocCountry,
      setDocCategory,
      docTypesFor,
      checkDuplicateFor,
      confirmChangeContactFor,
      mergedErrors,
      getRowErrors,
      getDocumentLabel,
      showAddError,
      onNumberBlur,
      hasDuplicates,
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

  .no-documents {
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

  .documents-header {
    font-size: 14px;
    color: #475569;
    margin-bottom: 16px;

    &-title {
      font-weight: 600;
      margin-bottom: 8px;
    }
  }

  .document-group + .document-group {
    margin-top: 12px;
    padding-top: 12px;
  }

  .document-grid {
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

  .field {
    .field-control {
      width: 100%;
    }
  }

  .field-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }

  .field-full {
    grid-column: 1 / -1;
  }

  .document-remove {
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

    .no-documents-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-documents {
      width: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .documents-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .document-group {
      width: 100%;
    }

    .document-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 12px;
      align-items: start;
    }

    .field {
      grid-column: auto / span 1;
    }

    .field-full,
    .document-remove {
      grid-column: 1 / -1;
    }
  }

  .documents-form.is-empty {
    display: grid;
    place-items: center;
    padding-top: 0;
    min-height: 422px;

    &::before {
      display: none;
    }

    .no-documents-container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
