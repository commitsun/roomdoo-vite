<template>
  <section class="personal-data-form">
    <div class="personal-data-form__header">
      {{ t('contacts.mandatoryFieldsText') }}
      <h1 class="personal-data-form__title">
        {{ t('contacts.basicInformation') }}
      </h1>
    </div>
    <div class="personal-data-form__grid">
      <!-- First Name  -->
      <div class="personal-data-form__field personal-data-form__field--full">
        <label class="personal-data-form__label" for="firstName">
          {{ t('contacts.firstName') }} *
        </label>
        <InputText
          id="firstName"
          v-model="personalData.firstName"
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
          v-model="personalData.lastName"
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
          v-model="personalData.lastName2"
          class="personal-data-form__control"
          :placeholder="t('contacts.secondLastNamePlaceholder')"
        />
      </div>
      <!-- Birthdate -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="birthdate">{{ birthdateLabel }}</label>
        <DatePicker
          id="birthdate"
          v-model="personalData.birthdate"
          showIcon
          dateFormat="dd/mm/yy"
          :maxDate="new Date()"
          class="personal-data-form__control"
          inputClass="personal-data-form__control-input"
        />
      </div>
      <!-- Gender -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="gender">{{
          t('contacts.gender.title')
        }}</label>

        <Select
          id="gender"
          v-model="personalData.gender"
          :options="genders"
          optionLabel="label"
          optionValue="value"
          class="personal-data-form__control"
        />
      </div>
      <!-- Nationality -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="nationality">{{
          t('contacts.nationality')
        }}</label>
        <Select
          id="nationality"
          v-model="personalData.nationalityId"
          :options="[...countries]"
          filter
          optionLabel="name"
          optionValue="id"
          class="personal-data-form__control"
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
          v-model="personalData.lang"
          :options="[...languages]"
          optionLabel="name"
          optionValue="code"
          class="personal-data-form__control"
        />
      </div>
      <!-- Email -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="email">{{ t('contacts.email') }}</label>
        <InputText id="email" v-model="personalData.email" class="personal-data-form__control" />
      </div>
      <!-- Phone -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="phone">{{ t('contacts.phone') }}</label>
        <InputText
          id="phone"
          v-model="personalData.phoneNumber"
          class="personal-data-form__control"
        />
      </div>
      <!-- Mobile -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="mobile">{{ t('contacts.mobile') }}</label>
        <InputText
          id="mobile"
          v-model="personalData.mobileNumber"
          class="personal-data-form__control"
        />
      </div>
      <!-- Residence data section -->
      <div class="personal-data-form__residence">
        <div class="personal-data-form__residence-title">
          {{ t('contacts.residenceData') }}
        </div>
        <Message severity="info">
          <template #icon>
            <Info :size="60" class="mr-1" />
          </template>
          <span>{{ t('contacts.residenceTextMessage') }}</span>
        </Message>
      </div>
      <!-- Address -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="street">{{
          t('contacts.residenceAddress')
        }}</label>
        <InputText id="street" v-model="personalData.street" class="personal-data-form__control" />
      </div>
      <!-- Zip -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="zip">{{ t('contacts.postalCode') }}</label>
        <InputText id="zip" v-model="personalData.zipCode" class="personal-data-form__control" />
      </div>
      <!-- City -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="city">{{ t('contacts.city') }}</label>
        <InputText id="city" v-model="personalData.city" class="personal-data-form__control" />
      </div>
      <!-- Country -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="country">{{ t('contacts.country') }}</label>
        <Select
          id="country"
          v-model="personalData.country"
          :options="[...countries]"
          optionLabel="name"
          filter
          class="personal-data-form__control"
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
      <!-- State -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="state">{{ t('contacts.state') }}</label>
        <Select
          id="state"
          v-model="personalData.state"
          :options="[...countryStates]"
          optionLabel="name"
          filter
          class="personal-data-form__control"
        />
      </div>
    </div>
  </section>
  <section></section>
</template>

