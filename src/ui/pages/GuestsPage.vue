<template>
  <div class="main-content">
    <DataTable
      :value="guests || []"
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
      selectionMode="single"
      :sortField="sortField || undefined"
      :sortOrder="sortOrder"
      :globalFilterFields="['name']"
      @page="loadLazy"
      @filter="loadLazy"
      @sort="loadLazy"
      @row-click="openContactDetail($event.data)"
    >
      <template #header>
        <div class="flex gap-3 items-center">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="globalQuery" placeholder="Keyword Search" @input="loadLazy()" />
          </IconField>
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            variant="outlined"
            @click="clearAll"
          />
        </div>
      </template>

      <!-- Nombre completo -->
      <Column
        field="name"
        header="Nombre completo"
        style="min-width: 220px"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
        sortable
        frozen
      >
        <template #body="{ data }">{{ data.name }}</template>

        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
        </template>
      </Column>

      <!-- Documento principal -->
      <Column
        field="documents"
        header="Documento"
        style="min-width: 200px"
        filter
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
      >
        <template #body="{ data }">
          <span v-if="data.documents?.length">
            {{ data.documents[0]?.type }} {{ data.documents[0]?.number }}
            <span
              v-if="data.documents.length > 1"
              :title="data.documents.map((d: any) => ((d?.type ?? 'Doc') + ' ' + (d?.number ?? ''))).join('\n')"
              style="cursor: help; opacity: 0.8"
            >
              (+{{ data.documents.length - 1 }})
            </span>
          </span>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by document" />
        </template>
      </Column>

      <!-- País -->
      <Column
        field="country"
        header="País"
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
          <div class="flex items-center gap-2 h-full">
            <div v-if="data.country">
              <CountryFlag
                :country="data.country.code ? data.country.code : ''"
                size="normal"
                shadow
              />
            </div>
            <div v-if="data.country">{{ data.country.name }}</div>
          </div>
        </template>

        <template #filter="{ filterModel }">
          <MultiSelect
            v-model="filterModel.value"
            :options="countryOptions"
            optionLabel="label"
            optionValue="label"
            filter
            placeholder="Select Countries"
            class="w-full ms-eq"
            showClear
            :showToggleAll="false"
            :maxSelectedLabels="1"
            appendTo="self"
            :panelStyle="{ width: '100%' }"
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

      <!-- Última reserva (nombre) -->
      <Column field="lastReservationName" header="Última reserva" style="min-width: 180px">
        <template #body="{ data }">
          <span>{{ data.lastReservationName }}</span>
        </template>
      </Column>

      <!-- Comentarios internos (truncado + tooltip) -->
      <Column field="internalNotes" header="Comentarios internos" style="max-width: 300px">
        <template #body="{ data }">
          <span v-if="data.internalNotes" class="ellipsis-2" :title="data.internalNotes">
            {{ data.internalNotes }}
          </span>
        </template>
      </Column>

      <!-- Actualmente alojado -->
      <Column field="inHouse" style="width: 160px; text-align: center">
        <template #header>
          <div class="flex items-center gap-2">
            <label for="inhouse-toggle" class="cursor-pointer select-none font-bold">
              Inhouse
            </label>
            <ToggleSwitch
              inputId="inhouse-toggle"
              :modelValue="filters.inHouse?.constraints?.[0]?.value === true"
              @update:modelValue="onToggleInhouse"
              aria-label="Filtrar inhouse"
            />
          </div>
        </template>

        <template #body="{ data }">
          <i v-if="data.inHouse" class="pi pi-home" style="font-size: 1rem; color: #22c55e" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ToggleSwitch from 'primevue/toggleswitch';

import CountryFlag from 'vue-country-flag-next';

import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';
import PartnerForm from '@/_legacy/components/partners/PartnerForm.vue';
import type { Contact } from '@/domain/entities/Contact';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useUIStore } from '@/infrastructure/stores/ui';

