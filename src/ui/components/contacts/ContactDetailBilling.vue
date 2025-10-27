<template>
  <section class="billing-form">
    <div class="billing-form__grid">
      <div class="billing-form__field">
        <label class="billing-form__label" for="fiscalIdNumberType">{{
          t('contacts.taxDocumentType')
        }}</label>
        <Select
          id="fiscalIdNumberType"
          v-model="modelValue.fiscalIdNumberType"
          :options="[...documentTypes]"
          optionLabel="name"
          optionValue="id"
          class="billing-form__control"
          :placeholder="t('contacts.select')"
        />
      </div>
      <div class="billing-form__field">
        <label class="billing-form__label" for="fiscalIdNumber">{{
          t('contacts.taxDocumentNumber')
        }}</label>
        <InputText
          id="fiscalIdNumber"
          v-model="modelValue.fiscalIdNumber"
          class="billing-form__control"
          :placeholder="t('contacts.fiscalDocumentNumberPlaceholder')"
        />
      </div>
      <div
        class="billing-form__field--full billing-form__address-choice"
        v-if="residenceAddressText"
      >
        <div class="billing-form__address-title">
          {{ t('contacts.fiscalAddress') }}
        </div>
        <label
          class="billing-card"
          :class="{ 'billing-card--active': billingAddressMode === 'residence' }"
        >
          <RadioButton
            name="billingAddressMode"
            inputId="addr_residence"
            value="residence"
            v-model="billingAddressMode"
          />
          <div class="billing-card__body">
            <div class="billing-card__title">{{ t('contacts.useResidenceAddress') }}</div>
            <div class="billing-card__subtitle">{{ residenceAddressText }}</div>
          </div>
        </label>

        <div
          class="billing-card"
          :class="{ 'billing-card--active': billingAddressMode === 'other' }"
          @click="billingAddressMode = 'other'"
        >
          <label class="billing-card__header" for="addr_other">
            <RadioButton
              name="billingAddressMode"
              inputId="addr_other"
              value="other"
              v-model="billingAddressMode"
              @click.stop
            />
            <div class="billing-card__body">
              <div class="billing-card__title">{{ t('contacts.useOtherAddress') }}</div>
            </div>
          </label>
          <div v-show="billingAddressMode === 'other'" class="billing-card__content">
            <div class="billing-form__field billing-form__field--full">
              <label class="billing-form__label" for="bill_street">{{
                t('contacts.address')
              }}</label>
              <InputText
                id="bill_street"
                v-model="billingData.street"
                class="billing-form__control"
                :placeholder="t('contacts.fiscalAddressPlaceholder')"
              />
            </div>
            <div class="billing-form__field">
              <label class="billing-form__label" for="bill_city">{{ t('contacts.city') }}</label>
              <InputText
                id="bill_city"
                v-model="billingData.city"
                class="billing-form__control"
                :placeholder="t('contacts.fiscalCityPlaceholder')"
              />
            </div>
            <div class="billing-form__field">
              <label class="billing-form__label" for="bill_zip">{{
                t('contacts.postalCode')
              }}</label>
              <InputText
                id="bill_zip"
                v-model="billingData.zipCode"
                class="billing-form__control"
                :placeholder="t('contacts.fiscalZipCodePlaceholder')"
              />
            </div>
            <div class="billing-form__field">
              <label class="billing-form__label" for="bill_country">{{
                t('contacts.country')
              }}</label>
              <Select
                id="bill_country"
                :modelValue="billingData.country?.id ?? null"
                :options="[...countries]"
                optionLabel="name"
                filter
                class="billing-form__control"
                :placeholder="t('contacts.select')"
                @update:modelValue="
                  (id) => {
                    const country = countries.find((c) => c.id === id) || undefined;
                    $emit('update:modelValue', { ...modelValue, country: country || undefined });
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
            <div class="billing-form__field">
              <label class="billing-form__label" for="state">{{ t('contacts.state') }}</label>
              <Select
                id="state"
                v-model="billingData.state"
                :options="[...countryStates]"
                optionLabel="name"
                filter
                class="billing-form__control"
                :placeholder="t('contacts.select')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="billing-form__address" v-else>
        <div class="billing-form__address-title">
          {{ t('contacts.fiscalAddress') }}
        </div>
        <Message severity="info" icon="pi pi-info-circle">
          <span>{{ t('contacts.fiscalAddressTextMessage') }}</span>
        </Message>
        <div class="billing-form__field billing-form__field--full">
          <label class="billing-form__label" for="bill_street">{{ t('contacts.address') }}</label>
          <InputText
            id="bill_street"
            v-model="modelValue.street"
            class="billing-form__control"
            :placeholder="t('contacts.fiscalAddressPlaceholder')"
          />
        </div>
        <div class="billing-form__field">
          <label class="billing-form__label" for="bill_zip">{{ t('contacts.postalCode') }}</label>
          <InputText
            id="bill_zip"
            v-model="modelValue.zipCode"
            class="billing-form__control"
            :placeholder="t('contacts.fiscalZipCodePlaceholder')"
          />
        </div>
        <div class="billing-form__field">
          <label class="billing-form__label" for="bill_city">{{ t('contacts.city') }}</label>
          <InputText
            id="bill_city"
            v-model="modelValue.city"
            class="billing-form__control"
            :placeholder="t('contacts.fiscalCityPlaceholder')"
          />
        </div>

        <div class="billing-form__field">
          <label class="billing-form__label" for="bill_country">{{ t('contacts.country') }}</label>
          <Select
            id="bill_country"
            v-model="modelValue.country"
            :options="[...countries]"
            optionLabel="name"
            filter
            class="billing-form__control"
            :placeholder="t('contacts.select')"
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
        <div class="billing-form__field">
          <label class="billing-form__label" for="state">{{ t('contacts.state') }}</label>
          <Select
            id="state"
            v-model="modelValue.state"
            :options="[...countryStates]"
            optionLabel="name"
            filter
            class="billing-form__control"
            :placeholder="t('contacts.select')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType, watch, ref, reactive, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Message from 'primevue/message';
import { Info } from 'lucide-vue-next';
import CountryFlag from 'vue-country-flag-next';

import type { ContactDetail } from '@/domain/entities/Contact';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import type { Country } from '@/domain/entities/Country';
import type { CountryState } from '@/domain/entities/CountryState';

export default defineComponent({
  components: {
    Select,
    InputText,
    RadioButton,
    Message,
    CountryFlag,
    Info,
  },
  props: {
    modelValue: {
      type: Object as PropType<ContactDetail>,
      required: true,
    },
  },
  emits: ['update:modelValue'],

  setup(props, context) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const countryStatesStore = useCountryStatesStore();
    const documentTypesStore = useDocumentTypesStore();
    const textMessageStore = useTextMessagesStore();
    const uiStore = useUIStore();
    const billingData = reactive({
      street: '',
      city: '',
      zipCode: '',
      country: undefined as Country | undefined,
      state: undefined as CountryState | undefined,
    });

    const billingAddressMode = ref<'residence' | 'other'>('residence');

    const countries = computed(() => countriesStore.countries);
    const countryStates = computed(() => countryStatesStore.countryStates);
    const documentTypes = computed(() => documentTypesStore.documentTypes);

    const residenceAddressText = computed(() => {
      let result = '';
      if (
        props.modelValue?.residenceStreet === '' &&
        props.modelValue?.residenceCity === '' &&
        props.modelValue?.residenceZip === '' &&
        props.modelValue?.residenceState === undefined &&
        props.modelValue?.residenceCountry === undefined
      ) {
        result = '';
      } else {
        const parts = [];
        if (props.modelValue.residenceStreet !== null) {
          parts.push(props.modelValue.residenceStreet);
        }
        if (props.modelValue.residenceCity !== null) {
          parts.push(props.modelValue.residenceCity);
        }
        if (props.modelValue.residenceZip !== null) {
          parts.push(props.modelValue.residenceZip);
        }
        if (props.modelValue.residenceState?.name !== null) {
          parts.push(props.modelValue.residenceState?.name);
        }
        if (props.modelValue.residenceCountry?.name !== null) {
          parts.push(props.modelValue.residenceCountry?.name);
        }
        result = parts.join(', ');
      }
      return result;
    });

    watch(billingAddressMode, (newMode) => {
      if (newMode === 'residence') {
        context.emit('update:modelValue', {
          ...props.modelValue,
          street: props.modelValue.residenceStreet,
          city: props.modelValue.residenceCity,
          zipCode: props.modelValue.residenceZip,
          country: props.modelValue.residenceCountry,
          state: props.modelValue.residenceState,
        });
      } else {
        context.emit('update:modelValue', {
          ...props.modelValue,
          street: billingData.street,
          city: billingData.city,
          zipCode: billingData.zipCode,
          country: billingData.country,
          state: billingData.state,
        });
      }
    });

    watch(
      () => props.modelValue.country,
      async () => {
        uiStore.startLoading();
        try {
          if (props.modelValue.country) {
            await countryStatesStore.fetchCountryStatesByCountryId(props.modelValue.country.id);
            const countryStateToSelect = countryStatesStore.countryStates?.find(
              (s) => s.id === props.modelValue.state?.id
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
          textMessageStore.addTextMessage(
            t('error.somethingWentWrong'),
            error instanceof Error ? error.message : 'Unknown error'
          );
        } finally {
          uiStore.stopLoading();
        }
      },
      { immediate: true, deep: true }
    );
    onBeforeMount(async () => {
      if (
        (props.modelValue.street !== props.modelValue.residenceStreet &&
          props.modelValue.street !== '') ||
        (props.modelValue.city !== props.modelValue.residenceCity &&
          props.modelValue.city !== '') ||
        (props.modelValue.zipCode !== props.modelValue.residenceZip &&
          props.modelValue.zipCode !== '') ||
        (props.modelValue.country?.id !== props.modelValue.residenceCountry?.id &&
          props.modelValue.country !== undefined) ||
        (props.modelValue.state?.id !== props.modelValue.residenceState?.id &&
          props.modelValue.state !== undefined)
      ) {
        billingData.street = props.modelValue.street ?? '';
        billingData.city = props.modelValue.city ?? '';
        billingData.zipCode = props.modelValue.zipCode ?? '';
        billingData.country = props.modelValue.country;
        billingData.state = props.modelValue.state;
        billingAddressMode.value = 'other';
      }
    });
    return {
      billingData,
      billingAddressMode,
      residenceAddressText,
      countries,
      documentTypes,
      countryStates,
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

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  &__field {
    .billing-form__control {
      width: 100%;
    }
    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-select-label),
    :deep(.p-dropdown),
    :deep(.p-inputwrapper) {
      width: 100%;
      font-size: 12px !important;
      height: 30px;
    }
    :deep(.p-select .p-select-label) {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }
  &__field--full {
    grid-column: 1 / -1;
  }
  &__label {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
  &__address-choice {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.billing-form__address {
  display: grid;
  gap: 8px;
  margin-top: 0.5rem;
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
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  cursor: pointer;

  &__header {
    display: contents;
    cursor: pointer;
  }

  &__body {
    display: grid;
    gap: 0.25rem;
  }
  &__title {
    font-weight: 600;
    color: #334155;
  }
  &__subtitle {
    color: #64748b;
    line-height: 1.25;
  }

  &__content {
    grid-column: 1 / -1;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }

  &--active {
    background: #eef4ff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3) inset;
  }
}

.billing-form__other {
  margin-top: 0.25rem;
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
}
@media (min-width: 1024px) {
  .billing-form {
    &::before {
      inset-inline: 0;
      background: #fff;
    }
    .billing-form__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 12px;
      align-items: start;
    }

    &__address {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 16px;
      .billing-form__address-title,
      :deep(.p-message) {
        grid-column: 1 / -1;
      }
    }
    &__field--full {
      grid-column: 1 / -1;
    }

    .billing-card__content {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 16px;
    }
    .billing-card__content .billing-form__field--full {
      grid-column: 1 / -1;
    }
  }
}

.billing-form__field {
  .billing-form__control {
    width: 100%;
  }
  :deep(.p-inputtext),
  :deep(.p-select),
  :deep(.p-select-label),
  :deep(.p-dropdown),
  :deep(.p-inputwrapper) {
    width: 100%;
    font-size: 14px !important;
    height: 35px;
  }
}
</style>
