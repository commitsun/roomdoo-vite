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
    <div class="contact-detail-accordion" v-if="!isDesktop">
      <Accordion v-model:value="activePanel">
        <AccordionPanel value="0">
          <AccordionHeader>
            <div
              class="flex items-center gap-2"
              :style="{ color: activePanel === '0' ? '#1D4ED8' : '' }"
            >
              <FileText :size="15" />
              <span>{{ t('contacts.generalInformation') }}</span>
            </div>
          </AccordionHeader>
          <AccordionContent>
            <ContactDetailGeneralData
              :contactType="contactType"
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
          <AccordionHeader>
            <div
              class="flex items-center gap-2"
              :style="{ color: activePanel === '1' ? '#1D4ED8' : '' }"
            >
              <IdCard :size="15" />
              <span>{{ t('contacts.documents') }}</span>
            </div>
          </AccordionHeader>
          <AccordionContent>
            <ContactDetailDocuments
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="2">
          <AccordionHeader>
            <div
              class="flex items-center gap-2"
              :style="{ color: activePanel === '2' ? '#1D4ED8' : '' }"
            >
              <Banknote :size="15" />
              <span>{{ t('contacts.invoicing') }}</span>
            </div>
          </AccordionHeader>
          <AccordionContent>
            <ContactDetailBilling
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="3">
          <AccordionHeader>
            <div
              class="flex items-center gap-2"
              :style="{ color: activePanel === '3' ? '#1D4ED8' : '' }"
            >
              <NotebookPen :size="15" />
              <span>{{ t('contacts.internalnotes') }}</span>
            </div>
          </AccordionHeader>
          <AccordionContent>
            <ContactDetailInternalNotes
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
    <div class="contact-detail-tabs" v-else>
      <Tabs v-model:value="activeTab" :lazy="true">
        <TabList>
          <Tab value="0">{{ t('contacts.generalInformation') }}</Tab>
          <Tab value="1">{{ t('contacts.documents') }}</Tab>
          <Tab value="2">{{ t('contacts.invoicing') }}</Tab>
          <Tab value="3">{{ t('contacts.internalnotes') }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <ContactDetailGeneralData
              :contactType="contactType"
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </TabPanel>
          <TabPanel value="1">
            <ContactDetailDocuments
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </TabPanel>
          <TabPanel value="2">
            <ContactDetailBilling
              :modelValue="contactForm"
              @update:modelValue="(v) => Object.assign(contactForm, v)"
            />
          </TabPanel>
          <TabPanel value="3">
            <ContactDetailInternalNotes
              :modelValue="contactForm"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <div class="footer">
      <div class="buttons">
        <Button :label="t('contacts.cancel')" severity="secondary" @click="handleCancel" />
        <Button :label="t('contacts.save')" severity="primary" @click="handleSave" />
      </div>
    </div>
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

import { useUIStore } from '@/infrastructure/stores/ui';
import { useTagsStore } from '@/infrastructure/stores/tags';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { usePricelistStore } from '@/infrastructure/stores/pricelist';
import { usePaymentTermsStore } from '@/infrastructure/stores/paymentTerms';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import type { ContactDetail } from '@/domain/entities/Contact';
import type { Country } from '@/domain/entities/Country';
import type { CountryState } from '@/domain/entities/CountryState';
import type { PaymentTerm } from '@/domain/entities/PaymentTerm';
import type { Pricelist } from '@/domain/entities/Pricelist';
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
    const paymentTermsStore = usePaymentTermsStore();
    const pricelistStore = usePricelistStore();
    const documentTypesStore = useDocumentTypesStore();
    const tagsStore = useTagsStore();
    const uiStore = useUIStore();
    const textMessageStore = useTextMessagesStore();
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const dialogRef =
      inject<
        Ref<{ close: (payload?: unknown) => void; data: { [key: string]: unknown } } | undefined>
      >('dialogRef');
    const { t } = useI18n();

    const contactType = ref('person');
    const contactTypeOptions = ref([
      { label: t('contacts.person'), value: 'person' },
      { label: t('contacts.company'), value: 'company' },
      { label: t('contacts.agency'), value: 'agency' },
    ]);
    const activePanel = ref<string | null>(null);
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
      residenceStreet: '',
      residenceZip: '',
      residenceCity: '',
      residenceState: undefined as CountryState | undefined,
      residenceCountry: undefined as Country | undefined,
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

    const contactsStoreSchema = computed(() => contactsStore.contactSchema);
    const paymentTerms = computed(() => paymentTermsStore.paymentTerms);
    const documentTypes = computed(() => documentTypesStore.documentTypes);
    const languages = computed(() => instanceStore.instance?.languages ?? APP_LANGUAGES);

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
        textMessageStore.addTextMessage(
          t('error.somethingWentWrong'),
          error instanceof Error ? error.message : 'Unknown error',
        );
      } finally {
        uiStore.stopLoading();
      }
    };

    const handleCancel = (): void => {
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
      contact.value = dialogRef?.value?.data.contact as ContactDetail | null;
      try {
        await documentTypesStore.fetchDocumentTypes();
        await countriesStore.fetchCountries();
        await paymentTermsStore.fetchPaymentTerms();
        await pricelistStore.fetchPricelists();
        await tagsStore.fetchTags();
        if (contact.value) {
          Object.assign(contactForm, contact.value);
          if (contact.value.birthdate) {
            contactForm.birthdate = new Date(contact.value.birthdate);
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
      } catch (error) {
        textMessageStore.addTextMessage(
          t('error.somethingWentWrong'),
          error instanceof Error ? error.message : 'Unknown error',
        );
      } finally {
        uiStore.stopLoading();
      }
    });

    return {
      contactType,
      contactTypeOptions,
      contactForm,
      contact,
      activePanel,
      activeTab,
      contactsStoreSchema,
      isDesktop,
      t,
      handleCancel,
      handleSave,
    };
  },
});
</script>
<style scoped lang="scss">
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
  }
  .contact-detail-accordion {
    height: calc(100% - 56px - 65px - 16px);
    overflow-y: auto;
  }
  .contact-detail-tabs {
    display: none;
  }
  .footer {
    background: #fff;
    width: 100%;
    .buttons {
      padding-top: 1.5rem;
      padding-right: 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      width: 100%;
    }
  }
}
@media (min-width: 1024px) {
  .contact-detail {
    width: 920px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .contact-type {
      justify-content: flex-start;
    }
    .contact-detail-accordion {
      display: none;
    }
    .contact-detail-tabs {
      height: calc(100% - 56px - 65px);
      overflow-y: auto;
      display: block;
    }
  }
  :deep(.p-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  :deep(.p-tabpanels) {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  :deep(.p-tabpanel) {
    height: 100%;
    display: block;
  }
  :deep(.p-tablist) {
    min-height: 50px;
  }
}
</style>
