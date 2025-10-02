<template>
  <section class="billing-form">
    <div class="billing-form__grid">
      <div class="billing-form__field billing-form__field--full">
        <IftaLabel>
          <InputText id="legalName" v-model="model.legalName" class="billing-form__control" />
          <label for="legalName">{{ t('contacts.legalName') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field">
        <IftaLabel>
          <Select
            id="fiscalIdNumberType"
            :options="[...documentTypes]"
            optionLabel="name"
            optionValue="id"
            class="billing-form__control"
            disabled
          />
          <label for="fiscalIdNumberType">{{ t('contacts.taxDocumentType') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field">
        <IftaLabel>
          <InputText
            id="fiscalIdNumber"
            v-model="model.fiscalIdNumber"
            class="billing-form__control"
          />
          <label for="fiscalIdNumber">{{ t('contacts.taxDocumentNumber') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field billing-form__field--full">
        <IftaLabel>
          <InputText id="address" v-model="model.street" class="billing-form__control" />
          <label for="address">{{ t('contacts.address') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field">
        <IftaLabel>
          <InputText id="zipCode" v-model="model.zipCode" class="billing-form__control" />
          <label for="zipCode">{{ t('contacts.postalCode') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field">
        <IftaLabel>
          <InputText id="city" v-model="model.city" class="billing-form__control" />
          <label for="city">{{ t('contacts.city') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field">
        <IftaLabel>
          <Select
            id="country"
            v-model="model.countryId"
            :options="[...countries]"
            optionLabel="name"
            optionValue="id"
            class="billing-form__control"
          />
          <label for="country">{{ t('contacts.country') }}</label>
        </IftaLabel>
      </div>

      <div class="billing-form__field">
        <IftaLabel>
          <Select
            id="state"
            v-model="model.stateId"
            :options="countryStates"
            optionLabel="label"
            optionValue="value"
            class="billing-form__control"
          />
          <label for="state">{{ t('contacts.state') }}</label>
        </IftaLabel>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import IftaLabel from 'primevue/iftalabel';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  form: any;
  countries: Array<any>;
  countryStates: Array<{ label: string; value: number }>;
  documentTypes?: Array<any>;
}>();
const emit = defineEmits<{ (e: 'update:form', v: any): void }>();

const model = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
});
const { t } = useI18n();
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

.billing-form {
  margin-inline: auto;

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
}

@media (min-width: $bp-desktop) {
  .billing-form {
    max-width: none;
    height: 310px;
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
@media (min-width: 1024px) {
  .billing-form {
    width: 680px !important;
  }
}
</style>
