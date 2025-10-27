<template>
  <section class="personal-data-form">
    <div class="personal-data-form__header">
      {{ t('contacts.mandatoryFieldsText') }}
      <h1 class="personal-data-form__title">
        {{ t('contacts.basicInformation') }}
      </h1>
    </div>
    <div class="personal-data-form__grid">
      <!-- First Name (full width) -->
      <div class="personal-data-form__field personal-data-form__field--full">
        <label class="personal-data-form__label" for="firstName">
          {{ t('contacts.firstName') }} *
        </label>
        <InputText
          id="firstName"
          v-model="modelValue.firstname"
          class="personal-data-form__control"
          :placeholder="t('contacts.firstNamePlaceholder')"
        />
      </div>
      <!-- Last Names -->
      <div
        class="personal-data-form__field"
        :class="{ 'personal-data-form__field--full': !showLastName2 }"
        v-if="contactType === 'person'"
      >
        <label class="personal-data-form__label" for="lastName">{{ t('contacts.lastName') }}</label>
        <InputText
          id="lastName"
          v-model="modelValue.lastname"
          class="personal-data-form__control"
          :placeholder="t('contacts.lastNamePlaceholder')"
        />
      </div>
      <div class="personal-data-form__field" v-if="showLastName2">
        <label class="personal-data-form__label" for="lastName2">{{
          t('contacts.secondLastName')
        }}</label>
        <InputText
          id="lastName2"
          v-model="modelValue.lastname2"
          class="personal-data-form__control"
          :placeholder="t('contacts.secondLastNamePlaceholder')"
        />
      </div>
      <!-- Birthdate -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="birthdate">{{ birthdateLabel }}</label>
        <DatePicker
          id="birthdate"
          :modelValue="modelValue.birthdate"
          @update:modelValue="(value) => (modelValue.birthdate = value as Date | null)"
          showIcon
          dateFormat="dd/mm/yy"
          :maxDate="new Date()"
          class="personal-data-form__control"
          inputClass="personal-data-form__control-input"
          :placeholder="t('contacts.datePlaceholder')"
        />
      </div>
      <!-- Gender -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="gender">{{
          t('contacts.gender.title')
        }}</label>
        <Select
          id="gender"
          v-model="modelValue.gender"
          :options="genders"
          optionLabel="label"
          optionValue="value"
          class="personal-data-form__control"
          :placeholder="t('contacts.select')"
        />
      </div>
      <!-- Nationality -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="nationality">{{
          t('contacts.nationality')
        }}</label>
        <Select
          id="nationality"
          :modelValue="modelValue.nationality?.id ?? null"
          :options="[...countries]"
          optionLabel="name"
          optionValue="id"
          filter
          class="personal-data-form__control"
          :placeholder="t('contacts.select')"
          @update:modelValue="
            (id) => {
              const c = countries.find((c) => c.id === id);
              $emit('update:modelValue', { ...modelValue, nationality: c || undefined });
            }
          "
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center w-full gap-1">
              <CountryFlag
                :country="countryById.get(value)?.code?.toLowerCase() || ''"
                size="small"
                shadow
              />
              <span class="whitespace-nowrap">{{ countryById.get(value)?.name }}</span>
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
      <!-- Language -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="lang">{{ t('contacts.language') }}</label>
        <Select
          id="lang"
          v-model="modelValue.lang"
          :options="[...languages]"
          optionLabel="name"
          optionValue="code"
          class="personal-data-form__control"
          :placeholder="t('contacts.select')"
        />
      </div>
      <div class="personal-data-form__field personal-data-form__field--full">
        <h1 class="personal-data-form__title">{{ t('contacts.contactData') }}</h1>
      </div>
      <div class="personal-data-form__field personal-data-form__field--full">
        <!-- Email  -->
        <label class="personal-data-form__label" for="email">{{ t('contacts.email') }}</label>
        <InputText
          id="email"
          v-model="modelValue.email"
          class="personal-data-form__control"
          :placeholder="t('contacts.emailPlaceholder')"
        />
      </div>
      <!-- Phone -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="phone">{{ t('contacts.phone') }}</label>
        <InputText
          id="phone"
          :modelValue="modelValue.phones?.filter((p) => p.type === 'phone')[0]?.number"
          class="personal-data-form__control"
          :placeholder="t('contacts.phonePlaceholder')"
        />
      </div>
      <!-- Mobile -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="mobile">{{ t('contacts.mobile') }}</label>
        <InputText
          id="mobile"
          :modelValue="modelValue.phones?.filter((p) => p.type === 'mobile')[0]?.number"
          class="personal-data-form__control"
          :placeholder="t('contacts.mobilePlaceholder')"
        />
      </div>
      <!-- Residence data section  -->
      <div class="personal-data-form__residence personal-data-form__field--full">
        <h1 class="personal-data-form__title">
          {{ t('contacts.residenceData') }}
        </h1>
        <Message severity="info" icon="pi pi-info-circle" v-if="sameFiscalAndResidenceAddress">
          <span>{{ t('contacts.residenceTextMessage') }}</span>
        </Message>
      </div>
      <!-- Address -->
      <div class="personal-data-form__field personal-data-form__field--full">
        <label class="personal-data-form__label" for="street">{{
          t('contacts.residenceAddress')
        }}</label>
        <InputText
          id="street"
          v-model="modelValue.residenceStreet"
          class="personal-data-form__control"
          :placeholder="t('contacts.residenceAddressPlaceholder')"
        />
      </div>
      <!-- Zip -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="zip">{{ t('contacts.postalCode') }}</label>
        <InputText
          id="zip"
          v-model="modelValue.residenceZip"
          class="personal-data-form__control"
          :placeholder="t('contacts.zipCodePlaceholder')"
        />
      </div>
      <!-- City -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="city">{{ t('contacts.city') }}</label>
        <InputText
          id="city"
          v-model="modelValue.residenceCity"
          class="personal-data-form__control"
          :placeholder="t('contacts.cityPlaceholder')"
        />
      </div>
      <!-- Country -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="country">{{ t('contacts.country') }}</label>
        <Select
          id="country"
          :modelValue="modelValue.residenceCountry?.id ?? null"
          :options="[...countries]"
          optionLabel="name"
          optionValue="id"
          filter
          class="personal-data-form__control"
          :placeholder="t('contacts.select')"
          @update:modelValue="
            (id) => {
              const c = countries.find((c) => c.id === id);
              const residenceCountry = c ? { id: c.id, name: c.name } : undefined;
              console.log(residenceCountry);
              $emit('update:modelValue', {
                ...modelValue,
                residenceCountry: residenceCountry || undefined,
              });
            }
          "
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center w-full gap-1">
              <CountryFlag
                :country="countryById.get(value)?.code?.toLowerCase() || ''"
                size="small"
                shadow
              />
              <span class="whitespace-nowrap">{{ countryById.get(value)?.name }}</span>
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
      <!-- State -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="state">{{ t('contacts.state') }}</label>
        <Select
          id="state"
          :modelValue="modelValue.residenceState?.id ?? null"
          :options="[...countryStates]"
          optionLabel="name"
          optionValue="id"
          filter
          class="personal-data-form__control"
          :placeholder="t('contacts.select')"
          @update:modelValue="
            (id) => {
              const s = countryStates.find((s) => s.id === id);
              $emit('update:modelValue', { ...modelValue, residenceState: s || undefined });
            }
          "
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
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import CountryFlag from 'vue-country-flag-next';
import { Info } from 'lucide-vue-next';

