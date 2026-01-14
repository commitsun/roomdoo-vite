<template>
  <div class="main-content">
    <div class="header">
      <div class="left">
        <Menu :size="24" class="icon" @click="$emit('showMenu')" />

        <h1>{{ t('contacts.title') }}</h1>
      </div>
      <Button :label="t('contacts.new')" icon="pi pi-plus" @click="openNewContact()" />
    </div>
    <Tabs v-model:value="activeTab" class="tabs" lazy>
      <TabList>
        <Tab value="all" as="div" class="flex items-center gap-2">
          <Users :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.all') }}</span>
          <Badge
            :value="allNumbersFormatted.all"
            size="large"
            :style="{
              fontWeight: '500',
              backgroundColor: getTabColor('all'),
              color: getFontColor('all'),
            }"
          />
        </Tab>
        <Tab value="customers" as="div" class="flex items-center gap-2">
          <UserCheck :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.customers') }}</span>
          <Badge
            :value="allNumbersFormatted.customers"
            size="large"
            :style="{
              fontWeight: '500',
              backgroundColor: getTabColor('customers'),
              color: getFontColor('customers'),
            }"
          />
        </Tab>
        <Tab value="guests" as="div" class="flex items-center gap-2">
          <BedDouble :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.guests') }}</span>
          <Badge
            :value="allNumbersFormatted.guests"
            size="large"
            :style="{
              fontWeight: '500',
              backgroundColor: getTabColor('guests'),
              color: getFontColor('guests'),
            }"
          />
        </Tab>
        <Tab value="agencies" as="div" class="flex items-center gap-2">
          <Store :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.agencies') }}</span>
          <Badge
            :value="allNumbersFormatted.agencies"
            size="large"
            :style="{
              fontWeight: '500',
              backgroundColor: getTabColor('agencies'),
              color: getFontColor('agencies'),
            }"
          />
        </Tab>
        <Tab value="suppliers" as="div" class="flex items-center gap-2">
          <Package :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.suppliers') }}</span>
          <Badge
            :value="allNumbersFormatted.suppliers"
            size="large"
            :style="{
              fontWeight: '500',
              backgroundColor: getTabColor('suppliers'),
              color: getFontColor('suppliers'),
            }"
          />
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="all">
          <ContactList
            type="contact"
            :total="numContacts"
            :isLoadingPage="isLoadingPage"
            :contacts="contactsStore.contacts"
            :numTotalRecords="contactsStore.contactsCount"
            :fetchAction="contactsStore.fetchContacts"
          />
        </TabPanel>
        <TabPanel value="customers">
          <ContactList
            type="customer"
            :total="numCustomers"
            :isLoadingPage="isLoadingPage"
            :contacts="contactsStore.customers"
            :numTotalRecords="contactsStore.customersCount"
            :fetchAction="contactsStore.fetchCustomers"
          />
        </TabPanel>
        <TabPanel value="guests">
          <ContactList
            type="guest"
            :total="numGuests"
            :isLoadingPage="isLoadingPage"
            :contacts="contactsStore.guests"
            :numTotalRecords="contactsStore.guestsCount"
            :fetchAction="contactsStore.fetchGuests"
          />
        </TabPanel>
        <TabPanel value="agencies">
          <ContactList
            type="agency"
            :total="numAgencies"
            :isLoadingPage="isLoadingPage"
            :contacts="contactsStore.agencies"
            :numTotalRecords="contactsStore.agenciesCount"
            :fetchAction="contactsStore.fetchAgencies"
          />
        </TabPanel>
        <TabPanel value="suppliers">
          <ContactList
            type="supplier"
            :total="numSuppliers"
            :isLoadingPage="isLoadingPage"
            :contacts="contactsStore.suppliers"
            :numTotalRecords="contactsStore.suppliersCount"
            :fetchAction="contactsStore.fetchSuppliers"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, type Ref } from 'vue';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Badge from 'primevue/badge';
import { Users, UserCheck, BedDouble, Store, Package, Menu } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

import ContactList from '@/ui/components/contactLists/ContactList.vue';
import ContactDetail from '@/ui/components/contactDetail/ContactDetail.vue';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { useUserStore } from '@/infrastructure/stores/user';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';

