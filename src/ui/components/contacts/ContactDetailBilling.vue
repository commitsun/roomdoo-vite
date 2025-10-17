<template>
  <section class="billing-form">
    <div class="billing-form__grid">
      <div class="billing-form__field">
        <label class="billing-form__label" for="fiscalIdNumberType">{{
          t('contacts.taxDocumentType')
        }}</label>

        <Select
          id="fiscalIdNumberType"
          v-model="billingData.fiscalIdNumberType"
          :options="[...documentTypes]"
          optionLabel="name"
          optionValue="id"
          class="billing-form__control"
        />
      </div>

      <div class="billing-form__field">
        <label class="billing-form__label" for="fiscalIdNumber">{{
          t('contacts.taxDocumentNumber')
        }}</label>
        <InputText
          id="fiscalIdNumber"
          v-model="billingData.fiscalIdNumber"
          class="billing-form__control"
        />
      </div>
      <div class="billing-form__address" v-if="residenceAddressText">
        <div class="billing-form__address-title">
          {{ t('contacts.fiscalAddress') }}
        </div>

        <!-- Tarjeta: usar residencia -->
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

        <!-- Tarjeta: usar otra dirección (WRAPPER, no label) -->
        <div
          class="billing-card billing-card--clickable"
          :class="{ 'billing-card--active': billingAddressMode === 'other' }"
          @click="billingAddressMode = 'other'"
        >
          <!-- Encabezado con radio y título -->
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

          <!-- Campos dentro de la MISMA tarjeta -->
          <div v-show="billingAddressMode === 'other'" class="billing-card__content">
            <div class="billing-form__field billing-form__field--full">
              <label class="billing-form__label" for="bill_street">{{
                t('contacts.address')
              }}</label>
              <InputText
                id="bill_street"
                v-model="billingData.street"
                class="billing-form__control"
              />
            </div>
            <div class="billing-form__field">
              <label class="billing-form__label" for="bill_city">{{ t('contacts.city') }}</label>
              <InputText id="bill_city" v-model="billingData.city" class="billing-form__control" />
            </div>
            <div class="billing-form__field">
              <label class="billing-form__label" for="bill_zip">{{
                t('contacts.postalCode')
              }}</label>
              <InputText id="bill_zip" v-model="billingData.zip" class="billing-form__control" />
            </div>
            <div class="billing-form__field billing-form__field--full">
              <label class="billing-form__label" for="bill_country">{{
                t('contacts.country')
              }}</label>
              <Select
                id="bill_country"
                v-model="billingData.country"
                :options="[...countries]"
                optionLabel="name"
                filter
                class="billing-form__control"
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
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="billing-form__address">
        <div class="billing-form__address-title">
          {{ t('contacts.fiscalAddress') }}
        </div>
        <Message severity="info">
          <template #icon>
            <Info :size="60" class="mr-1" />
          </template>
          <span>{{ t('contacts.fiscalAddressTextMessage') }}</span>
        </Message>
        <div class="billing-form__field billing-form__field--full">
          <label class="billing-form__label" for="bill_street">{{ t('contacts.address') }}</label>
          <InputText id="bill_street" v-model="billingData.street" class="billing-form__control" />
        </div>
        <div class="billing-form__field">
          <label class="billing-form__label" for="bill_zip">{{ t('contacts.postalCode') }}</label>
          <InputText id="bill_zip" v-model="billingData.zip" class="billing-form__control" />
        </div>
        <div class="billing-form__field">
          <label class="billing-form__label" for="bill_city">{{ t('contacts.city') }}</label>
          <InputText id="bill_city" v-model="billingData.city" class="billing-form__control" />
        </div>

        <div class="billing-form__field billing-form__field--full">
          <label class="billing-form__label" for="bill_country">{{ t('contacts.country') }}</label>
          <Select
            id="bill_country"
            v-model="billingData.country"
            :options="[...countries]"
            optionLabel="name"
            filter
            class="billing-form__control"
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
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType, watch, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Message from 'primevue/message';
import type { ContactDetail } from '@/domain/entities/Contact';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { Info } from 'lucide-vue-next';
import CountryFlag from 'vue-country-flag-next';

import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { useUIStore } from '@/infrastructure/stores/ui';

import type { CountryState } from '@/domain/entities/CountryState';
import type { Country } from '@/domain/entities/Country';

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
      type: Object as PropType<ContactDetail | null>,
      required: true,
    },
  },
  emits: ['update:modelValue'],

  setup(props) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const countryStatesStore = useCountryStatesStore();
    const documentTypesStore = useDocumentTypesStore();
    const uiStore = useUIStore();

    const billingData = reactive({
      fiscalIdNumber: '',
      fiscalIdNumberType: null as number | null,
      street: '',
      city: '',
      zip: '',
      state: undefined as CountryState | undefined,
      country: undefined as Country | undefined,
    });

    const billingAddressMode = ref<'residence' | 'other'>('residence');

    const countries = computed(() => countriesStore.countries);
    const countryStates = computed(() => countryStatesStore.countryStates);

    const documentTypes = computed(() => documentTypesStore.documentTypes);

    const residenceAddressText = computed(() => {
      if (!props.modelValue) return '';
      const parts = [];
      if (props.modelValue.street) parts.push(props.modelValue.street);
      if (props.modelValue.city) parts.push(props.modelValue.city);
      if (props.modelValue.zipCode) parts.push(props.modelValue.zipCode);
      if (props.modelValue.state?.name) parts.push(props.modelValue.state.name);
      if (props.modelValue.country?.name) parts.push(props.modelValue.country.name);
      return parts.join(', ');
    });

    watch(billingAddressMode, () => {
      if (billingAddressMode.value === 'residence') {
        billingData.street = '';
        billingData.city = '';
        billingData.zip = '';
        billingData.country = undefined;
        billingData.state = undefined;
      }
    });
    watch(
      () => billingData.country,
      async () => {
        uiStore.startLoading();
        try {
          if (billingData.country?.id) {
            await countryStatesStore.fetchCountryStatesByCountryId(billingData.country.id);
            const countryStateToSelect = countryStatesStore.countryStates?.find(
              (s) => s.id === billingData.state?.id
            );
            if (countryStateToSelect && billingData.state) {
              billingData.state.id = countryStateToSelect.id;
            } else {
              billingData.state = undefined;
            }
          }
        } catch (error) {
          console.error('Error fetching country states:', error);
        } finally {
          uiStore.stopLoading();
        }
      },
      { immediate: true, deep: true }
    );
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
    gap: 12px;
  }

  &__field {
    :deep(.p-iftalabel) {
      display: block;
      width: 100%;
    }
    .billing-form__control {
      width: 100%;
    }
    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-dropdown),
    :deep(.p-inputwrapper) {
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

  &--clickable {
    cursor: pointer;
  }

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
    width: 680px !important;
  }
}
</style>