export default defineComponent({
  components: {
    DataTable,
    Column,
    InputText,
    MultiSelect,
    Button,
    IconField,
    InputIcon,
    ToggleSwitch,
    CountryFlag,
  },
  setup() {
    const contactsStore = useContactsStore();
    const countriesStore = useCountriesStore();
    const { open } = useAppDialog();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const uiStore = useUIStore();

    const guests = computed(() => contactsStore.guests);
    const currentPmsPropertyId = computed(() => pmsPropertiesStore.currentPmsPropertyId);

    const numTotalRecords = ref<number>(contactsStore.contactsCount || 0);

    const page = ref(1);
    const rows = ref(50);
    const rowsPerPageOptions = ref([50, 100, 200]);

    const sortField = ref<string | null>(null);
    const sortOrder = ref<number>(1);
    const SORT_FIELD_MAP: Record<string, string> = { name: 'name', country: 'country' };
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
      country: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as string[] | string | null, matchMode: FilterMatchMode.IN }],
      },
      documents: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as string | null, matchMode: FilterMatchMode.CONTAINS }],
      },
      inHouse: {
        operator: FilterOperator.AND,
        constraints: [{ value: null as boolean | null, matchMode: FilterMatchMode.EQUALS }],
      },
    });

    const globalQuery = ref<string>('');

    const countryOptions = computed(
      () =>
        countriesStore.countries?.map((c) => ({
          label: c.name,
          value: c.name,
          code: c.code,
        })) ?? []
    );

    const fetchNow = async () => {
      const inhouseOnly =
        filters.value.inHouse?.constraints?.[0]?.value === true ? true : undefined;
      uiStore.startLoading();
      await contactsStore.fetchGuests(
        page.value,
        rows.value,
        globalQuery.value || undefined,
        filters.value.name.constraints[0].value || undefined,
        filters.value.documents.constraints[0].value || undefined,
        (filters.value.country.constraints[0].value as string[] | null) || undefined,
        inhouseOnly,
        orderBy.value
      );
      numTotalRecords.value = contactsStore.contactsCount ?? numTotalRecords.value;
      uiStore.stopLoading();
    };

    const debouncedFetchNow = useDebounceFn(async () => await fetchNow(), 250, { maxWait: 3000 });

    const loadLazy = async (e?: any) => {
      if (e?.page !== undefined) {
        page.value = e.page + 1;
        rows.value = e.rows;
        return await debouncedFetchNow();
      }

      if (e === undefined) {
        const q = (globalQuery.value ?? '').trim();
        if (q.length === 0) {
          page.value = 1;
          return await debouncedFetchNow();
        }
        if (q.length < 3) return;
        page.value = 1;
        return await debouncedFetchNow();
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

      await debouncedFetchNow();
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
        country: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
        },
        documents: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
        },
        inHouse: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
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

    const onToggleInhouse = (val: boolean) => {
      const newVal = val ? true : null;
      filters.value = {
        ...filters.value,
        inHouse: {
          ...filters.value.inHouse,
          constraints: [{ value: newVal, matchMode: FilterMatchMode.EQUALS }],
        },
      };
      page.value = 1;
      loadLazy({ filters: { ...filters.value } });
    };

    const openContactDetail = async (contact: Contact) => {
      await useLegacyStore().fetchAndSetVuexPartnerAndACtiveProperty(
        contact.id,
        currentPmsPropertyId.value!
      );
      open(PartnerForm, {
        props: { header: contact.name || 'Contact Detail' },
        onClose: ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
          if (data?.refresh || data?.action === 'saved') {
            fetchNow();
          }
        },
      });
    };

    onBeforeMount(async () => {
      await fetchNow();
      await countriesStore.fetchCountries();
    });

    return {
      guests,
      numTotalRecords,
      rows,
      rowsPerPageOptions,
      sortField,
      sortOrder,
      filters,
      globalQuery,
      countryOptions,
      loadLazy,
      clearAll,
      onToggleInhouse,
      openContactDetail,
    };
  },
});
</script>

<style scoped>
.main-content {
  height: 100%;
  background-color: #f9f9f9;
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  max-width: 100%;
}
</style>
