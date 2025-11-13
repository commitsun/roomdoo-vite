import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { reactive, ref } from 'vue';
import { createTestingPinia } from '@pinia/testing';

// ---- PrimeVue Confirmation mocks (¡ANTES de importar el SFC!) ----
vi.mock('primevue/confirmdialog', () => ({
  default: {
    name: 'ConfirmDialog',
    template: '<div data-testid="confirm-dialog-stub"></div>',
  },
}));

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({ require: vi.fn() }),
}));

// ---- i18n mock ----
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.noDocuments': 'No documents yet',
    'contacts.addDocument': 'Add document',
    'contacts.allDocuments': 'All documents',
    'contacts.mandatoryFieldsText': 'Mandatory fields',
    'contacts.issueCountry': 'Issue country',
    'contacts.documentType': 'Document type',
    'contacts.documentNumber': 'Document number',
    'contacts.documentNumberPlaceholder': 'Enter number',
    'contacts.supportNumber': 'Support number',
    'contacts.supportNumberPlaceholder': 'Enter support',
    'contacts.remove': 'Remove',
    'contacts.select': 'Select...',
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

// ---- Stubs PrimeVue / CountryFlag ----
const ButtonStub = {
  name: 'Button',
  inheritAttrs: false,
  props: ['label', 'icon', 'severity', 'variant', 'text'],
  emits: ['click'],
  template: `<button type="button" :data-icon="icon" @click="$emit('click')">{{ label }}</button>`,
};

const InputTextStub = {
  name: 'InputText',
  inheritAttrs: false,
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `
    <input
      type="text"
      role="textbox"
      :value="modelValue ?? ''"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    />
  `,
};

const SelectStub = {
  name: 'Select',
  inheritAttrs: false,
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'filter', 'placeholder', 'class'],
  emits: ['update:modelValue'],
  template: `
    <div class="pv-select" :data-testid="$attrs.id">
      <div class="opt-list">
        <button
          v-for="(o, i) in (options || [])"
          :key="(o[optionValue] ?? i)"
          type="button"
          :data-testid="($attrs.id || 'sel') + '-opt-' + (o[optionValue] ?? i)"
          @click="$emit('update:modelValue', o[optionValue])"
        >
          {{ o[optionLabel] ?? o.name ?? ('opt-' + i) }}
        </button>
      </div>
      <slot name="value" :value="modelValue" />
      <slot name="option" v-for="(o, i) in (options || [])" :option="o" :key="i" />
    </div>
  `,
};

const CountryFlagStub = {
  name: 'CountryFlag',
  props: ['country', 'size', 'shadow'],
  template: `<i data-testid="flag" :data-country="country"></i>`,
};

// ---- Stores mocks ----
const countriesStoreMock = {
  countries: [
    { id: 33, code: 'GB', name: 'UK' },
    { id: 34, code: 'ES', name: 'Spain' },
  ],
  fetchCountries: vi.fn(),
};

const documentTypesStoreMock = {
  documentTypes: [
    { id: 5, name: 'Passport', code: 'P', countries: [{ id: 33, code: 'GB', name: 'UK' }] },
    { id: 9, name: 'DNI', code: 'D', countries: [] },
  ],
  fetchDocumentTypes: vi.fn(),
  fetchFiscalDocumentTypes: vi.fn(),
};

vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => countriesStoreMock,
}));
vi.mock('@/infrastructure/stores/documentTypes', () => ({
  useDocumentTypesStore: () => documentTypesStoreMock,
}));
export const requireSpy = vi.fn();
vi.mock('primevue/confirmdialog', () => ({
  default: {
    name: 'ConfirmDialog',
    template: '<div data-testid="confirm-dialog-stub"></div>',
  },
}));
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({ require: requireSpy }),
}));

const isContactDuplicate = vi.fn();
vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => ({ isContactDuplicate }),
}));

import Component from './ContactDetailDocuments.vue';

function renderWithModel(initial: any) {
  const model = ref(initial);
  const updateSpy = vi.fn((v: any) => {
    model.value = v;
  });

  const utils = render(Component, {
    props: {
      modelValue: model.value,
      'onUpdate:modelValue': updateSpy,
    } as any,
    global: {
      plugins: [createTestingPinia()],
      components: {
        Button: ButtonStub,
        InputText: InputTextStub,
        Select: SelectStub,
        CountryFlag: CountryFlagStub,
      },
    },
  });

  const rerender = async () => {
    await utils.rerender({
      modelValue: model.value,
      'onUpdate:modelValue': updateSpy,
    } as any);
  };

  return { ...utils, model, updateSpy, rerender };
}

