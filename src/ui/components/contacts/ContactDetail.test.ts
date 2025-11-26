import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';
// eslint-disable-next-line import/order
import type { z } from 'zod';

// ---- Mocks i18n ----
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.person': 'Person',
    'contacts.company': 'Company',
    'contacts.agency': 'Agency',
    'contacts.generalInformation': 'General information',
    'contacts.documents': 'Documents',
    'contacts.invoicing': 'Invoicing',
    'contacts.internalnotes': 'Internal notes',
    'contacts.cancel': 'Cancel',
    'contacts.save': 'Save',
    'error.somethingWentWrong': 'Something went wrong',
  };
  return {
    useI18n: () => ({
      t: (k: string) => tMap[k] ?? k,
    }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

// ---- Mock responsive (desktop/mobile) ----
const desktopFlag = ref<boolean>(true);
vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => desktopFlag),
  __setDesktop: (v: boolean) => (desktopFlag.value = v),
}));

vi.mock('vee-validate', () => {
  return {
    useForm: () => ({
      validate: vi.fn().mockResolvedValue({ valid: true }),
      setValues: vi.fn(),
      errors: { value: {} as Record<string, string> },
    }),
  };
});
vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: (s: unknown) => s,
}));

// --- MOCK stdnum ---
vi.mock('stdnum', () => {
  const mk = (fn: (s: string) => boolean) => ({
    validate: (s: string) => ({ isValid: fn(s), compact: s?.replace(/\s|-/g, '') }),
  });
  return {
    stdnum: {
      ES: { nif: mk((s) => s === 'NIF-OK') },
      MX: { rfc: mk((s) => s === 'RFC-OK') },
      BR: { cpf: mk(() => false) },
    },
  };
});

// ---- Stubs UI ----
export const SelectButtonStub = {
  name: 'SelectButton',
  props: ['modelValue', 'options', 'allowEmpty', 'optionLabel', 'optionValue'],
  emits: ['update:modelValue'],
  template: `
    <div data-testid="selectbutton">
      <button
        v-for="o in (options || [])"
        :key="o.value"
        type="button"
        role="button"
        :aria-pressed="modelValue === o.value ? 'true' : 'false'"
        @click="$emit('update:modelValue', o.value)"
      >
        {{ o.label }}
      </button>
    </div>
  `,
};

export const TabsStub = {
  name: 'Tabs',
  props: ['value', 'lazy'],
  emits: ['update:value'],
  template: `
    <div class="pv-tabs" data-testid="tabs" :data-model="value">
      <button type="button" data-testid="tabs-set-2" @click="$emit('update:value', '2')">set-tab-2</button>
      <slot />
    </div>
  `,
};

export const TabListStub = {
  name: 'TabList',
  template: `<div class="p-tablist"><slot /></div>`,
};

export const TabStub = {
  name: 'Tab',
  props: ['value'],
  template: `<button role="tab"><slot /></button>`,
};

export const TabPanelsStub = {
  name: 'TabPanels',
  template: `<div class="p-tabpanels"><slot /></div>`,
};

export const TabPanelStub = {
  name: 'TabPanel',
  props: ['value'],
  template: `<div class="p-tabpanel"><slot /></div>`,
};

export const AccordionStub = {
  name: 'Accordion',
  props: ['value', 'lazy'],
  emits: ['update:value'],
  template: `
    <div class="pv-accordion" data-testid="accordion" :data-model="value">
      <button type="button" data-testid="acc-set-1" @click="$emit('update:value', '1')">set-acc-1</button>
      <slot />
    </div>
  `,
};

export const AccordionHeaderStub = {
  name: 'AccordionHeader',
  template: `<div class="pv-accordion-header"><slot /></div>`,
};

export const AccordionContentStub = {
  name: 'AccordionContent',
  template: `<div class="pv-accordion-content"><slot /></div>`,
};