<script lang="ts">
import { defineComponent, computed, watch, reactive, type PropType } from 'vue';
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
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import type { ContactDetail } from '@/domain/entities/Contact';
import type { CountryState } from '@/domain/entities/CountryState';
import type { Country } from '@/domain/entities/Country';

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

    const personalData = reactive({
      firstName: '',
      lastName: '',
      lastName2: '',
      birthdate: null as Date | null,
      nationalityId: 0,
      lang: '',
      gender: '',
      phoneNumber: '',
      mobileNumber: '',
      email: '',
      street: '',
      zipCode: '',
      city: '',
      state: undefined as CountryState | undefined,
      country: undefined as Country | undefined,
    });
    const countries = computed(() => countriesStore.countries);
    const contactsStoreSchema = computed(() => contactsStore.contactSchema);
    const languages = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);

    const countryStates = computed(() => countryStatesStore.countryStates);
    const showLastName2 = computed(
      () =>
        props.contactType === 'person' &&
        (contactsStoreSchema.value?.fields ?? []).includes('lastname2')
    );
    const age = computed(() => {
      if (!personalData.birthdate) return null;
      const today = new Date();
      let years = today.getFullYear() - personalData.birthdate.getFullYear();
      const m = today.getMonth() - personalData.birthdate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < personalData.birthdate.getDate())) years--;
      return years;
    });
    const birthdateLabel = computed(() =>
      age.value !== null
        ? `${t('contacts.birthDate')} (${age.value} ${t('contacts.yearsOld')})`
        : t('contacts.birthDate')
    );

    const genders = [
      { label: t('contacts.gender.female'), value: 'female' },
      { label: t('contacts.gender.male'), value: 'male' },
      { label: t('contacts.gender.other'), value: 'other' },
    ];
    const countryById = computed(() => {
      const m = new Map<number, { id: number; name: string; code: string }>();
      countries.value.forEach((c) => m.set(c.id, c));
      return m;
    });

    watch(
      personalData,
      () => {
        // context.emit('update:modelValue', { ...props.modelValue, ...personalData });
        console.log('Personal data changed:', personalData);
      },
      { immediate: true, deep: true }
    );
    watch(
      () => props.modelValue,
      (v) => {
        personalData.firstName = props.modelValue.firstname || '';
        personalData.lastName = props.modelValue.lastname || '';
        personalData.lastName2 = props.modelValue.lastname2 || '';
        personalData.birthdate = props.modelValue.birthdate
          ? new Date(props.modelValue.birthdate)
          : null;
        personalData.nationalityId = props.modelValue.nationality?.id || 0;
        personalData.lang = props.modelValue.lang?.replace('_', '-') || '';
        personalData.gender = props.modelValue.gender || '';
        personalData.phoneNumber =
          props.modelValue.phones?.filter((p) => p.type === 'phone')[0]?.number || '';
        personalData.mobileNumber =
          props.modelValue.phones?.filter((p) => p.type === 'mobile')[0]?.number || '';
        personalData.email = props.modelValue.email || '';
        personalData.street = props.modelValue.street || '';
        personalData.zipCode = props.modelValue.zipCode || '';
        personalData.city = props.modelValue.city || '';
        personalData.country = props.modelValue.country || undefined;
        personalData.state = props.modelValue.state || undefined;
      },
      { immediate: true, deep: true }
    );
    watch(
      () => personalData.country,
      async () => {
        uiStore.startLoading();
        try {
          if (personalData.country) {
            await countryStatesStore.fetchCountryStatesByCountryId(personalData.country.id);
            const countryStateToSelect = countryStatesStore.countryStates?.find(
              (s) => s.id === personalData.state?.id
            );
            if (countryStateToSelect && personalData.state) {
              personalData.state.id = countryStateToSelect.id;
            } else {
              personalData.state = undefined;
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
      personalData,
      countries,
      showLastName2,
      age,
      birthdateLabel,
      languages,
      genders,
      countryById,
      countryStates,
      t,
    };
  },
});
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

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

  &__title {
    font-size: 16px;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.2rem;
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
  &__residence-title {
    font-size: 14px;
    color: #475569;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
}

@media (min-width: 1024px) {
  .personal-data-form {
    max-width: none;
    &::before {
      inset-inline: 0;
    }
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 12px;
    }
    &__field--full {
      grid-column: 1 / -1;
    }
  }
}
</style>
