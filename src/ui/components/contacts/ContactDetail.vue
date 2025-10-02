<template>
  <div class="contact-detail">
    <div class="contact-type">
      <SelectButton
        v-model="contactType"
        :options="contactTypeOptions"
        :allowEmpty="false"
        optionLabel="label"
        optionValue="value"
      >
        <template #option="slotProps">
          <User
            v-if="slotProps.option.value === 'person'"
            :size="14"
            :color="contactType === slotProps.option.value ? '#1D4ED8' : 'currentColor'"
          />
          <Building
            v-else-if="slotProps.option.value === 'company'"
            :size="14"
            :color="contactType === slotProps.option.value ? '#1D4ED8' : 'currentColor'"
          />
          <Store
            v-else
            :size="14"
            :color="contactType === slotProps.option.value ? '#1D4ED8' : 'currentColor'"
          />
          <span :style="contactType === slotProps.option.value ? 'color: #1D4ED8' : ''">
            {{ slotProps.option.label }}
          </span>
        </template>
      </SelectButton>
    </div>
    <Tabs v-model:value="activeTab">
      <TabList class="contact-detail__tablist">
        <Tab value="0" as="div" class="flex items-center gap-2">
          <FileText :size="14" :color="activeTab === '0' ? '#1D4ED8' : 'currentColor'" />
          <span> {{ t('contacts.generalInformation') }} </span>
        </Tab>
        <Tab value="1" as="div" class="flex items-center gap-2" v-if="contactType === 'person'">
          <IdCard :size="14" :color="activeTab === '1' ? '#1D4ED8' : 'currentColor'" />
          <span> {{ t('contacts.documents') }} </span>
        </Tab>
        <Tab value="2" as="div" class="flex items-center gap-2">
          <Banknote :size="14" :color="activeTab === '2' ? '#1D4ED8' : 'currentColor'" />
          <span> {{ t('contacts.invoicing') }} </span>
        </Tab>
        <Tab value="3" as="div" class="flex items-center gap-2">
          <NotebookPen :size="14" :color="activeTab === '3' ? '#1D4ED8' : 'currentColor'" />
          <span> {{ t('contacts.internalnotes') }} </span>
        </Tab>
        <Tab value="4" as="div" class="flex items-center gap-2">
          <BookUser :size="14" :color="activeTab === '4' ? '#1D4ED8' : 'currentColor'" />
          <span> {{ t('contacts.addressBook') }} </span>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <ContactPersonalDataTab
            :contactType="contactType"
            :contact="contact"
            @updatePersonalData="onUpdateContact"
          />
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
                  <!-- <Button
                    :label="t('contacts.saveDocument')"
                    icon="pi pi-check"
                    severity="secondary"
                    @click="saveDraftDocument"
                  /> -->
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
                  <InputText
                    id="zipCode"
                    v-model="contactForm.zipCode"
                    class="billing-form__control"
                  />
                  <label for="zipCode">{{ t('contacts.postalCode') }}</label>
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
                    v-model="contactForm.countryId"
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
                    v-model="contactForm.stateId"
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
                    v-model="contactForm.paymentTermId"
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
                    v-model="contactForm.pricelistId"
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
                    :options="[
                      ...tags.filter((t) => !contactForm.tags.some((ct) => ct.id === t.id)),
                    ]"
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
            <Textarea v-model="contactForm.internalNotes" rows="5" />
          </section>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <!-- <div class="flex justify-end">
      <Button
        :label="t('contacts.cancel')"
        icon="pi pi-times"
        class="mt-4 mr-2"
        text
        @click="handleCancel()"
      />
      <Button @click="handleSave()" :label="t('contacts.save')" icon="pi pi-check" class="mt-4" />
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onBeforeMount, watch, inject } from 'vue';
import type { ContactDetail, ContactDetailPayload } from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import { useCountryStatesStore } from '@/infrastructure/stores/countryStates';
import { usePaymentTermsStore } from '@/infrastructure/stores/paymentTerms';
import { usePricelistStore } from '@/infrastructure/stores/pricelist';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useTagsStore } from '@/infrastructure/stores/tags';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useInstanceStore } from '@/infrastructure/stores/instance';
import SelectButton, { type SelectButtonPassThroughMethodOptions } from 'primevue/selectbutton';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Chip from 'primevue/chip';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import IftaLabel from 'primevue/iftalabel';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import type { Tag } from '@/domain/entities/Tag';
import type { Phone } from '@/domain/entities/Phone';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
import { useI18n } from 'vue-i18n';
import ContactPersonalDataTab from './ContactPersonalDataTab.vue';
import {
  User,
  Building,
  Store,
  FileText,
  IdCard,
  Banknote,
  NotebookPen,
  BookUser,
} from 'lucide-vue-next';

