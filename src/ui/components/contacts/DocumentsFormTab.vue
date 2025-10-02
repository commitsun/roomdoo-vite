<template>
  <section class="documents-form">
    <div v-for="(doc, idx) in model.documents" :key="doc.id ?? idx" class="documents-form__group">
      <div class="documents-form__group-grid">
        <div class="documents-form__field">
          <IftaLabel>
            <Select
              :id="`doc-country-${idx}`"
              v-model="(doc.country ?? (doc.country = { id: null })).id"
              :options="[...countries]"
              optionLabel="name"
              optionValue="id"
              class="documents-form__control"
            />
            <label :for="`doc-country-${idx}`">{{ t('contacts.issueCountry') }}</label>
          </IftaLabel>
        </div>

        <div class="documents-form__field">
          <IftaLabel>
            <Select
              :id="`doc-type-${idx}`"
              v-model="(doc.category ?? (doc.category = { id: null })).id"
              :options="[...documentTypes]"
              optionLabel="name"
              optionValue="id"
              class="documents-form__control"
            />
            <label :for="`doc-type-${idx}`">{{ t('contacts.documentType') }}</label>
          </IftaLabel>
        </div>

        <div class="documents-form__field">
          <IftaLabel>
            <InputText
              :id="`doc-number-${idx}`"
              v-model="doc.name"
              class="documents-form__control"
              autocomplete="off"
            />
            <label :for="`doc-number-${idx}`">{{ t('contacts.documentNumber') }}</label>
          </IftaLabel>
        </div>

        <div class="documents-form__field">
          <IftaLabel>
            <InputText
              :id="`doc-support-${idx}`"
              v-model="doc.supportNumber"
              class="documents-form__control"
              autocomplete="off"
            />
            <label :for="`doc-support-${idx}`">{{ t('contacts.supportNumber') }}</label>
          </IftaLabel>
        </div>
      </div>
    </div>

    <div class="documents-form__actions">
      <div class="documents-form__actions-left">
        <div v-if="!hasDraftDoc">
          <Button
            :label="t('contacts.addDocument')"
            icon="pi pi-plus"
            severity="secondary"
            @click="startAddDocument"
          />
        </div>
        <div v-else class="flex gap-2">
          <Button
            :label="t('contacts.cancel')"
            icon="pi pi-times"
            text
            @click="cancelAddDocument"
          />
          <!--
          <Button
            :disabled="!canSaveDraft"
            :label="t('contacts.saveDocument')"
            icon="pi pi-check"
            severity="secondary"
            @click="saveDraftDocument"
          />
          -->
        </div>
      </div>
      <div class="documents-form__actions-right" v-if="hasDraftDoc"></div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import IftaLabel from 'primevue/iftalabel';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const props = defineProps<{
  form: any;
  countries: Array<any>;
  documentTypes: Array<any>;
}>();
const emit = defineEmits<{ (e: 'update:form', v: any): void }>();

const { t } = useI18n();

const model = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
});

const draftDoc = computed(() => model.value.documents.find((d: any) => d._isDraft) || null);
const hasDraftDoc = computed(() => !!draftDoc.value);

const canSaveDraft = computed(() => {
  const d: any = draftDoc.value;
  if (!d) return false;
  const numberOk = !!d.name?.trim();
  const countryOk = !!d.country?.id;
  const typeOk = !!d.category?.id;
  return numberOk && countryOk && typeOk;
});

function startAddDocument() {
  if (hasDraftDoc.value) return;
  model.value.documents.push({
    name: '',
    supportNumber: '',
    country: { id: null },
    category: { id: null },
    _isDraft: true,
  } as any);
}

function cancelAddDocument() {
  const idx = model.value.documents.findIndex((d: any) => d._isDraft);
  if (idx !== -1) model.value.documents.splice(idx, 1);
}

function saveDraftDocument() {
  // Si quieres delegar al padre, emite; si lo haces aquí, llama a tu store.
  // emit('save-draft-document');
}
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

.documents-form {
  margin-inline: auto;

  &__group + &__group {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--surface-border, #6b7280);
  }

  &__group-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  &__field {
    :deep(.p-iftalabel) {
      display: block;
      width: 100%;
    }
    .documents-form__control {
      width: 100%;
    }
    :deep(.p-inputtext),
    :deep(.p-select),
    :deep(.p-dropdown),
    :deep(.p-inputwrapper) {
      width: 100%;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }
  &__actions-left,
  &__actions-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

@media (min-width: $bp-desktop) {
  .documents-form {
    max-width: none;
    height: 310px;
    &__group-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 12px;
    }
  }
}
@media (min-width: 1024px) {
  .documents-form {
    width: 680px !important;
  }
}
</style>
