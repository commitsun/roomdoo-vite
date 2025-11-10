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
import { defineComponent, ref, reactive, computed, onBeforeMount, watch, inject } from 'vue';
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

import { useTagsStore } from '@/infrastructure/stores/tags';
import { useUIStore } from '@/infrastructure/stores/ui';
import { ContactSchema, type ContactInput } from '@/application/contacts/ContactSchemas';
import type { ContactDetail } from '@/domain/entities/Contact';
import { usePaymentTermsStore } from '@/infrastructure/stores/paymentTerms';
import { usePricelistStore } from '@/infrastructure/stores/pricelist';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useSaleChannelsStore } from '@/infrastructure/stores/saleChannels';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import type { Phone } from '@/domain/entities/Phone';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';
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
      if (contactType.value !== 'person') {
        contactForm.lastname = '';
        contactForm.lastname2 = '';
        contactForm.birthdate = null;
        contactForm.gender = '';
        contactForm.documents = [];
        contactForm.nationality = undefined;
        contactForm.residenceStreet = '';
        contactForm.residenceZip = '';
        contactForm.residenceCity = '';
        contactForm.residenceState = undefined;
        contactForm.residenceCountry = undefined;
      }
    };
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

    const normalizeDocType = (codeRaw: unknown): ContactInput['documents'][number]['type'] => {
      const code = String(codeRaw ?? '')
        .trim()
        .toLowerCase();
      if (code === 'dni' || code === 'nif') {
        return 'dni';
      }
      if (code === 'nie') {
        return 'nie';
      }
      if (code === 'passport') {
        return 'passport';
      }
      return 'other';
    };

    const docNumberErrorBySchema = (docType: unknown, numberRaw: string): string | undefined => {
      const code = String(docType ?? '')
        .trim()
        .toLowerCase();
      type DocCode = 'dni' | 'nie' | 'passport';
      const type: DocCode | 'other' =
        code === 'nif'
          ? 'dni'
          : (['dni', 'nie', 'passport'] as DocCode[]).includes(code as DocCode)
            ? (code as DocCode)
            : 'other';
      const number = numberRaw.toUpperCase().replace(/[\s-]/g, '');

      const res = ContactSchema.safeParse({
        contactType: 'person',
        name: '_',
        saleChannelId: null,
        documents: [{ type, number }],
      });
      if (res.success) {
        return undefined;
      }

      const issue = res.error.issues.find(
        (i) => i.path[0] === 'documents' && i.path[1] === 0 && i.path[2] === 'number',
      );
      return issue?.message;
    };

    const validateDocumentsPresence = (): DocumentRowError[] => {
      const docs = contactForm.documents ?? [];
      if (docs.length === 0) {
        return [];
      }
      return docs.map((d) => {
        const row: DocumentRowError = {};
        if (d.country?.id === 0 || d.country?.id === undefined) {
          row.country = 'contacts.errors.countryRequired';
        }
        if (!d.category?.id) {
          row.category = 'contacts.errors.documentTypeRequired';
        }
        const raw = String(d?.name ?? '').trim();
        if (!raw) {
          row.number = 'contacts.errors.documentNumberRequired';
        } else if (d.category?.id) {
          const err = docNumberErrorBySchema(d.category.name, raw);
          if (err !== null) {
            row.number = err;
          }
        }
        return row;
      });
    };

    const mapVeeValidateErrorsToUI = (): void => {
      const flat = vvErrors.value as Record<string, string>;
      for (const [path, msg] of Object.entries(flat)) {
        if (path === 'name' || path === 'saleChannelId') {
          (uiErrors.general as GeneralErrors)[path as keyof GeneralErrors] = msg;
          continue;
        }
        const m = path.match(/^documents(?:\.|\[)(\d+)(?:\]|\.)number$/);
        if (m) {
          const idx = Number(m[1]);
          uiErrors.documents[idx] ??= {};
          uiErrors.documents[idx].number = msg;
        }
      }
    };

    const resetUiErrors = (): void => {
      uiErrors.general = {};
      uiErrors.documents = [];
    };

    const buildPayloadToValidate = (): ContactInput => ({
      contactType: contactType.value,
      name: (
        contactForm.name || `${contactForm.firstname ?? ''} ${contactForm.lastname ?? ''}`
      ).trim(),
      saleChannelId: contactForm.saleChannel?.id ?? null,
      documents: (contactForm.documents ?? []).map((d) => ({
        type: normalizeDocType(d?.category?.code),
        number: String(d?.name ?? '').trim(),
      })),
    });

    const handleSave = async (): Promise<void> => {
      resetUiErrors();
      clearHiddenFields();
      contactForm.contactType = contactType.value;

      uiErrors.documents = validateDocumentsPresence();

      const payload = buildPayloadToValidate();
      setValues(payload);
      const { valid } = await validate();

      if (
        !valid ||
        uiErrors.documents.some(
          (r) => r.country !== undefined || r.category !== undefined || r.number !== undefined,
        )
      ) {
        mapVeeValidateErrorsToUI();
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
      uiStore.startLoading();
      try {
        if (contact.value) {
          await contactsStore.updateContactFields(contact.value.id, contact.value, contactForm);
        } else {
          await contactsStore.createContact(contactForm);
        }
        dialogRef?.value?.close({ action: 'saved' });
      } catch (error) {
        textMessageStore.addTextMessage(
          t('error.somethingWentWrong'),
          error instanceof Error ? error.message : 'Unknown error',
        );
        textMessageStore.addTextMessage(t('error.somethingWentWrong'), (error as Error).message);
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
        }
      } catch (error) {
        textMessageStore.addTextMessage(
          t('error.somethingWentWrong'),
          error instanceof Error ? error.message : 'Unknown error',
        );
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
