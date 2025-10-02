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
          :placeholder="t('contacts.firstName')"
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
      <!-- Nationality -->
      <div class="personal-data-form__field" v-if="contactType === 'person'">
        <label class="personal-data-form__label" for="nationality">{{
          t('contacts.nationality')
        }}</label>
        <Select
          id="nationality"
          v-model="personalData.nationalityId"
          :options="[...countries]"
          optionLabel="name"
          optionValue="id"
          class="personal-data-form__control"
        />
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
      <!-- Phone -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="phone">{{ t('contacts.phone') }}</label>
        <InputText
          id="phone"
          v-model="personalData.phoneNumber"
          class="personal-data-form__control"
        />
      </div>
      <!-- Email -->
      <div class="personal-data-form__field">
        <label class="personal-data-form__label" for="email">{{ t('contacts.email') }}</label>
        <InputText id="email" v-model="personalData.email" class="personal-data-form__control" />
      </div>
    </div>
  </section>
  <section></section>
</template>

<script lang="ts">
import { defineComponent, computed, watch, onMounted, reactive, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';

import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import type { ContactDetail } from '@/domain/entities/Contact';

export default defineComponent({
  props: {
    contact: {
      type: Object as PropType<ContactDetail | null>,
      required: false,
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
  },
  emits: ['updatePersonalData'],
  setup(props, context) {
    const { t } = useI18n();
    const countriesStore = useCountriesStore();
    const contactsStore = useContactsStore();
    const instanceStore = useInstanceStore();

    const personalData = reactive({
      firstName: '',
      lastName: '',
      lastName2: '',
      birthdate: null as Date | null,
      nationalityId: 0,
      lang: '',
      gender: '',
      phoneNumber: '',
      email: '',
    });
    const countries = computed(() => countriesStore.countries);
    const contactsStoreSchema = computed(() => contactsStore.contactSchema);
    const languages = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);

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

    watch(
      personalData,
      () => {
        context.emit('updatePersonalData', personalData);
      },
      { deep: true }
    );

    onMounted(() => {
      if (props.contact) {
        personalData.firstName = props.contact.firstname || '';
        personalData.lastName = props.contact.lastname || '';
        personalData.lastName2 = props.contact.lastname2 || '';
        personalData.birthdate = props.contact.birthdate ? new Date(props.contact.birthdate) : null;
        personalData.nationalityId = props.contact.nationality?.id || 0;
        personalData.lang = props.contact.lang?.replace('_', '-') || '';
        personalData.gender = props.contact.gender || '';
        personalData.phoneNumber = props.contact.phones?.[0]?.number || '';
        personalData.email = props.contact.email || '';
      }
    });

    return {
      t,
      personalData,
      countries,
      showLastName2,
      age,
      birthdateLabel,
      languages,
      genders,
    };
  },
});
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

.personal-data-form {
  margin-inline: auto;

  &__title {
    font-size: 16px;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  &__field {
    .personal-data-form__control {
      width: 100%;
    }

    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-dropdown),
    :deep(.p-datepicker),
    :deep(.p-inputwrapper) {
      width: 100%;
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

@media (min-width: 1024px) {
  .personal-data-form {
    max-width: none;
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
