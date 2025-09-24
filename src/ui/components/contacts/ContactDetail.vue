<template>
  <SelectButton
    class="mb-3"
    v-model="contactType"
    :options="contactTypeOptions"
    :allowEmpty="false"
    optionLabel="label"
    optionValue="value"
  >
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <i
          :class="{
            'pi pi-user': slotProps.option.value === 'person',
            'pi pi-building': slotProps.option.value === 'company',
            'pi pi-briefcase': slotProps.option.value === 'agency',
          }"
        />
        <span>{{ slotProps.option.label }}</span>
      </div>
    </template>
  </SelectButton>
  <Tabs v-model:value="activeTab">
    <TabList>
      <Tab value="0" as="div" class="flex items-center gap-2">
        <i class="pi pi-user-edit" />
        <span> {{ t('contacts.contact') }} </span>
      </Tab>
      <Tab value="1" as="div" class="flex items-center gap-2" v-if="contactType === 'person'">
        <i class="pi pi-id-card" />
        <span> {{ t('contacts.documents') }} </span>
      </Tab>
      <Tab value="2" as="div" class="flex items-center gap-2">
        <i class="pi pi-money-bill" />
        <span> {{ t('contacts.invoicing') }} </span>
      </Tab>
      <Tab value="3" as="div" class="flex items-center gap-2">
        <i class="pi pi-cog" />
        <span> {{ t('contacts.settings') }} </span>
      </Tab>
      <Tab value="4" as="div" class="flex items-center gap-2">
        <i class="pi pi-pen-to-square" />
        <span> {{ t('contacts.internalnotes') }} </span>
      </Tab>
    </TabList>
    <TabPanels>
      <!-- FIRST TAB -->
      <TabPanel value="0">
        <section class="contact-form">
          <div class="contact-form__grid">
            <!-- First Name  -->
            <div class="contact-form__field contact-form__field--full">
              <IftaLabel>
                <InputText
                  id="firstName"
                  v-model="contactForm.firstName"
                  class="contact-form__control"
                />
                <label for="firstName">{{ t('contacts.firstName') }}</label>
              </IftaLabel>
            </div>

            <!-- Last Names -->
            <div
              class="contact-form__field"
              :class="{ 'contact-form__field--full': !showLastName2 }"
              v-if="contactType === 'person'"
            >
              <IftaLabel>
                <InputText
                  id="lastName1"
                  v-model="contactForm.lastName1"
                  class="contact-form__control"
                />
                <label for="lastName1">{{ t('contacts.lastName') }}</label>
              </IftaLabel>
            </div>
            <div class="contact-form__field" v-if="showLastName2">
              <IftaLabel>
                <InputText
                  id="lastName2"
                  v-model="contactForm.lastName2"
                  class="contact-form__control"
                />
                <label for="lastName2">{{ t('contacts.secondLastName') }}</label>
              </IftaLabel>
            </div>
            <!-- Birthdate -->
            <div class="contact-form__field" v-if="contactType === 'person'">
              <IftaLabel>
                <DatePicker
                  id="birthdate"
                  v-model="contactForm.birthdate"
                  showIcon
                  dateFormat="dd/mm/yy"
                  :maxDate="new Date()"
                  class="contact-form__control"
                  inputClass="contact-form__control-input"
                />
                <label for="birthdate">{{ birthdateLabel }}</label>
              </IftaLabel>
            </div>
            <!-- Nationality -->
            <div class="contact-form__field" v-if="contactType === 'person'">
              <IftaLabel>
                <Select
                  id="nationality"
                  v-model="(contactForm.nationality ?? { id: 0 }).id"
                  :options="[...countries]"
                  optionLabel="name"
                  optionValue="id"
                  class="contact-form__control"
                />
                <label for="nationality">{{ t('contacts.nationality') }}</label>
              </IftaLabel>
            </div>
            <!-- Language -->
            <div class="contact-form__field">
              <IftaLabel>
                <Select
                  id="lang"
                  :modelValue="(contactForm.lang ?? '').replaceAll('_', '-')"
                  :options="[...languages]"
                  optionLabel="name"
                  optionValue="code"
                  class="contact-form__control"
                />
                <label for="language">{{ t('contacts.language') }}</label>
              </IftaLabel>
            </div>
            <!-- Gender -->
            <div class="contact-form__field" v-if="contactType === 'person'">
              <IftaLabel>
                <Select
                  id="gender"
                  v-model="contactForm.gender"
                  :options="genders"
                  optionLabel="label"
                  optionValue="value"
                  class="contact-form__control"
                />
                <label for="gender">{{ t('contacts.gender.title') }}</label>
              </IftaLabel>
            </div>
            <!-- Phone -->
            <div class="contact-form__field">
              <IftaLabel>
                <InputText id="phone" v-model="contactForm.phone" class="contact-form__control" />
                <label for="phone">{{ t('contacts.phone') }}</label>
              </IftaLabel>
            </div>
            <!-- Email -->
            <div class="contact-form__field">
              <IftaLabel>
                <InputText id="email" v-model="contactForm.email" class="contact-form__control" />
                <label for="email">{{ t('contacts.email') }}</label>
              </IftaLabel>
            </div>
          </div>
        </section>
      </TabPanel>
      <TabPanel value="1">
        <section class="documents-form">
          <div
            v-for="(doc, idx) in contactForm.documents"
            :key="doc.id ?? idx"
            class="documents-form__group"
          >
            <div class="documents-form__group-grid">
              <!-- Document Issuing Country -->
              <div class="documents-form__field">
                <IftaLabel>
                  <Select
                    :id="`doc-country`"
                    v-model="(doc.country ?? { id: 0 }).id"
                    :options="[...countries]"
                    optionLabel="name"
                    optionValue="id"
                    class="documents-form__control"
                  />
                  <label :for="`doc-country-${idx}`">{{ t('contacts.issueCountry') }}</label>
                </IftaLabel>
              </div>
              <!-- Document Type -->
              <div class="documents-form__field">
                <IftaLabel>
                  <Select
                    :id="`doc-type-${idx}`"
                    v-model="(doc.category ?? { id: 0 }).id"
                    :options="[...documentTypes]"
                    optionLabel="name"
                    optionValue="id"
                    class="documents-form__control"
                  />
                  <label :for="`doc-type-${idx}`">{{ t('contacts.documentType') }}</label>
                </IftaLabel>
              </div>
              <!-- Document Number -->
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
              <!-- Document Support Number -->
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
          <!-- Document Actions -->
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
                <Button
                  :label="t('contacts.saveDocument')"
                  icon="pi pi-check"
                  severity="secondary"
                  @click="saveDraftDocument"
                />
              </div>
            </div>
            <div class="documents-form__actions-right" v-if="hasDraftDoc"></div>
          </div>
        </section>
      </TabPanel>
      <TabPanel value="2">
        <section class="billing-form">
          <div class="billing-form__grid">
            <!-- Legal First Name -->
            <div class="billing-form__field billing-form__field--full">
              <IftaLabel>
                <InputText
                  id="legalName"
                  v-model="contactForm.legalName"
                  class="billing-form__control"
                />
                <label for="legalName">{{ t('contacts.legalName') }}</label>
              </IftaLabel>
            </div>
            <!-- Fiscal Document -->
            <div class="billing-form__field">
              <IftaLabel>
                <Select
                  id="fiscalIdNumberType"
                  v-model="contactForm.fiscalIdNumberType"
                  :options="[...documentTypes]"
                  optionLabel="name"
                  optionValue="id"
                  class="billing-form__control"
                />
                <label for="fiscalIdNumberType">{{ t('contacts.taxDocumentType') }}</label>
              </IftaLabel>
            </div>
            <div class="billing-form__field">
              <IftaLabel>
                <InputText
                  id="fiscalIdNumber"
                  v-model="contactForm.fiscalIdNumber"
                  class="billing-form__control"
                />
                <label for="fiscalIdNumber">{{ t('contacts.taxDocumentNumber') }}</label>
              </IftaLabel>
            </div>
            <!-- Fiscal address -->
            <div class="billing-form__field billing-form__field--full">
              <IftaLabel>
                <InputText
                  id="address"
                  v-model="contactForm.street"
                  class="billing-form__control"
                />
                <label for="address">{{ t('contacts.address') }}</label>
              </IftaLabel>
            </div>
            <div class="billing-form__field">
              <IftaLabel>
                <InputText id="zip" v-model="contactForm.zip" class="billing-form__control" />
                <label for="zip">{{ t('contacts.postalCode') }}</label>
              </IftaLabel>
            </div>
            <div class="billing-form__field">
              <IftaLabel>
                <InputText id="city" v-model="contactForm.city" class="billing-form__control" />
                <label for="city">{{ t('contacts.city') }}</label>
              </IftaLabel>
            </div>
            <div class="billing-form__field">
              <IftaLabel>
                <Select
                  id="country"
                  v-model="(contactForm.country ?? { id: 0 }).id"
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
                  v-model="(contactForm.state ?? { id: 0 }).id"
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
      </TabPanel>
      <TabPanel value="3">
        <section class="settings-form">
          <div class="settings-form__grid">
            <div class="settings-form__field">
              <IftaLabel>
                <Select
                  id="paymentTerm"
                  v-model="(contactForm.paymentTerm ?? { id: 0 }).id"
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
                  v-model="(contactForm.pricelist ?? { id: 0 }).id"
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
                  v-model="contactForm.invoicingPolicy"
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
                <InputText
                  id="ref"
                  v-model="contactForm.reference"
                  class="settings-form__control"
                />
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
      </TabPanel>
      <TabPanel value="4">
        <section class="internal-notes">
          <Textarea v-model="contactForm.internalNotes" rows="5" readonly />
        </section>
      </TabPanel>
    </TabPanels>
  </Tabs>
  <div class="flex justify-end">
    <Button
      :label="t('contacts.cancel')"
      icon="pi pi-times"
      class="mt-4 mr-2"
      text
      @click="handleCancel"
    />
    <Button :label="t('contacts.save')" icon="pi pi-check" class="mt-4" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, watch, inject } from 'vue';
