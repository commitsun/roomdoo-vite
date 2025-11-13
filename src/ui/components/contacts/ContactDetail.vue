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
      <Accordion v-model:value="activePanel" :lazy="true">
        <AccordionPanel value="0">
          <AccordionHeader>
            <div
              class="flex items-center gap-2"
              :style="{ color: activePanel === '0' ? '#1D4ED8' : '' }"
            >
              <FileText :size="15" />
              <span>{{ t('contacts.generalInformation') }}</span>
              <Badge v-if="badges.general" :value="badges.general" severity="danger" size="small" />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <ContactDetailGeneralData
              :contactType="contactType"
              :modelValue="contactForm"
              :errors="uiErrors.general"
              :billingAddressMode="billingAddressMode"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1" v-if="contactType === 'person'">
          <AccordionHeader>
            <div
              class="flex items-center gap-2"
              :style="{ color: activePanel === '1' ? '#1D4ED8' : '' }"
            >
              <IdCard :size="15" />
              <span>{{ t('contacts.documents') }}</span>
              <Badge
                v-if="badges.documents"
                :value="badges.documents"
                severity="danger"
                size="small"
              />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <ContactDetailDocuments
              :modelValue="contactForm"
              :errors="uiErrors.documents"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
              @changeContactForm="(id: number) => changeContactForm(id)"
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
              :billingAddress="billingAddress"
              :billingAddressMode="billingAddressMode"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
              @update:billingAddress="(v: Address) => Object.assign(billingAddress, v)"
              @updateBillingAddressMode="billingAddressMode = $event"
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
          <Tab value="0">
            {{ t('contacts.generalInformation') }}
            <Badge v-if="badges.general" :value="badges.general" severity="danger" size="small" />
          </Tab>
          <Tab v-if="contactType === 'person'" value="1">
            {{ t('contacts.documents') }}
            <Badge
              v-if="badges.documents"
              :value="badges.documents"
              severity="danger"
              size="small"
            />
          </Tab>
          <Tab value="2">{{ t('contacts.invoicing') }}</Tab>
          <Tab value="3">{{ t('contacts.internalnotes') }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <ContactDetailGeneralData
              :contactType="contactType"
              :modelValue="contactForm"
              :errors="uiErrors.general"
              :billingAddressMode="billingAddressMode"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
            />
          </TabPanel>
          <TabPanel value="1">
            <ContactDetailDocuments
              :modelValue="contactForm"
              :errors="uiErrors.documents"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
              @changeContactForm="(id: number) => changeContactForm(id)"
            />
          </TabPanel>
          <TabPanel value="2">
            <ContactDetailBilling
              :modelValue="contactForm"
              :billingAddress="billingAddress"
              :billingAddressMode="billingAddressMode"
              @update:modelValue="(v: ContactDetail) => Object.assign(contactForm, v)"
              @update:billingAddress="(v: Address) => Object.assign(billingAddress, v)"
              @updateBillingAddressMode="billingAddressMode = $event"
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
    <div
      class="footer"
      :class="{
        'justify-end': !badges.general && !badges.documents,
        'justify-between': badges.general || badges.documents,
      }"
    >
      <div class="all-errors" v-if="badges.general || badges.documents">
        <Info :size="isDesktop ? 16 : 14" />
        <span>
          {{
            t('contacts.errors.fieldErrors', {
              count: badges.general + badges.documents,
            })
          }}
        </span>
      </div>
      <div class="buttons">
        <Button :label="t('contacts.cancel')" severity="secondary" @click="handleCancel" />
        <Button :label="t('contacts.save')" severity="primary" @click="handleSave" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  computed,
  onBeforeMount,
  watch,
  inject,
  type Ref,
} from 'vue';
import { useMediaQuery } from '@vueuse/core';
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
import Badge from 'primevue/badge';
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
  Info,
} from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import ContactDetailGeneralData from './ContactDetailGeneralData.vue';
import ContactDetailDocuments from './ContactDetailDocuments.vue';
import ContactDetailBilling from './ContactDetailBilling.vue';
import ContactDetailInternalNotes from './ContactDetailInternalNotes.vue';