export default defineComponent({
  components: {
    Button,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Badge,
    ContactList,
    Users,
    UserCheck,
    BedDouble,
    Menu,
    Store,
    Package,
  },
  setup() {
    const { t } = useI18n();
    const { openDialog } = useAppDialog();
    const uiStore = useUIStore();
    const userStore = useUserStore();
    const contactsStore = useContactsStore();
    const useTextMessageStore = useTextMessagesStore();
    const isLoadingPage = ref(false);
    const activeTab: Ref<string> = ref('all');
    const numContacts = ref(0);
    const numCustomers = ref(0);
    const numGuests = ref(0);
    const numAgencies = ref(0);
    const numSuppliers = ref(0);

    const abbreviateNumber = (value: number): string => {
      if (!value) {
        return '0';
      }
      const formattedUS = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }).format(value); // → e.g. "1.2M"
      const decimalSeparator = (1.1).toLocaleString(userStore.user?.lang).charAt(1);
      return formattedUS.replace('.', decimalSeparator);
    };

    const allNumbersFormatted = computed(() => {
      return {
        all: abbreviateNumber(numContacts.value),
        customers: abbreviateNumber(numCustomers.value),
        guests: abbreviateNumber(numGuests.value),
        agencies: abbreviateNumber(numAgencies.value),
        suppliers: abbreviateNumber(numSuppliers.value),
      };
    });

    const getTabColor = (tab: string): string => {
      return activeTab.value === tab ? 'var(--p-primary-100)' : '#F1F5F9';
    };

    const getFontColor = (tab: string): string => {
      return activeTab.value === tab ? 'var(--p-primary-color)' : '#475569';
    };

    const fetchAllContacts = async (): Promise<void> => {
      isLoadingPage.value = true;
      const initialPagination = {
        page: 1,
        pageSize: 50,
      };
      // uiStore.startLoading();
      try {
        await Promise.all([
          contactsStore.fetchContacts(initialPagination),
          contactsStore.fetchAgencies(initialPagination),
          contactsStore.fetchCustomers(initialPagination),
          contactsStore.fetchGuests(initialPagination),
          contactsStore.fetchSuppliers(initialPagination),
        ]);
        numContacts.value = contactsStore.contactsCount;
        numCustomers.value = contactsStore.customersCount;
        numGuests.value = contactsStore.guestsCount;
        numAgencies.value = contactsStore.agenciesCount;
        numSuppliers.value = contactsStore.suppliersCount;
      } finally {
        isLoadingPage.value = false;
        // uiStore.stopLoading();
      }
    };

    const openNewContact = async (): Promise<void> => {
      uiStore.startLoading();
      try {
        openDialog(ContactDetail, {
          props: { header: t('contacts.new') },
          data: { props: { contact: null } },
          onClose: async ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh === true || data?.action === 'saved') {
              await fetchAllContacts();
            }
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
        }
      } finally {
        uiStore.stopLoading();
      }
    };

    onBeforeMount(async () => {
      await fetchAllContacts();
    });

    return {
      t,
      isLoadingPage,
      activeTab,
      allNumbersFormatted,
      getTabColor,
      getFontColor,
      openNewContact,
      numContacts,
      numCustomers,
      numGuests,
      numAgencies,
      numSuppliers,
      // Store to pass refs
      contactsStore,
    };
  },
});
</script>

<style scoped lang="scss">
.main-content {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100%;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    padding: 1rem;
    .left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }
  .tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .p-tablist {
      border-radius: 12px 0 0 0;
      border-bottom: 1px solid #ccc;
      background-color: #fff;
    }
    .p-tabpanels {
      flex: 1;
      padding: 0;
      background-color: #fff;
      border-top: none;
      min-height: 0;
      border-radius: 0 0 12px 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      :deep(.p-tabpanel) {
        height: 100%;
        overflow-y: hidden;
        overflow-x: auto;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    padding: 18px;
    .header {
      padding: 0;
      margin-bottom: 1rem;
      .left {
        .icon {
          display: none;
        }
      }
    }
    .tabs {
      .p-tablist {
        border-radius: 12px 12px 0 0;
      }
    }
  }
}
</style>
