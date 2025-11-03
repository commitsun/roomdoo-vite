import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ref, reactive, defineComponent } from 'vue';
import { createTestingPinia } from '@pinia/testing';

// ---- i18n mock ----
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.taxDocumentType': 'Tax document type',
    'contacts.taxDocumentNumber': 'Tax document number',
    'contacts.select': 'Select...',
    'contacts.fiscalAddress': 'Fiscal address',
    'contacts.fiscalAddressTextMessage': 'If provided, we will use this for invoices.',
    'contacts.address': 'Address',
    'contacts.city': 'City',
    'contacts.country': 'Country',
    'contacts.state': 'State',
    'contacts.postalCode': 'Postal code',
    'contacts.fiscalAddressPlaceholder': 'Write your billing address',
    'contacts.fiscalCityPlaceholder': 'City...',
    'contacts.zipCodePlaceholder': 'ZIP...',
    'contacts.useResidenceAddress': 'Use residence address',
    'contacts.useOtherAddress': 'Use other address',
    'contacts.mandatoryFieldsText': 'Mandatory fields',
    'error.somethingWentWrong': 'Something went wrong',
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

// ---- Stubs PrimeVue & CountryFlag ----
const ButtonStub = {
  name: 'Button',
  props: ['label', 'icon', 'severity', 'variant', 'text'],
  emits: ['click'],
  template: `<button type="button" @click="$emit('click')">{{ label }}</button>`,
};

