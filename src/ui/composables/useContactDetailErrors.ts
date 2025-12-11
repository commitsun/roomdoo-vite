import { computed, reactive, type ComputedRef, type Ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import { ContactSchema, type ContactInput } from '@/application/contacts/ContactSchemas';
import type { ContactDetail } from '@/domain/entities/Contact';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';

type GeneralErrors = { name?: string; saleChannelId?: string };
type DocumentRowError = { country?: string; category?: string; number?: string };

type ContactBadges = {
  general: number;
  documents: number;
  total: number;
};

export interface UseContactDetailErrorsReturn {
  validate: ReturnType<typeof useForm>['validate'];
  setValues: ReturnType<typeof useForm>['setValues'];
  uiErrors: {
    general: GeneralErrors;
    documents: DocumentRowError[];
  };
  badges: ComputedRef<ContactBadges>;
  resetUiErrors: () => void;
  buildPayloadToValidate: () => ContactInput;
  mapVeeValidateErrors: () => void;
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

  const uiErrors = reactive<{ general: GeneralErrors; documents: DocumentRowError[] }>({
    general: {},
    documents: [],
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
    return { general, documents, total: general + documents };
  });

  const resetUiErrors = (): void => {
    uiErrors.general = {};
    uiErrors.documents = [];
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

  return {
    validate,
    setValues,
    uiErrors,
    badges,
    resetUiErrors,
    buildPayloadToValidate,
    mapVeeValidateErrors,
  };
};
