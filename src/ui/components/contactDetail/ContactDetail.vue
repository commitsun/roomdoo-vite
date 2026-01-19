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
          <User v-if="slotProps.option.value === 'person'" :size="14" />
          <Building v-else-if="slotProps.option.value === 'company'" :size="14" />
          <Store v-else :size="14" />
          <span>
            {{ slotProps.option.label }}
          </span>
        </template>
      </SelectButton>
    </div>
    <div class="contact-detail-accordion">
      <ContactDetailAccordion
        v-model:modelValue="activePanel"
        :formParts="formParts"
        :badges="badges"
      >
        <template #formPart="{ formPart }">
          <component
            :is="components[formPart.id]"
            v-bind="componentProps(formPart.id)"
            v-on="componentListeners(formPart.id)"
          />
        </template>
      </ContactDetailAccordion>
    </div>
    <div class="contact-detail-tabs">
      <ContactDetailTabs v-model:modelValue="activeTab" :formParts="formParts" :badges="badges">
        <template #formPart="{ formPart }">
          <component
            :is="components[formPart.id]"
            v-bind="componentProps(formPart.id)"
            v-on="componentListeners(formPart.id)"
          />
        </template>
      </ContactDetailTabs>
    </div>
    <div
      class="footer"
      :class="{
        'justify-end': !badges.general && !badges.documents,
        'justify-between': badges.general || badges.documents,
      }"
    >
      <div class="all-errors" v-if="badges.general || badges.documents">
        <Info :size="16" />
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
  type Component,
} from 'vue';
import SelectButton from 'primevue/selectbutton';
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

import ContactDetailAccordion from './ContactDetailAccordion.vue';
import ContactDetailTabs from './ContactDetailTabs.vue';
import ContactDetailGeneralData from './ContactDetailGeneralData.vue';
import ContactDetailDocuments from './ContactDetailDocuments.vue';
import ContactDetailBilling from './ContactDetailBilling.vue';
import ContactDetailInternalNotes from './ContactDetailInternalNotes.vue';

import { useContactDetailErrors } from '@/ui/composables/useContactDetailErrors';
import { useContactDetailLoader } from '@/ui/composables/useContactDetail';
import type { ContactDetail } from '@/domain/entities/Contact';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import type { CountryState } from '@/domain/entities/CountryState';
import type { Country } from '@/domain/entities/Country';
import type { Address } from '@/domain/entities/Address';

export default defineComponent({
  components: {
    SelectButton,
    ContactDetailGeneralData,
    ContactDetailDocuments,
    ContactDetailBilling,
    ContactDetailInternalNotes,
    ContactDetailAccordion,
    ContactDetailTabs,
    Button,
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
    type BadgeKey = 'general' | 'documents';
    type FormPartId = 'general' | 'documents' | 'billing' | 'internalNotes';

    type FormPartConfig = {
      id: FormPartId;
      value: string;
      icon: Component;
      labelKey: string;
      show: boolean;
      badgeKey?: BadgeKey;
    };

    const contactsStore = useContactsStore();
    const uiStore = useUIStore();
    const useTextMessageStore = useTextMessagesStore();
    const { t } = useI18n();

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

    const formParts = computed<FormPartConfig[]>(() => [
      {
        id: 'general',
        value: '0',
        icon: FileText,
        labelKey: 'contacts.generalInformation',
        show: true,
        badgeKey: 'general',
      },
      {
        id: 'documents',
        value: '1',
        icon: IdCard,
        labelKey: 'contacts.documents',
        show: contactType.value === 'person',
        badgeKey: 'documents',
      },
      {
        id: 'billing',
        value: '2',
        icon: Banknote,
        labelKey: 'contacts.invoicing',
        show: true,
      },
      {
        id: 'internalNotes',
        value: '3',
        icon: NotebookPen,
        labelKey: 'contacts.internalNotes',
        show: true,
      },
    ]);

    const components: Record<FormPartId, Component> = {
      general: ContactDetailGeneralData,
      documents: ContactDetailDocuments,
      billing: ContactDetailBilling,
      internalNotes: ContactDetailInternalNotes,
    };

    const {
      uiErrors,
      badges,
      validate,
      setValues,
      resetUiErrors,
      buildPayloadToValidate,
      mapVeeValidateErrors,
    } = useContactDetailErrors(contactType, contactForm);

    const { contact, activePanel, activeTab, changeContactForm, loadInitialData } =
      useContactDetailLoader({
        contactType,
        contactForm,
        billingAddress,
        billingAddressMode,
        resetUiErrors,
      });

    const mergeIntoForm = (v: ContactDetail): ContactDetail => Object.assign(contactForm, v);

    const componentProps = (id: FormPartId): Record<string, unknown> => {
      switch (id) {
        case 'general':
          return {
            contactType: contactType.value,
            modelValue: contactForm,
            errors: uiErrors.general,
            billingAddressMode: billingAddressMode.value,
          };
        case 'documents':
          return {
            modelValue: contactForm,
            errors: uiErrors.documents,
          };
        case 'billing':
          return {
            modelValue: contactForm,
            billingAddress,
            billingAddressMode: billingAddressMode.value,
          };
        case 'internalNotes':
          return {
            modelValue: contactForm,
          };
        default:
          return {};
      }
    };

    const componentListeners = (id: FormPartId): Record<string, unknown> => {
      switch (id) {
        case 'general':
          return {
            'update:modelValue': mergeIntoForm,
          };
        case 'documents':
          return {
            'update:modelValue': mergeIntoForm,
            changeContactForm,
          };
        case 'billing':
          return {
            'update:modelValue': mergeIntoForm,
            'update:billingAddress': (v: Address) => Object.assign(billingAddress, v),
            updateBillingAddressMode: (v: 'residence' | 'other'): void => {
              billingAddressMode.value = v;
            },
          };
        case 'internalNotes':
          return {
            'update:modelValue': mergeIntoForm,
          };
        default:
          return {};
      }
    };

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

    const handleSave = async (): Promise<void> => {
      resetUiErrors();
      clearHiddenFields();
      contactForm.contactType = contactType.value;
      const payload = buildPayloadToValidate();
      setValues(payload);
      const { valid } = await validate();
      mapVeeValidateErrors();
      if (!Boolean(valid) || badges.value.total > 0) {
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
        if (contact.value !== null) {
          await contactsStore.updateContactFields(contact.value.id, contact.value, contactForm);
          contactId = contact.value.id;
        } else {
          const newContact = await contactsStore.createContact(contactForm);
          contactId = newContact.id;
        }
        dialogRef?.value?.close({ action: 'saved', contactId });
      } catch (error) {
        useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), (error as Error).message);
      } finally {
        uiStore.stopLoading();
      }
    };

    const handleCancel = (): void => {
      dialogRef?.value?.close({ action: 'cancel' });
    };

    watch(contactType, () => {
      activeTab.value = '0';
      activePanel.value = null;
      if (contactForm.id === 0) {
        contactForm.firstname = '';
        contactForm.lastname = '';
        contactForm.lastname2 = '';
        contactForm.name = '';
      }
      resetUiErrors();
    });

    onBeforeMount(async () => {
      const initialContact = dialogRef?.value?.data.contact as ContactDetail | null;
      try {
        await loadInitialData(initialContact ?? null);
      } catch (error) {
        if (error instanceof Error) {
          useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
        }
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
      uiErrors,
      badges,
      billingAddressMode,
      billingAddress,
      formParts,
      components,
      componentProps,
      componentListeners,
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
    height: 632px;
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
      flex: 1;
      min-height: 0;
      overflow: hidden;
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