import SelectButton from 'primevue/selectbutton';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Chip from 'primevue/chip';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

import DatePicker from 'primevue/datepicker';
import type { ContactDetail } from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import type { CountryState } from '@/domain/entities/CountryState';
import type { Country } from '@/domain/entities/Country';
import type { Pricelist } from '@/domain/entities/Pricelist';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { usePaymentTermsStore } from '@/infrastructure/stores/paymentTerms';
import { usePricelistStore } from '@/infrastructure/stores/pricelist';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useTagsStore } from '@/infrastructure/stores/tags';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import IftaLabel from 'primevue/iftalabel';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

import type { PaymentTerm } from '@/domain/entities/PaymentTerm';
import type { Tag } from '@/domain/entities/Tag';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';

import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    SelectButton,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    InputText,
    Select,
    DatePicker,
    IftaLabel,
    Chip,
    Textarea,
    Button,
  },
  props: {
    contact: {
      type: Object as () => ContactDetail | null,
      required: false,
    },
  },

  setup(props) {
    const contactsStore = useContactsStore();
    const countriesStore = useCountriesStore();
    const countryStatesStore = useCountryStatesStore();
    const paymentTermsStore = usePaymentTermsStore();
    const pricelistStore = usePricelistStore();
    const documentTypesStore = useDocumentTypesStore();
    const tagsStore = useTagsStore();
    const uiStore = useUIStore();
    const instanceStore = useInstanceStore();
    const dialogRef = inject<any>('dialogRef');
    const { t } = useI18n();

    const contactType = ref('person');
    const contactTypeOptions = ref([
      { label: t('contacts.person'), value: 'person' },
      { label: t('contacts.company'), value: 'company' },
      { label: t('contacts.agency'), value: 'agency' },
    ]);
    const tagDraftId = ref(0);
    const selectResetKey = ref(0);
    const activeTab = ref('0');
    const tagsInputRef = ref<HTMLInputElement | null>(null);
    const hasDraftDoc = ref(false);

    const contactForm = reactive({
      firstName: '',
      lastName1: '',
      lastName2: '',
      birthdate: null as Date | null,
      nationality: null as Country | null,
      lang: '',
      gender: '',
      phone: '',
      email: '',
      documents: [] as PersonalDocument[],
      legalName: '',
      fiscalIdNumberType: null as DocumentType | null,
      fiscalIdNumber: '',
      street: '',
      zip: '',
      city: '',
      state: null as CountryState | null,
      country: null as Country | null,
      paymentTerm: null as PaymentTerm | null,
      pricelist: null as Pricelist | null,
      invoicingPolicy: '',
      reference: '',
      tags: [] as Tag[],
      internalNotes: '',
    });

    const countries = computed(() => countriesStore.countries);
    const contactsStoreSchema = computed(() => contactsStore.contactSchema);
    const paymentTerms = computed(() => paymentTermsStore.paymentTerms);
    const tags = computed(() => tagsStore.tags);
    const documentTypes = computed(() => documentTypesStore.documentTypes);
    const draftDoc = computed(() => contactForm.documents.find((d: any) => d._isDraft) || null);
    const languages = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);

    const showLastName2 = computed(
      () =>
        contactType.value === 'person' &&
        (contactsStoreSchema.value?.fields ?? []).includes('lastname2'),
    );

    const countryStates = computed(() =>
      countryStatesStore.countryStates?.map((state) => ({
        label: state.name,
        value: state.id,
      })),
    );

    const age = computed(() => {
      if (!contactForm.birthdate) {
        return null;
      }
      const today = new Date();
      let years = today.getFullYear() - contactForm.birthdate.getFullYear();
      const m = today.getMonth() - contactForm.birthdate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < contactForm.birthdate.getDate())) {
        years--;
      }
      return years;
    });

    const birthdateLabel = computed(() =>
      age.value !== null
        ? `${t('contacts.birthDate')} (${age.value} ${t('contacts.yearsOld')})`
        : t('contacts.birthDate'),
    );

    const pricelists = computed(() =>
      pricelistStore.pricelists?.map((list) => ({
        label: list.name,
        value: list.id,
      })),
    );

    const genders = [
      { label: t('contacts.gender.female'), value: 'female' },
      { label: t('contacts.gender.male'), value: 'male' },
      { label: t('contacts.gender.other'), value: 'other' },
    ];

    const invoicingPolicies = [
      { label: 'Property policy', value: 'property' },
      { label: 'Manual', value: 'manual' },
      { label: 'From checkout', value: 'checkout' },
      { label: 'Month day', value: 'month_day' },
    ];

    const clearTagSelect = () => {
      tagDraftId.value = 0;
      selectResetKey.value++;
    };

    const onTagSelected = (id: number) => {
      if (!id) {
        return;
      }
      const selected = tags.value.find((t) => t.id === id);
      if (!selected) {
        return;
      }

      const exists = contactForm.tags.some((t) => t.id === selected.id);
      if (!exists) {
        contactForm.tags.push(selected);
      }

      clearTagSelect();
    };

    const removeTag = (id: number) => {
      const idx = contactForm.tags.findIndex((t) => t.id === id);
      if (idx !== -1) {
        contactForm.tags.splice(idx, 1);
      }
      if (tagDraftId.value === id) {
        clearTagSelect();
      }
    };

    const canSaveDraft = computed(() => {
      const d: any = draftDoc.value;
      if (!d) {
        return false;
      }
      const numberOk = Boolean(d.name?.trim());
      const countryOk = Boolean(d.country?.id);
      const typeOk = Boolean(d.category?.id);
      return numberOk && countryOk && typeOk;
    });

    const startAddDocument = () => {
      if (hasDraftDoc.value) {
        return;
      } // 1 borrador a la vez
      contactForm.documents.push({
        name: '',
        supportNumber: '',
        country: { id: null }, // <- objetos garantizados para v-model
        category: { id: null },
        _isDraft: true,
      } as any);
      hasDraftDoc.value = true;
    };

    const cancelAddDocument = () => {
      const idx = contactForm.documents.findIndex((d: any) => d._isDraft);
      if (idx !== -1) {
        contactForm.documents.splice(idx, 1);
      }
      hasDraftDoc.value = false;
    };

    const saveDraftDocument = () => {
      console.log('Saving draft document...', draftDoc.value);
      if (draftDoc.value) {
        contactsStore.persistContactDocument(props.contact?.id ?? 0, draftDoc.value);
      }
    };
    const handleCancel = () => {
      dialogRef?.value?.close({ action: 'cancel' });
    };

    watch(contactType, () => {
      activeTab.value = '0';
    });

    onMounted(async () => {
      uiStore.startLoading();
      try {
        await documentTypesStore.fetchDocumentTypes();
        await countriesStore.fetchCountries();
        await countryStatesStore.fetchCountryStates();
        await paymentTermsStore.fetchPaymentTerms();
        await pricelistStore.fetchPricelists();
        await tagsStore.fetchTags();
        if (props.contact) {
          contactType.value =
            props.contact.contactType === 'agency'
              ? 'agency'
              : props.contact.contactType === 'company'
                ? 'company'
                : 'person';

          contactForm.firstName = props.contact.firstname || '';
          contactForm.lastName1 = props.contact.lastname || '';
          contactForm.lastName2 = props.contact.lastname2 || '';
          contactForm.birthdate = props.contact.birthdate
            ? new Date(props.contact.birthdate)
            : null;
          contactForm.nationality = props.contact.nationality || null;
          contactForm.lang = props.contact.lang || '';
          contactForm.gender = props.contact.gender || '';
          contactForm.phone = props.contact.phones ? props.contact.phones[0].number || '' : '';
          contactForm.email = props.contact.email || '';
          contactForm.documents = props.contact.documents || [];
          contactForm.legalName = props.contact.name || '';
          contactForm.fiscalIdNumberType = props.contact.fiscalIdNumberType || null;
          contactForm.fiscalIdNumber = props.contact.fiscalIdNumber || '';
          contactForm.street = props.contact.street || props.contact.street2 || '';
          contactForm.zip = props.contact.zipCode || '';
          contactForm.city = props.contact.city || '';
          contactForm.state = props.contact.state || null;
          contactForm.country = props.contact.country || null;
          contactForm.paymentTerm = props.contact.paymentTerm || null;
          contactForm.tags = props.contact.tags || [];
          contactForm.pricelist = props.contact.pricelist || null;
          contactForm.internalNotes = props.contact.internalNotes || '';
          contactForm.invoicingPolicy = props.contact.invoicingPolicy || '';
          contactForm.reference = props.contact.reference || '';
          if (!contactForm.firstName && (contactForm.lastName1 || contactForm.lastName2)) {
            contactForm.firstName = contactForm.lastName1 ?? contactForm.lastName2 ?? '';
            contactForm.lastName1 = contactForm.lastName2 = '';
          }
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        uiStore.stopLoading();
      }
    });

    return {
      contactType,
      contactTypeOptions,
      contactForm,
      genders,
      age,
      birthdateLabel,
      paymentTerms,
      pricelists,
      countries,
      countryStates,
      tagDraftId,
      tagsInputRef,
      activeTab,
      invoicingPolicies,
      contactsStoreSchema,
      showLastName2,
      tags,
      selectResetKey,
      documentTypes,
      hasDraftDoc,
      canSaveDraft,
      languages,
      t,
      removeTag,
      onTagSelected,
      startAddDocument,
      cancelAddDocument,
      saveDraftDocument,
      handleCancel,
    };
  },
});
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

.contact-form {
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

    .contact-form__control {
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
      grid-template-columns: 1fr auto; // input | icono
      align-items: stretch;
    }
    :deep(.contact-form__control-input),
    :deep(.p-datepicker .p-inputtext) {
      width: 100%;
    }
  }

  &__field--full {
    grid-column: 1 / -1;
  }

  &__hint {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-color-secondary, #6b7280);
  }
}
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

.tags-field {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px solid var(--surface-border, #e5e7eb);

  &__chip {
    :deep(.p-chip) {
      line-height: 1.25rem;
    }
  }

  &__input {
    flex: 1 1 140px;
    min-width: 120px;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 0;
    height: 2rem;
    font: inherit;
    box-shadow: none;
  }
}

.internal-notes {
  margin-inline: auto;
  :deep(.p-textarea) {
    width: 100%;
    resize: none;
  }
}

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
:deep(.p-tabpanels) {
  padding: 0;
  padding-top: 18px;
}

@media (min-width: $bp-desktop) {
  .contact-form {
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
  .internal-notes {
    max-width: none;
    height: 310px;
  }
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
  .contact-form,
  .billing-form,
  .settings-form,
  .internal-notes,
  .documents-form {
    width: 680px !important;
  }
}
</style>
