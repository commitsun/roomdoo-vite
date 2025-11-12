<template>
  <div class="main-content">
    <div class="header">
      <h1>{{ t('contacts.title') }}</h1>
      <Button :label="t('contacts.new')" icon="pi pi-plus" />
    </div>
    <Tabs v-model:value="activeTab" class="tabs" lazy>
      <TabList>
        <Tab value="all" as="div" class="flex items-center gap-2">
          <Users :size="14" :class="{ active: activeTab === 'all' }" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.all') }}</span>
          <Badge
            :value="allNumbersFormatted.all"
            size="small"
            :style="{ backgroundColor: getTabColor('all') }"
          />
        </Tab>
        <Tab value="customers" as="div" class="flex items-center gap-2">
          <UserCheck :class="{ active: activeTab === 'customers' }" :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.customers') }}</span>
          <Badge
            :value="allNumbersFormatted.customers"
            size="small"
            :style="{ backgroundColor: getTabColor('customers') }"
          />
        </Tab>
        <Tab value="guests" as="div" class="flex items-center gap-2">
          <BedDouble :class="{ active: activeTab === 'guests' }" :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.guests') }}</span>
          <Badge
            :value="allNumbersFormatted.guests"
            size="small"
            :style="{ backgroundColor: getTabColor('guests') }"
          />
        </Tab>
        <Tab value="agencies" as="div" class="flex items-center gap-2">
          <Store :class="{ active: activeTab === 'agencies' }" :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.agencies') }}</span>
          <Badge
            :value="allNumbersFormatted.agencies"
            size="small"
            :style="{ backgroundColor: getTabColor('agencies') }"
          />
        </Tab>
        <Tab value="suppliers" as="div" class="flex items-center gap-2">
          <Package :class="{ active: activeTab === 'suppliers' }" :size="14" />
          <span class="whitespace-nowrap text-[14px]">{{ t('contacts.suppliers') }}</span>
          <Badge
            :value="allNumbersFormatted.suppliers"
            size="small"
            :style="{ backgroundColor: getTabColor('suppliers') }"
          />
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="all">
          <ContactList :total="numContacts" />
        </TabPanel>
        <TabPanel value="customers">
          <CustomerList :total="numCustomers" />
        </TabPanel>
        <TabPanel value="guests">
          <GuestList :total="numGuests" />
        </TabPanel>
        <TabPanel value="agencies">
          <AgencyList :total="numAgencies" />
        </TabPanel>
        <TabPanel value="suppliers">
          <SupplierList :total="numSuppliers" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, type Ref } from 'vue';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Badge from 'primevue/badge';
import { Users, UserCheck, BedDouble, Store, Package } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

import ContactList from '@/ui/components/contacts/ContactList.vue';
import CustomerList from '@/ui/components/contacts/CustomerList.vue';
import GuestList from '@/ui/components/contacts/GuestList.vue';
import SupplierList from '@/ui/components/contacts/SupplierList.vue';
import AgencyList from '@/ui/components/contacts/AgencyList.vue';
import { useUserStore } from '@/infrastructure/stores/user';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useUIStore } from '@/infrastructure/stores/ui';

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
    CustomerList,
    GuestList,
    SupplierList,
    AgencyList,
    Users,
    UserCheck,
    BedDouble,
    Store,
    Package,
  },
  setup() {
    const { t } = useI18n();
    const uiStore = useUIStore();
    const userStore = useUserStore();
    const contactsStore = useContactsStore();
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
      return activeTab.value === tab ? 'var(--p-primary-color)' : 'lightgray';
    };

    onMounted(async () => {
      const initialPagination = {
        page: 1,
        pageSize: 50,
      };
      uiStore.startLoading();
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
        uiStore.stopLoading();
      }
    });
    return {
      activeTab,
      allNumbersFormatted,
      t,
      getTabColor,
      numContacts,
      numCustomers,
      numGuests,
      numAgencies,
      numSuppliers,
    };
  },
});
</script>

<style scoped lang="scss">
.main-content {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100%;
  .header {
    display: flex;
    justify-content: space-between;

    align-items: center;
    margin-bottom: 1rem;
    h1 {
      font-size: 1.5rem;
      font-weight: bold;
      // margin-bottom: 1rem;
    }
  }
  .tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .p-tablist {
      border-radius: 12px 12px 0 0;
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
</style>