export const AccordionPanelStub = {
  name: 'AccordionPanel',
  props: ['value'],
  template: `<div class="pv-accordion-panel"><slot /></div>`,
};

export const ButtonStub = {
  name: 'Button',
  props: ['label', 'severity'],
  emits: ['click'],
  template: `
    <button
      type="button"
      role="button"
      :class="'pv-btn ' + (severity || '')"
      @click="$emit('click')"
    >
      {{ label }}
    </button>
  `,
};

// ---- Stubs hijos (mockeados con emisión de update:modelValue) ----
export const ContactDetailGeneralDataStub = {
  name: 'ContactDetailGeneralData',
  template: `<div data-testid="general-data"></div>`,
};

export const ContactDetailDocumentsStub = {
  name: 'ContactDetailDocuments',
  template: `<div data-testid="documents"></div>`,
};

export const ContactDetailBillingStub = {
  name: 'ContactDetailBilling',
  template: `<div data-testid="billing"></div>`,
};

export const ContactDetailInternalNotesStub = {
  name: 'ContactDetailInternalNotes',
  template: `<div data-testid="internal-notes"></div>`,
};

const base: ContactInput = {
  contactType: 'person',
  name: 'John Doe',
  saleChannelId: null,
  documents: [],
};

const doc = (over: Partial<ContactInput['documents'][number]> = {}) => ({
  number: 'X',
  countryCode: 'ES',
  documentTypeName: 'nif',
  isValidable: true,
  ...over,
});

function expectError(
  parsed: ReturnType<typeof ContactSchema.safeParse>,
  expected: Array<{ path: (string | number)[]; message: string }>,
) {
  expect(parsed.success).toBe(false);
  const issues = (parsed as any).error.issues as z.ZodIssue[];
  for (const e of expected) {
    const found = issues.find(
      (i) => JSON.stringify(i.path) === JSON.stringify(e.path) && i.message === e.message,
    );
    expect(
      found,
      `No se encontró error para path=${JSON.stringify(e.path)} msg=${e.message}`,
    ).toBeTruthy();
  }
  // También comprobamos que no haya errores "extra" no esperados en estos tests.
  expect(issues.length).toBe(expected.length);
}

// ---- Iconos stubs (no funcionales) ----
export const UserIconStub = { name: 'User', template: `<i class="icon-user"></i>` };
export const BuildingIconStub = { name: 'Building', template: `<i class="icon-building"></i>` };
export const StoreIconStub = { name: 'Store', template: `<i class="icon-store"></i>` };
export const FileTextIconStub = { name: 'FileText', template: `<i class="icon-file"></i>` };
export const IdCardIconStub = { name: 'IdCard', template: `<i class="icon-idcard"></i>` };
export const BanknoteIconStub = { name: 'Banknote', template: `<i class="icon-bank"></i>` };
export const NotebookPenIconStub = { name: 'NotebookPen', template: `<i class="icon-notes"></i>` };
export const BookUserIconStub = { name: 'BookUser', template: `<i class="icon-bookuser"></i>` };

// ---- Hijos reales mockeados con inputs que emiten cambios ----
vi.mock('./ContactDetailGeneralData.vue', () => ({
  default: {
    name: 'ContactDetailGeneralData',
    data: () => ({ first: '' }),
    template: `
      <div data-testid="general-data">
        <label for="first-input">First name</label>
        <input id="first-input" aria-label="First name"
          placeholder="first name"
          v-model="first"
          @input="$emit('update:modelValue', { firstname: first })" />
      </div>
    `,
  },
}));

