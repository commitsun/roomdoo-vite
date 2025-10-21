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
      :value="contacts"
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
      :globalFilterFields="['name', 'email', 'phones']"
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
          {{ t('contacts.allContacts') }}
        </div>
      </template>

      <!-- Name -->
      <Column
        field="name"
        :header="t('contacts.fullName')"
        style="max-width: 200px"
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

      <!-- Type -->
      <Column
        :header="t('contacts.type')"
        filter
        filterField="type"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
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
          <MultiSelect
            v-model="filterModel.value"
            :options="CONTACT_TYPES.map((v) => ({ label: t('contacts.types.' + v), value: v }))"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('contacts.searchByType')"
            class="w-full"
            showClear
            :showToggleAll="false"
            :maxSelectedLabels="2"
            appendTo="self"
            :panelStyle="{ width: '100%' }"
            :selectedItemsLabel="
              t('contacts.n_types_selected', {
                count: Array.isArray(filterModel.value) ? filterModel.value.length : 0,
              })
            "
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
        sortable
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

      <!-- Phones -->
      <Column
        field="phones"
        :header="t('contacts.phone')"
        style="min-width: 220px"
        filter
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showApplyButton="false"
        :showClearButton="false"
        :filterMenuStyle="{ padding: '0.75rem 0.75rem 0.25rem' }"
      >
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

        <template #filter="{ filterModel, filterCallback, applyFilter }">
          <div class="flex flex-col gap-2">
            <InputText
              v-model="phoneDraft"
              type="text"
              placeholder="Search by phone"
              :aria-label="t('contacts.searchByPhone')"
            />
            <span v-if="phoneDraft.length < 3" class="text-xs">
              {{ t('contacts.phoneFilterMinChars') }}
            </span>
            <div class="flex justify-between">
              <Button
                size="small"
                variant="outlined"
                :label="t('contacts.clear')"
                @click="onClearPhoneFilter(filterModel, filterCallback, applyFilter)"
              />
              <Button
                :label="t('contacts.apply')"
                :disabled="phoneDraft.length < 3"
                class="p-button p-component p-button-sm p-datatable-filter-apply-button"
                @click="onApplyPhoneFilter(filterModel, filterCallback, applyFilter)"
              />
            </div>
          </div>
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
            :placeholder="t('contacts.searchByCountry')"
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
                  :country="slotProps.option.value"
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
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDebounceFn } from '@vueuse/core';
import DataTable, {
  type DataTableFilterEvent,
  type DataTablePageEvent,
  type DataTableSortEvent,
} from 'primevue/datatable';
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
import { FilterMatchMode } from '@primevue/core/api';

import { CONTACT_TYPES } from '@/domain/types/ContactType';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { useLegacyStore } from '@/_legacy/utils/useLegacyStore';
import PartnerForm from '@/_legacy/components/partners/PartnerForm.vue';
import type { Contact } from '@/domain/entities/Contact';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';

