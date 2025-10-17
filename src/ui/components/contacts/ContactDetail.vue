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

    <Accordion>
      <AccordionPanel value="0">
        <AccordionHeader>
          <div class="flex items-center gap-2">
            <FileText :size="15" />
            <span> {{ t('contacts.generalInformation') }} </span>
          </div>
        </AccordionHeader>
        <AccordionContent>
          <ContactDetailGeneralData :contactType="contactType" v-model="contactForm" />
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1">
        <AccordionHeader>
          <div class="flex items-center gap-2">
            <IdCard :size="15" />
            <span> {{ t('contacts.documents') }} </span>
          </div>
        </AccordionHeader>
        <AccordionContent>
          <ContactDetailDocuments v-model="contactForm" />
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="2">
        <AccordionHeader>
          <div class="flex items-center gap-2">
            <Banknote :size="15" />
            <span> {{ t('contacts.invoicing') }} </span>
          </div>
        </AccordionHeader>
        <AccordionContent>
          <ContactDetailBilling v-model="contactForm" />
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="3">
        <AccordionHeader>
          <div class="flex items-center gap-2">
            <NotebookPen :size="15" />
            <span> {{ t('contacts.internalnotes') }} </span>
          </div>
        </AccordionHeader>
        <AccordionContent>
          <ContactDetailInternalNotes v-model="contactForm" />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onBeforeMount, watch, inject } from 'vue';
import SelectButton from 'primevue/selectbutton';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Accordion from 'primevue/accordion';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import AccordionPanel from 'primevue/accordionpanel';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
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

import ContactDetailGeneralData from './ContactDetailGeneralData.vue';
import ContactDetailDocuments from './ContactDetailDocuments.vue';
import ContactDetailBilling from './ContactDetailBilling.vue';
import ContactDetailInternalNotes from './ContactDetailInternalNotes.vue';

import type { Country } from '@/domain/entities/Country';
import type { CountryState } from '@/domain/entities/CountryState';
import type { PaymentTerm } from '@/domain/entities/PaymentTerm';
import type { Pricelist } from '@/domain/entities/Pricelist';
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
import type { Tag } from '@/domain/entities/Tag';
import type { Phone } from '@/domain/entities/Phone';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';

export default defineComponent({
  components: {
    SelectButton,
    Tabs,
    ContactDetailGeneralData,
    ContactDetailDocuments,
    ContactDetailBilling,
    ContactDetailInternalNotes,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    Accordion,
    AccordionHeader,
    AccordionContent,
    AccordionPanel,
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
    const activeTab = ref('0');

    const contact = ref<ContactDetail | null>(null);

    const contactForm: ContactDetail = reactive({
      id: 0,
      name: '',
      firstname: '',
      lastname: '',
      lastname2: '',
      birthdate: null as Date | null,
      nationality: undefined as Country | undefined,
      lang: '',
      gender: '',
      phones: [] as Phone[],
      email: '',
      documents: [] as PersonalDocument[],
      // fiscalIdNumberType: null as DocumentType | null,
      fiscalIdNumber: '',
      street: '',
      zipCode: '',
      city: '',
      state: undefined as CountryState | undefined,
      country: undefined as Country | undefined,
      paymentTerm: undefined as PaymentTerm | undefined,
      pricelist: undefined as Pricelist | undefined,
      invoicingPolicy: '',
      reference: '',
      tags: [] as Tag[],
      internalNotes: '',
      contactType: 'person',
    });

    const countries = computed(() => countriesStore.countries);
    const contactsStoreSchema = computed(() => contactsStore.contactSchema);
    const paymentTerms = computed(() => paymentTermsStore.paymentTerms);
    const documentTypes = computed(() => documentTypesStore.documentTypes);
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
              (s) => s.id === contactForm.stateId,
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
      },
    );

    onBeforeMount(async () => {
      uiStore.startLoading();
      contact.value = dialogRef.value.data.contact;
      console.log('Loaded contact:', contact.value);
      try {
        await documentTypesStore.fetchDocumentTypes();
        await countriesStore.fetchCountries();
        await countryStatesStore.fetchCountryStates();
        await paymentTermsStore.fetchPaymentTerms();
        await pricelistStore.fetchPricelists();
        await tagsStore.fetchTags();
        if (contact.value) {
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
          contactForm.id = contact.value.id;
          contactForm.name = contact.value.name || '';
          contactForm.firstname = contact.value.firstname || '';
          contactForm.lastname = contact.value.lastname || '';
          contactForm.lastname2 = contact.value.lastname2 || '';
          contactForm.birthdate = contact.value.birthdate
            ? new Date(contact.value.birthdate)
            : null;
          contactForm.nationality = contact.value?.nationality ?? undefined;
          contactForm.lang = contact.value.lang || '';
          contactForm.gender = contact.value.gender || '';
          contactForm.phones = (contact.value.phones as Phone[]) || [];
          contactForm.email = contact.value.email || '';
          contactForm.documents = contact.value.documents || [];
          // contactForm.fiscalIdNumberType = contact.value.fiscalIdNumberType?.name || null;
          contactForm.fiscalIdNumber = contact.value.fiscalIdNumber || '';
          contactForm.street = contact.value.street || contact.value.street2 || '';
          contactForm.zipCode = contact.value.zipCode || '';
          contactForm.city = contact.value.city || '';
          contactForm.country = contact.value.country ?? undefined;
          contactForm.state = contact.value.state ?? undefined;
          contactForm.paymentTerm = contact.value.paymentTerm ?? undefined;
          contactForm.tags = contact.value.tags || [];
          contactForm.pricelist = contact.value.pricelist ?? undefined;
          contactForm.internalNotes = contact.value.internalNotes || '';
          contactForm.invoicingPolicy = contact.value.invoicingPolicy || '';
          contactForm.reference = contact.value.reference || '';
          if (!contactForm.firstname && (contactForm.lastname || contactForm.lastname2)) {
            contactForm.firstname = contactForm.lastname ?? contactForm.lastname2 ?? '';
            contactForm.lastname = contactForm.lastname2 = '';
          }
        }
        console.log('Contact form initialized:', contactForm);
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
      age,
      birthdateLabel,
      paymentTerms,
      pricelists,
      countries,
      countryStates,
      activeTab,
      contactsStoreSchema,
      documentTypes,
      languages,
      t,
      handleCancel,
      handleSave,
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
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 var(--bleed-x) #f1f5f9;
}

.contact-detail__tablist {
  position: sticky;
  top: 56px;
  z-index: 19;
  background: #fff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.06),
    0 0 0 var(--bleed-x) #fff;
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