vi.mock('./ContactDetailDocuments.vue', () => ({
  default: {
    name: 'ContactDetailDocuments',
    data: () => ({
      docName: '',
      catId: '9', // 9 = DNI, 5 = Passport (como en tus <option>)
      countryId: '34', // Spain
      support: '',
    }),
    methods: {
      catObj(catId: string): { id: number; name: string; code: string; countries: any[] } {
        const id = Number(catId);
        if (id === 5) {
          // cuando el test selecciona 5 -> PASSPORT
          return { id, name: 'passport', code: 'passport', countries: [] };
        }
        // por defecto -> DNI
        return { id, name: 'dni', code: 'dni', countries: [] };
      },
      emitAll(this: any) {
        this.$emit('update:modelValue', {
          documents: [
            {
              id: 0,
              name: this.docName,
              category: this.catObj(this.catId), // <- usa passport/dni según catId
              country: { id: Number(this.countryId), name: 'Spain', code: 'ES' },
              supportNumber: this.support,
            },
          ],
        });
      },
    },
    template: `
      <div data-testid="documents">
        <label for="doc-name">Doc name</label>
        <input id="doc-name" aria-label="Document name"
          v-model="docName"
          placeholder="document name"
          @input="emitAll"
        />

        <label for="doc-cat">Category</label>
        <select id="doc-cat" aria-label="Document category"
          v-model="catId"
          placeholder="document category"
          @change="emitAll"
        >
          <option value="9">DNI</option>
          <option value="5">Passport</option>
        </select>

        <label for="doc-country">Country</label>
        <select id="doc-country" aria-label="Document country"
          v-model="countryId"
          placeholder="document country"
          @change="emitAll"
        >
          <option value="34">Spain</option>
          <option value="33">UK</option>
        </select>

        <label for="doc-support">Support</label>
        <input id="doc-support" aria-label="Support number"
          placeholder="support number"
          v-model="support"
          @input="emitAll"
        />
      </div>
    `,
  },
}));

vi.mock('./ContactDetailBilling.vue', () => ({
  default: {
    name: 'ContactDetailBilling',
    data: () => ({ vat: '' }),
    template: `
      <div data-testid="billing">
        <label for="vat-input">VAT</label>
        <input id="vat-input" aria-label="VAT"
          placeholder="VAT"
          v-model="vat"
          @input="$emit('update:modelValue', { fiscalIdNumber: vat })"
        />
      </div>
    `,
  },
}));

vi.mock('./ContactDetailInternalNotes.vue', () => ({
  default: {
    name: 'ContactDetailInternalNotes',
    data: () => ({ notes: '' }),
    template: `
      <div data-testid="internal-notes">
        <label for="notes-input">Notes</label>
        <textarea id="notes-input" aria-label="Internal notes"
          placeholder="internal notes"
          v-model="notes"
          @input="$emit('update:modelValue', { internalNotes: notes })">
        </textarea>
      </div>
    `,
  },
}));

// ---- Stores mocks ----
const fetches = {
  fetchDocumentTypes: vi.fn().mockResolvedValue(undefined),
  fetchFiscalDocumentTypes: vi.fn().mockResolvedValue(undefined),
  fetchCountries: vi.fn().mockResolvedValue(undefined),
  fetchPaymentTerms: vi.fn().mockResolvedValue(undefined),
  fetchPricelists: vi.fn().mockResolvedValue(undefined),
  fetchTags: vi.fn().mockResolvedValue(undefined),
};

const contactsStoreMock = {
  contactSchema: { fields: ['lastname2'] },
  createContact: vi.fn().mockResolvedValue(undefined),
  updateContactFields: vi.fn().mockResolvedValue(undefined),
};

const uiStoreMock = {
  startLoading: vi.fn(),
  stopLoading: vi.fn(),
};

const textMessagesStoreMock = {
  addTextMessage: vi.fn(),
};

vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => contactsStoreMock,
}));
vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => ({ fetchCountries: fetches.fetchCountries }),
}));
vi.mock('@/infrastructure/stores/paymentTerms', () => ({
  usePaymentTermsStore: () => ({ fetchPaymentTerms: fetches.fetchPaymentTerms }),
}));
vi.mock('@/infrastructure/stores/pricelist', () => ({
  usePricelistStore: () => ({ fetchPricelists: fetches.fetchPricelists }),
}));
vi.mock('@/infrastructure/stores/documentTypes', () => ({
  useDocumentTypesStore: () => ({
    fetchDocumentTypes: fetches.fetchDocumentTypes,
    fetchFiscalDocumentTypes: fetches.fetchFiscalDocumentTypes,
  }),
}));
vi.mock('@/infrastructure/stores/tags', () => ({
  useTagsStore: () => ({ fetchTags: fetches.fetchTags }),
}));
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => uiStoreMock,
}));
vi.mock('@/infrastructure/stores/textMessages', () => ({
  useTextMessagesStore: () => textMessagesStoreMock,
}));

import * as vueuse from '@vueuse/core';

import Component from './ContactDetail.vue';

import { ContactSchema, type ContactInput } from '@/application/contacts/ContactSchemas';

// ---- Helper render ----
const renderWith = (opts: { provideDialog?: any } = {}) => {
  const pinia = createTestingPinia();

  return render(Component, {
    global: {
      plugins: [pinia],
      provide: {
        dialogRef:
          opts.provideDialog ??
          ref<{ close: (p?: unknown) => void; data: any }>({
            close: vi.fn(),
            data: {},
          }),
      },
      components: {
        SelectButton: SelectButtonStub,
        Tabs: TabsStub,
        TabList: TabListStub,
        Tab: TabStub,
        TabPanels: TabPanelsStub,
        TabPanel: TabPanelStub,
        Accordion: AccordionStub,
        AccordionHeader: AccordionHeaderStub,
        AccordionContent: AccordionContentStub,
        AccordionPanel: AccordionPanelStub,
        Button: ButtonStub,
      },
    },
  });
};