// helper: explicit non-empty string
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export default defineComponent({
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
    const pmsPropertiesStore = usePmsPropertiesStore();
    const { t } = useI18n();
    const { open } = useAppDialog();

    const first = ref(0);
    const numTotalRecords = ref(0);
    const page = ref(1);
    const rows = ref(50);
    const rowsPerPageOptions = ref([50, 100, 200]);
    const phoneDraft = ref('');

    const sortField = ref<string | null>(null);
    const sortOrder = ref<number>(1);
    const globalQuery = ref<string>('');

    const SORT_FIELD_MAP: Record<string, string> = {
      name: 'name',
      country: 'country',
      email: 'email',
    };

    // orderBy: returns undefined when no sort
    const orderBy = computed<string | undefined>(() => {
      if (sortField.value !== null && sortField.value !== '') {
        const key = SORT_FIELD_MAP[sortField.value] ?? sortField.value;
        const prefix = sortOrder.value === -1 ? '-' : '';
        return `${prefix}${key}`;
      }
      return undefined;
    });

    // safe value for DataTable prop
    const safeSortField = computed<string | undefined>(() =>
      sortField.value === null || sortField.value === '' ? undefined : sortField.value,
    );

    const filters = ref({
      name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      email: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      phones: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      type: { value: null as string[] | null, matchMode: FilterMatchMode.IN },
      country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
    });

    // explicit boolean for the Clear button
    const showClearButton = computed<boolean>(() => {
      const f = filters.value;

      const anyString =
        isNonEmptyString(globalQuery.value) ||
        isNonEmptyString(f.name.value) ||
        isNonEmptyString(f.email.value) ||
        isNonEmptyString(f.phones.value) ||
        isNonEmptyString(sortField.value);

      const anyType = Array.isArray(f.type.value) && f.type.value.length > 0;

      const anyCountry =
        (Array.isArray(f.country.value) && f.country.value.length > 0) ||
        (typeof f.country.value === 'string' && f.country.value.trim().length > 0);

      return anyString || anyType || anyCountry;
    });

    const countryOptions = computed(() =>
      (countriesStore.countries ?? []).map((country) => ({
        label: country.name,
        value: country.code,
      })),
    );

    const contacts = computed(() => contactsStore.contacts);
    const currentPmsPropertyId = computed(() => pmsPropertiesStore.currentPmsPropertyId);
    const setCountFromStore = (): void => {
      numTotalRecords.value = contactsStore.contactsCount;
    };

    async function fetchNow(): Promise<void> {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContacts(
          {
            page: page.value,
            pageSize: rows.value,
          },
          {
            globalSearch: isNonEmptyString(globalQuery.value) ? globalQuery.value : undefined,
            nameContains: isNonEmptyString(filters.value.name.value)
              ? filters.value.name.value
              : undefined,
            emailContains: isNonEmptyString(filters.value.email.value)
              ? filters.value.email.value
              : undefined,
            typeIn:
              Array.isArray(filters.value.type.value) && filters.value.type.value.length > 0
                ? filters.value.type.value
                : undefined,
            countryIn:
              Array.isArray(filters.value.country.value) && filters.value.country.value.length > 0
                ? (filters.value.country.value as string[])
                : undefined,
            phonesContains: isNonEmptyString(filters.value.phones.value)
              ? filters.value.phones.value
              : undefined,
          },
          orderBy.value,
        );
        setCountFromStore();
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
      first.value = 0;

      filters.value = {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
        phones: { value: null, matchMode: FilterMatchMode.CONTAINS },
        type: { value: null as string[] | null, matchMode: FilterMatchMode.IN },
        country: { value: null as string[] | null, matchMode: FilterMatchMode.IN },
      };

      await fetchNow();
    }

    function severityType(type: string): 'warning' | 'success' | 'danger' | 'info' | 'secondary' {
      if (type === 'guest') {
        return 'warning';
      }
      if (type === 'customer') {
        return 'success';
      }
      if (type === 'agency') {
        return 'danger';
      }
      if (type === 'supplier') {
        return 'info';
      }
      return 'secondary';
    }

    async function openContactDetail(contact: Contact): Promise<void> {
      uiStore.startLoading();
      try {
        const propId = currentPmsPropertyId.value;
        if (!isNonEmptyString(propId)) {
          // sin propiedad activa no podemos abrir detalle de legacy
          return;
        }
        await useLegacyStore().fetchAndSetVuexPartnerAndActiveProperty(contact.id, propId);
        open(PartnerForm, {
          props: { header: contact.name || t('contacts.detail') },
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

    async function openNewContact(): Promise<void> {
      uiStore.startLoading();
      try {
        const propId = currentPmsPropertyId.value;
        if (!isNonEmptyString(propId)) {
          return;
        }
        await useLegacyStore().removeVuexPartner(propId);
        open(PartnerForm, {
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

    function onClearPhoneFilter(
      filterModel: { value: unknown },
      filterCallback: (value?: unknown) => void,
      applyFilter: () => void,
    ): void {
      phoneDraft.value = '';
      filterModel.value = null;
      filterCallback();
      applyFilter?.();
    }

    function onApplyPhoneFilter(
      filterModel: { value: unknown },
      filterCallback: (value?: unknown) => void,
      applyFilter: () => void,
    ): void {
      if (phoneDraft.value.length < 3) {
        return;
      }
      filterModel.value = phoneDraft.value;
      filterCallback();
      applyFilter?.();
    }

    function onGlobalQueryInput(): void {
      const len = globalQuery.value.length;
      if (len >= 3 || len === 0) {
        void debouncedFetchNow();
      }
    }

    onMounted(async () => {
      await fetchNow();
      await useCountriesStore().fetchCountries();
    });

    return {
      rowsPerPageOptions,
      rows,
      contacts,
      numTotalRecords,
      globalQuery,
      filters,
      CONTACT_TYPES,
      sortOrder,
      sortField,
      safeSortField,
      countryOptions,
      first,
      phoneDraft,
      showClearButton,
      handlePageChange,
      handleFilterChange,
      handleSortChange,
      t,
      fetchNow,
      debouncedFetchNow,
      clearAll,
      severityType,
      openContactDetail,
      onClearPhoneFilter,
      onApplyPhoneFilter,
      openNewContact,
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
