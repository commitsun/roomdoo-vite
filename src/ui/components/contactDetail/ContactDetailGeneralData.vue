<template>
  <section class="personal-data-form">
    <div class="header">
      {{ t('contacts.mandatoryFieldsText') }}
      <h1 class="title">
        {{ t('contacts.basicInformation') }}
      </h1>
    </div>

    <div class="grid">
      <!-- First Name (only person) -->
      <div
        class="field"
        :class="{ 'field--full': contactType === 'person' }"
        v-if="contactType === 'person'"
      >
        <label class="label" for="firstName">{{ t('contacts.firstName') }} *</label>

        <InputText
          id="firstName"
          v-model="modelValue.firstname"
          :placeholder="t('contacts.firstNamePlaceholder')"
          :invalid="!!errors.name"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />

        <Message v-if="errors.name" size="small" severity="error" variant="simple" class="mt-2">
          {{ t(errors.name) }}
        </Message>
      </div>

      <!-- Fiscal Name (company, agency) -->
      <div class="field" :class="{ 'field--full': !showComercialName }" v-else>
        <label class="label" for="name">{{ t('contacts.fiscalName') }} *</label>

        <InputText
          id="name"
          v-model="modelValue.name"
          :placeholder="t('contacts.firstNamePlaceholder')"
          :invalid="!!errors.name"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />

        <Message v-if="errors.name" size="small" severity="error" variant="simple" class="mt-2">
          {{ t(errors.name) }}
        </Message>
      </div>

      <!-- Trade Name -->
      <div class="field" v-if="showComercialName">
        <label class="label" for="tradeName">{{ t('contacts.tradeName') }}</label>

        <InputText
          id="tradeName"
          v-model="modelValue.comercial"
          :placeholder="t('contacts.firstNamePlaceholder')"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />
      </div>

      <!-- Last Names -->
      <div class="field" :class="{ 'field--full': !showLastName2 }" v-if="contactType === 'person'">
        <label class="label" for="lastName">{{ t('contacts.lastName') }}</label>

        <InputText
          id="lastName"
          v-model="modelValue.lastname"
          :placeholder="t('contacts.lastNamePlaceholder')"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />
      </div>

      <div class="field" v-if="showLastName2">
        <label class="label" for="lastName2">{{ t('contacts.secondLastName') }}</label>

        <InputText
          id="lastName2"
          v-model="modelValue.lastname2"
          :placeholder="t('contacts.secondLastNamePlaceholder')"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />
      </div>

      <!-- Birthdate -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="birthdate">{{ birthdateLabel }}</label>

        <DatePicker
          id="birthdate"
          :modelValue="modelValue.birthdate"
          @update:modelValue="
            (v) => (modelValue.birthdate = v instanceof Date || v === null ? v : null)
          "
          showIcon
          dateFormat="dd/mm/yy"
          :maxDate="new Date()"
          :placeholder="t('contacts.datePlaceholder')"
          class="w-full h-[30px] lg:h-[35px]"
          inputClass="w-full text-[12px]! lg:text-[14px]!"
        />
      </div>

      <!-- Gender -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="gender">{{ t('contacts.gender.title') }}</label>

        <Select
          id="gender"
          v-model="modelValue.gender"
          :options="genders"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('contacts.select')"
          class="w-full flex items-center h-[30px] lg:h-[35px]"
          :pt="{
            label: {
              class: 'text-[12px]! lg:text-[14px]! ',
            },
          }"
        />
      </div>

      <!-- Nationality -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="nationality">{{ t('contacts.nationality') }}</label>

        <Select
          id="nationality"
          :modelValue="modelValue.nationality?.id ?? null"
          :options="[...countries]"
          optionLabel="name"
          optionValue="id"
          filter
          :placeholder="t('contacts.select')"
          class="w-full flex items-center h-[30px] lg:h-[35px]"
          overlayClass="max-w-[315px] lg:max-w-md"
          :pt="{
            label: {
              class: 'text-[12px]! lg:text-[14px]! ',
            },
          }"
          @update:modelValue="
            (id) =>
              $emit('update:modelValue', {
                ...modelValue,
                nationality: countries.find((c) => c.id === id),
              })
          "
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center gap-1">
              <CountryFlag
                :country="countryById.get(value)?.code?.toLowerCase() ?? ''"
                size="small"
                shadow
              />
              <span>{{ countryById.get(value)?.name }}</span>
            </div>
          </template>

          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <CountryFlag :country="option.code?.toLowerCase()" size="normal" shadow />
              <div>{{ option.name }}</div>
            </div>
          </template>
        </Select>
      </div>

      <!-- Language -->
      <div class="field">
        <label class="label" for="lang">{{ t('contacts.language') }}</label>

        <Select
          id="lang"
          v-model="modelValue.lang"
          :options="[...languages]"
          optionLabel="name"
          optionValue="code"
          :placeholder="t('contacts.select')"
          class="w-full flex items-center h-[30px] lg:h-[35px]"
          :pt="{
            label: {
              class: 'text-[12px]! lg:text-[14px]! ',
            },
          }"
        />
      </div>

      <!-- Contact data title -->
      <div class="field field--full">
        <h1 class="title">{{ t('contacts.contactData') }}</h1>
      </div>

      <!-- Email -->
      <div class="field field--full">
        <label class="label" for="email">{{ t('contacts.email') }}</label>

        <InputText
          id="email"
          v-model="modelValue.email"
          :placeholder="t('contacts.emailPlaceholder')"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />
      </div>

      <!-- Phone -->
      <div class="field">
        <label class="label" for="phone">{{ t('contacts.phone') }}</label>

        <InputText
          id="phone"
          :modelValue="modelValue.phones?.find((p) => p.type === 'phone')?.number"
          :placeholder="t('contacts.phonePlaceholder')"
          class="w-full flex items-center text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
          @update:modelValue="
            (value: string | undefined) => {
              const phoneExist = modelValue.phones?.filter((p: Phone) => p.type === 'phone')[0];
              if (phoneExist) {
                phoneExist.number = value ?? '';
              } else {
                modelValue.phones?.push({ type: 'phone', number: value ?? '' });
              }
              modelValue.phones = modelValue.phones?.filter((p: Phone) => p.number !== '');
              $emit('update:modelValue', { ...modelValue });
            }
          "
        />
      </div>

      <!-- Mobile -->
      <div class="field">
        <label class="label" for="mobile">{{ t('contacts.mobile') }}</label>

        <InputText
          id="mobile"
          :modelValue="modelValue.phones?.find((p) => p.type === 'mobile')?.number"
          :placeholder="t('contacts.mobilePlaceholder')"
          class="w-full flex items-center text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
          @update:modelValue="
            (value: string | undefined) => {
              const mobileExist = modelValue.phones?.filter((p: Phone) => p.type === 'mobile')[0];
              if (mobileExist) {
                mobileExist.number = value ?? '';
              } else {
                modelValue.phones?.push({ type: 'mobile', number: value ?? '' });
              }
              modelValue.phones = modelValue.phones?.filter((p: Phone) => p.number !== '');
              $emit('update:modelValue', { ...modelValue });
            }
          "
        />
      </div>

      <!-- Residence title -->
      <div class="residence field--full" v-if="contactType === 'person'">
        <h1 class="title">{{ t('contacts.residenceData') }}</h1>

        <Message severity="info" icon="pi pi-info-circle" v-if="billingAddressMode === 'residence'">
          <span>{{ t('contacts.residenceTextMessage') }}</span>
        </Message>
      </div>

      <!-- Address -->
      <div class="field field--full" v-if="contactType === 'person'">
        <label class="label" for="street">{{ t('contacts.residenceAddress') }}</label>

        <InputText
          id="street"
          v-model="modelValue.residenceStreet"
          :placeholder="t('contacts.residenceAddressPlaceholder')"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />
      </div>

      <!-- Zip -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="zip">{{ t('contacts.postalCode') }}</label>

        <AutoComplete
          id="zip"
          :modelValue="modelValue.residenceZip ?? ''"
          :suggestions="addressItems"
          optionLabel="value.zip"
          :placeholder="t('contacts.zipCodePlaceholder')"
          class="w-full h-[30px] lg:h-[35px]"
          @complete="fetchAddressByZip($event)"
          @update:modelValue="handleResidenceZipUpdate"
          @optionSelect="handleResidenceZipOptionSelect"
          inputClass="w-full text-[12px]! lg:text-[14px]!"
          panelClass="text-[12px]! lg:text-[14px]! max-w-[315px] lg:max-w-md"
        >
          <template #option="{ option }">
            <div>{{ option.label }}</div>
          </template>
        </AutoComplete>
      </div>

      <!-- City -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="city">{{ t('contacts.city') }}</label>

        <InputText
          id="city"
          v-model="modelValue.residenceCity"
          :placeholder="t('contacts.cityPlaceholder')"
          class="w-full text-[12px]! h-[30px] lg:text-[14px]! lg:h-[35px]"
        />
      </div>

      <!-- Country -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="country">{{ t('contacts.country') }}</label>

        <Select
          id="country"
          :modelValue="modelValue.residenceCountry?.id ?? null"
          :options="[...countries]"
          optionLabel="name"
          optionValue="id"
          filter
          :placeholder="t('contacts.select')"
          class="w-full flex items-center h-[30px] lg:h-[35px]"
          overlayClass="max-w-[315px] lg:max-w-md"
          :pt="{
            label: {
              class: 'text-[12px]! lg:text-[14px]! ',
            },
          }"
          @update:modelValue="
            (id: number | null) => {
              const c = countries.find((c: Country) => c.id === id);
              const residenceCountry = c ? { id: c.id, name: c.name } : undefined;
              $emit('update:modelValue', {
                ...modelValue,
                residenceCountry: residenceCountry || undefined,
              });
            }
          "
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center gap-1">
              <CountryFlag
                :country="countryById.get(value)?.code?.toLowerCase() ?? ''"
                size="small"
                shadow
              />
              <span>{{ countryById.get(value)?.name }}</span>
            </div>
          </template>

          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <CountryFlag :country="option.code?.toLowerCase()" size="normal" shadow />
              <div>{{ option.name }}</div>
            </div>
          </template>
        </Select>
      </div>

      <!-- State -->
      <div class="field" v-if="contactType === 'person'">
        <label class="label" for="state">{{ t('contacts.state') }}</label>

        <Select
          id="state"
          :modelValue="modelValue.residenceState?.id ?? null"
          :options="[...countryStates]"
          optionLabel="name"
          optionValue="id"
          filter
          :placeholder="t('contacts.select')"
          class="w-full flex items-center h-[30px] lg:h-[35px]"
          :pt="{
            label: {
              class: 'text-[12px]! lg:text-[14px]! ',
            },
          }"
          @update:modelValue="
            (id) =>
              $emit('update:modelValue', {
                ...modelValue,
                residenceState: countryStates.find((s) => s.id === id),
              })
          "
        />
      </div>

      <!-- Agency title -->
      <div class="field--full" v-if="contactType === 'agency'">
        <h1 class="title">{{ t('contacts.agencyDetails') }}</h1>
      </div>

      <!-- Sale Channel -->
      <div class="field" v-if="contactType === 'agency'">
        <label class="label" for="saleChannel">{{ t('contacts.saleChannel') }} *</label>

        <Select
          id="saleChannel"
          :modelValue="modelValue.saleChannel?.id ?? null"
          :options="[...saleChannels]"
          optionLabel="name"
          optionValue="id"
          :placeholder="t('contacts.select')"
          :invalid="!!errors.saleChannelId"
          class="w-full flex items-center text-[12px] h-[30px] lg:text-[14px]! lg:h-[35px]"
          @update:modelValue="
            (id) =>
              $emit('update:modelValue', {
                ...modelValue,
                saleChannel: saleChannels.find((sc) => sc.id === id),
              })
          "
        />

        <Message
          v-if="errors.saleChannelId"
          size="small"
          severity="error"
          variant="simple"
          class="mt-2"
        >
          {{ t(errors.saleChannelId) }}
        </Message>
      </div>

      <!-- Commission -->
      <div class="field" v-if="contactType === 'agency'">
        <label class="label" for="commission">{{ t('contacts.commission') }}</label>

        <InputNumber
          v-model="modelValue.defaultCommission"
          inputId="commission"
          suffix="%"
          placeholder="%"
          showButtons
          :min="0"
          :max="100"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, watch, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import AutoComplete from 'primevue/autocomplete';
