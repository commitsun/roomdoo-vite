<template>
  <section class="billing-form">
    <div class="billing-grid">
      <div class="field">
        <label class="field-label" for="fiscalIdNumberType">
          {{ t('contacts.taxDocumentType') }}
        </label>
        <Select
          id="fiscalIdNumberType"
          v-model="modelValue.fiscalIdNumberType"
          :options="[...fiscalDocumentTypes]"
          optionLabel="name"
          optionValue="id"
          :placeholder="t('contacts.select')"
          @blur="checkContactDuplicateByFiscalDocument()"
          class="w-full flex items-center h-[30px] lg:h-[35px]"
          :pt="{
            label: {
              class: 'text-[12px]! lg:text-[14px]! ',
            },
          }"
        />
      </div>

      <div class="field">
        <label class="field-label" for="fiscalIdNumber">
          {{ t('contacts.taxDocumentNumber') }}
        </label>
        <InputText
          id="fiscalIdNumber"
          v-model="modelValue.fiscalIdNumber"
          class="field-control"
          :placeholder="t('contacts.fiscalDocumentNumberPlaceholder')"
          @blur="checkContactDuplicateByFiscalDocument()"
        />
      </div>

      <div class="mt-2 flex gap-1 items-center" v-if="contactDuplicated.id !== 0">
        <CircleAlert :size="16" color="#dc2626" />
        <Message size="small" severity="error" variant="simple">
          {{ t('contacts.isDuplicated', { name: contactDuplicated?.name }) }}
          <span
            class="underline text-sm text-blue-600 hover:text-blue-800 visited:text-purple-600 cursor-pointer font-bold"
            @click="confirmChangeContact(contactDuplicated.id)"
          >
            {{ t('contacts.seeContact') }}
          </span>
        </Message>
      </div>

      <div class="field-full address-choice" v-if="residenceAddressText">
        <div class="billing-address-title">
          {{ t('contacts.fiscalAddress') }}
        </div>

        <label
          class="billing-card"
          :class="{ 'billing-card-active': billingAddressMode === 'residence' }"
        >
          <RadioButton
            name="billingAddressMode"
            inputId="addr_residence"
            value="residence"
            v-model="billingAddressMode"
          />
          <div class="billing-card-body">
            <div class="billing-card-title">
              {{ t('contacts.useResidenceAddress') }}
            </div>
            <div class="billing-card-subtitle">
              {{ residenceAddressText }}
            </div>
          </div>
        </label>

        <div
          class="billing-card"
          :class="{ 'billing-card-active': billingAddressMode === 'other' }"
          @click="billingAddressMode = 'other'"
        >
          <label class="billing-card-header" for="addr_other">
            <RadioButton
              name="billingAddressMode"
              inputId="addr_other"
              value="other"
              v-model="billingAddressMode"
              @click.stop
            />
            <div class="billing-card-body">
              <div class="billing-card-title">
                {{ t('contacts.useOtherAddress') }}
              </div>
            </div>
          </label>

          <div v-show="billingAddressMode === 'other'" class="billing-card-content">
            <div class="field field-full">
              <label class="field-label" for="bill_street">
                {{ t('contacts.address') }}
              </label>
              <InputText
                id="bill_street"
                :modelValue="billingAddress.street"
                class="field-control"
                :placeholder="t('contacts.fiscalAddressPlaceholder')"
                @update:modelValue="
                  (val: string | undefined) => {
                    billingAddress.street = val ?? '';
                    $emit('update:billingAddress', { ...billingAddress, street: val ?? '' });
                  }
                "
              />
            </div>

            <div class="field">
              <label class="field-label" for="bill_zip">
                {{ t('contacts.postalCode') }}
              </label>
              <AutoComplete
                id="bill_zip"
                :modelValue="billingAddress.zipCode ?? ''"
                :suggestions="addressItems"
                optionLabel="value.zip"
                :placeholder="t('contacts.zipCodePlaceholder')"
                @complete="fetchAddressByZip($event)"
                @update:modelValue="handleBillingAddressZipUpdate"
                @optionSelect="handleBillingAddressZipOptionSelect"
                class="h-[30px] lg:h-[35px]"
                inputClass="w-full text-[12px]! lg:text-[14px]!"
                panelClass="text-[12px]! lg:text-[14px]! max-w-[285px] lg:max-w-md"
              >
                <template #option="{ option }">
                  <div>{{ option.label }}</div>
                </template>
              </AutoComplete>
            </div>

            <div class="field">
              <label class="field-label" for="bill_city">
                {{ t('contacts.city') }}
              </label>
              <InputText
                id="bill_city"
                :modelValue="billingAddress.city"
                class="field-control"
                :placeholder="t('contacts.fiscalCityPlaceholder')"
                @update:modelValue="
                  (val: string | undefined) => {
                    billingAddress.city = val ?? '';
                    $emit('update:billingAddress', { ...billingAddress, city: val ?? '' });
                  }
                "
              />
            </div>

            <div class="field">
              <label class="field-label" for="bill_country">
                {{ t('contacts.country') }}
              </label>
              <Select
                id="bill_country"
                :modelValue="billingAddress.country?.id ?? null"
                :options="[...countries]"
                optionLabel="name"
                optionValue="id"
                filter
                :placeholder="t('contacts.select')"
                class="w-full flex items-center h-[30px] lg:h-[35px]"
                overlayClass="max-w-[285px] lg:max-w-md"
                :pt="{
                  label: {
                    class: 'text-[12px]! lg:text-[14px]! ',
                  },
                }"
                @update:modelValue="
                  (val: number | null) => {
                    const n =
                      typeof val === 'number' ? val : val == null || val === '' ? NaN : Number(val);
                    const country = Number.isFinite(n)
                      ? countries.find((c: Country) => c.id === n)
                      : undefined;
                    billingAddress.country = country;
                    $emit('update:billingAddress', {
                      ...billingAddress,
                      country: country || undefined,
                    });
                  }
                "
              >
                <template #value="{ value }">
                  <div v-if="Number.isFinite(value)" class="flex items-center w-full gap-1">
                    <CountryFlag
                      :country="
                        (countries.find((c: Country) => c.id === value)?.code || '').toLowerCase()
                      "
                      size="small"
                      shadow
                    />
                    <span class="whitespace-nowrap">
                      {{ countries.find((c: Country) => c.id === value)?.name }}
                    </span>
                  </div>
                </template>
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <CountryFlag
                      :country="option.code?.toLowerCase()"
                      size="normal"
                      shadow
                      style="margin-bottom: 1px"
                    />
                    <div>{{ option.name }}</div>
                  </div>
                </template>
              </Select>
            </div>

            <div class="field">
              <label class="field-label" for="state">
                {{ t('contacts.state') }}
              </label>
              <Select
                id="state"
                :modelValue="billingAddress.state?.id ?? null"
                :options="[...countryStates]"
                optionLabel="name"
                optionValue="id"
                filter
                :placeholder="t('contacts.select')"
                class="w-full flex items-center h-[30px] lg:h-[35px]"
                overlayClass="max-w-[285px] lg:max-w-md"
                :pt="{
                  label: {
                    class: 'text-[12px]! lg:text-[14px]! ',
                  },
                }"
                @update:modelValue="
                  (val: number | null) => {
                    const n =
                      typeof val === 'number' ? val : val == null || val === '' ? NaN : Number(val);
                    const s = Number.isFinite(n)
                      ? countryStates.find((cs: CountryState) => cs.id === n)
                      : undefined;
                    billingAddress.state = s;
                    $emit('update:billingAddress', { ...billingAddress, state: s || undefined });
                  }
                "
              />
            </div>
          </div>
        </div>
      </div>

      <div class="billing-address" v-else>
        <div class="billing-address-title">
          {{ t('contacts.fiscalAddress') }}
        </div>

        <Message
          severity="info"
          icon="pi pi-info-circle"
          v-if="modelValue.contactType === 'person'"
          class="field-full"
        >
          <span>{{ t('contacts.fiscalAddressTextMessage') }}</span>
        </Message>

        <div class="field field-full">
          <label class="field-label" for="bill_street">
            {{ t('contacts.address') }}
          </label>
          <InputText
            id="bill_street"
            v-model="modelValue.street"
            class="field-control"
            :placeholder="t('contacts.fiscalAddressPlaceholder')"
          />
        </div>

        <div class="field">
          <label class="field-label" for="bill_zip">
            {{ t('contacts.postalCode') }}
          </label>
          <AutoComplete
            id="bill_zip"
            :modelValue="modelValue.zipCode ?? ''"
            :suggestions="addressItems"
            optionLabel="value.zip"
            :placeholder="t('contacts.zipCodePlaceholder')"
            @complete="fetchAddressByZip($event)"
            @update:modelValue="handleModelZipUpdate"
            @optionSelect="handleModelZipOptionSelect"
            class="h-[30px] lg:h-[35px]"
            inputClass="w-full text-[12px]! lg:text-[14px]!"
            panelClass="text-[12px]! lg:text-[14px]! max-w-[315px] lg:max-w-md"
          >
            <template #option="{ option }">
              <div>{{ option.label }}</div>
            </template>
          </AutoComplete>
        </div>

        <div class="field">
          <label class="field-label" for="bill_city">
            {{ t('contacts.city') }}
          </label>
          <InputText
            id="bill_city"
            v-model="modelValue.city"
            class="field-control"
            :placeholder="t('contacts.fiscalCityPlaceholder')"
          />
        </div>

        <div class="field">
          <label class="field-label" for="bill_country">
            {{ t('contacts.country') }}
          </label>
          <Select
            id="country"
            v-model="modelValue.country"
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
              (val: number | null) => {
                const n =
                  typeof val === 'number' ? val : val == null || val === '' ? NaN : Number(val);
                const country = Number.isFinite(n)
                  ? countries.find((c: Country) => c.id === n)
                  : undefined;
                billingAddress.country = country;
                $emit('update:modelValue', {
                  ...modelValue,
                  country: country || undefined,
                });
              }
            "
          >
            <template #value="{ value }">
              <div v-if="value" class="flex items-center w-full gap-1">
                <CountryFlag :country="value.code?.toLowerCase() || ''" size="small" shadow />
                <span class="whitespace-nowrap">{{ value.name }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <CountryFlag
                  :country="option.code?.toLowerCase()"
                  size="normal"
                  shadow
                  style="margin-bottom: 1px"
                />
                <div>{{ option.name }}</div>
              </div>
            </template>
          </Select>
        </div>

        <div class="field">
          <label class="field-label" for="state">
            {{ t('contacts.state') }}
          </label>
          <Select
            id="state"
            v-model="modelValue.state"
            :options="[...countryStates]"
            optionLabel="name"
            filter
            :placeholder="t('contacts.select')"
            class="w-full flex items-center h-[30px] lg:h-[35px]"
            :pt="{
              label: {
                class: 'text-[12px]! lg:text-[14px]! ',
              },
            }"
          />
        </div>
      </div>
    </div>
  </section>

  <ConfirmDialog :style="{ maxWidth: '350px' }" />
