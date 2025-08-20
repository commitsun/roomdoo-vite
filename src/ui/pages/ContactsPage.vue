<template>
  <div class="main-content">
    <DataTable
      :value="customers"
      scrollable
      scrollHeight="flex"
      class="contacts-table"
      paginator
      :rows="rows"
      :rowsPerPageOptions="rowsPerPageOptions"
      :rowStyle="() => ({ height: '58px' })"
      :totalRecords="numTotalRecords"
      @page="loadContacts($event)"
      lazy
    >
      <Column
        field="name"
        header="Nombre"
        style="min-width: 200px"
        frozen
        class="font-bold"
      ></Column>
      <Column field="types" header="Tipo" style="min-width: 100px">
        <template #body="{ data }">
          <Tag
            :severity="severityType(type)"
            v-for="type in data.types"
            :value="type"
            class="mr-2 mt-1"
          ></Tag>
        </template>
      </Column>
      <Column field="email" header="Email" style="min-width: 100px"></Column>
      <Column field="phone" header="Teléfono" style="min-width: 200px">
        <template #body="{ data }">
          <span v-for="(phone, index) in data.phones" :key="phone.type">
            <Chip
              v-if="index === 0"
              :label="phone.number"
              :style="{ fontSize: '11px', padding: '0 6px', height: '18px', lineHeight: '18px' }"
              :icon="phone.type === 'phone' ? 'pi pi-phone' : 'pi pi-mobile'"
            />
            <Chip
              v-else
              :label="phone.number"
              :style="{ fontSize: '11px', padding: '0 6px', height: '18px', lineHeight: '18px' }"
              :icon="phone.type === 'phone' ? 'pi pi-phone' : 'pi pi-mobile'"
            />
          </span>
        </template>
      </Column>
      <Column header="Country" filterField="country" style="min-width: 200px">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <div v-if="data.country">
              <CountryFlag :country="data.country.code" size="normal" shadow></CountryFlag>
            </div>
            <span v-if="data.country">{{ data.country.name }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';

import Column from 'primevue/column';
import CountryFlag from 'vue-country-flag-next';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useUIStore } from '@/infrastructure/stores/ui';

export default defineComponent({
  name: 'ContactsPage',
  components: {
    DataTable,
    Column,
    Tag,
    Chip,
    CountryFlag,
  },
  setup() {
    const contactsStore = useContactsStore();
    const uiStore = useUIStore();
    const numTotalRecords = ref(0);
    const page = ref(1);
    const rows = ref(20);
    const rowsPerPageOptions = ref([20, 100, 200]);

    const customers = computed(() => {
      return contactsStore.contacts || [];
    });

    const severityType = (type: string) => {
      // values: are guest, customer, agency, supplier
      if (type === 'guest') return 'warning';
      if (type === 'customer') return 'success';
      if (type === 'agency') return 'danger';
      if (type === 'supplier') return 'info';
      return 'secondary';
    };

    onBeforeMount(async () => {
      await contactsStore.fetchContacts(page.value, rows.value);
      numTotalRecords.value = contactsStore.contactsCount;
    });

    const loadContacts = async (event: any) => {
      uiStore.startLoading();
      await contactsStore.fetchContacts(event.page + 1, event.rows);
      uiStore.stopLoading();
    };

    return {
      rowsPerPageOptions,
      rows,
      customers,
      numTotalRecords,
      loadContacts,
      severityType,
    };
  },
});
</script>
<style lang="scss" scoped>
.main-content {
  height: 100%;
  background-color: #f9f9f9;
  padding-top: 80px;
}
</style>