import { ContactSchema, type ContactInput } from '@/application/contacts/ContactSchemas';
import type { ContactDetail } from '@/domain/entities/Contact';
import { usePaymentTermsStore } from '@/infrastructure/stores/paymentTerms';
import { usePricelistStore } from '@/infrastructure/stores/pricelist';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useSaleChannelsStore } from '@/infrastructure/stores/saleChannels';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useTagsStore } from '@/infrastructure/stores/tags';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import type { Country } from '@/domain/entities/Country';
import type { CountryState } from '@/domain/entities/CountryState';
// eslint-disable-next-line
import type { Address } from '@/domain/entities/Address';

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
    Badge,
    User,
    Building,
    Store,
    FileText,
    IdCard,
    Banknote,
    NotebookPen,
    BookUser,
    Info,
  },

  setup() {
    type GeneralErrors = { name?: string; saleChannelId?: string };
    type DocumentRowError = { country?: string; category?: string; number?: string };

    const contactsStore = useContactsStore();
    const countriesStore = useCountriesStore();
    const paymentTermsStore = usePaymentTermsStore();
    const pricelistStore = usePricelistStore();
    const documentTypesStore = useDocumentTypesStore();
    const tagsStore = useTagsStore();
    const saleChannelsStore = useSaleChannelsStore();
    const uiStore = useUIStore();
    const textMessageStore = useTextMessagesStore();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const { t } = useI18n();

    const {
      validate,
      setValues,
      errors: vvErrors,
    } = useForm({
      validationSchema: toTypedSchema(ContactSchema),
    });

    const dialogRef =
      inject<
        Ref<{ close: (payload?: unknown) => void; data: { [key: string]: unknown } } | undefined>
      >('dialogRef');

    const contactType = ref<'person' | 'company' | 'agency'>('person');
    const billingAddressMode = ref<'residence' | 'other'>('residence');

    const contactTypeOptions = computed(() => [
      { label: t('contacts.person'), value: 'person' },
      { label: t('contacts.company'), value: 'company' },
      { label: t('contacts.agency'), value: 'agency' },
    ]);
    const isPerson = computed(() => contactType.value === 'person');

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
      nationality: undefined,
      lang: '',
      gender: '',
      phones: [],
      email: '',
      documents: [],
      fiscalIdNumberType: '',
      fiscalIdNumber: '',
      residenceStreet: '',
      residenceZip: '',
      residenceCity: '',
      residenceState: undefined,
      residenceCountry: undefined,
      street: '',
      zipCode: '',
      city: '',
      state: undefined,
      country: undefined,
      reference: '',
      tags: [],
      internalNotes: '',
      defaultCommission: 0,
      saleChannel: undefined,
      comercial: '',
      contactType: 'person',
    });

    const billingAddress = reactive({
      street: '',
      city: '',
      zipCode: '',
      country: undefined as Country | undefined,
      state: undefined as CountryState | undefined,
    });

    const uiErrors = reactive<{ general: GeneralErrors; documents: DocumentRowError[] }>({
      general: {},
      documents: [],
    });

    const badges = computed(() => {
      const general = Object.keys(uiErrors.general).length;
      const documents = uiErrors.documents.reduce(
        (acc, r) =>
          acc +
          (r.country !== undefined ? 1 : 0) +
          (r.category !== undefined ? 1 : 0) +
          (r.number !== undefined ? 1 : 0),
        0,
      );
      return { general, documents, total: general + documents };
    });

    const mergeIntoForm = (v: ContactDetail): ContactDetail => Object.assign(contactForm, v);

    const clearHiddenFields = (): void => {
      if (
        contactType.value === 'person' &&
        contactForm.name &&
        contactForm.firstname === '' &&
        contactForm.lastname === '' &&
        contactForm.lastname2 === ''
      ) {
        contactForm.name = '';
      }
      if (!isPerson.value) {
        Object.assign(contactForm, {
          lastname: '',
          lastname2: '',
          birthdate: null,
          gender: '',
          documents: [],
          nationality: undefined,
          residenceStreet: '',
          residenceZip: '',
          residenceCity: '',
          residenceState: undefined,
          residenceCountry: undefined,
        });
      }
    };

    const mapVeeValidateErrors = (): void => {
      const flat = vvErrors.value as Record<string, string>;
      uiErrors.general = {};
      uiErrors.documents = [];

      for (const [path, msg] of Object.entries(flat)) {
        if (path === 'name' || path === 'saleChannelId') {
          (uiErrors.general as GeneralErrors)[path as keyof GeneralErrors] = msg;
          continue;
        }
        const m = path.match(/^documents(?:\[(\d+)\]|\.([0-9]+))\.(.+)$/);
        if (!m) {
          continue;
        }
        const idx = Number(m[1] ?? m[2]);
        const field = m[3];
        while (uiErrors.documents.length <= idx) {
          uiErrors.documents.push({});
        }
        const prev = uiErrors.documents[idx] ?? {};
        const next = {
          ...prev,
          ...(field === 'number' ? { number: msg } : {}),
          ...(field === 'countryCode' ? { country: msg } : {}),
          ...(field === 'documentTypeName' ? { category: msg } : {}),
        };

        uiErrors.documents.splice(idx, 1, next);
      }

      uiErrors.documents = uiErrors.documents.map((r) => ({ ...r }));
    };

    const resetUiErrors = (): void => {
      uiErrors.general = {};
      uiErrors.documents = [];
    };

    const normCode = (code?: string): string => (code ?? '').trim().slice(0, 2).toUpperCase();
    const normDocType = (name?: string): string => (name ?? '').trim().toLowerCase();

    const buildPayloadToValidate = (): ContactInput => ({
      contactType: contactType.value,
      name: (
        contactForm.name || `${contactForm.firstname ?? ''} ${contactForm.lastname ?? ''}`
      ).trim(),
      saleChannelId: contactForm.saleChannel?.id ?? null,
      documents: (contactForm.documents ?? []).map((d) => ({
        number: String(d?.name ?? '').trim(),
        countryCode: normCode(d?.country?.code),
        documentTypeName: normDocType(d?.category?.name),
        isValidable: Boolean(d?.category?.isValidableDocument),
      })),
    });

    const handleSave = async (): Promise<void> => {
      resetUiErrors();
      clearHiddenFields();
      contactForm.contactType = contactType.value;

      const payload = buildPayloadToValidate();
      setValues(payload);

      const { valid } = await validate();
      mapVeeValidateErrors();

      if (!valid || badges.value.total > 0) {
        return;
      }
      if (
        billingAddressMode.value === 'residence' &&
        (contactForm.residenceStreet !== '' ||
          contactForm.residenceZip !== '' ||
          contactForm.residenceCity !== '' ||
          contactForm.residenceCountry !== undefined ||
          contactForm.residenceState !== undefined)
      ) {
        contactForm.street = contactForm.residenceStreet;
        contactForm.zipCode = contactForm.residenceZip;
        contactForm.city = contactForm.residenceCity;
        contactForm.country = contactForm.residenceCountry;
        contactForm.state = contactForm.residenceState;
      } else if (billingAddressMode.value === 'other') {
        contactForm.street = billingAddress.street;
        contactForm.zipCode = billingAddress.zipCode;
        contactForm.city = billingAddress.city;
        contactForm.country = billingAddress.country;
        contactForm.state = billingAddress.state;
      }
      if (
        contactForm.firstname !== '' ||
        contactForm.lastname !== '' ||
        contactForm.lastname2 !== ''
      ) {
        contactForm.name = `${contactForm.firstname ?? ''} ${contactForm.lastname ?? ''} ${
          contactForm.lastname2 ?? ''
        }`.trim();
      }
      uiStore.startLoading();
      try {
        let contactId = 0;
        if (contact.value) {
          await contactsStore.updateContactFields(contact.value.id, contact.value, contactForm);
          contactId = contact.value.id;
        } else {
          const createdContact = await contactsStore.createContact(contactForm);
          contactId = createdContact.id;
        }
        dialogRef?.value?.close({ action: 'saved', contactId });
      } catch (error) {
        textMessageStore.addTextMessage(t('error.somethingWentWrong'), (error as Error).message);
      } finally {
        uiStore.stopLoading();
      }
    };

    const handleCancel = (): void => {
      dialogRef?.value?.close({ action: 'cancel' });
    };

    const changeContactForm = async (id: number): Promise<void> => {
      const contactFetched = await contactsStore.fetchContactById(id);
      if (contactFetched) {
        contactType.value = (contactFetched.contactType ?? 'person') as typeof contactType.value;
        Object.assign(contactForm, contactFetched);
        if (contact.value) {
          Object.assign(contact.value, contactFetched);
        } else {
          contact.value = contactFetched;
        }

        if (contactFetched.birthdate) {
          contactForm.birthdate = new Date(contactFetched.birthdate);
          contact.value.birthdate = new Date(contactFetched.birthdate);
        }
        if (contactFetched.lang !== undefined) {
          contactForm.lang = contactFetched.lang.replace('_', '-');
        }
        if (
          contactFetched.street === contactFetched.residenceStreet &&
          contactFetched.zipCode === contactFetched.residenceZip &&
          contactFetched.city === contactFetched.residenceCity &&
          contactFetched.country?.id === contactFetched.residenceCountry?.id &&
          contactFetched.state?.id === contactFetched.residenceState?.id
        ) {
          billingAddressMode.value = 'residence';
        } else {
          billingAddressMode.value = 'other';
          Object.assign(billingAddress, {
            street: contactFetched.street,
            zipCode: contactFetched.zipCode,
            city: contactFetched.city,
            country: contactFetched.country,
            state: contactFetched.state,
          });
        }
        if (contact.value.documents) {
          contact.value.documents.forEach((doc) => {
            if (doc.country) {
              doc.country.code = countriesStore.countries.find((c) => c.id === doc.country?.id)
                ?.code as string;
            }
          });
          contactForm.documents = contact.value.documents;
        }
        activeTab.value = '0';
        activePanel.value = '0';
      }
    };

    watch(contactType, () => {
      activeTab.value = '0';
      activePanel.value = null;
      resetUiErrors();
    });

    watch(
      () => [contactForm.name, contactForm.firstname],
      () => {
        if (uiErrors.general.name !== undefined) {
          delete uiErrors.general.name;
        }
      },
    );

    watch(
      () => contactForm.saleChannel,
      () => {
        if (uiErrors.general.saleChannelId !== undefined) {
          delete uiErrors.general.saleChannelId;
        }
      },
    );

    watch(
      () => contactForm.documents,
      () => {
        if (uiErrors.documents.length) {
          uiErrors.documents = [];
        }
      },
      { deep: true },
    );

    onBeforeMount(async () => {
      uiStore.startLoading();
      contact.value = dialogRef?.value?.data.contact as ContactDetail | null;
      try {
        await Promise.all([
          documentTypesStore.fetchDocumentTypes(),
          documentTypesStore.fetchFiscalDocumentTypes(),
          countriesStore.fetchCountries(),
          paymentTermsStore.fetchPaymentTerms(),
          pricelistStore.fetchPricelists(),
          saleChannelsStore.fetchSaleChannels(),
          tagsStore.fetchTags(),
        ]);

        if (contact.value) {
          contactType.value = (contact.value.contactType ?? 'person') as typeof contactType.value;
          Object.assign(contactForm, contact.value);

          if (contact.value.birthdate) {
            contactForm.birthdate = new Date(contact.value.birthdate);
            contact.value.birthdate = new Date(contact.value.birthdate);
          }
          if (contact.value.lang !== undefined) {
            contactForm.lang = contact.value.lang.replace('_', '-');
          }
          if (
            contact.value.street === contact.value.residenceStreet &&
            contact.value.zipCode === contact.value.residenceZip &&
            contact.value.city === contact.value.residenceCity &&
            contact.value.country?.id === contact.value.residenceCountry?.id &&
            contact.value.state?.id === contact.value.residenceState?.id
          ) {
            billingAddressMode.value = 'residence';
          } else {
            billingAddressMode.value = 'other';
            Object.assign(billingAddress, {
              street: contact.value.street,
              zipCode: contact.value.zipCode,
              city: contact.value.city,
              country: contact.value.country,
              state: contact.value.state,
            });
          }
          if (contact.value.documents) {
            contact.value.documents.forEach((doc) => {
              if (doc.country) {
                doc.country.code = countriesStore.countries.find((c) => c.id === doc.country?.id)
                  ?.code as string;
              }
            });
            contactForm.documents = contact.value.documents;
          }
        }
      } catch (error) {
        textMessageStore.addTextMessage(t('error.somethingWentWrong'), (error as Error).message);
      } finally {
        uiStore.stopLoading();
      }
    });

    return {
      contactType,
      contactTypeOptions,
      isPerson,
      contactForm,
      contact,
      activePanel,
      activeTab,
      isDesktop,
      uiErrors,
      badges,
      billingAddressMode,
      billingAddress,
      t,
      handleCancel,
      handleSave,
      mergeIntoForm,
      changeContactForm,
    };
  },
});
</script>
<style scoped lang="scss">
.contact-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  .contact-type {
    position: sticky;
    top: 0;
    z-index: 20;
    background: #f1f5f9;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    display: flex;
    align-items: center;
    padding-top: 1.5rem;
    padding-right: 1.5rem;
    .all-errors {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #b91c1c;
      margin-right: auto;
      font-size: 12px;
    }
    .buttons {
      display: flex;
      gap: 0.5rem;
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
    .footer {
      .all-errors {
        font-size: 14px;
      }
    }
  }
}
</style>