import CountryFlag from 'vue-country-flag-next';
import { Info } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';

import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { useSaleChannelsStore } from '@/infrastructure/stores/saleChannels';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { useAddressStore } from '@/infrastructure/stores/address';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import type { ContactDetail } from '@/domain/entities/Contact';
import type { CountryState } from '@/domain/entities/CountryState';
// eslint-disable-next-line
import type { Country } from '@/domain/entities/Country';
// eslint-disable-next-line
import type { Phone } from '@/domain/entities/Phone';
import type { Address } from '@/domain/entities/Address';

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail>,
      required: true,
    },
    contactType: {
      type: String,
      required: true,
    },
    errors: {
      type: Object as PropType<{ name?: string; saleChannelId?: string }>,
      default: () => ({}),
    },
    billingAddressMode: {
      type: String as PropType<'residence' | 'other'>,
      required: true,
    },
  },
  components: {
    IftaLabel,
    InputText,
    InputNumber,
    Select,
    DatePicker,
    Message,
    AutoComplete,
    CountryFlag,
    Info,
  },
  emits: ['update:modelValue'],
  setup(props, context) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const countryStatesStore = useCountryStatesStore();
    const instanceStore = useInstanceStore();
    const addressStore = useAddressStore();
    const saleChannelsStore = useSaleChannelsStore();
    const uiStore = useUIStore();
    const useTextMessageStore = useTextMessagesStore();
    const phoneNumber = ref('');
    const mobileNumber = ref('');
    const countryStates = ref<CountryState[]>([]);
    const addressItems = ref([] as { label: string; value: Address }[]);

    const countries = computed(() => countriesStore.countries);
    const languages = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);
    const showLastName2 = computed(
      () =>
        props.contactType === 'person' &&
        instanceStore.instance?.dynamicFields.find(
          (f) => f.field === 'lastname2' && f.source === 'contact',
        ),
    );

    const showComercialName = computed(
      () =>
        props.contactType !== 'person' &&
        instanceStore.instance?.dynamicFields.find(
          (f) => f.field === 'comercial_name' && f.source === 'contact',
        ),
    );

    const saleChannels = computed(() =>
      saleChannelsStore.saleChannels.filter((sc) => sc.type === 'indirect'),
    );

    const isValidDate = (d: unknown): d is Date =>
      d instanceof Date && Number.isFinite(d.getTime());

    const age = computed(() => {
      const b = props.modelValue.birthdate;
      if (!isValidDate(b)) {
        return null;
      }
      const today = new Date();
      let years = today.getFullYear() - b.getFullYear();
      const m = today.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < b.getDate())) {
        years--;
      }
      return years;
    });

    const birthdateLabel = computed(() =>
      age.value !== null
        ? `${t('contacts.birthDate')} (${age.value} ${t('contacts.yearsOld')})`
        : t('contacts.birthDate'),
    );

    const countryById = computed(() => {
      const m = new Map<number, { id: number; name: string; code: string }>();
      countries.value.forEach((c) => m.set(c.id, c));
      return m;
    });

    const genders = [
      { label: t('contacts.gender.female'), value: 'female' },
      { label: t('contacts.gender.male'), value: 'male' },
      { label: t('contacts.gender.other'), value: 'other' },
    ];

    const debouncedFetchAddressByZip = useDebounceFn(
      async (query: string) => {
        uiStore.startLoading();
        try {
          const results = await addressStore.fetchAddressByZip(query);
          if (results.length > 0) {
            addressItems.value = results.map((address: Address) => ({
              label: `${address.zip} - ${address.city}, ${address.state.name}, ${address.country.name}`,
              value: address,
            }));
          } else {
            addressItems.value = [];
          }
        } catch (error) {
          useTextMessageStore.addTextMessage(
            t('error.somethingWentWrong'),
            error instanceof Error ? error.message : 'Unknown error',
          );
        } finally {
          uiStore.stopLoading();
        }
      },
      150,
      { maxWait: 3000 },
    );

    const fetchAddressByZip = async (event: { query: string }): Promise<void> => {
      const len = event.query.length;
      if (len >= 3 || len === 0) {
        await debouncedFetchAddressByZip(event.query);
      } else {
        addressItems.value = [];
      }
    };

    const handleResidenceZipUpdate = (val: { value: { zip: string } } | string): void => {
      const zip =
        typeof val === 'object' && val !== null && 'value' in val ? val.value.zip : (val as string);

      context.emit('update:modelValue', {
        ...props.modelValue,
        residenceZip: zip,
      });
    };

    const handleResidenceZipOptionSelect = (e: { value: { value: Address } }): void => {
      const address: Address = e.value.value;

      context.emit('update:modelValue', {
        ...props.modelValue,
        residenceZip: address.zip,
        residenceCity: address.city,
        residenceCountry: address.country,
        residenceState: address.state,
      });
    };

    watch(
      () => props.modelValue.residenceCountry,
      async () => {
        try {
          if (props.modelValue.residenceCountry) {
            countryStates.value = await countryStatesStore.fetchCountryStatesByCountryId(
              props.modelValue.residenceCountry.id,
            );
            const countryStateToSelect = countryStates.value.find(
              (s) => s.id === props.modelValue.residenceState?.id,
            );
            if (countryStateToSelect && props.modelValue.residenceState) {
              context.emit('update:modelValue', {
                ...props.modelValue,
                residenceState: countryStateToSelect,
              });
            } else {
              context.emit('update:modelValue', {
                ...props.modelValue,
                residenceState: undefined,
              });
            }
          }
        } catch (error) {
          useTextMessageStore.addTextMessage(
            t('error.somethingWentWrong'),
            error instanceof Error ? error.message : 'Unknown error',
          );
        }
      },
      { immediate: true, deep: true },
    );

    return {
      countries,
      showLastName2,
      birthdateLabel,
      languages,
      genders,
      countryById,
      countryStates,
      saleChannels,
      phoneNumber,
      mobileNumber,
      addressItems,
      showComercialName,
      fetchAddressByZip,
      handleResidenceZipUpdate,
      handleResidenceZipOptionSelect,
      t,
    };
  },
});
</script>

<style scoped lang="scss">
.personal-data-form {
  position: relative;
  padding-top: 1rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    inset-inline: -1.1rem;
    height: 1px;
    background: #e2e8f0;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .title {
    font-size: 14px;
    color: #475569;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  .field--full {
    grid-column: 1 / -1;
  }

  .label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
}

@media (min-width: 1024px) {
  .personal-data-form {
    &::before {
      inset-inline: 0;
      background: #ffffff;
    }

    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
  }
}
</style>
