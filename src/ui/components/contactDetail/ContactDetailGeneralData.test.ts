import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ref } from 'vue';
import { createTestingPinia } from '@pinia/testing';

// ------------ i18n MOCK (sin h) ------------
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.mandatoryFieldsText': 'All fields with * are required',
    'contacts.basicInformation': 'Basic information',
    'contacts.firstName': 'First name',
    'contacts.fiscalName': 'Fiscal name',
    'contacts.firstNamePlaceholder': 'Type first name',
    'contacts.tradeName': 'Trade name',
    'contacts.lastName': 'Last name',
    'contacts.lastNamePlaceholder': 'Type last name',
    'contacts.secondLastName': 'Second last name',
    'contacts.secondLastNamePlaceholder': 'Type second last name',
    'contacts.birthDate': 'Birth date',
    'contacts.yearsOld': 'years',
    'contacts.gender.title': 'Gender',
    'contacts.gender.female': 'Female',
    'contacts.gender.male': 'Male',
    'contacts.gender.other': 'Other',
    'contacts.nationality': 'Nationality',
    'contacts.language': 'Language',
    'contacts.contactData': 'Contact data',
    'contacts.email': 'Email',
    'contacts.emailPlaceholder': 'Type email',
    'contacts.phone': 'Phone',
    'contacts.phonePlaceholder': 'Type phone',
    'contacts.mobile': 'Mobile',
    'contacts.mobilePlaceholder': 'Type mobile',
    'contacts.residenceData': 'Residence data',
    'contacts.residenceTextMessage': 'Fiscal and residence address are the same',
    'contacts.residenceAddress': 'Residence address',
    'contacts.residenceAddressPlaceholder': 'Type address',
    'contacts.postalCode': 'Postal code',
    'contacts.zipCodePlaceholder': 'Type postal code',
    'contacts.city': 'City',
    'contacts.cityPlaceholder': 'Type city',
    'contacts.country': 'Country',
    'contacts.select': 'Select',
    'error.somethingWentWrong': 'Something went wrong',
    'contacts.state': 'State',
    'contacts.datePlaceholder': 'dd/mm/yy',
    'contacts.agencyDetails': 'Agency details',
    'contacts.saleChannel': 'Sale channel',
    'contacts.commission': 'Commission',
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ install: () => {} })),
  };
});