const MessageStub = {
  name: 'Message',
  props: ['severity', 'icon'],
  template: `<div role="note"><slot /></div>`,
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
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'filter', 'placeholder'],
  emits: ['update:modelValue'],
  template: `
    <div class="pv-select" :data-testid="$attrs.id">
      <div class="opt-list">
        <button
          v-for="(o,i) in (options || [])"
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

const RadioButtonStub = {
  name: 'RadioButton',
  props: ['name', 'inputId', 'value', 'modelValue'],
  emits: ['update:modelValue', 'click'],
  template: `
    <input
      type="radio"
      :id="inputId"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @click="$emit('click'); $emit('update:modelValue', value)"
      aria-label="radio-{{value}}"
    />
  `,
};

const AutoCompleteStub = defineComponent({
  name: 'AutoComplete',
  inheritAttrs: false,
  props: ['modelValue', 'suggestions', 'optionLabel'],
  emits: ['update:modelValue', 'complete', 'optionSelect'],
  data() {
    return { q: this.modelValue ?? '' };
  },
  methods: {
    complete() {
      this.$emit('complete', { query: this.q });
    },
    selectFirst() {
      if ((this.suggestions ?? []).length > 0) {
        this.$emit('optionSelect', { value: this.suggestions[0] });
      }
    },
  },
  template: `
    <div :data-testid="$attrs.id">
      <input
        role="textbox"
        :value="q"
        @input="e => (q = e.target.value, $emit('update:modelValue', q))"
      />
      <button type="button" @click="complete">Complete</button>
      <div class="suggestions">
        <button
          v-for="(s, i) in (suggestions || [])"
          :key="i"
          :data-testid="($attrs.id || 'ac') + '-sugg-' + i"
          @click="$emit('optionSelect', { value: s })"
        >
          {{ s.label ?? 'opt ' + i }}
        </button>
      </div>
      <slot name="option" v-for="(s,i) in (suggestions || [])" :option="s" :key="i" />
    </div>
  `,
});

const CountryFlagStub = {
  name: 'CountryFlag',
  props: ['country', 'size', 'shadow'],
  template: `<i data-testid="flag" :data-country="country"></i>`,
};

// ---- Stores mocks ----
const docTypesStoreMock = {
  fiscalDocumentTypes: [{ name: 'dni' }, { name: 'passport' }],
};

const countriesStoreMock = {
  countries: [
    { id: 33, code: 'GB', name: 'UK' },
    { id: 34, code: 'ES', name: 'Spain' },
  ],
};

const countryStatesStoreMock = {
  fetchCountryStatesByCountryId: vi.fn().mockResolvedValue([
    { id: 7, name: 'Madrid' },
    { id: 8, name: 'Barcelona' },
  ]),
};

const uiStoreMock = { startLoading: vi.fn(), stopLoading: vi.fn() };
const textMsgStoreMock = { addTextMessage: vi.fn() };
const addressStoreMock = {
  fetchAddressByZip: vi.fn().mockResolvedValue([
    {
      zip: '28001',
      city: 'Madrid',
      country: { id: 34, code: 'ES', name: 'Spain' },
      state: { id: 7, name: 'Madrid' },
    },
  ]),
};

vi.mock('@/infrastructure/stores/documentTypes', () => ({
  useDocumentTypesStore: () => docTypesStoreMock,
}));
vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => countriesStoreMock,
}));
vi.mock('@/infrastructure/stores/countryStates', () => ({
  useCountryStatesStore: () => countryStatesStoreMock,
}));
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => uiStoreMock,
}));
vi.mock('@/infrastructure/stores/textMessages', () => ({
  useTextMessagesStore: () => textMsgStoreMock,
}));
vi.mock('@/infrastructure/stores/address', () => ({
  useAddressStore: () => addressStoreMock,
}));

// ---- Componente bajo test ----
import Component from './ContactDetailBilling.vue';

// Helper: render con v-model simulado
function renderWithModel(initial: any) {
  const model = ref(initial);
  const updateSpy = vi.fn((v: any) => (model.value = v));

  const utils = render(Component, {
    props: {
      modelValue: model.value,
      'onUpdate:modelValue': updateSpy,
    } as any,
    global: {
      plugins: [createTestingPinia()],
      components: {
        Select: SelectStub,
        InputText: InputTextStub,
        RadioButton: RadioButtonStub,
        Message: MessageStub,
        AutoComplete: AutoCompleteStub,
        CountryFlag: CountryFlagStub,
        Button: ButtonStub,
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

describe('ContactDetailBilling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('basic rendering: tax type/number and simple block when there is NO residence', async () => {
    renderWithModel(
      reactive({
        fiscalIdNumberType: null,
        fiscalIdNumber: '',
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
      }),
    );
    expect(screen.getByText('Tax document type')).toBeInTheDocument();
    expect(screen.getByText('Tax document number')).toBeInTheDocument();

    expect(screen.getByRole('note')).toBeInTheDocument();

    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('AutoComplete (simple branch): complete calls store and optionSelect outputs zip/city/country/state', async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { updateSpy, rerender, model } = renderWithModel(
      reactive({
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
      }),
    );

    const ac = screen.getByTestId('bill_zip');
    const completeBtn = within(ac).getByRole('button', { name: /complete/i });
    const input = within(ac).getByRole('textbox');

    await user.type(input, '28001');
    await user.click(completeBtn);

    await vi.advanceTimersByTimeAsync(170);

    await Promise.resolve();

    expect(addressStoreMock.fetchAddressByZip).toHaveBeenCalledWith('28001');

    const suggBtn = within(ac).getByTestId('bill_zip-sugg-0');
    await user.click(suggBtn);
    await Promise.resolve();

    expect(updateSpy).toHaveBeenCalled();
    const payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.zipCode).toBe('28001');
    expect(payload.city).toBe('Madrid');
    expect(payload.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });
    expect(payload.state).toEqual({ id: 7, name: 'Madrid' });

    await rerender();
    expect(model.value.city).toBe('Madrid');

    vi.useRealTimers();
  });

  it('with residence address shows cards and when changing to "other" emits with billingData', async () => {
    const { updateSpy } = renderWithModel(
      reactive({
        residenceStreet: 'Gran Via 1',
        residenceCity: 'Madrid',
        residenceZip: '28001',
        residenceCountry: { id: 34, code: 'ES', name: 'Spain' },
        residenceState: { id: 7, name: 'Madrid' },
        street: '',
        city: '',
        zipCode: '',
        country: undefined,
        state: undefined,
      }),
    );

    expect(screen.getByText('Use residence address')).toBeInTheDocument();
    expect(screen.getByText('Use other address')).toBeInTheDocument();

    const otherCard = screen.getByText('Use other address').closest('.billing-card');
    await userEvent.click(otherCard!);

    const payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.street).toBe('');
    expect(payload.city).toBe('');
    expect(payload.zipCode).toBe('');
    expect(payload.country).toBeUndefined();
    expect(payload.state).toBeUndefined();
  });

  it('In other mode: edit street/city outputs update:modelValue', async () => {
    const { updateSpy } = renderWithModel(
      reactive({
        residenceStreet: 'Calle A',
        residenceCity: 'Sevilla',
        residenceZip: '41001',
        residenceCountry: { id: 34, code: 'ES', name: 'Spain' },
        residenceState: { id: 8, name: 'Barcelona' },
        street: '',
        city: '',
        zipCode: '',
        country: undefined,
        state: undefined,
      }),
    );

    const otherCard = screen.getByText('Use other address').closest('.billing-card');
    await userEvent.click(otherCard!);

    const street = screen.getByLabelText('Address');
    await userEvent.clear(street);
    await userEvent.type(street, 'Calle Nueva 5');

    let last = updateSpy.mock.calls.at(-1)![0];
    expect(last.street).toBe('Calle Nueva 5');

    const city = screen.getByLabelText('City');
    await userEvent.clear(city);
    await userEvent.type(city, 'Valencia');

    last = updateSpy.mock.calls.at(-1)![0];
    expect(last.city).toBe('Valencia');
  });

  it('In other mode: select country emits country and then watch loads states and adjusts state', async () => {
    const { updateSpy, rerender, model } = renderWithModel(
      reactive({
        residenceStreet: 'R1',
        residenceCity: 'C1',
        residenceZip: 'Z1',
        residenceCountry: { id: 33, code: 'GB', name: 'UK' },
        residenceState: { id: 99, name: 'Any' },
        street: '',
        city: '',
        zipCode: '',
        country: undefined,
        state: undefined,
      }),
    );

    const otherCard = screen.getByText('Use other address').closest('.billing-card');
    await userEvent.click(otherCard!);

    const selCountry = screen.getByTestId('bill_country');
    const btnES = within(selCountry).getByTestId('bill_country-opt-34');
    await userEvent.click(btnES);

    const payload1 = updateSpy.mock.calls.at(-1)![0];
    expect(payload1.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });

    await rerender();

    expect(uiStoreMock.startLoading).toHaveBeenCalled();
    expect(countryStatesStoreMock.fetchCountryStatesByCountryId).toHaveBeenCalledWith(34);
    expect(uiStoreMock.stopLoading).toHaveBeenCalled();

    const lastPayload = updateSpy.mock.calls.at(-1)![0];
    expect(lastPayload.state).toBeUndefined();

    model.value = { ...model.value, state: { id: 7, name: 'Madrid' } };
    await rerender();

    const finalPayload = updateSpy.mock.calls.at(-1)![0];
    expect(finalPayload.state).toEqual({ id: 7, name: 'Madrid' });
  });

  it('onBeforeMount: if billing differs from residence, copy billing to billingData, emit and switch to other', async () => {
    const { updateSpy } = renderWithModel(
      reactive({
        residenceStreet: 'R St',
        residenceCity: 'R City',
        residenceZip: 'R Zip',
        residenceCountry: { id: 33, code: 'GB', name: 'UK' },
        residenceState: { id: 99, name: 'Any' },
        street: 'B St',
        city: 'B City',
        zipCode: 'B Zip',
        country: { id: 34, code: 'ES', name: 'Spain' },
        state: { id: 7, name: 'Madrid' },
      }),
    );

    expect(updateSpy).toHaveBeenCalled();
    const payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.street).toBe('B St');
    expect(payload.city).toBe('B City');
    expect(payload.zipCode).toBe('B Zip');
    expect(payload.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });
    expect(payload.state).toEqual({ id: 7, name: 'Madrid' });
  });

  it('AutoComplete in other mode: complete + option Select updates billing data and issues', async () => {
    // Controlar debounce
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { updateSpy, rerender } = renderWithModel(
      reactive({
        residenceStreet: 'R',
        residenceCity: 'R',
        residenceZip: 'R',
        residenceCountry: { id: 33, code: 'GB', name: 'UK' },
        residenceState: { id: 99, name: 'Any' },
        street: '',
        city: '',
        zipCode: '',
        country: undefined,
        state: undefined,
      }),
    );

    // Activa modo "other"
    const otherCard = screen.getByText('Use other address').closest('.billing-card');
    await user.click(otherCard!);

    // Autocomplete ZIP con debounce
    const ac = screen.getByTestId('bill_zip');
    const input = within(ac).getByRole('textbox');
    await user.type(input, '28001');

    const completeBtn = within(ac).getByRole('button', { name: /complete/i });
    await user.click(completeBtn);

    // Avanza el debounce (150ms + margen) y drena promesas/render
    await vi.advanceTimersByTimeAsync(170);
    await Promise.resolve();

    expect(addressStoreMock.fetchAddressByZip).toHaveBeenCalledWith('28001');

    // Seleccionar sugerencia y verificar payload
    const suggBtn = within(ac).getByTestId('bill_zip-sugg-0');
    await user.click(suggBtn);
    await Promise.resolve();

    const payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.zipCode).toBe('28001');
    expect(payload.city).toBe('Madrid');
    expect(payload.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });
    expect(payload.state).toEqual({ id: 7, name: 'Madrid' });

    await rerender();

    // Limpieza
    vi.useRealTimers();
  });

  it('update all v-model fields emits update:modelValue', async () => {
    const { updateSpy, rerender } = renderWithModel(
      reactive({
        fiscalIdNumberType: null,
        fiscalIdNumber: '',
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
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: /^dni$/i }));

    await userEvent.type(screen.getByLabelText('Tax document number'), '12345678A');

    const label = document.querySelector('label[for="addr_other"]') as HTMLLabelElement;
    await userEvent.click(label);

    await userEvent.type(screen.getByLabelText('Address'), 'Calle Falsa 123');
    await userEvent.type(screen.getByLabelText('City'), 'Springfield');

    await userEvent.click(screen.getByRole('button', { name: /^spain$/i }));

    await rerender();

    const zipInput = screen.getByTestId('bill_zip').querySelector('input')!;
    await userEvent.type(zipInput, '28001');

    expect(updateSpy).toHaveBeenCalled();

    const payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.fiscalIdNumberType).toBe('dni');
    expect(payload.fiscalIdNumber).toBe('12345678A');
    expect(payload.street).toBe('Calle Falsa 123');
    expect(payload.city).toBe('Springfield');
    expect(payload.country).toEqual(34);
    expect(payload.zipCode).toBe('28001');
  });
  it('billingAddressMode v-model: toggles residence ⇄ other and emits expected payload', async () => {
    const { updateSpy, rerender, container } = renderWithModel(
      reactive({
        residenceStreet: 'Gran Via 1',
        residenceCity: 'Madrid',
        residenceZip: '28001',
        residenceCountry: { id: 34, code: 'ES', name: 'Spain' },
        residenceState: { id: 7, name: 'Madrid' },

        street: '',
        city: '',
        zipCode: '',
        country: undefined,
        state: undefined,

        fiscalIdNumberType: null,
        fiscalIdNumber: '',
      }),
    );

    const cards = container.querySelectorAll('.billing-card');
    const residenceCard = cards[0] as HTMLElement;
    const otherCard = cards[1] as HTMLElement;

    expect(residenceCard).toHaveClass('billing-card--active');
    expect(otherCard).not.toHaveClass('billing-card--active');

    await userEvent.click(otherCard);
    await rerender();

    expect(otherCard).toHaveClass('billing-card--active');
    expect(residenceCard).not.toHaveClass('billing-card--active');

    expect(updateSpy).toHaveBeenCalled();

    let payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.street).toBe('');
    expect(payload.city).toBe('');
    expect(payload.zipCode).toBe('');
    expect(payload.country).toBeUndefined();
    expect(payload.state).toBeUndefined();

    await userEvent.click(residenceCard);
    await rerender();

    expect(residenceCard).toHaveClass('billing-card--active');
    expect(otherCard).not.toHaveClass('billing-card--active');

    payload = updateSpy.mock.calls.at(-1)![0];
    expect(payload.street).toBe('Gran Via 1');
    expect(payload.city).toBe('Madrid');
    expect(payload.zipCode).toBe('28001');
    expect(payload.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });
    expect(payload.state).toEqual({ id: 7, name: 'Madrid' });
  });
});
