import { computed, reactive, watch, type ComputedRef, type Ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import { ContactSchema, type ContactInput } from '@/application/contacts/ContactSchemas';
import type { ContactDetail } from '@/domain/entities/Contact';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';

type GeneralErrors = { name?: string; saleChannelId?: string };
type DocumentRowError = { country?: string; category?: string; number?: string };
type BillingErrors = { duplicateFiscalDocument?: string };

type ContactBadges = {
  general: number;
  documents: number;
  billing: number;
  total: number;
};

export interface UseContactDetailErrorsReturn {
  validate: ReturnType<typeof useForm>['validate'];
  setValues: ReturnType<typeof useForm>['setValues'];
  uiErrors: {
    general: GeneralErrors;
    documents: DocumentRowError[];
    billing: BillingErrors;
  };
  badges: ComputedRef<ContactBadges>;
  resetUiErrors: () => void;
  buildPayloadToValidate: () => ContactInput;
  mapVeeValidateErrors: () => void;
  setDuplicateDocumentError: (index: number) => void;
  setDuplicateFiscalError: () => void;
  clearDuplicateErrors: () => void;
}

export const useContactDetailErrors = (
  contactType: Ref<'person' | 'company' | 'agency'>,
  contactForm: ContactDetail,
): UseContactDetailErrorsReturn => {
  const documentTypesStore = useDocumentTypesStore();

  const {
    validate,
    setValues,
    errors: vvErrors,
  } = useForm({
    validationSchema: toTypedSchema(ContactSchema),
  });

  const uiErrors = reactive<{
    general: GeneralErrors;
    documents: DocumentRowError[];
    billing: BillingErrors;
  }>({
    general: {},
    documents: [],
    billing: {},
  });

  const badges = computed<ContactBadges>(() => {
    const general = Object.keys(uiErrors.general).length;
    const documents = uiErrors.documents.reduce(
      (acc, r) =>
        acc +
        (r.country !== undefined ? 1 : 0) +
        (r.category !== undefined ? 1 : 0) +
        (r.number !== undefined ? 1 : 0),
      0,
    );
    const billing = Object.keys(uiErrors.billing).length;
    return { general, documents, billing, total: general + documents + billing };
  });

  const resetUiErrors = (): void => {
    uiErrors.general = {};
    uiErrors.documents = [];
    uiErrors.billing = {};
  };

  const buildPayloadToValidate = (): ContactInput => ({
    contactType: contactType.value,
    name: (
      contactForm.name || `${contactForm.firstname ?? ''} ${contactForm.lastname ?? ''}`
    ).trim(),
    saleChannelId: contactForm.saleChannel?.id ?? null,
    documents: (contactForm.documents ?? []).map((d) => {
      const docTypeId = d?.category?.id;
      const docTypeFromStore = documentTypesStore.documentTypes.find((dt) => dt.id === docTypeId);

      return {
        number: String(d?.name ?? '').trim(),
        countryCode: String(d?.country?.code ?? '')
          .trim()
          .slice(0, 2)
          .toUpperCase(),
        documentTypeName: String(d?.category?.name ?? '').trim(),
        documentTypeCode: String(d?.category?.shortCode ?? '')
          .trim()
          .toLowerCase(),
        isValidableDocument: Boolean(docTypeFromStore?.isValidableDocument),
      };
    }),
  });

  const mapVeeValidateErrors = (): void => {
    const flat = vvErrors.value as Record<string, string>;
    uiErrors.general = {};
    uiErrors.documents = [];

    for (const [path, msg] of Object.entries(flat)) {
      if (path === 'name' || path === 'saleChannelId') {
        (uiErrors.general as GeneralErrors)[path as keyof GeneralErrors] = msg;
        continue;
      }

      const m = path.match(/^documents(?:\[(\d+)\]|\.([0-9]+))\.(.+)$/);
      if (!m) {
        continue;
      }
      const idx = Number(m[1] ?? m[2]);
      const field = m[3];

      while (uiErrors.documents.length <= idx) {
        uiErrors.documents.push({});
      }

      const prev = uiErrors.documents[idx] ?? {};
      const next: DocumentRowError = {
        ...prev,
        ...(field === 'number' ? { number: msg } : {}),
        ...(field === 'countryCode' ? { country: msg } : {}),
        ...(field === 'documentTypeCode' || field === 'documentTypeName' ? { category: msg } : {}),
      };

      uiErrors.documents.splice(idx, 1, next);
    }

    uiErrors.documents = uiErrors.documents.map((r) => ({ ...r }));
  };

  const clearGeneralError = (key: keyof GeneralErrors): void => {
    if (uiErrors.general?.[key] !== undefined) {
      delete (uiErrors.general as GeneralErrors)[key];
    }
  };

  const clearDocError = (index: number, key: keyof DocumentRowError): void => {
    const row = uiErrors.documents[index];
    if (row === undefined || row[key] === undefined) {
      return;
    }

    const next = { ...(row ?? {}) };
    delete next[key];

    uiErrors.documents.splice(index, 1, next);
  };

  const payload = computed(() => buildPayloadToValidate());

  watch(
    () => payload.value.name,
    (nv, ov) => {
      if (nv !== ov) {
        clearGeneralError('name');
      }
    },
  );

  watch(
    () => payload.value.saleChannelId,
    (nv, ov) => {
      if (nv !== ov) {
        clearGeneralError('saleChannelId');
      }
    },
  );

  watch(
    () =>
      payload.value.documents.map((d) => ({
        countryCode: d.countryCode,
        documentTypeCode: d.documentTypeCode,
        documentTypeName: d.documentTypeName,
        number: d.number,
      })),
    (nextDocs, prevDocs) => {
      const max = Math.max(nextDocs.length, prevDocs?.length ?? 0);

      for (let i = 0; i < max; i++) {
        const n = nextDocs[i];
        const p = prevDocs?.[i];

        if (n === undefined) {
          if (uiErrors.documents[i] !== undefined) {
            uiErrors.documents.splice(i, 1);
          }
          continue;
        }
        if (p === undefined || p === null) {
          continue;
        }

        if (n.countryCode !== p.countryCode) {
          clearDocError(i, 'country');
        }
        if (
          n.documentTypeCode !== p.documentTypeCode ||
          n.documentTypeName !== p.documentTypeName
        ) {
          clearDocError(i, 'category');
        }
        if (n.number !== p.number) {
          clearDocError(i, 'number');
        }
      }
    },
    { deep: false },
  );

  const setDuplicateDocumentError = (index: number): void => {
    while (uiErrors.documents.length <= index) {
      uiErrors.documents.push({});
    }
    const prev = uiErrors.documents[index] ?? {};
    uiErrors.documents.splice(index, 1, {
      ...prev,
      number: 'contacts.errors.duplicateDocument',
    });
  };

  const setDuplicateFiscalError = (): void => {
    uiErrors.billing.duplicateFiscalDocument = 'contacts.errors.duplicateFiscalDocument';
  };

  const clearDuplicateErrors = (): void => {
    // Clear duplicate errors from documents
    uiErrors.documents = uiErrors.documents.map((doc) => {
      if (doc.number === 'contacts.errors.duplicateDocument') {
        const { number: _number, ...rest } = doc;
        return rest;
      }
      return doc;
    });

    // Clear duplicate fiscal document error
    if (uiErrors.billing.duplicateFiscalDocument === 'contacts.errors.duplicateFiscalDocument') {
      delete uiErrors.billing.duplicateFiscalDocument;
    }
  };

  return {
    validate,
    setValues,
    uiErrors,
    badges,
    resetUiErrors,
    buildPayloadToValidate,
    mapVeeValidateErrors,
    setDuplicateDocumentError,
    setDuplicateFiscalError,
    clearDuplicateErrors,
  };
};
