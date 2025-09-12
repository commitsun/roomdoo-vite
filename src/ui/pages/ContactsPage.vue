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
      lazy
      v-model:filters="filters"
      filterDisplay="menu"
      sortMode="single"
      :sortField="sortField || undefined"
      :sortOrder="sortOrder"
      :globalFilterFields="['name', 'email', 'phone']"
      @page="loadLazy"
      @filter="loadLazy"
      @sort="loadLazy"
    >
      <template #header>
        <div class="flex gap-3 items-center">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="globalQuery"
              :placeholder="t('contacts.globalSearch')"
              @input="debouncedFetchNow()"
              :aria-label="t('contacts.globalSearch')"
            />
          </IconField>
          <Button
            type="button"
            icon="pi pi-filter-slash"
            :label="t('contacts.clear')"
            :aria-label="t('contacts.clear')"
            variant="outlined"
            @click="clearAll"
          />
        </div>
      </template>

      <!-- Nombre -->
      <Column
        field="name"
        :header="t('contacts.fullName')"
        style="min-width: 200px"
        frozen
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
        sortable
      >
        <template #body="{ data }">
          {{ data.name }}
        </template>

        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="t('contacts.searchByName')"
          />
        </template>
      </Column>

      <!-- Tipo -->
      <Column
        :header="t('contacts.type')"
        filter
        filterField="type"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 100px"
      >
        <template #body="{ data }">
          <Tag
            v-for="type in data.types"
            :key="type"
            :severity="severityType(type)"
            :value="t('contacts.types.' + type)"
            class="mr-2 mt-1"
          />
        </template>

        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="CONTACT_TYPES.map((v) => ({ name: t('contacts.types.' + v), value: v }))"
            optionLabel="name"
            optionValue="value"
            showClear
            :placeholder="t('contacts.searchByType')"
          />
        </template>
      </Column>

      <!-- Email -->
      <Column
        field="email"
        :header="t('contacts.email')"
        style="min-width: 200px"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
      >
        <template #body="{ data }">
          {{ data.email }}
        </template>

        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="t('contacts.searchByEmail')"
          />
        </template>
      </Column>

      <!-- Teléfonos -->
      <Column field="phone" :header="t('contacts.phone')" style="min-width: 220px">
        <template #body="{ data }">
          <span v-for="(phone, index) in data.phones" :key="`${phone.type}-${index}`">
            <Chip
              :label="phone.number"
              :style="{ fontSize: '11px', padding: '0 6px', height: '18px', lineHeight: '18px' }"
              :icon="phone.type === 'phone' ? 'pi pi-phone' : 'pi pi-mobile'"
              class="mr-1 mb-1"
            />
          </span>
        </template>
      </Column>

      <!-- País -->
      <Column
        field="country"
        :header="t('contacts.country')"
        filter
        filterField="country"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :filterMenuStyle="{ width: '18rem' }"
        style="min-width: 220px"
        sortable
      >
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <div v-if="data.country">
              <CountryFlag :country="data.country.code" size="normal" shadow />
            </div>
            <span v-if="data.country">{{ data.country.name }}</span>
          </div>
        </template>

        <template #filter="{ filterModel }">
          <MultiSelect
            v-model="filterModel.value"
            :options="countries"
            optionLabel="label"
            optionValue="value"
            filter
            :placeholder="t('contacts.searchByCountry')"
            class="w-full ms-eq"
            showClear
            :showToggleAll="false"
            :maxSelectedLabels="1"
            appendTo="self"
            :panelStyle="{ width: '100%' }"
            :selectedItemsLabel="
              t('contacts.n_countries_selected', {
                count: filterModel.value ? filterModel.value.length : 0,
              })
            "
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2 leading-none">
                <CountryFlag
                  :country="slotProps.option.code"
                  size="normal"
                  shadow
                  style="margin-bottom: 1px"
                />
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDebounceFn } from '@vueuse/core';
import { CONTACT_TYPES } from '@/domain/types/ContactType';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import CountryFlag from 'vue-country-flag-next';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useUIStore } from '@/infrastructure/stores/ui';

