import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, type Ref } from 'vue';

// Mock vee-validate
vi.mock('vee-validate', () => ({
  useForm: () => ({
    validate: vi.fn().mockResolvedValue({ valid: true }),
    setValues: vi.fn(),
    errors: ref({}),
  }),
}));

// Mock @vee-validate/zod
vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn((schema) => schema),
}));

// Mock stores
vi.mock('@/infrastructure/stores/documentTypes', () => ({
  useDocumentTypesStore: () => ({
    documentTypes: [],
  }),
}));

import { useContactDetailErrors } from './useContactDetailErrors';

import type { ContactDetail } from '@/domain/entities/Contact';

describe('useContactDetailErrors', () => {
  let contactType: Ref<'person' | 'company' | 'agency'>;
  let contactForm: ContactDetail;

  beforeEach(() => {
    contactType = ref<'person' | 'company' | 'agency'>('person');
    contactForm = {
      id: 0,
      name: '',
      firstname: '',
      lastname: '',
      lastname2: '',
      email: '',
      phones: [],
      birthdate: null,
      gender: '',
      nationality: undefined,
      residenceStreet: '',
      residenceCity: '',
      residenceZip: '',
      residenceCountry: undefined,
      residenceState: undefined,
      street: '',
      city: '',
      zipCode: '',
      country: undefined,
      state: undefined,
      fiscalIdNumberType: undefined,
      fiscalIdNumber: '',
      saleChannel: undefined,
      documents: [],
      internalNotes: '',
      tags: [],
      contactType: 'person',
    };
  });

  describe('billing errors', () => {
    it('should initialize with empty billing errors', () => {
      const { uiErrors } = useContactDetailErrors(contactType, contactForm);
      expect(uiErrors.billing).toEqual({});
    });

    it('should include billing errors in badges count', () => {
      const { uiErrors, badges } = useContactDetailErrors(contactType, contactForm);

      // Add billing error
      uiErrors.billing.duplicateFiscalDocument = 'contacts.errors.duplicateFiscalDocument';

      expect(badges.value.billing).toBe(1);
      expect(badges.value.total).toBe(1);
    });

    it('should reset billing errors when resetUiErrors is called', () => {
      const { uiErrors, resetUiErrors } = useContactDetailErrors(contactType, contactForm);

      // Add billing error
      uiErrors.billing.duplicateFiscalDocument = 'contacts.errors.duplicateFiscalDocument';
      expect(uiErrors.billing.duplicateFiscalDocument).toBeDefined();

      // Reset
      resetUiErrors();
      expect(uiErrors.billing).toEqual({});
    });
  });

  describe('setDuplicateDocumentError', () => {
    it('should set duplicate error for specific document index', () => {
      const { uiErrors, setDuplicateDocumentError } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      setDuplicateDocumentError(0);

      expect(uiErrors.documents[0]).toBeDefined();
      expect(uiErrors.documents[0].number).toBe('contacts.errors.duplicateDocument');
    });

    it('should expand documents array if index does not exist', () => {
      const { uiErrors, setDuplicateDocumentError } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      setDuplicateDocumentError(2);

      expect(uiErrors.documents.length).toBeGreaterThanOrEqual(3);
      expect(uiErrors.documents[2].number).toBe('contacts.errors.duplicateDocument');
    });

    it('should preserve existing errors when setting duplicate error', () => {
      const { uiErrors, setDuplicateDocumentError } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      // Set initial error
      uiErrors.documents[0] = { country: 'Country required' };

      // Set duplicate error
      setDuplicateDocumentError(0);

      expect(uiErrors.documents[0].country).toBe('Country required');
      expect(uiErrors.documents[0].number).toBe('contacts.errors.duplicateDocument');
    });
  });

  describe('setDuplicateFiscalError', () => {
    it('should set duplicate fiscal document error', () => {
      const { uiErrors, setDuplicateFiscalError } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      setDuplicateFiscalError();

      expect(uiErrors.billing.duplicateFiscalDocument).toBe(
        'contacts.errors.duplicateFiscalDocument',
      );
    });
  });

  describe('clearDuplicateErrors', () => {
    it('should clear duplicate document errors', () => {
      const { uiErrors, setDuplicateDocumentError, clearDuplicateErrors } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      // Set duplicate errors
      setDuplicateDocumentError(0);
      setDuplicateDocumentError(1);

      expect(uiErrors.documents[0].number).toBe('contacts.errors.duplicateDocument');
      expect(uiErrors.documents[1].number).toBe('contacts.errors.duplicateDocument');

      // Clear
      clearDuplicateErrors();

      expect(uiErrors.documents[0].number).toBeUndefined();
      expect(uiErrors.documents[1].number).toBeUndefined();
    });

    it('should clear duplicate fiscal document error', () => {
      const { uiErrors, setDuplicateFiscalError, clearDuplicateErrors } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      // Set duplicate error
      setDuplicateFiscalError();
      expect(uiErrors.billing.duplicateFiscalDocument).toBe(
        'contacts.errors.duplicateFiscalDocument',
      );

      // Clear
      clearDuplicateErrors();
      expect(uiErrors.billing.duplicateFiscalDocument).toBeUndefined();
    });

    it('should preserve non-duplicate errors when clearing', () => {
      const { uiErrors, clearDuplicateErrors } = useContactDetailErrors(contactType, contactForm);

      // Set mixed errors
      uiErrors.documents[0] = {
        country: 'Country required',
        number: 'contacts.errors.duplicateDocument',
      };

      // Clear duplicates
      clearDuplicateErrors();

      expect(uiErrors.documents[0].country).toBe('Country required');
      expect(uiErrors.documents[0].number).toBeUndefined();
    });

    it('should not affect other billing errors', () => {
      const { uiErrors, setDuplicateFiscalError, clearDuplicateErrors } = useContactDetailErrors(
        contactType,
        contactForm,
      );

      // Set duplicate error and another error
      setDuplicateFiscalError();
      uiErrors.billing.duplicateFiscalDocument = 'contacts.errors.duplicateFiscalDocument';

      // Clear
      clearDuplicateErrors();

      expect(uiErrors.billing.duplicateFiscalDocument).toBeUndefined();
    });
  });

  describe('badges calculation', () => {
    it('should calculate total including general, documents, and billing errors', () => {
      const { uiErrors, badges } = useContactDetailErrors(contactType, contactForm);

      // Add various errors
      uiErrors.general.name = 'Name required';
      uiErrors.documents[0] = { number: 'Number required' };
      uiErrors.billing.duplicateFiscalDocument = 'Duplicate fiscal';

      expect(badges.value.general).toBe(1);
      expect(badges.value.documents).toBe(1);
      expect(badges.value.billing).toBe(1);
      expect(badges.value.total).toBe(3);
    });

    it('should count multiple document errors correctly', () => {
      const { uiErrors, badges } = useContactDetailErrors(contactType, contactForm);

      uiErrors.documents[0] = {
        country: 'Country required',
        category: 'Category required',
        number: 'Number required',
      };

      expect(badges.value.documents).toBe(3);
    });
  });
});