// ------------ STUBS PRIMEVUE ------------
const InputTextStub = {
  name: 'InputText',
  props: ['modelValue', 'id', 'placeholder'],
  emits: ['update:modelValue'],
  template: `
    <input
      :id="id"
      role="textbox"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
};

const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'id'],
  emits: ['update:modelValue'],
  template: `
    <div role="combobox" :id="id">
      <div aria-label="options">
        <button
          v-for="(o,i) in (options || [])"
          :key="o?.id ?? i"
          type="button"
          @click="$emit('update:modelValue', optionValue ? o?.[optionValue] : o)"
        >
          {{ (o && o[optionLabel]) ?? ('opt-' + i) }}
        </button>
      </div>
      <slot name="value" :value="modelValue" />
      <slot name="option" v-for="(o,i) in (options || [])" :option="o" :index="i" />
    </div>
  `,
};

const DatePickerStub = {
  name: 'DatePicker',
  props: ['modelValue', 'id'],
  emits: ['update:modelValue'],
  template: `
    <div :id="id" data-testid="datepicker">
      <button type="button" @click="$emit('update:modelValue', new Date('2000-10-30T00:00:00Z'))">
        set-fixed
      </button>
      <span>{{ modelValue ? (new Date(modelValue)).toDateString() : 'no-date' }}</span>
    </div>
  `,
};

const AutoCompleteStub = {
  name: 'AutoComplete',
  props: ['modelValue', 'suggestions', 'id', 'optionLabel', 'placeholder'],
  emits: ['update:modelValue', 'complete', 'optionSelect'],
  template: `
    <div>
      <input
        :id="id"
        role="textbox"
        :placeholder="placeholder"
        :value="modelValue ?? ''"
        @input="
          $emit('update:modelValue', $event.target.value);
          $emit('complete', { query: $event.target.value });
        "
      />
      <div>
        <button
          v-for="(s, i) in (suggestions || [])"
          :key="i"
          type="button"
          @click="$emit('optionSelect', { value: s })"
        >
          {{ s?.label ?? ('sug-' + i) }}
        </button>
      </div>
      <slot name="option" v-for="(s,i) in (suggestions || [])" :option="s" :index="i" />
    </div>
  `,
};

const MessageStub = { name: 'Message', template: `<div role="note"><slot /></div>` };
const InputNumberStub = { name: 'InputNumber', template: `<input role="spinbutton" />` };
const CountryFlagStub = { name: 'CountryFlag', template: `<i data-testid="flag"></i>` };

// ------------ STORES MOCKS  ------------

const countriesList = [
  { id: 1, code: 'ES', name: 'Spain' },
  { id: 2, code: 'PT', name: 'Portugal' },
];
const countryStatesES = [
  { id: 10, name: 'A Coruña' },
  { id: 11, name: 'Pontevedra' },
];

const fetchCountryStatesByCountryId = vi.fn(async (id: number) =>
  id === 1 ? countryStatesES : [],
);
const fetchAddressByZip = vi.fn(async (q: string) =>
  q
    ? [
        {
          zip: '15001',
          city: 'A Coruña',
          state: { id: 10, name: 'A Coruña' },
          country: { id: 1, code: 'ES', name: 'Spain' },
        },
      ]
    : [],
);

vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => ({ countries: countriesList }),
}));
vi.mock('@/infrastructure/stores/countryStates', () => ({
  useCountryStatesStore: () => ({ fetchCountryStatesByCountryId }),
}));
vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => ({ contactSchema: { fields: ['lastname2'] } }),
}));
vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({
    instance: {
      languages: [
        { code: 'en_GB', name: 'English' },
        { code: 'es_ES', name: 'Español' },
      ],
    },
  }),
}));
vi.mock('@/infrastructure/stores/extraFeature', () => ({
  useExtraFeatureStore: () => ({
    extraFeatures: [
      { field: 'lastname2', source: 'contact' },
      { field: 'comercial_name', source: 'contact' },
    ],
  }),
}));

const startLoading = vi.fn();
const stopLoading = vi.fn();
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading, stopLoading }),
}));
const addTextMessage = vi.fn();
vi.mock('@/infrastructure/stores/textMessages', () => ({
  useTextMessagesStore: () => ({ addTextMessage }),
}));
vi.mock('@/infrastructure/stores/address', () => ({
  useAddressStore: () => ({ fetchAddressByZip }),
}));

import Component from './ContactDetailGeneralData.vue';

function renderWithModel(
  modelPatch: any = {},
  contactType: 'person' | 'company' | 'agency' = 'person',
) {
  const pinia = createTestingPinia();
  const base = {
    id: 0,
    firstname: '',
    lastname: '',
    lastname2: '',
    birthdate: null as any,
    gender: '',
    nationality: undefined,
    lang: '',
    email: '',
    phones: [] as any[],
    residenceStreet: '',
    residenceZip: '',
    residenceCity: '',
    residenceCountry: undefined,
    residenceState: undefined,
    street: '',
    zipCode: '',
    city: '',
    country: undefined,
    state: undefined,
  };
  const model = ref<any>({ ...base, ...modelPatch });

  const utils = render(Component, {
    props: {
      modelValue: model.value,
      contactType,
      billingAddressMode: 'residence',
      'onUpdate:modelValue': (v: any) => {
        model.value = v;
      },
    },
    global: {
      plugins: [pinia],
      components: {
        InputText: InputTextStub,
        Select: SelectStub,
        DatePicker: DatePickerStub,
        Message: MessageStub,
        AutoComplete: AutoCompleteStub,
        InputNumber: InputNumberStub,
        CountryFlag: CountryFlagStub,
      },
    },
  });

  const rerender = async () => {
    await utils.rerender({
      modelValue: model.value,
      contactType,
      'onUpdate:modelValue': (v: any) => {
        model.value = v;
      },
    } as any);
  };

  return { ...utils, model, rerender };
}

describe('ContactDetailGeneralData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('person: displays surnames and lastname2 (per schema) and the Birth date label includes years', async () => {
    renderWithModel({ birthdate: new Date('2000-10-30T00:00:00Z') }, 'person');
    expect(screen.getByText(/^Birth date/i)).toHaveTextContent(/years/i);
    expect(screen.getByLabelText(/^First name(\s*\*)?$/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Last name$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Second last name$/i)).toBeInTheDocument();
  });

  it('company/agency: displays Fiscal name and hides surnames', async () => {
    renderWithModel({}, 'company');
    expect(screen.getByLabelText('Fiscal name', { exact: false })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /^Last name$/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Second last name$/i)).not.toBeInTheDocument();

    renderWithModel({}, 'agency');
    expect(screen.getAllByLabelText('Fiscal name', { exact: false })).toHaveLength(1);
  });

  it('v-model: firstname, email y lang', async () => {
    const { model, rerender } = renderWithModel({ lang: '' }, 'person');

    await userEvent.type(screen.getByLabelText(/^First name(\s*\*)?$/i), 'Ada');
    await rerender();
    expect(model.value.firstname).toBe('Ada');

    await userEvent.type(screen.getByLabelText(/^Email$/i), 'ada@math.com');
    await rerender();
    expect(model.value.email).toBe('ada@math.com');

    const combos = screen.getAllByRole('combobox');
    const langCombo = combos.find((c) => {
      const region = within(c).queryByLabelText('options');
      if (!region) {
        return false;
      }
      const btn = within(region).queryByRole('button', { name: /Español/i });
      return Boolean(btn);
    });

    expect(langCombo).toBeTruthy();

    const optionRegion = within(langCombo!).getByLabelText('options');
    const esBtn =
      within(optionRegion).queryByRole('button', { name: /Español/i }) ??
      within(optionRegion)
        .getAllByRole('button')
        .find((b) => typeof b.textContent === 'string' && /Español/i.test(b.textContent))!;
    await userEvent.click(esBtn);

    await rerender();
    expect(model.value.lang).toBe('es_ES');
  });

  it('Select Nationality emits the complete country by id', async () => {
    const { model } = renderWithModel({}, 'person');

    const combo = screen.getAllByRole('combobox').find((c) => {
      const btns = within(c).queryAllByRole('button');
      return btns.some(
        (b) => typeof b.textContent === 'string' && /Spain|Portugal/i.test(b.textContent),
      );
    })!;
    await userEvent.click(within(combo).getByRole('button', { name: 'Spain' }));

    expect(model.value.nationality?.id).toBe(1);
    expect(model.value.nationality?.name).toBe('Spain');
  });

  it('Phone/Mobile: updates and clears phones array', async () => {
    const { model, rerender } = renderWithModel({ phones: [] }, 'person');

    const phone = screen.getByLabelText(/^Phone$/i);
    const mobile = screen.getByLabelText(/^Mobile$/i);

    await userEvent.type(phone, '981111111');
    await rerender();
    expect(model.value.phones.find((p: any) => p.type === 'phone')?.number).toBe('981111111');

    await userEvent.type(mobile, '600111222');
    await rerender();
    expect(model.value.phones.find((p: any) => p.type === 'mobile')?.number).toBe('600111222');

    await userEvent.clear(mobile);
    await rerender();
    expect(model.value.phones.find((p: any) => p.type === 'mobile')).toBeUndefined();
  });

  it('ZIP autocomplete: complete + optionSelect fill residence', async () => {
    vi.useFakeTimers();

    const { model, rerender } = renderWithModel({}, 'person');

    const zip = screen.getByLabelText(/^Postal code$/i);

    await fireEvent.update(zip, '15001');

    await vi.advanceTimersByTimeAsync(170);

    await Promise.resolve();
    expect(fetchAddressByZip).toHaveBeenCalled();
    const args = (fetchAddressByZip as any).mock.calls.map((c: any[]) => c[0]);
    expect(args).toContain('15001');

    vi.useRealTimers();

    const btn = await screen.findByRole('button', { name: /15001\s*-\s*A Coruña/i });
    await userEvent.click(btn);
    await rerender();

    expect(model.value.residenceZip).toBe('15001');
    expect(model.value.residenceCity).toBe('A Coruña');
    expect(model.value.residenceCountry?.id).toBe(1);
    expect(model.value.residenceState?.id).toBe(10);
  });

  it('when changing residenceCountry → load states and adjust residenceState', async () => {
    const { model, rerender } = renderWithModel(
      { residenceState: { id: 999, name: 'X' } },
      'person',
    );
    const countryCombo = screen.getAllByRole('combobox').find((c) => c.id === 'country')!;
    await userEvent.click(within(countryCombo).getByRole('button', { name: 'Spain' }));
    await rerender();

    expect(fetchCountryStatesByCountryId).toHaveBeenCalledWith(1);
    expect(model.value.residenceState).toBeUndefined();

    model.value.residenceState = { id: 10, name: 'A Coruña' };
    await rerender();
    await userEvent.click(within(countryCombo).getByRole('button', { name: 'Spain' }));
    await rerender();

    expect(model.value.residenceState?.id).toBe(10);
  });
});
