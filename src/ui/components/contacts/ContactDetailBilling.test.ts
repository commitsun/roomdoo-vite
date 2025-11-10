// ContactDetailBilling.spec.ts
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
    'contacts.dni': 'DNI',
    'contacts.passport': 'Passport',
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

import Component from './ContactDetailBilling.vue';

// ---- Helper :  ----
function renderWithModels(
  initialModel: any,
  initialBilling: any = {
    street: '',
    city: '',
    zipCode: '',
    country: undefined,
    state: undefined,
  },
  initialMode: 'residence' | 'other' = 'residence',
) {
  const model = ref(initialModel);
  const billing = ref(initialBilling);
  const mode = ref<'residence' | 'other'>(initialMode);

  const onUpdateModel = vi.fn((v: any) => (model.value = v));
  const onUpdateBilling = vi.fn((v: any) => (billing.value = v));
  const onUpdateMode = vi.fn((v: 'residence' | 'other') => (mode.value = v));

  const utils = render(Component, {
    props: {
      modelValue: model.value,
      'onUpdate:modelValue': onUpdateModel,
      billingAddress: billing.value,
      'onUpdate:billingAddress': onUpdateBilling,
      billingAddressMode: mode.value,
      onUpdateBillingAddressMode: onUpdateMode,
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
      'onUpdate:modelValue': onUpdateModel,
      billingAddress: billing.value,
      'onUpdate:billingAddress': onUpdateBilling,
      billingAddressMode: mode.value,
      onUpdateBillingAddressMode: onUpdateMode,
    } as any);
  };

  return {
    ...utils,
    model,
    billing,
    mode,
    onUpdateModel,
    onUpdateBilling,
    onUpdateMode,
    rerender,
  };
}

describe('ContactDetailBilling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('render simple block (without residence) and basic fields', async () => {
    renderWithModels(
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
        fiscalIdNumberType: null,
        fiscalIdNumber: '',
      }),
    );

    expect(screen.getByText('Tax document type')).toBeInTheDocument();
    expect(screen.getByText('Tax document number')).toBeInTheDocument();

    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('AutoComplete (simple): complete + optionSelect fills modelValue', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { onUpdateModel, rerender, model } = renderWithModels(
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

    const payload = onUpdateModel.mock.calls.at(-1)![0];
    expect(payload.zipCode).toBe('28001');
    expect(payload.city).toBe('Madrid');
    expect(payload.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });
    expect(payload.state).toEqual({ id: 7, name: 'Madrid' });

    await rerender();
    expect(model.value.city).toBe('Madrid');

    vi.useRealTimers();
  });

  it('with residence: shows cards and switching to "other" emits updateBillingAddressMode', async () => {
    const { onUpdateMode, mode, rerender } = renderWithModels(
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
      { street: '', city: '', zipCode: '', country: undefined, state: undefined },
      'residence',
    );

    expect(screen.getByText('Use residence address')).toBeInTheDocument();
    expect(screen.getByText('Use other address')).toBeInTheDocument();

    const otherCard = screen.getByText('Use other address').closest('.billing-card')!;
    await userEvent.click(otherCard);
    await rerender();

    expect(onUpdateMode).toHaveBeenCalledWith('other');
    expect(mode.value).toBe('other');
  });

  it('other mode: editing street/city emits update:billingAddress', async () => {
    const { onUpdateBilling } = renderWithModels(
      reactive({
        residenceStreet: 'R1',
        residenceCity: 'C1',
        residenceZip: 'Z1',
        residenceCountry: { id: 34, code: 'ES', name: 'Spain' },
        residenceState: { id: 7, name: 'Madrid' },

        street: '',
        city: '',
        zipCode: '',
        country: undefined,
        state: undefined,
      }),
      { street: '', city: '', zipCode: '', country: undefined, state: undefined },
      'other',
    );

    const street = screen.getByLabelText('Address');
    await userEvent.clear(street);
    await userEvent.type(street, 'Calle Nueva 5');

    let last = onUpdateBilling.mock.calls.at(-1)![0];
    expect(last.street).toBe('Calle Nueva 5');

    const city = screen.getByLabelText('City');
    await userEvent.clear(city);
    await userEvent.type(city, 'Valencia');

    last = onUpdateBilling.mock.calls.at(-1)![0];
    expect(last.city).toBe('Valencia');
  });

  it('other mode: selecting country updates billingAddress and does not trigger fetch of states (watch listens to modelValue)', async () => {
    const { onUpdateBilling, rerender } = renderWithModels(
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
      { street: '', city: '', zipCode: '', country: undefined, state: undefined },
      'other',
    );

    const selCountry = screen.getByTestId('bill_country');
    const btnES = within(selCountry).getByTestId('bill_country-opt-34');
    await userEvent.click(btnES);

    const payload1 = onUpdateBilling.mock.calls.at(-1)![0];
    expect(payload1.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });

    await rerender();

    expect(countryStatesStoreMock.fetchCountryStatesByCountryId).not.toHaveBeenCalled();
  });

  it('simple: selecting country emits country object and triggers loading of states', async () => {
    const { onUpdateModel, rerender, model } = renderWithModels(
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

    const selCountry = screen.getByTestId('country');
    const btnES = within(selCountry).getByTestId('country-opt-34');
    await userEvent.click(btnES);

    const objectPayload = onUpdateModel.mock.calls
      .map((c) => c[0])
      .find((arg) => Boolean(arg) && typeof arg.country === 'object');

    expect(objectPayload).toBeTruthy();
    expect(objectPayload!.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });

    model.value = objectPayload!;
    await rerender();

    expect(uiStoreMock.startLoading).toHaveBeenCalled();
    expect(countryStatesStoreMock.fetchCountryStatesByCountryId).toHaveBeenCalledWith(34);
    expect(uiStoreMock.stopLoading).toHaveBeenCalled();
  });

  it('other mode: AutoComplete complete + optionSelect updates billingAddress', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { onUpdateBilling } = renderWithModels(
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
      { street: '', city: '', zipCode: '', country: undefined, state: undefined },
      'other',
    );

    const ac = screen.getByTestId('bill_zip');
    const input = within(ac).getByRole('textbox');
    await user.type(input, '28001');

    const completeBtn = within(ac).getByRole('button', { name: /complete/i });
    await user.click(completeBtn);

    await vi.advanceTimersByTimeAsync(170);
    await Promise.resolve();

    expect(addressStoreMock.fetchAddressByZip).toHaveBeenCalledWith('28001');

    const suggBtn = within(ac).getByTestId('bill_zip-sugg-0');
    await user.click(suggBtn);
    await Promise.resolve();

    const payload = onUpdateBilling.mock.calls.at(-1)![0];
    expect(payload.zipCode).toBe('28001');
    expect(payload.city).toBe('Madrid');
    expect(payload.country).toEqual({ id: 34, code: 'ES', name: 'Spain' });
    expect(payload.state).toEqual({ id: 7, name: 'Madrid' });

    vi.useRealTimers();
  });
});
