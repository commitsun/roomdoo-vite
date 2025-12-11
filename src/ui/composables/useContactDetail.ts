import { ref, type Ref } from 'vue';

import type { ContactDetail } from '@/domain/entities/Contact';
import type { Country } from '@/domain/entities/Country';
import type { CountryState } from '@/domain/entities/CountryState';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { usePaymentTermsStore } from '@/infrastructure/stores/paymentTerms';
import { usePricelistStore } from '@/infrastructure/stores/pricelist';
import { useDocumentTypesStore } from '@/infrastructure/stores/documentTypes';
import { useTagsStore } from '@/infrastructure/stores/tags';
import { useSaleChannelsStore } from '@/infrastructure/stores/saleChannels';

type BillingAddressState = {
  street: string;
  city: string;
  zipCode: string;
  country: Country | undefined;
  state: CountryState | undefined;
};

export function useContactDetailLoader({
  contactType,
  contactForm,
  billingAddress,
  billingAddressMode,
  resetUiErrors,
}: {
  contactType: Ref<'person' | 'company' | 'agency'>;
  contactForm: ContactDetail;
  billingAddress: BillingAddressState;
  billingAddressMode: Ref<'residence' | 'other'>;
  resetUiErrors: () => void;
}): {
  contact: Ref<ContactDetail | null>;
  activePanel: Ref<string | null>;
  activeTab: Ref<string>;
  changeContactForm: (id: number) => Promise<void>;
  loadInitialData: (initialContact: ContactDetail | null) => Promise<void>;
} {
  const contactsStore = useContactsStore();
  const countriesStore = useCountriesStore();
  const paymentTermsStore = usePaymentTermsStore();
  const pricelistStore = usePricelistStore();
  const documentTypesStore = useDocumentTypesStore();
  const tagsStore = useTagsStore();
  const saleChannelsStore = useSaleChannelsStore();

  const contact = ref<ContactDetail | null>(null);
  const activePanel = ref<string | null>(null);
  const activeTab = ref('0');

  const applyContactToState = (source: ContactDetail): void => {
    contactType.value = (source.contactType ?? 'person') as typeof contactType.value;

    Object.assign(contactForm, source);
    if (contact.value !== null) {
      Object.assign(contact.value, source);
    } else {
      contact.value = source;
    }

    if (source.birthdate) {
      const birth = new Date(source.birthdate);
      contactForm.birthdate = birth;
      if (contact.value !== null) {
        contact.value.birthdate = birth;
      }
    }

    if (source.lang !== undefined) {
      contactForm.lang = source.lang.replace('_', '-');
    }

    if (
      source.street === source.residenceStreet &&
      source.zipCode === source.residenceZip &&
      source.city === source.residenceCity &&
      source.country?.id === source.residenceCountry?.id &&
      source.state?.id === source.residenceState?.id
    ) {
      billingAddressMode.value = 'residence';
    } else {
      billingAddressMode.value = 'other';
      Object.assign(billingAddress, {
        street: source.street,
        zipCode: source.zipCode,
        city: source.city,
        country: source.country,
        state: source.state,
      });
    }

    if (source.documents) {
      source.documents.forEach((doc) => {
        if (doc.country) {
          const country = countriesStore.countries.find((c) => c.id === doc.country?.id);
          if (country) {
            doc.country.code = country.code as string;
          }
        }
      });
      contactForm.documents = source.documents;
    }

    activeTab.value = '0';
    activePanel.value = '0';
  };

  const changeContactForm = async (id: number): Promise<void> => {
    resetUiErrors();

    const contactFetched = await contactsStore.fetchContactById(id);
    if (contactFetched) {
      applyContactToState(contactFetched);
    }
  };

  const loadInitialData = async (initialContact: ContactDetail | null): Promise<void> => {
    contact.value = initialContact;

    await Promise.all([
      documentTypesStore.fetchDocumentTypes(),
      documentTypesStore.fetchFiscalDocumentTypes(),
      countriesStore.fetchCountries(),
      paymentTermsStore.fetchPaymentTerms(),
      pricelistStore.fetchPricelists(),
      saleChannelsStore.fetchSaleChannels(),
      tagsStore.fetchTags(),
    ]);

    resetUiErrors();

    if (contact.value) {
      applyContactToState(contact.value);
    }
  };

  return {
    contact,
    activePanel,
    activeTab,
    changeContactForm,
    loadInitialData,
  };
}
