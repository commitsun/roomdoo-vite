import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';
// eslint-disable-next-line import/order
import * as vee from 'vee-validate';

// ---- Mocks i18n ----
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.person': 'Person',
    'contacts.company': 'Company',
    'contacts.agency': 'Agency',
    'contacts.generalInformation': 'General information',
    'contacts.documents': 'Documents',
    'contacts.invoicing': 'Invoicing',
    'contacts.internalNotes': 'Internal notes',
    'contacts.cancel': 'Cancel',
    'contacts.save': 'Save',
    'error.somethingWentWrong': 'Something went wrong',
    'contacts.errors.fieldErrors': '{count} field errors',
  };
  return {
    useI18n: () => ({
      t: (k: string, vars?: any) =>
        k === 'contacts.errors.fieldErrors' ? `${vars?.count} field errors` : (tMap[k] ?? k),
    }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

// ---- Mock responsive (desktop/mobile) ----
const desktopFlag = ref<boolean>(true);

const vvState = {
  errors: {} as Record<string, string>,
  validateResult: { valid: true } as { valid: boolean },
  setValues: vi.fn(),
};

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => desktopFlag),
  __setDesktop: (v: boolean) => {
    desktopFlag.value = v;
  },
}));

// ---- Mock vee-validate ----
vi.mock('vee-validate', () => {
  return {
    useForm: () => ({
      validate: vi.fn().mockImplementation(async () => vvState.validateResult),
      setValues: vvState.setValues,
      errors: { value: vvState.errors },
    }),
    __vvSetErrors: (e: Record<string, string>) => {
      for (const k of Object.keys(vvState.errors)) {
        delete vvState.errors[k];
      }
      Object.assign(vvState.errors, e ?? {});
    },
    __vvSetValidate: (res: { valid: boolean }) => (vvState.validateResult = res),
    __vvGetState: () => vvState,
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

vi.mock('./ContactDetailAccordion.vue', () => ({
  default: {
    name: 'ContactDetailAccordion',
    props: ['modelValue', 'formParts', 'badges'],
    emits: ['update:modelValue'],
    template: `
      <div data-testid="accordion" :data-model="modelValue">
        <button
          type="button"
          data-testid="acc-set-1"
          @click="$emit('update:modelValue', '1')"
        >
          set-acc-1
        </button>

        <div
          v-for="(p, idx) in (Array.isArray(formParts) ? formParts : [])"
          :key="(p && p.id) || idx"
        >
          <span v-if="p && p.labelKey === 'contacts.documents' && p.show">
            Documents
          </span>
          <slot name="formPart" :formPart="p" />
        </div>
      </div>
    `,
  },
}));

vi.mock('./ContactDetailTabs.vue', () => ({
  default: {
    name: 'ContactDetailTabs',
    props: ['modelValue', 'formParts', 'badges'],
    emits: ['update:modelValue'],
    template: `
      <div data-testid="tabs" :data-model="modelValue">
        <button
          type="button"
          data-testid="tabs-set-2"
          @click="$emit('update:modelValue', '2')"
        >
          set-tab-2
        </button>

        <div
          v-for="(p, idx) in (Array.isArray(formParts) ? formParts : [])"
          :key="(p && p.id) || idx"
        >
          <!-- Solo usamos .show cuando p es truthy -->
          <span v-if="p && p.labelKey === 'contacts.documents' && p.show">
            Documents
          </span>
          <slot name="formPart" :formPart="p" />
        </div>
      </div>
    `,
  },
}));

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
  documentTypeCode: 'nif',
  isValidableDocument: true,
  ...over,
});

export const UserIconStub = { name: 'User', template: `<i class="icon-user"></i>` };
export const BuildingIconStub = { name: 'Building', template: `<i class="icon-building"></i>` };
export const StoreIconStub = { name: 'Store', template: `<i class="icon-store"></i>` };
export const FileTextIconStub = { name: 'FileText', template: `<i class="icon-file"></i>` };
export const IdCardIconStub = { name: 'IdCard', template: `<i class="icon-idcard"></i>` };
export const BanknoteIconStub = { name: 'Banknote', template: `<i class="icon-bank"></i>` };
export const NotebookPenIconStub = { name: 'NotebookPen', template: `<i class="icon-notes"></i>` };
export const BookUserIconStub = { name: 'BookUser', template: `<i class="icon-bookuser"></i>` };

vi.mock('./ContactDetailGeneralData.vue', () => ({
  default: {
    name: 'ContactDetailGeneralData',
    data: () => ({
      first: '',
      last: '',
      last2: '',
      rStreet: '',
      rZip: '',
      rCity: '',
    }),
    methods: {
      emitAll(this: any) {
        this.$emit('update:modelValue', {
          firstname: this.first,
          lastname: this.last,
          lastname2: this.last2,
          residenceStreet: this.rStreet,
          residenceZip: this.rZip,
          residenceCity: this.rCity,
        });
      },
    },
    template: `
      <div data-testid="general-data">
        <label for="first-input">First name</label>
        <input id="first-input" aria-label="First name"
          placeholder="first name" v-model="first" @input="emitAll" />

        <label for="last-input">Last name</label>
        <input id="last-input" aria-label="Last name"
          placeholder="last name" v-model="last" @input="emitAll" />

        <label for="last2-input">Second last name</label>
        <input id="last2-input" aria-label="Second last name"
          placeholder="second last name" v-model="last2" @input="emitAll" />

        <!-- (si usas residencia) -->
        <input aria-label="Residence street" placeholder="residence street" v-model="rStreet" @input="emitAll" />
        <input aria-label="Residence zip" placeholder="residence zip" v-model="rZip" @input="emitAll" />
        <input aria-label="Residence city" placeholder="residence city" v-model="rCity" @input="emitAll" />
      </div>
    `,
  },
}));

vi.mock('./ContactDetailDocuments.vue', () => ({
  default: {
    name: 'ContactDetailDocuments',
    data: () => ({
      docName: '',
      catId: '9',
      countryId: '34',
      support: '',
    }),
    methods: {
      catObj(catId: string): { id: number; name: string; code: string; countries: any[] } {
        const id = Number(catId);
        if (id === 5) {
          return { id, name: 'passport', code: 'passport', countries: [] };
        }
        return { id, name: 'dni', code: 'dni', countries: [] };
      },
      emitAll(this: any) {
        this.$emit('update:modelValue', {
          documents: [
            {
              id: 0,
              name: this.docName,
              category: this.catObj(this.catId),
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
        <button aria-label="open-by-doc" @click="$emit('changeContactForm', 555)">open-by-doc</button>
      </div>
    `,
  },
}));

vi.mock('./ContactDetailBilling.vue', () => ({
  default: {
    name: 'ContactDetailBilling',
    data: () => ({
      vat: '',
      bStreet: '',
      bZip: '',
      bCity: '',
      bCountryId: '33',
      bStateId: '3301',
    }),
    methods: {
      emitBilling(this: any) {
        this.$emit('update:billingAddress', {
          street: this.bStreet,
          zipCode: this.bZip,
          city: this.bCity,
          country: { id: Number(this.bCountryId), code: 'GB', name: 'UK' },
          state: { id: Number(this.bStateId), name: 'England' },
        });
      },
    },
    template: `
      <div data-testid="billing">
        <input aria-label="VAT" placeholder="VAT" v-model="vat"
          @input="$emit('update:modelValue', { fiscalIdNumber: vat })" />

        <!-- billing address inputs -->
        <input aria-label="billing street" placeholder="billing street" v-model="bStreet" @input="emitBilling" />
        <input aria-label="billing zip" placeholder="billing zip" v-model="bZip" @input="emitBilling" />
        <input aria-label="billing city" placeholder="billing city" v-model="bCity" @input="emitBilling" />

        <!-- cambia el modo -->
        <button aria-label="Use other address" @click="$emit('updateBillingAddressMode', 'other')">use-other</button>

        <!-- dispara cambio de contacto -->
        <button aria-label="open-by-billing" @click="$emit('changeContactForm', 888)">open-by-billing</button>
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
  fetchContactById: vi.fn(),
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
    documentTypes: [
      {
        id: 5,
        name: 'passport',
        code: 'passport',
        countries: [],
        isValidableDocument: false,
        shortCode: 'passport',
      },
      {
        id: 9,
        name: 'dni',
        code: 'dni',
        countries: [],
        isValidableDocument: false,
        shortCode: 'dni',
      },
    ],
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
    (vueuse as any).__setDesktop?.(true);
  });

  it('it renders both Tabs and Accordion wrappers', async () => {
    renderWith();

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  it('it displays Documents tab for contactType = person', async () => {
    renderWith();
    expect(screen.getAllByText('Documents').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: 'Company' }));

    expect(screen.queryByText('Documents')).not.toBeInTheDocument();
  });

  it('it resets activeTab/panel when changing contactType (verifiable by disappearance of "Documents")', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    expect(screen.getAllByText('Documents').length).toBeGreaterThan(0);

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

    await waitFor(() => expect(uiStoreMock.stopLoading).toHaveBeenCalled());
  });

  it('handleSave creates contact when there is no contact in dialogRef', async () => {
    const dialogRef = ref<{ close: (p?: unknown) => void; data: any }>({
      close: vi.fn(),
      data: {},
    });

    renderWith({ provideDialog: dialogRef });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1));
    expect(contactsStoreMock.updateContactFields).not.toHaveBeenCalled();
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

    await waitFor(() => expect(contactsStoreMock.updateContactFields).toHaveBeenCalledTimes(1));
    const args = (contactsStoreMock.updateContactFields as any).mock.calls[0];
    expect(args[0]).toBe(123);
    expect(dialogRef.value.close).toHaveBeenCalledWith({ action: 'saved', contactId: 123 });
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

    const firstInput = screen.getAllByPlaceholderText('first name')[0];
    await userEvent.type(firstInput, 'Alice');

    const vatInput = screen.getAllByPlaceholderText('VAT')[0];
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

    const nameInput = screen.getAllByPlaceholderText('document name')[0];
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'ABC123');

    const catSelect = screen.getAllByPlaceholderText('document category')[0];
    await userEvent.selectOptions(catSelect, '5');

    const countrySelect = screen.getAllByPlaceholderText('document country')[0];
    await userEvent.selectOptions(countrySelect, '34');

    const supportInput = screen.getAllByPlaceholderText('support number')[0];
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

    const firstInput = screen.getAllByPlaceholderText('first name')[0];
    await userEvent.type(firstInput, 'Eve');

    const notes = screen.getAllByPlaceholderText('internal notes')[0];
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
    expect(screen.getByTestId('tabs')).toBeInTheDocument();

    expect(screen.getAllByText('Documents').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: 'Company' }));

    expect(screen.queryByText('Documents')).not.toBeInTheDocument();
  });

  it('Documents emits correct values', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    await userEvent.type(screen.getAllByPlaceholderText('first name')[0], 'Alice');

    await userEvent.clear(screen.getAllByPlaceholderText('document name')[0]);
    await userEvent.type(screen.getAllByPlaceholderText('document name')[0], 'N-77');

    await userEvent.selectOptions(screen.getAllByPlaceholderText('document category')[0], '5');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document country')[0], '34');
    await userEvent.type(screen.getAllByPlaceholderText('support number')[0], 'SUP-9');

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

    const firstInput = screen.getAllByPlaceholderText('first name')[0];
    await userEvent.type(firstInput, 'Bob');

    const vatInput = screen.getAllByPlaceholderText('VAT')[0];
    await userEvent.type(vatInput, 'Y789');

    const nameInput = screen.getAllByPlaceholderText('document name')[0];
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'ABC123');

    const catSelect = screen.getAllByPlaceholderText('document category')[0];
    await userEvent.selectOptions(catSelect, '5');

    const countrySelect = screen.getAllByPlaceholderText('document country')[0];
    await userEvent.selectOptions(countrySelect, '34');

    const supportInput = screen.getAllByPlaceholderText('support number')[0];
    await userEvent.type(supportInput, 'SN-1');

    const notesInput = screen.getAllByPlaceholderText('internal notes')[0];
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
    renderWith();

    const tabs = await screen.findByTestId('tabs');
    expect(tabs.getAttribute('data-model')).toBe('0');

    await userEvent.click(screen.getByTestId('tabs-set-2'));

    expect(tabs.getAttribute('data-model')).toBe('2');
  });

  it('v-model Accordion: updates activePanel when child emits update:value', async () => {
    renderWith();

    const acc = await screen.findByTestId('accordion');
    expect(acc.getAttribute('data-model') ?? '').toBe('');

    await userEvent.click(screen.getByTestId('acc-set-1'));

    expect(acc.getAttribute('data-model')).toBe('1');
  });

  it('unvalidatable document: does not execute stdnum, does not block even if the number is "wrong"', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ number: 'CUALQUIERA', isValidableDocument: false })],
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
      documents: [
        doc({ countryCode: 'BR', documentTypeName: 'cpf', documentTypeCode: 'cpf', number: '123' }),
      ],
    });

    expect(parsed.success).toBe(false);
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
        doc({
          countryCode: 'ES',
          documentTypeName: 'nif',
          documentTypeCode: 'nif',
          number: 'NIF-OK',
        }),
        doc({ countryCode: 'BR', documentTypeName: 'cpf', documentTypeCode: 'cpf', number: 'BAD' }),
        doc({ countryCode: 'US', documentTypeName: 'ssn', documentTypeCode: 'ssn', number: 'ANY' }),
      ],
    });

    expect(parsed.success).toBe(false);
  });

  it('normalizes countryCode/documentTypeName (trim + case), and triggers validation', () => {
    const parsed = ContactSchema.safeParse({
      ...base,
      documents: [doc({ countryCode: ' es ', documentTypeName: '  Nif ', number: 'NIF-OK' })],
    });
    expect(parsed.success).toBe(true);
  });

  it('does not save if validate() returns valid=false (early return)', async () => {
    (vee as any).__vvSetValidate({ valid: false });
    renderWith();

    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(contactsStoreMock.createContact).not.toHaveBeenCalled();
      expect(contactsStoreMock.updateContactFields).not.toHaveBeenCalled();
    });

    (vee as any).__vvSetValidate({ valid: true });
  });

  it('does not save if there are mapped errors (badges > 0)', async () => {
    (vee as any).__vvSetErrors({
      name: 'required',
      'documents[0].number': 'bad',
      'documents.1.countryCode': 'bad',
      'documents.2.documentTypeName': 'bad',
    });

    renderWith();
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(contactsStoreMock.createContact).not.toHaveBeenCalled();
      expect(contactsStoreMock.updateContactFields).not.toHaveBeenCalled();
    });

    (vee as any).__vvSetErrors({});
  });

  it('buildPayloadToValidate: composes name and flattens documents for validation', async () => {
    (vueuse as any).__setDesktop(true);
    const {} = renderWith();

    await userEvent.type(screen.getAllByPlaceholderText('first name')[0], ' Ana ');

    await userEvent.clear(screen.getAllByPlaceholderText('document name')[0]);
    await userEvent.type(screen.getAllByPlaceholderText('document name')[0], '  X-1  ');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document category')[0], '9');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document country')[0], '34');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    const { setValues } = (vee as any).__vvGetState();
    expect(setValues).toHaveBeenCalledTimes(1);

    const payload = (setValues as any).mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        contactType: 'person',
        name: 'Ana',
        saleChannelId: null,
      }),
    );

    expect(payload.documents).toHaveLength(1);
    expect(payload.documents[0]).toEqual(
      expect.objectContaining({
        number: 'X-1',
        countryCode: 'ES',
        documentTypeName: 'dni',
        isValidableDocument: expect.any(Boolean),
      }),
    );
  });

  it('when editing documents, the watch clears errors and allows saving', async () => {
    (vueuse as any).__setDesktop(true);
    (vee as any).__vvSetErrors({ 'documents[0].number': 'bad' });

    renderWith();

    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(contactsStoreMock.createContact).not.toHaveBeenCalled());

    await userEvent.clear(screen.getAllByPlaceholderText('document name')[0]);
    await userEvent.type(screen.getAllByPlaceholderText('document name')[0], 'OK-77');
    (vee as any).__vvSetErrors({});

    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1));
  });

  it('billingAddressMode=residence copies residence to billing on save', async () => {
    (vueuse as any).__setDesktop(true);

    renderWith();

    await userEvent.type(screen.getAllByPlaceholderText('residence street')[0], 'Calle 1');
    await userEvent.type(screen.getAllByPlaceholderText('residence zip')[0], '15001');
    await userEvent.type(screen.getAllByPlaceholderText('residence city')[0], 'A Coruña');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(contactsStoreMock.createContact).toHaveBeenCalled();
    });
    const saved = (contactsStoreMock.createContact as any).mock.calls.at(-1)[0];

    expect(saved).toEqual(
      expect.objectContaining({
        street: 'Calle 1',
        zipCode: '15001',
        city: 'A Coruña',
      }),
    );
  });

  it('when there are first/last/last2, composes name before saving', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    await userEvent.type(screen.getAllByPlaceholderText('first name')[0], 'John');
    await userEvent.type(screen.getAllByPlaceholderText('last name')[0], 'Doe');
    await userEvent.type(screen.getAllByPlaceholderText('second last name')[0], 'Roe');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(contactsStoreMock.createContact).toHaveBeenCalled());
    const payload = (contactsStoreMock.createContact as any).mock.calls.at(-1)[0];
    expect(payload.name).toBe('John Doe Roe');
  });

  it('clearHiddenFields on non-person wipes person-only fields and documents', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    await userEvent.type(screen.getAllByPlaceholderText('first name')[0], 'Zoe');
    await userEvent.clear(screen.getAllByPlaceholderText('document name')[0]);
    await userEvent.type(screen.getAllByPlaceholderText('document name')[0], 'DOC-1');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document category')[0], '9');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document country')[0], '34');
    await userEvent.click(screen.getByRole('button', { name: 'Company' }));

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1));
    const payload = (contactsStoreMock.createContact as any).mock.calls[0][0];

    expect(payload.lastname ?? '').toBe('');
    expect(payload.lastname2 ?? '').toBe('');
    expect(payload.birthdate ?? null).toBeNull();
    expect(payload.documents ?? []).toEqual([]);
    expect(payload.residenceStreet ?? '').toBe('');
    expect(payload.residenceZip ?? '').toBe('');
    expect(payload.residenceCity ?? '').toBe('');
    expect(payload.residenceCountry ?? undefined).toBeUndefined();
    expect(payload.residenceState ?? undefined).toBeUndefined();
  });

  it('billingAddressMode="other" copies billingAddress into street/zip/city/country/state on save', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    await userEvent.type(screen.getAllByPlaceholderText('billing street')[0], 'Baker St 221B');
    await userEvent.type(screen.getAllByPlaceholderText('billing zip')[0], 'NW1');
    await userEvent.type(screen.getAllByPlaceholderText('billing city')[0], 'London');

    const useOtherButtons = screen.getAllByLabelText(/use other address/i);
    await userEvent.click(useOtherButtons[0]);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1));

    const saved = (contactsStoreMock.createContact as any).mock.calls.at(-1)[0];
    expect(saved).toEqual(
      expect.objectContaining({
        street: 'Baker St 221B',
        zipCode: 'NW1',
        city: 'London',
      }),
    );
    expect(saved.country).toEqual(expect.objectContaining({ id: 33 }));
    expect(saved.state).toEqual(expect.objectContaining({ id: 3301 }));
  });

  it('mapVeeValidateErrors reflects in the footer counter (badges.total)', async () => {
    (vee as any).__vvSetErrors({
      name: 'required',
      'documents[0].number': 'bad',
      'documents.1.countryCode': 'bad',
      'documents.2.documentTypeName': 'bad',
    });

    renderWith();

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('4 field errors')).toBeInTheDocument();

    (vee as any).__vvSetErrors({});
  });

  it('buildPayloadToValidate normalizes countryCode and documentTypeName (trim/case) with validable flag', async () => {
    (vueuse as any).__setDesktop(true);
    renderWith();

    await userEvent.clear(screen.getAllByPlaceholderText('document name')[0]);
    await userEvent.type(screen.getAllByPlaceholderText('document name')[0], '  X-99  ');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document category')[0], '9');
    await userEvent.selectOptions(screen.getAllByPlaceholderText('document country')[0], '34');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    const { setValues } = (vee as any).__vvGetState();
    const payload = (setValues as any).mock.calls.at(-1)[0];

    expect(payload.documents[0]).toEqual(
      expect.objectContaining({
        number: 'X-99',
        countryCode: 'ES',
        documentTypeName: 'dni',
        isValidableDocument: expect.any(Boolean),
      }),
    );
  });

  it('Documents emits changeContactForm → loads contact via store, resets tab to "0" and updates instead of creating', async () => {
    (vueuse as any).__setDesktop(true);

    const fetched = {
      id: 555,
      firstname: 'Fetched',
      lastname: 'User',
      contactType: 'person',
      street: 'X',
      zipCode: 'Y',
      city: 'Z',
      country: { id: 33, code: 'GB', name: 'UK' },
      state: { id: 3301, name: 'England' },
      residenceStreet: '',
      residenceZip: '',
      residenceCity: '',
      residenceCountry: undefined,
      residenceState: undefined,
    };
    contactsStoreMock.fetchContactById.mockResolvedValueOnce(fetched);

    renderWith();

    const openButtons = screen.getAllByLabelText(/open-by-doc/i);
    await userEvent.click(openButtons[0]);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(contactsStoreMock.updateContactFields).toHaveBeenCalledTimes(1));
    const [id] = (contactsStoreMock.updateContactFields as any).mock.calls[0];
    expect(id).toBe(555);

    const tabs = await screen.findByTestId('tabs');
    expect(tabs.getAttribute('data-model')).toBe('0');
  });

  it('updateBillingAddressMode="other" from Billing on mobile is honored on save', async () => {
    (vueuse as any).__setDesktop(false);
    renderWith();

    await userEvent.type(screen.getAllByPlaceholderText(/billing street/i)[0], 'Baker St 221B');
    await userEvent.type(screen.getAllByPlaceholderText(/billing zip/i)[0], 'NW1');
    await userEvent.type(screen.getAllByPlaceholderText(/billing city/i)[0], 'London');

    await userEvent.click(screen.getByRole('button', { name: /use other address/i }));

    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(contactsStoreMock.createContact).toHaveBeenCalledTimes(1));

    const saved = (contactsStoreMock.createContact as any).mock.calls.at(-1)[0];
    expect(saved).toEqual(
      expect.objectContaining({
        street: 'Baker St 221B',
        zipCode: 'NW1',
        city: 'London',
      }),
    );
    expect(saved.country).toEqual(expect.objectContaining({ id: 33 }));
    expect(saved.state).toEqual(expect.objectContaining({ id: 3301 }));
  });
});