</template>

<script lang="ts">
import { defineComponent, computed, type PropType, watch, ref, reactive, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Message from 'primevue/message';
import AutoComplete from 'primevue/autocomplete';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { Info, CircleAlert } from 'lucide-vue-next';
import CountryFlag from 'vue-country-flag-next';
import { useDebounceFn } from '@vueuse/core';

import type { ContactDetail } from '@/domain/entities/Contact';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useAddressStore } from '@/infrastructure/stores/address';
import type { Country } from '@/domain/entities/Country';
import type { CountryState } from '@/domain/entities/CountryState';
import type { Address } from '@/domain/entities/Address';

export default defineComponent({
  components: {
    Select,
    InputText,
    RadioButton,
    Message,
    AutoComplete,
    ConfirmDialog,
    CountryFlag,
    Info,
    CircleAlert,
  },
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail>,
      required: true,
    },
    billingAddress: {
      type: Object as PropType<{
        street: string;
        city: string;
        zipCode: string;
        country: Country | undefined;
        state: CountryState | undefined;
      }>,
      required: true,
    },
    billingAddressMode: {
      type: String as PropType<'residence' | 'other'>,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
    'update:billingAddress',
    'updateBillingAddressMode',
    'changeContactForm',
  ],

  setup(props, context) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const countryStatesStore = useCountryStatesStore();
    const documentTypesStore = useDocumentTypesStore();
    const contactsStore = useContactsStore();
    const useTextMessageStore = useTextMessagesStore();
    const addressStore = useAddressStore();
    const uiStore = useUIStore();
    const confirm = useConfirm();

    const billingAddress = reactive({
      street: '',
      city: '',
      zipCode: '',
      country: undefined as Country | undefined,
      state: undefined as CountryState | undefined,
    });

    const billingAddressMode = ref<'residence' | 'other'>('residence');
    const countryStates = ref<CountryState[]>([]);
    const addressItems = ref([] as { label: string; value: Address }[]);
    const contactDuplicated = ref({ id: 0, name: '' });
    const countries = computed(() => countriesStore.countries);

    const fiscalDocumentTypes = computed(() =>
      documentTypesStore.fiscalDocumentTypes.map((dt) => {
        return {
          id: dt.name,
          name: t(`contacts.fiscalDocumentType.${dt.name}`),
        };
      }),
    );

    const residenceAddressText = computed(() => {
      if (
        props.modelValue.residenceStreet === '' &&
        props.modelValue.residenceCity === '' &&
        props.modelValue.residenceZip === '' &&
        props.modelValue.residenceState === undefined &&
        props.modelValue.residenceCountry === undefined
      ) {
        return '';
      }
      const parts = [
        props.modelValue.residenceStreet,
        props.modelValue.residenceCity,
        props.modelValue.residenceZip,
        props.modelValue.residenceState?.name,
        props.modelValue.residenceCountry?.name,
      ].filter(Boolean);

      return parts.join(', ');
    });

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
          if (error instanceof Error) {
            useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
          }
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

    const handleBillingAddressZipUpdate = (val: { value: { zip: string } } | string): void => {
      const zip =
        typeof val === 'object' && val !== null && 'value' in val ? val.value.zip : (val as string);

      billingAddress.zipCode = zip;
      context.emit('update:billingAddress', { ...billingAddress, zipCode: zip });
    };

    const handleBillingAddressZipOptionSelect = (e: { value: { value: Address } }): void => {
      const address: Address = e.value.value;

      billingAddress.zipCode = address.zip;
      billingAddress.city = address.city;
      billingAddress.country = address.country;
      billingAddress.state = address.state;

      context.emit('update:billingAddress', {
        ...billingAddress,
        zipCode: address.zip,
        city: address.city,
        country: address.country,
        state: address.state,
      });
    };

    const handleModelZipUpdate = (val: { value: { zip: string } } | string): void => {
      const zip =
        typeof val === 'object' && val !== null && 'value' in val ? val.value.zip : (val as string);

      context.emit('update:modelValue', { ...props.modelValue, zipCode: zip });
    };

    const handleModelZipOptionSelect = (e: { value: { value: Address } }): void => {
      const address: Address = e.value.value;

      context.emit('update:modelValue', {
        ...props.modelValue,
        zipCode: address.zip,
        city: address.city,
        country: address.country,
        state: address.state,
      });
    };

    const checkContactDuplicateByFiscalDocument = async (): Promise<void> => {
      contactDuplicated.value = { id: 0, name: '' };
      if (
        props.modelValue.fiscalIdNumber === '' ||
        props.modelValue.fiscalIdNumber === undefined ||
        props.modelValue.fiscalIdNumberType === '' ||
        props.modelValue.fiscalIdNumberType === undefined
      ) {
        return;
      }
      let countryId: number | undefined = undefined;
      if (
        residenceAddressText.value &&
        billingAddressMode.value === 'residence' &&
        props.modelValue.residenceCountry
      ) {
        countryId = props.modelValue.residenceCountry.id;
      } else if (billingAddressMode.value === 'other' && billingAddress.country) {
        countryId = billingAddress.country.id;
      } else if (props.modelValue.country) {
        countryId = props.modelValue.country.id;
      }
      try {
        const dup = await contactsStore.checkContactDuplicateByFiscalDocument(
          props.modelValue.fiscalIdNumberType,
          props.modelValue.fiscalIdNumber,
          countryId,
        );
        const currentId = (props.modelValue as ContactDetail)?.id as number | undefined;
        if (dup && dup.id !== currentId) {
          contactDuplicated.value = { id: dup.id, name: dup.name };
        }
      } catch (error) {
        if (error instanceof Error) {
          useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
        }
      }
    };

    const confirmChangeContact = (id: number): void => {
      confirm.require({
        message: t('contacts.confirmMessage'),
        header: t('contacts.confirmTitle'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: { label: t('contacts.cancel'), severity: 'secondary', outlined: true },
        acceptProps: { label: t('contacts.seeContact') },
        accept: () => {
          context.emit('changeContactForm', id);
        },
      });
    };

    watch(billingAddressMode, (newMode) => {
      if (newMode === 'residence') {
        context.emit('updateBillingAddressMode', 'residence');
      } else {
        context.emit('updateBillingAddressMode', 'other');
      }
    });

    watch(
      () => props.modelValue.country,
      async () => {
        try {
          if (props.modelValue.country) {
            countryStates.value = await countryStatesStore.fetchCountryStatesByCountryId(
              props.modelValue.country.id,
            );
            const countryStateToSelect = countryStates.value.find(
              (s) => s.id === props.modelValue.state?.id,
            );
            if (countryStateToSelect && props.modelValue.state) {
              context.emit('update:modelValue', {
                ...props.modelValue,
                state: countryStateToSelect,
              });
            } else {
              context.emit('update:modelValue', {
                ...props.modelValue,
                state: undefined,
              });
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
          }
        }
      },
      { immediate: true, deep: true },
    );

    watch(
      () => billingAddress.country,
      async () => {
        try {
          if (billingAddress.country) {
            countryStates.value = await countryStatesStore.fetchCountryStatesByCountryId(
              billingAddress.country.id,
            );
            const countryStateToSelect = countryStates.value.find(
              (s) => s.id === billingAddress.state?.id,
            );
            if (countryStateToSelect && billingAddress.state) {
              context.emit('update:billingAddress', {
                ...billingAddress,
                state: countryStateToSelect,
              });
            } else {
              context.emit('update:billingAddress', {
                ...billingAddress,
                state: undefined,
              });
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
          }
        }
      },
      { immediate: true, deep: true },
    );
    onBeforeMount(async () => {
      billingAddress.street = props.billingAddress.street;
      billingAddress.city = props.billingAddress.city;
      billingAddress.zipCode = props.billingAddress.zipCode;
      billingAddress.country = props.billingAddress.country;
      billingAddress.state = props.billingAddress.state;
      if (props.billingAddressMode === 'residence') {
        billingAddressMode.value = 'residence';
      } else if (props.billingAddressMode === 'other') {
        billingAddressMode.value = 'other';
      }
    });
    return {
      billingAddress,
      billingAddressMode,
      residenceAddressText,
      countries,
      fiscalDocumentTypes,
      countryStates,
      addressItems,
      contactDuplicated,
      fetchAddressByZip,
      checkContactDuplicateByFiscalDocument,
      confirmChangeContact,
      handleBillingAddressZipUpdate,
      handleBillingAddressZipOptionSelect,
      handleModelZipUpdate,
      handleModelZipOptionSelect,
      t,
    };
  },
});
</script>

<style scoped lang="scss">
.billing-form {
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
}

.billing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .field-control {
    width: 100%;
    font-size: 12px !important;
    height: 30px;
    display: flex;
    align-items: center;
  }
}

.field-full {
  grid-column: 1 / -1;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #64748b;
}

.address-choice {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.billing-address {
  display: grid;
  gap: 8px;
  margin-top: 0.5rem;
}

.billing-address-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #334155;
}

.billing-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;

  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}

.billing-card-active {
  background: #eef4ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3) inset;
}

.billing-card-header {
  display: contents;
  cursor: pointer;
}

.billing-card-body {
  display: grid;
  gap: 0.25rem;
}

.billing-card-title {
  font-weight: 600;
  color: #334155;
}

.billing-card-subtitle {
  color: #64748b;
  line-height: 1.25;
}

.billing-card-content {
  grid-column: 1 / -1;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
}

@media (min-width: 1024px) {
  .billing-form {
    &::before {
      inset-inline: 0;
      background: #fff;
    }
  }

  .billing-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 12px;
    align-items: start;
  }

  .billing-address {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;

    .billing-address-title {
      grid-column: 1 / -1;
    }
  }

  .billing-card-content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
  }

  .billing-card-content .field-full {
    grid-column: 1 / -1;
  }

  .field .field-control {
    font-size: 14px !important;
    height: 35px;
  }
}
</style>
