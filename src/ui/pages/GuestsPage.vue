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
      :sortField="sortField || undefined"
      :sortOrder="sortOrder"
      :globalFilterFields="['name']"
      @page="handlePageChange"
      @filter="handleFilterChange"
      @sort="handleSortChange"
      @rowClick="openContactDetail($event.data)"
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
                @input="
                  globalQuery.length >= 3 || globalQuery.length == 0 ? debouncedFetchNow() : null
                "
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
        field="documents"
        :header="t('contacts.document')"
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
            :placeholder="t('contacts.selectCountries')"
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
    const { t } = useI18n();

    const numTotalRecords = ref<number>(contactsStore.contactsCount || 0);
    const first = ref(0);
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
      name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
      documents: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      inHouse: { value: null as boolean | null, matchMode: FilterMatchMode.EQUALS },
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
    const showClearButton = computed(
      () =>
        globalQuery.value.length ||
        sortField.value ||
        filters.value.name.value ||
        filters.value.documents.value ||
        (filters.value.country.value && filters.value.country.value.length) ||
        filters.value.inHouse.value === true
    );

    const guests = computed(() => contactsStore.guests);
    const currentPmsPropertyId = computed(() => pmsPropertiesStore.currentPmsPropertyId);

    const fetchNow = async () => {
      const inhouseOnly = filters.value.inHouse?.value === true ? true : undefined;
      uiStore.startLoading();
      await contactsStore.fetchGuests(
        page.value,
        rows.value,
        globalQuery.value || undefined,
        filters.value.name.value || undefined,
        filters.value.documents.value || undefined,
        (filters.value.country.value as string[] | null) || undefined,
        inhouseOnly,
        orderBy.value
      );
      numTotalRecords.value = contactsStore.contactsCount ?? numTotalRecords.value;
      uiStore.stopLoading();
    };

    const debouncedFetchNow = useDebounceFn(async () => await fetchNow(), 250, { maxWait: 3000 });
    const handlePageChange = async (e: DataTablePageEvent) => {
      if (e.page !== undefined) {
        page.value = e.page + 1;
        rows.value = e.rows;
        return await fetchNow();
      }
    };

    const handleFilterChange = async (e: DataTableFilterEvent) => {
      if (e.filters) {
        filters.value = e.filters as typeof filters.value;
        page.value = 1;
        return await fetchNow();
      }
    };
    const handleSortChange = async (e: DataTableSortEvent) => {
      if (e.sortField !== undefined) {
        sortField.value = (e.sortField as typeof sortField.value) || null; // TODO: check type
        sortOrder.value = typeof e.sortOrder === 'number' ? e.sortOrder : 1;
        page.value = 1;
        return await fetchNow();
      }
    };

    const clearAll = () => {
      globalQuery.value = '';
      sortField.value = null;
      sortOrder.value = 1;
      page.value = 1;

      filters.value = {
        name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
        country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
        documents: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
        inHouse: { value: null as boolean | null, matchMode: FilterMatchMode.EQUALS },
      };
      fetchNow();
    };

    const onToggleInhouse = (val: boolean) => {
      const newVal = val ? true : null;
      filters.value = {
        ...filters.value,
        inHouse: {
          value: newVal,
          matchMode: FilterMatchMode.EQUALS,
        },
      };
      page.value = 1;
      fetchNow();
    };

    const openContactDetail = async (contact: Contact) => {
      uiStore.startLoading();
      try {
        await useLegacyStore().fetchAndSetVuexPartnerAndActiveProperty(
          contact.id,
          currentPmsPropertyId.value!
        );
        open(PartnerForm, {
          props: { header: contact.name || t('contacts.detail') },
          onClose: ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh || data?.action === 'saved') {
              fetchNow();
            }
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    };

    const openNewContact = async () => {
      uiStore.startLoading();
      try {
        await useLegacyStore().removeVuexPartner(currentPmsPropertyId.value!);
        open(PartnerForm, {
          props: { header: t('contacts.new') },
          data: { props: { contact: null } },
          onClose: ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh || data?.action === 'saved') {
              fetchNow();
            }
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
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
    };
  },
});
</script>

<style scoped>
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
    }
  }
}
</style>
