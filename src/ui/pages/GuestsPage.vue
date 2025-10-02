<template>
  <div class="main-content">
    <Button
      class="button-add-mobile"
      icon="pi pi-user-plus"
      severity="primary"
      size="large"
      rounded
      @click="openNewContact()"
    />
    <DataTable
      v-model:first="first"
      :value="guests"
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
      :sortField="safeSortField"
      :sortOrder="sortOrder"
      :globalFilterFields="['name']"
      @page="handlePageChange"
      @filter="handleFilterChange"
      @sort="handleSortChange"
      @rowClick="openContactDetail($event.data.id)"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex gap-3 items-center">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="globalQuery"
                :placeholder="t('contacts.globalSearch')"
                @input="onGlobalQueryInput"
                :aria-label="t('contacts.globalSearch')"
              />
            </IconField>
            <Button
              v-if="showClearButton"
              type="button"
              icon="pi pi-filter-slash"
              :label="t('contacts.clear')"
              :aria-label="t('contacts.clear') + ' ' + t('contacts.globalSearch')"
              variant="outlined"
              @click="clearAll"
            />
          </div>
          <Button
            type="button"
            icon="pi pi-user-plus"
            :label="t('contacts.new')"
            @click="openNewContact()"
            class="button-add"
          />
        </div>
        <div class="mt-6 font-semibold">
          {{ t('contacts.guests') }}
        </div>
      </template>

      <!-- Name -->
      <Column
        field="name"
        :header="t('contacts.fullName')"
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
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="t('contacts.searchByName')"
          />
        </template>
      </Column>

      <!-- Main Document -->
      <Column
        field="identificationDocuments"
        :header="t('contacts.document')"
        style="min-width: 200px"
        filter
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
      >
        <template #body="{ data }">
          <span
            v-if="
              Array.isArray(data.identificationDocuments) && data.identificationDocuments.length > 0
            "
          >
            {{ data.identificationDocuments[0]?.type }}
            {{ data.identificationDocuments[0]?.number }}
            <span
              v-if="data.identificationDocuments.length > 1"
              :title="data.identificationDocuments.map((d: { type: string; number: string }) => ((d.type ) + ' ' + (d.number ))).join('\n')"
              style="cursor: help; opacity: 0.8"
            >
              (+{{ data.identificationDocuments.length - 1 }})
            </span>
          </span>
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="t('contacts.searchByDocument')"
          />
        </template>
      </Column>

      <!-- Country -->
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
          <div class="flex items-center gap-2 h-full">
            <div v-if="data.country">
              <CountryFlag :country="data.country?.code ?? ''" size="normal" shadow />
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
            :placeholder="t('contacts.selectCountries')"
            class="w-full ms-eq"
            showClear
            :showToggleAll="false"
            :maxSelectedLabels="1"
            appendTo="self"
            :panelStyle="{ width: '100%' }"
            :selectedItemsLabel="
              t('contacts.n_countries_selected', {
                count: Array.isArray(filterModel.value) ? filterModel.value.length : 0,
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

      <!-- Last reservation (name) -->
      <Column
        field="lastReservationName"
        :header="t('contacts.lastReservation')"
        style="min-width: 180px"
      >
        <template #body="{ data }">
          <span>{{ data.lastReservationName }}</span>
        </template>
      </Column>

      <!-- Internal comments -->
      <Column field="internalNotes" :header="t('contacts.internalNotes')" style="max-width: 300px">
        <template #body="{ data }">
          <span v-if="data.internalNotes" class="ellipsis-2" :title="data.internalNotes">
            {{ data.internalNotes }}
          </span>
        </template>
      </Column>

      <!-- In house -->
      <Column field="inHouse" style="width: 160px; text-align: center">
        <template #header>
          <div class="flex items-center gap-2">
            <label for="inhouse-toggle" class="cursor-pointer select-none font-bold">
              Inhouse
            </label>
            <ToggleSwitch
              inputId="inhouse-toggle"
              :modelValue="filters.inHouse?.value === true"
              @update:modelValue="onToggleInhouse"
              aria-label="In-house"
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
import { useI18n } from 'vue-i18n';
import DataTable, {
  type DataTableFilterEvent,
  type DataTablePageEvent,
  type DataTableSortEvent,
} from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ToggleSwitch from 'primevue/toggleswitch';
import CountryFlag from 'vue-country-flag-next';
import { FilterMatchMode } from '@primevue/core/api';

import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useUIStore } from '@/infrastructure/stores/ui';
import ContactDetail from '@/ui/components/contacts/ContactDetail.vue';

// helper: explicit non-empty string
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

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
    const { t } = useI18n();

    const numTotalRecords = ref<number>(contactsStore.contactsCount || 0);
    const first = ref(0);
    const page = ref(1);
    const rows = ref(50);
    const rowsPerPageOptions = ref([50, 100, 200]);

    const sortField = ref<string | null>(null);
    const sortOrder = ref<number>(1);
    const SORT_FIELD_MAP: Record<string, string> = { name: 'name', country: 'country' };

    const orderBy = computed<string | undefined>(() => {
      if (sortField.value !== null && sortField.value !== '') {
        const key = SORT_FIELD_MAP[sortField.value] ?? sortField.value;
        const prefix = sortOrder.value === -1 ? '-' : '';
        return `${prefix}${key}`;
      }
      return undefined;
    });

    const safeSortField = computed<string | undefined>(() =>
      sortField.value === null || sortField.value === '' ? undefined : sortField.value,
    );

    const filters = ref({
      name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
      identificationDocuments: {
        value: null as string | null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      inHouse: { value: null as boolean | null, matchMode: FilterMatchMode.EQUALS },
    });

    const globalQuery = ref<string>('');

    const countryOptions = computed(() =>
      (countriesStore.countries ?? []).map((c) => ({
        label: c.name,
        value: c.name,
        code: c.code,
      })),
    );

    const showClearButton = computed<boolean>(() => {
      const f = filters.value;

      const anyString =
        isNonEmptyString(globalQuery.value) ||
        isNonEmptyString(f.name.value) ||
        isNonEmptyString(f.identificationDocuments.value) ||
        isNonEmptyString(sortField.value);

      const anyCountry =
        (Array.isArray(f.country.value) && f.country.value.length > 0) ||
        (typeof f.country.value === 'string' && f.country.value.trim().length > 0);

      const inHouseOn = f.inHouse.value === true;

      return anyString || anyCountry || inHouseOn;
    });

    const guests = computed(() => contactsStore.guests);

    async function fetchNow(): Promise<void> {
      const inHouseOnly = filters.value.inHouse?.value === true ? true : undefined;
      uiStore.startLoading();
      try {
        await contactsStore.fetchGuests(
          {
            page: page.value,
            pageSize: rows.value,
          },
          {
            globalSearch: isNonEmptyString(globalQuery.value) ? globalQuery.value : undefined,
            nameContains: isNonEmptyString(filters.value.name.value)
              ? filters.value.name.value
              : undefined,
            documentContains: isNonEmptyString(filters.value.identificationDocuments.value)
              ? filters.value.identificationDocuments.value
              : undefined,
            inHouseOnly: inHouseOnly,
            countryIn:
              Array.isArray(filters.value.country.value) && filters.value.country.value.length > 0
                ? (filters.value.country.value as string[])
                : undefined,
          },

          orderBy.value,
        );
        numTotalRecords.value = contactsStore.contactsCount ?? numTotalRecords.value;
      } finally {
        uiStore.stopLoading();
      }
    }

    const debouncedFetchNow = useDebounceFn(async () => fetchNow(), 250, { maxWait: 3000 });

    async function handlePageChange(e: DataTablePageEvent): Promise<void> {
      if (typeof e.page === 'number') {
        page.value = e.page + 1;
        rows.value = e.rows;
        await fetchNow();
      }
    }

    async function handleFilterChange(e: DataTableFilterEvent): Promise<void> {
      if (e.filters !== null) {
        filters.value = e.filters as typeof filters.value; // TODO: refine type
        page.value = 1;
        await fetchNow();
      }
    }

    async function handleSortChange(e: DataTableSortEvent): Promise<void> {
      if (e.sortField !== undefined) {
        sortField.value = (e.sortField as string) ?? null;
        sortOrder.value = typeof e.sortOrder === 'number' ? e.sortOrder : 1;
        page.value = 1;
        await fetchNow();
      }
    }

    async function clearAll(): Promise<void> {
      globalQuery.value = '';
      sortField.value = null;
      sortOrder.value = 1;
      page.value = 1;

      filters.value = {
        name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
        country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
        identificationDocuments: {
          value: null as string | null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        inHouse: { value: null as boolean | null, matchMode: FilterMatchMode.EQUALS },
      };
      await fetchNow();
    }

    function onToggleInhouse(val: boolean): void {
      const newVal = val ? true : null;
      filters.value = {
        ...filters.value,
        inHouse: { value: newVal, matchMode: FilterMatchMode.EQUALS },
      };
      page.value = 1;
      void fetchNow();
    }

    const currentPmsPropertyId = computed(() => pmsPropertiesStore.currentPmsPropertyId);

    const openContactDetail = async (contactId: number) => {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContactSchema();
        const contact = await contactsStore.fetchContactById(contactId);
        contact.id = contactId;
        open(ContactDetail, {
          props: { header: contact.name || t('contacts.detail') },
          data: { contact: contact || null },
          onClose: ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh === true || data?.action === 'saved') {
              void fetchNow();
            }
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    };

    async function openNewContact(): Promise<void> {
      uiStore.startLoading();
      try {
        open(ContactDetail, {
          props: { header: t('contacts.new') },
          data: { props: { contact: null } },
          onClose: ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh === true || data?.action === 'saved') {
              void fetchNow();
            }
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    }

    function onGlobalQueryInput(): void {
      const len = globalQuery.value.length;
      if (len >= 3 || len === 0) {
        void debouncedFetchNow();
      }
    }

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
      safeSortField,
      filters,
      globalQuery,
      countryOptions,
      first,
      showClearButton,
      t,
      clearAll,
      onToggleInhouse,
      openContactDetail,
      openNewContact,
      handlePageChange,
      handleFilterChange,
      handleSortChange,
      fetchNow,
      debouncedFetchNow,
      onGlobalQueryInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content {
  height: 100%;
  background-color: #f9f9f9;
  position: relative;
  .button-add-mobile {
    position: absolute;
    bottom: 5rem;
    right: 2rem;
    z-index: 10;
    opacity: 0.7;
  }
  .button-add {
    display: none;
  }
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  max-width: 100%;
}
@media (min-width: 1024px) {
  .main-content {
    .button-add-mobile {
      display: none;
    }
    .button-add {
      display: flex;
      margin-right: 1rem;
    }
  }
  :deep(.p-datatable-scrollable .p-datatable-frozen-column) {
    background: none;
  }
}
</style>