describe('ContactDetailDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('it displays an empty state and allows adding a draft (it emits update:modelValue)', async () => {
    const { updateSpy, rerender, model } = renderWithModel(reactive({ documents: [] }));

    expect(screen.getByText('No documents yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add document' }));

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const payload = updateSpy.mock.calls[0][0];
    expect(Array.isArray(payload.documents)).toBe(true);
    expect(payload.documents).toHaveLength(1);
    expect(payload.documents[0]).toMatchObject({
      id: 0,
      name: '',
      supportNumber: '',
      category: { id: 0, name: '', code: '', countries: [] },
      country: { id: 0, name: '', code: '' },
    });

    await rerender();

    expect(screen.getByText('All documents')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add document' }));

    expect(model.value.documents).toHaveLength(2);
  });

  it('change the country (Select) → setDocCountry issues an update with the complete country', async () => {
    const initial = reactive({
      documents: [
        {
          id: 0,
          name: '',
          supportNumber: '',
          category: { id: 0, name: '', code: '', countries: [] },
          country: undefined,
        },
      ],
    });
    const { updateSpy, rerender } = renderWithModel(initial);

    const sel = screen.getByTestId('doc-country-0');
    const optSpain = within(sel).getByTestId('doc-country-0-opt-34');
    await userEvent.click(optSpain);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const payload = updateSpy.mock.calls[0][0];
    expect(payload.documents[0].country).toEqual({ id: 34, code: 'ES', name: 'Spain' });

    await rerender();
  });

  it('change the type (Select) → setDocCategory issues an update with a cloned category', async () => {
    const initial = reactive({
      documents: [
        {
          id: 0,
          name: '',
          supportNumber: '',
          category: { id: 0, name: '', code: '', countries: [] },
          country: undefined,
        },
      ],
    });

    const { updateSpy, rerender } = renderWithModel(initial);

    const selCountry = screen.getByTestId('doc-country-0');
    const btnES = within(selCountry).getByTestId('doc-country-0-opt-34'); // Spain id=34
    await userEvent.click(btnES);
    await rerender();

    const selType = screen.getByTestId('doc-type-0');

    let opt = within(selType).queryByTestId('doc-type-0-opt-5') as HTMLElement | null;
    if (!opt) {
      opt = selType.querySelector('[data-testid^="doc-type-0-opt-"]') as HTMLElement | null;
    }
    expect(opt).toBeTruthy();

    const testId = opt!.getAttribute('data-testid')!;
    const pickedId = Number(testId.split('-').pop());

    await userEvent.click(opt!);

    expect(updateSpy).toHaveBeenCalled();

    const payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.documents[0].category.id).toBe(pickedId);
    expect(Array.isArray(payload.documents[0].category.countries)).toBe(true);

    const storeCat = documentTypesStoreMock.documentTypes.find((d) => d.id === pickedId)!;
    expect(payload.documents[0].category.countries).not.toBe(storeCat.countries);

    if (pickedId === 5) {
      expect(payload.documents[0].category.name).toBe('Passport');
    }

    await rerender();
  });

  it('Remove deletes the draft at the given index (emits payload without that doc)', async () => {
    const initial = reactive({
      documents: [
        {
          id: 0,
          name: 'ABC',
          supportNumber: '',
          category: { id: 0, name: '', code: '', countries: [] },
          country: undefined,
        },
      ],
    });
    const { updateSpy } = renderWithModel(initial);

    const removeBtn = screen.getByRole('button', { name: 'Remove' });
    await userEvent.click(removeBtn);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const payload = updateSpy.mock.calls[0][0];
    expect(payload.documents).toEqual([]);
  });

  it('edit number and supportNumber (InputText) does NOT emit update:modelValue; the input reflects the value', async () => {
    const initial = reactive({
      documents: [
        {
          id: 0,
          name: '',
          supportNumber: '',
          category: { id: 0, name: '', code: '', countries: [] },
          country: undefined,
        },
      ],
    });
    const { updateSpy } = renderWithModel(initial);

    const numberInput = screen.getByRole('textbox', { name: /document number/i });
    await userEvent.type(numberInput, '12345');
    expect(updateSpy).not.toHaveBeenCalled();
    expect(numberInput).toHaveValue('12345');

    const supportInput = screen.getByRole('textbox', { name: /support number/i });
    await userEvent.type(supportInput, 'XYZ');
    expect(updateSpy).not.toHaveBeenCalled();
    expect(supportInput).toHaveValue('XYZ');
  });

  it('when there are documents, it displays the title "All documents" and the groups', async () => {
    renderWithModel(
      reactive({
        documents: [
          {
            id: 1,
            name: '11111111H',
            supportNumber: '111',
            category: { id: 9, name: 'DNI', code: 'D', countries: [] },
            country: { id: 33, code: 'GB', name: 'UK' },
          },
        ],
      }),
    );

    expect(screen.getByText('All documents')).toBeInTheDocument();
    expect(screen.getByText('Issue country *')).toBeInTheDocument();
    expect(screen.getByText('Document type *')).toBeInTheDocument();
  });
});