import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import type { ContactDetail } from '@/domain/entities/Contact';

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
  },
  components: {
    IftaLabel,
    InputText,
    Select,
    DatePicker,
    Message,
    CountryFlag,
    Info,
  },
  emits: ['update:modelValue'],
  setup(props, context) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const countryStatesStore = useCountryStatesStore();
    const contactsStore = useContactsStore();
    const instanceStore = useInstanceStore();
    const uiStore = useUIStore();
    const textMessageStore = useTextMessagesStore();
    const phoneNumber = ref('');
    const mobileNumber = ref('');
    const countries = computed(() => countriesStore.countries);
    const contactsStoreSchema = computed(() => contactsStore.contactSchema);
    const languages = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);
    const countryStates = computed(() => countryStatesStore.countryStates);
    const showLastName2 = computed(
      () =>
        props.contactType === 'person' &&
        (contactsStoreSchema.value?.fields ?? []).includes('lastname2')
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
        : t('contacts.birthDate')
    );
    const countryById = computed(() => {
      const m = new Map<number, { id: number; name: string; code: string }>();
      countries.value.forEach((c) => m.set(c.id, c));
      return m;
    });
    const sameFiscalAndResidenceAddress = computed(() => {
      return (
        props.modelValue.street === props.modelValue.residenceStreet &&
        props.modelValue.city === props.modelValue.residenceCity &&
        props.modelValue.zipCode === props.modelValue.residenceZip &&
        props.modelValue.country?.id === props.modelValue.residenceCountry?.id &&
        props.modelValue.state?.id === props.modelValue.residenceState?.id
      );
    });
    const genders = [
      { label: t('contacts.gender.female'), value: 'female' },
      { label: t('contacts.gender.male'), value: 'male' },
      { label: t('contacts.gender.other'), value: 'other' },
    ];
    watch(
      () => props.modelValue.residenceCountry,
      async () => {
        uiStore.startLoading();
        try {
          if (props.modelValue.residenceCountry) {
            await countryStatesStore.fetchCountryStatesByCountryId(
              props.modelValue.residenceCountry.id
            );
            const countryStateToSelect = countryStatesStore.countryStates?.find(
              (s) => s.id === props.modelValue.state?.id
            );
            if (countryStateToSelect && props.modelValue.state) {
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
    return {
      countries,
      showLastName2,
      birthdateLabel,
      languages,
      genders,
      countryById,
      countryStates,
      phoneNumber,
      mobileNumber,
      sameFiscalAndResidenceAddress,
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

  &__header {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  &__title {
    font-size: 14px;
    color: #475569;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  &__field {
    .personal-data-form__control {
      width: 100%;
    }

    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-select-label),
    :deep(.p-datepicker),
    :deep(.p-inputwrapper) {
      width: 100%;
      font-size: 12px !important;
      height: 30px;
    }

    :deep(.p-datepicker .p-inputwrapper) {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: stretch;
    }

    :deep(.personal-data-form__control-input),
    :deep(.p-datepicker .p-inputtext) {
      width: 100%;
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

  &__residence {
    margin-top: 24px;
  }
}

@media (min-width: 1024px) {
  .personal-data-form {
    max-width: none;

    &::before {
      inset-inline: 0;
      background: #ffffff;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      align-items: start;
    }

    &__field {
      grid-column: auto / span 1;
      :deep(.p-inputtext),
      :deep(.p-select),
      :deep(.p-select-label),
      :deep(.p-datepicker),
      :deep(.p-inputwrapper) {
        font-size: 14px !important;
        height: 35px;
      }
    }
    &__field--full {
      grid-column: 1 / -1;
    }

    &__residence {
      grid-column: 1 / -1;
    }

    &__residence :deep(.p-message) {
      width: 100%;
    }
  }
}
</style>