// ---- Tests ----
describe('ContactDetailDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (vueuse as any).__setDesktop(true);
    (contactsStoreMock.createContact as any).mockResolvedValue({ id: 123 });
    (contactsStoreMock.updateContactFields as any).mockResolvedValue(undefined);
  });

  it('it displays Tabs on desktop and Accordion on mobile', async () => {
    renderWith();
    expect(screen.queryByTestId('tabs')).toBeInTheDocument();
    expect(screen.queryByTestId('accordion')).not.toBeInTheDocument();

    (vueuse as any).__setDesktop(false);
    renderWith();
    expect(screen.queryByTestId('accordion')).toBeInTheDocument();
  });

  it('it displays Documents tab for contactType = person', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    expect(screen.getByText('Documents')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Company' }));
    expect(screen.queryByText('Documents')).not.toBeInTheDocument();
  });

  it('it resets activeTab/panel when changing contactType (verifiable by disappearance of "Documents")', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    expect(screen.getByText('Documents')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Agency' }));
    expect(screen.queryByText('Documents')).not.toBeInTheDocument();
  });

  it('onBeforeMount calls fetch and starts/stops loading', async () => {
    renderWith();

    await waitFor(() => expect(fetches.fetchDocumentTypes).toHaveBeenCalled());
    await waitFor(() => expect(fetches.fetchFiscalDocumentTypes).toHaveBeenCalled());
    await waitFor(() => expect(fetches.fetchCountries).toHaveBeenCalled());
    await waitFor(() => expect(fetches.fetchPaymentTerms).toHaveBeenCalled());
    await waitFor(() => expect(fetches.fetchPricelists).toHaveBeenCalled());
    await waitFor(() => expect(fetches.fetchTags).toHaveBeenCalled());

    await waitFor(() => expect(uiStoreMock.startLoading).toHaveBeenCalled());
    await waitFor(() => expect(uiStoreMock.stopLoading).toHaveBeenCalled());
  });

  it('handleSave creates contact when there is no contact in dialogRef', async () => {
    const dialogRef = ref<{ close: (p?: unknown) => void; data: any }>({
      close: vi.fn(),
      data: {},
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1);
      expect(contactsStoreMock.updateContactFields).not.toHaveBeenCalled();
      expect(dialogRef.value.close).toHaveBeenCalledWith({
        action: 'saved',
        contactId: 123,
      });
    });
  });

  it('handleSave updates contact when there is contact in dialogRef', async () => {
    const dialogRef = ref<{ close: (p?: unknown) => void; data: any }>({
      close: vi.fn(),
      data: {
        contact: {
          id: 123,
          firstname: 'John',
          lastname: 'Doe',
          contactType: 'person',
        },
      },
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(contactsStoreMock.updateContactFields).toHaveBeenCalledTimes(1);
      const args = (contactsStoreMock.updateContactFields as any).mock.calls[0];
      expect(args[0]).toBe(123);

      expect(dialogRef.value.close).toHaveBeenCalledWith({
        action: 'saved',
        contactId: 123,
      });
    });
  });

  it('handleCancel closes the dialog', async () => {
    const dialogRef = ref<{ close: (p?: unknown) => void; data: any }>({
      close: vi.fn(),
      data: {},
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(dialogRef.value.close).toHaveBeenCalledWith({ action: 'cancel' });
  });

  it('if a fetch fails, it shows error text (addTextMessage)', async () => {
    fetches.fetchCountries.mockRejectedValueOnce(new Error('countries fail'));

    renderWith();

    await waitFor(() => expect(textMessagesStoreMock.addTextMessage).toHaveBeenCalled());

    const [title, msg] = (textMessagesStoreMock.addTextMessage as any).mock.calls[0];
    expect(title).toBe('Something went wrong');
    expect(msg).toBe('countries fail');
  });

  it('merging changes from child inputs (firstname + VAT) and sends them in createContact', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    const firstInput = screen.getByPlaceholderText('first name');
    await userEvent.type(firstInput, 'Alice');

    const vatInput = screen.getByPlaceholderText('VAT');
    await userEvent.type(vatInput, 'X123');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1);
      const payload = (contactsStoreMock.createContact as any).mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          firstname: 'Alice',
          fiscalIdNumber: 'X123',
        }),
      );
    });
  });

  it('merging changes from Documents (input + select) and sends them in createContact in desktop', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    const nameInput = screen.getByPlaceholderText('document name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'ABC123');

    const catSelect = screen.getByPlaceholderText('document category');
    await userEvent.selectOptions(catSelect, '5');

    const countrySelect = screen.getByPlaceholderText('document country');
    await userEvent.selectOptions(countrySelect, '34');

    const supportInput = screen.getByPlaceholderText('support number');
    await userEvent.type(supportInput, 'SN-1');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1);
      const payload = (contactsStoreMock.createContact as any).mock.calls[0][0];

      expect(Array.isArray(payload.documents)).toBe(true);
      expect(payload.documents).toHaveLength(1);
      expect(payload.documents[0]).toEqual(
        expect.objectContaining({
          id: 0,
          name: 'ABC123',
          category: expect.objectContaining({ id: 5 }),
          country: expect.objectContaining({ id: 34 }),
          supportNumber: 'SN-1',
        }),
      );
    });
  });

  it('hydrate contactForm from dialogRef: birthdate -> Date and lang with hyphen', async () => {
    const dialogRef = ref<{ close: (p?: unknown) => void; data: any }>({
      close: vi.fn(),
      data: {
        contact: {
          id: 7,
          firstname: 'Init',
          lastname: 'User',
          birthdate: '1990-01-02',
          lang: 'en_US',
          contactType: 'person',
        },
      },
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(contactsStoreMock.updateContactFields).toHaveBeenCalledTimes(1));
    const [, , updated] = (contactsStoreMock.updateContactFields as any).mock.calls[0];

    expect(updated.birthdate).toBeInstanceOf(Date);
    expect(updated.lang).toBe('en-US');
  });

  it('in edit mode, update contactType with the current selection.', async () => {
    const dialogRef = ref({
      close: vi.fn(),
      data: { contact: { id: 10, firstname: 'A', lastname: 'B', contactType: 'person' } },
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: 'Agency' }));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(contactsStoreMock.updateContactFields).toHaveBeenCalledTimes(1));
    const args = (contactsStoreMock.updateContactFields as any).mock.calls[0];
    const updated = args[2];
    expect(updated.contactType).toBe('agency');
  });

  it('shows error if createContact fails and always does stopLoading', async () => {
    contactsStoreMock.createContact.mockRejectedValueOnce(new Error('create boom'));

    renderWith();

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(textMessagesStoreMock.addTextMessage).toHaveBeenCalled();
    });
    const [title, msg] = (textMessagesStoreMock.addTextMessage as any).mock.calls.at(-1);
    expect(title).toBe('Something went wrong');
    expect(msg).toBe('create boom');

    expect(uiStoreMock.startLoading).toHaveBeenCalled();
    expect(uiStoreMock.stopLoading).toHaveBeenCalled();
  });

  it('shows error if updateContactFields fails and always does stopLoading', async () => {
    contactsStoreMock.updateContactFields.mockRejectedValueOnce(new Error('update fail'));

    const dialogRef = ref({
      close: vi.fn(),
      data: { contact: { id: 99, firstname: 'J', lastname: 'D', contactType: 'person' } },
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(textMessagesStoreMock.addTextMessage).toHaveBeenCalled();
    });
    const [title, msg] = (textMessagesStoreMock.addTextMessage as any).mock.calls.at(-1);
    expect(title).toBe('Something went wrong');
    expect(msg).toBe('update fail');

    expect(uiStoreMock.startLoading).toHaveBeenCalled();
    expect(uiStoreMock.stopLoading).toHaveBeenCalled();
  });

  it('maintains merge of several children (firstname + internalNotes) in createContact', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    const firstInput = screen.getByPlaceholderText('first name');
    await userEvent.type(firstInput, 'Eve');

    const notes = screen.getByPlaceholderText('internal notes');
    await userEvent.type(notes, 'Hello world');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    const payload = (contactsStoreMock.createContact as any).mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        firstname: 'Eve',
        internalNotes: 'Hello world',
      }),
    );
  });

  it('in mobile uses Accordion and hides Documents when changing contactType', async () => {
    (vueuse as any).__setDesktop(false);
    renderWith();

    expect(screen.getByTestId('accordion')).toBeInTheDocument();
    expect(screen.queryByTestId('tabs')).not.toBeInTheDocument();

    expect(screen.getByText('Documents')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Company' }));
    expect(screen.queryByText('Documents')).not.toBeInTheDocument();
  });

  it('Documents emits correct values', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    await userEvent.type(screen.getByPlaceholderText('first name'), 'Alice');

    await userEvent.clear(screen.getByPlaceholderText('document name'));
    await userEvent.type(screen.getByPlaceholderText('document name'), 'N-77');

    await userEvent.selectOptions(screen.getByPlaceholderText('document category'), '5');
    await userEvent.selectOptions(screen.getByPlaceholderText('document country'), '34');
    await userEvent.type(screen.getByPlaceholderText('support number'), 'SUP-9');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    const payload = (contactsStoreMock.createContact as any).mock.calls[0][0];
    expect(payload.firstname).toBe('Alice');
    expect(payload.documents?.[0]).toEqual(
      expect.objectContaining({
        id: 0,
        name: 'N-77',
        supportNumber: 'SUP-9',
        category: expect.objectContaining({ id: 5 }),
        country: expect.objectContaining({ id: 34 }),
      }),
    );
  });

  it('merging changes from GeneralData, Documents, Billing, InternalNotes and sends them in createContact in mobile', async () => {
    (vueuse as any).__setDesktop(false);
    renderWith();

    const firstInput = screen.getByPlaceholderText('first name');
    await userEvent.type(firstInput, 'Bob');

    const vatInput = screen.getByPlaceholderText('VAT');
    await userEvent.type(vatInput, 'Y789');

    const nameInput = screen.getByPlaceholderText('document name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'ABC123');

    const catSelect = screen.getByPlaceholderText('document category');
    await userEvent.selectOptions(catSelect, '5');

    const countrySelect = screen.getByPlaceholderText('document country');
    await userEvent.selectOptions(countrySelect, '34');

    const supportInput = screen.getByPlaceholderText('support number');
    await userEvent.type(supportInput, 'SN-1');

    const notesInput = screen.getByPlaceholderText('internal notes');
    await userEvent.type(notesInput, 'Notes here');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1);
    });
    const payload = (contactsStoreMock.createContact as any).mock.calls[0][0];

    expect(Array.isArray(payload.documents)).toBe(true);
    expect(payload.documents).toHaveLength(1);
    expect(payload).toEqual(
      expect.objectContaining({
        firstname: 'Bob',
        fiscalIdNumber: 'Y789',
        internalNotes: 'Notes here',
      }),
    );
    expect(payload.documents[0]).toEqual(
      expect.objectContaining({
        id: 0,
        name: 'ABC123',
        category: expect.objectContaining({ id: 5 }),
        country: expect.objectContaining({ id: 34 }),
        supportNumber: 'SN-1',
      }),
    );
  });

  it('v-model Tabs: updates activeTab when child emits update:value', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    const tabs = await screen.findByTestId('tabs');
    expect(tabs.getAttribute('data-model')).toBe('0');

    await userEvent.click(screen.getByTestId('tabs-set-2'));

    expect(tabs.getAttribute('data-model')).toBe('2');
  });

  it('v-model Accordion: updates activePanel when child emits update:value', async () => {
    (vueuse as any).__setDesktop(false);
    renderWith();

    const acc = await screen.findByTestId('accordion');
    expect(acc.getAttribute('data-model') ?? '').toBe('');

    await userEvent.click(screen.getByTestId('acc-set-1'));

    expect(acc.getAttribute('data-model')).toBe('1');
  });

  it('unvalidatable document: does not execute stdnum, does not block even if the number is "wrong"', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ number: 'CUALQUIERA', isValidable: false })],
    });
    expect(parsed.success).toBe(true);
  });

  it('validable and supported document: valid (ES.nif -> "NIF-OK', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ countryCode: 'es', documentTypeName: 'NIF', number: 'NIF-OK' })],
    });
    expect(parsed.success).toBe(true);
  });

  it('validable and supported document: invalid (BR.cpf always KO in mock)', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ countryCode: 'BR', documentTypeName: 'cpf', number: '123' })],
    });
    expectError(parsed, [
      {
        path: ['documents', 0, 'number'],
        message: 'contacts.errors.invalidDocument',
      },
    ]);
  });

  it('validable document but type/country not supported by stdnum: does not block', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ countryCode: 'US', documentTypeName: 'ssn', number: 'ANY' })],
    });
    expect(parsed.success).toBe(true);
  });

  it('several mixed documents (OK, KO, not supported) only propagate the KO error', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [
        doc({ countryCode: 'ES', documentTypeName: 'nif', number: 'NIF-OK' }),
        doc({ countryCode: 'BR', documentTypeName: 'cpf', number: 'BAD' }),
        doc({ countryCode: 'US', documentTypeName: 'ssn', number: 'ANY' }),
      ],
    });
    expectError(parsed, [
      {
        path: ['documents', 1, 'number'],
        message: 'contacts.errors.invalidDocument',
      },
    ]);
  });

  it('normalizes countryCode/documentTypeName (trim + case), and triggers validation', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ countryCode: ' es ', documentTypeName: '  Nif ', number: 'NIF-OK' })],
    });
    expect(parsed.success).toBe(true);
  });
});