const truncateLabel = (label: string, maxLength = 20) => {
  if (!label) return '';
  return label.length > maxLength ? label.substring(0, maxLength) + '…' : label;
};

export default defineComponent({
  name: 'ContactsPage',
  components: {
    DataTable,
    Column,
    Tag,
    Chip,
    InputText,
    Select,
    MultiSelect,
    Button,
    IconField,
    InputIcon,
    CountryFlag,
  },
  setup() {
    const contactsStore = useContactsStore();
    const countriesStore = useCountriesStore();
    const uiStore = useUIStore();
    const { t } = useI18n();

    const numTotalRecords = ref(0);
    const page = ref(1);
    const rows = ref(50);
    const rowsPerPageOptions = ref([50, 100, 200]);

    const sortField = ref<string | null>(null);
    const sortOrder = ref<number>(1);
    const SORT_FIELD_MAP: Record<string, string> = {
      name: 'name',
      country: 'country',
    };
    const orderBy = computed(() =>
      sortField.value
        ? `${sortOrder.value === -1 ? '-' : ''}${
            SORT_FIELD_MAP[sortField.value] ?? sortField.value
          }`
        : undefined
    );

    const filters = ref({
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as string | null, matchMode: FilterMatchMode.CONTAINS }],
      },
      email: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as string | null, matchMode: FilterMatchMode.CONTAINS }],
      },
      type: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as string | null, matchMode: FilterMatchMode.EQUALS }],
      },
      country: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as string[] | string | null, matchMode: FilterMatchMode.IN }],
      },
    });

    const globalQuery = ref<string>('');

    const countries = computed(() =>
      countriesStore.countries.map((c) => ({
        label: truncateLabel(c.name),
        value: c.name,
        code: c.code,
      }))
    );

    const customers = computed(() => contactsStore.contacts || []);
    const setCountFromStore = () => (numTotalRecords.value = contactsStore.contactsCount);

    const fetchNow = async () => {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContacts(
          page.value,
          rows.value,
          globalQuery.value || undefined,
          filters.value.name.constraints[0].value || undefined,
          filters.value.email.constraints[0].value || undefined,
          filters.value.type.constraints[0].value || undefined,
          (filters.value.country.constraints[0].value as string[] | null) || undefined,
          orderBy.value
        );
        setCountFromStore();
      } finally {
        uiStore.stopLoading();
      }
    };

    const debouncedFetchNow = useDebounceFn(async () => await fetchNow(), 250, { maxWait: 3000 });

    const loadLazy = async (e?: any) => {
      if (e?.page !== undefined) {
        page.value = e.page + 1;
        rows.value = e.rows;
      }
      if (e?.sortField !== undefined) {
        sortField.value = e.sortField || null;
        sortOrder.value = typeof e.sortOrder === 'number' ? e.sortOrder : 1;
        page.value = 1;
      }
      if (e?.filters) {
        filters.value = e.filters;
        page.value = 1;
      }
      await fetchNow();
    };

    const clearAll = () => {
      globalQuery.value = '';
      sortField.value = null;
      sortOrder.value = 1;
      page.value = 1;

      filters.value = {
        name: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
        },
        email: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
        },
        type: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        country: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
        },
      };

      loadLazy({
        filters: { ...filters.value },
        page: 0,
        rows: rows.value,
        sortField: null,
        sortOrder: 1,
      });
    };

    const severityType = (type: string) => {
      if (type === 'guest') return 'warning';
      if (type === 'customer') return 'success';
      if (type === 'agency') return 'danger';
      if (type === 'supplier') return 'info';
      return 'secondary';
    };

    onBeforeMount(async () => {
      await fetchNow();
    });
    onMounted(async () => {
      await useCountriesStore().fetchCountries();
    });

    return {
      rowsPerPageOptions,
      rows,
      customers,
      numTotalRecords,
      globalQuery,
      filters,
      CONTACT_TYPES,
      countries,
      sortOrder,
      sortField,
      t,
      loadLazy,
      fetchNow,
      debouncedFetchNow,
      clearAll,
      severityType,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content {
  height: 100%;
  background-color: #f9f9f9;
}
</style>