export default defineComponent({
  components: {
    SelectButton,
    Tabs,
    ContactPersonalDataTab,
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
    User,
    Building,
    Store,
    FileText,
    IdCard,
    Banknote,
    NotebookPen,
    BookUser,
  },

  setup() {
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
    const contact = ref<ContactDetail | null>(null);

    const contactForm = reactive({
      firstName: '',
      lastName: '',
      lastName2: '',
      birthdate: null as Date | null,
      nationalityId: 0 as number | null,
      lang: '',
      gender: '',
      phoneNumber: '',
      email: '',
      documents: [] as PersonalDocument[],
      legalName: '',
      // fiscalIdNumberType: null as DocumentType | null,
      fiscalIdNumber: '',
      street: '',
      zipCode: '',
      city: '',
      stateId: 0 as number | null,
      countryId: 0 as number | null,
      paymentTermId: 0 as number | null,
      pricelistId: 0 as number | null,
      invoicingPolicy: '',
      reference: '',
      tags: [] as Tag[],
      internalNotes: '',
      contactType: 'person',
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
        (contactsStoreSchema.value?.fields ?? []).includes('lastname2')
    );

    const countryStates = computed(() =>
      countryStatesStore.countryStates?.map((state) => ({
        label: state.name,
        value: state.id,
      }))
    );

    const age = computed(() => {
      if (!contactForm.birthdate) return null;
      const today = new Date();
      let years = today.getFullYear() - contactForm.birthdate.getFullYear();
      const m = today.getMonth() - contactForm.birthdate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < contactForm.birthdate.getDate())) years--;
      return years;
    });

    const birthdateLabel = computed(() =>
      age.value !== null
        ? `${t('contacts.birthDate')} (${age.value} ${t('contacts.yearsOld')})`
        : t('contacts.birthDate')
    );

    const pricelists = computed(() =>
      pricelistStore.pricelists?.map((list) => ({
        label: list.name,
        value: list.id,
      }))
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

    const canSaveDraft = computed(() => {
      const d: any = draftDoc.value;
      if (!d) return false;
      const numberOk = !!d.name?.trim();
      const countryOk = !!d.country?.id;
      const typeOk = !!d.category?.id;
      return numberOk && countryOk && typeOk;
    });

    const startAddDocument = () => {
      if (hasDraftDoc.value) return; // 1 borrador a la vez
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
      if (idx !== -1) contactForm.documents.splice(idx, 1);
      hasDraftDoc.value = false;
    };

    const saveDraftDocument = () => {
      if (draftDoc.value) {
        contactsStore.persistContactDocument(contact.value?.id ?? 0, draftDoc.value);
      }
    };

    const onUpdateContact = (data: Partial<ContactDetailPayload>) => {
      Object.assign(contactForm, data);
    };

    const handleSave = async () => {
      uiStore.startLoading();
      try {
        if (contact.value) {
          contactForm.contactType = contactType.value;
          await contactsStore.updateContactFields(contact.value.id, contact.value, contactForm);
        } else {
          await contactsStore.createContact(contactForm);
        }
      } catch (error) {
        console.error('Error saving contact:', error);
      } finally {
        uiStore.stopLoading();
      }
    };

    const handleCancel = () => {
      dialogRef?.value?.close({ action: 'cancel' });
    };

    watch(contactType, () => {
      activeTab.value = '0';
    });

    watch(
      () => contactForm.countryId,
      async () => {
        uiStore.startLoading();
        try {
          if (contactForm.countryId) {
            await countryStatesStore.fetchCountryStatesByCountryId(contactForm.countryId);
            const countryStateToSelect = countryStatesStore.countryStates?.find(
              (s) => s.id === contactForm.stateId
            );
            if (countryStateToSelect) {
              contactForm.stateId = countryStateToSelect.id;
            } else {
              contactForm.stateId = null;
            }
          }
        } catch (error) {
          console.error('Error fetching country states:', error);
        } finally {
          uiStore.stopLoading();
        }
      }
    );

    onBeforeMount(async () => {
      uiStore.startLoading();
      contact.value = dialogRef.value.data.contact;
      try {
        await documentTypesStore.fetchDocumentTypes();
        await countriesStore.fetchCountries();
        await countryStatesStore.fetchCountryStates();
        await paymentTermsStore.fetchPaymentTerms();
        await pricelistStore.fetchPricelists();
        await tagsStore.fetchTags();
        if (contact.value) {
          console.log(contact.value.birthdate);
          if (contact.value.birthdate) {
            (contact.value as ContactDetail).birthdate =
              new Date(contact.value.birthdate || '') ?? null;
          }
          contactType.value =
            contact.value.contactType === 'agency'
              ? 'agency'
              : contact.value.contactType === 'company'
              ? 'company'
              : 'person';

          contactForm.firstName = contact.value.firstname || '';
          contactForm.lastName = contact.value.lastname || '';
          contactForm.lastName2 = contact.value.lastname2 || '';
          contactForm.birthdate = contact.value.birthdate
            ? new Date(contact.value.birthdate)
            : null;
          contactForm.nationalityId = contact.value?.nationality?.id ?? null;
          contactForm.lang = contact.value.lang || '';
          contactForm.gender = contact.value.gender || '';
          contactForm.phoneNumber =
            (contact.value.phones && contact.value.phones.length > 0
              ? (contact.value.phones[0] as Phone).number
              : '') || '';

          contactForm.email = contact.value.email || '';
          contactForm.documents = contact.value.documents || [];
          // contactForm.legalName = contact.value.name || '';
          // contactForm.fiscalIdNumberType = contact.value.fiscalIdNumberType?.name || null;
          contactForm.fiscalIdNumber = contact.value.fiscalIdNumber || '';
          contactForm.street = contact.value.street || contact.value.street2 || '';
          contactForm.zipCode = contact.value.zipCode || '';
          contactForm.city = contact.value.city || '';
          contactForm.countryId = contact.value.country?.id ?? null;
          contactForm.stateId = contact.value.state?.id ?? null;
          contactForm.paymentTermId = contact.value.paymentTerm?.id ?? null;
          contactForm.tags = contact.value.tags || [];
          contactForm.pricelistId = contact.value.pricelist?.id ?? null;
          contactForm.internalNotes = contact.value.internalNotes || '';
          contactForm.invoicingPolicy = contact.value.invoicingPolicy || '';
          contactForm.reference = contact.value.reference || '';
          if (!contactForm.firstName && (contactForm.lastName || contactForm.lastName2)) {
            contactForm.firstName = contactForm.lastName ?? contactForm.lastName2 ?? '';
            contactForm.lastName = contactForm.lastName2 = '';
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
      contact,
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
      handleCancel,
      handleSave,
      onUpdateContact,
    };
  },
});
</script>

<style scoped lang="scss">
$bp-desktop: 640px;

:root {
  --bleed-x: 24px;
}

.contact-detail {
  height: auto;
}

.contact-type {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #f1f5f9;
  min-height: 56px; /* <— la altura de esta barra */
  display: flex;
  align-items: center;
  box-shadow: 0 0 0 var(--bleed-x) #f1f5f9; /* truco para cubrir el padding lateral del modal */
}

/* TabList fijo justo debajo de la barra anterior */
.contact-detail__tablist {
  position: sticky;
  top: 56px; /* <— igual a la altura de .contact-type */
  z-index: 19;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 0 0 var(--bleed-x) #fff;
}

.contact-type::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -16px;
  right: -16px;
  background: #f1f5f9;
  z-index: -1;
  pointer-events: none;
}

// .contact-detail {
//   margin-inline: auto;

//   &__grid {
//     display: grid;
//     grid-template-columns: 1fr;
//     gap: 12px;
//   }

//   &__field {
//     :deep(.p-iftalabel) {
//       display: block;
//       width: 100%;
//     }

//     .contact-detail__control {
//       width: 100%;
//     }

//     :deep(.p-inputtext),
//     :deep(.p-select),
//     :deep(.p-dropdown),
//     :deep(.p-datepicker),
//     :deep(.p-inputwrapper) {
//       width: 100%;
//     }

//     :deep(.p-datepicker .p-inputwrapper) {
//       display: grid;
//       grid-template-columns: 1fr auto; // input | icono
//       align-items: stretch;
//     }
//     :deep(.contact-detail__control-input),
//     :deep(.p-datepicker .p-inputtext) {
//       width: 100%;
//     }
//   }

//   &__field--full {
//     grid-column: 1 / -1;
//   }

//   &__hint {
//     display: block;
//     margin-top: 4px;
//     font-size: 12px;
//     color: var(--text-color-secondary, #6b7280);
//   }
// }
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
  // .contact-detail {
  //   max-width: none;
  //   height: 310px;
  //   &__grid {
  //     grid-template-columns: repeat(2, minmax(0, 1fr));
  //     column-gap: 16px;
  //     row-gap: 12px;
  //   }

  //   &__field--full {
  //     grid-column: 1 / -1;
  //   }
  // }
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
  .contact-detail,
  .billing-form,
  .settings-form,
  .internal-notes,
  .documents-form {
    width: 900px;
  }
}
</style>
