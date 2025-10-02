<template>
  <section class="settings-form">
    <div class="settings-form__grid">
      <div class="settings-form__field">
        <IftaLabel>
          <Select
            id="paymentTerm"
            v-model="model.paymentTermId"
            :options="[...paymentTerms]"
            optionLabel="name"
            optionValue="id"
            class="settings-form__control"
          />
          <label for="paymentTerm">{{ t('contacts.paymentTerm') }}</label>
        </IftaLabel>
      </div>

      <div class="settings-form__field">
        <IftaLabel>
          <Select
            id="pricelist"
            v-model="model.pricelistId"
            :options="[...pricelists]"
            optionLabel="label"
            optionValue="value"
            class="settings-form__control"
          />
          <label for="rate">{{ t('contacts.pricelistAssociated') }}</label>
        </IftaLabel>
      </div>

      <div class="settings-form__field">
        <IftaLabel>
          <Select
            id="invoicingPolicy"
            v-model="model.invoicingPolicy"
            :options="invoicingPolicies"
            optionLabel="label"
            optionValue="value"
            class="settings-form__control"
          />
          <label for="invoicingPolicy">{{ t('contacts.invoicingPolicy') }}</label>
        </IftaLabel>
      </div>

      <div class="settings-form__field">
        <IftaLabel>
          <InputText id="ref" v-model="model.reference" class="settings-form__control" />
          <label for="ref">{{ t('contacts.internalReference') }}</label>
        </IftaLabel>
      </div>

      <div class="settings-form__field settings-form__field--full">
        <label class="settings-form__label" for="tagsInput">{{ t('contacts.tags') }}</label>
        <div class="tags-field">
          <Chip
            v-for="tag in contactForm.tags"
            :key="tag.id"
            :label="tag.name"
            removable
            @remove="removeTag(tag.id)"
          />
          <Select
            :key="selectResetKey"
            id="tagsInput"
            v-model="tagDraftId"
            :options="[...tags.filter((t) => !contactForm.tags.some((ct) => ct.id === t.id))]"
            optionLabel="name"
            optionValue="id"
            class="tags-field__input"
            :placeholder="$options.length ? ` ${t('contacts.selectTag')} ` : ''"
            @update:modelValue="onTagSelected"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import IftaLabel from 'primevue/iftalabel';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  form: any;
  paymentTerms: Array<any>;
  pricelists: Array<{ label: string; value: number }>;
  invoicingPolicies: Array<{ label: string; value: string }>;
  tags: Array<{ id: number; name: string }>;
}>();

const emit = defineEmits<{ (e: 'update:form', v: any): void }>();
const model = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
});
const tagDraftId = ref(0);
const selectResetKey = ref(0);
const { t } = useI18n();
const clearTagSelect = () => {
  tagDraftId.value = 0;
  selectResetKey.value++;
};

const onTagSelected = (id: number) => {
  if (!id) return;
  const selected = tags.value.find((t) => t.id === id);
  if (!selected) return;

  const exists = contactForm.tags.some((t) => t.id === selected.id);
  if (!exists) contactForm.tags.push(selected);

  clearTagSelect();
};

const removeTag = (id: number) => {
  const idx = contactForm.tags.findIndex((t) => t.id === id);
  if (idx !== -1) contactForm.tags.splice(idx, 1);
  if (tagDraftId.value === id) {
    clearTagSelect();
  }
};
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

.settings-form {
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
    .settings-form__control {
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
    font-size: 0.875rem;
    color: var(--text-color-secondary, #6b7280);
    margin-bottom: 6px;
  }
}

@media (min-width: $bp-desktop) {
  .settings-form {
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
  .settings-form {
    width: 680px !important;
  }
}
</style>
