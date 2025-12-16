<template>
  <div class="table-main-content">
    <DataTable
      v-model:first="firstRecord"
      :value="customers"
      scrollable
      scrollHeight="flex"
      class="contacts-table"
      :rows="rows"
      :paginator="numTotalRecords > 0"
      :pageLinkSize="3"
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
      :loading="isLoading"
      @rowClick="openContactDetail($event.data.id)"
      :pt="{
        thead: { style: { zIndex: 5 } },
        headerRow: { style: { zIndex: 5 } },
        header: { style: { zIndex: 6, border: 'none' } },
        headerCell: {
          style: {
            zIndex: 5,
            position: 'sticky',
          },
        },
        mask: { style: { zIndex: 6 } },
        table: { style: { height: numTotalRecords > 0 ? 'auto' : '100%' } },
        tbody: { style: { zIndex: 1, height: '100%' } },
        bodyRow: { style: { zIndex: 1 } },
        bodyCell: {
          style: {
            zIndex: 1,
            position: 'relative',
          },
        },
        emptyMessageRow: {
          style: {
            height: '100vh',
          },
        },
        emptyMessageCell: {
          style: {
            height: '100%',
            padding: '0',
          },
        },
      }"
    >
      <!-- header -->
      <template #header>
        <div class="table-header lime-bg">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="globalQuery"
              :placeholder="t('contacts.globalSearch')"
              @input="onGlobalQueryInput"
              :aria-label="t('contacts.globalSearch')"
              style="width: 100%; min-width: 240px"
            />
            <InputIcon
              class="pi pi-times"
              @click="clearGlobalQuery"
              v-if="globalQuery && globalQuery.length >= 3"
            />
          </IconField>
          <Button
            icon="pi pi-filter-slash"
            v-if="(isFilter || isSorting) && numTotalRecords > 0"
            type="button"
            :label="isFilter ? t('contacts.restoreFilters') : t('contacts.restoreSorting')"
            :aria-label="t('contacts.clear') + ' ' + t('contacts.globalSearch')"
            severity="secondary"
            variant="outlined"
            class="button"
            @click="clearAll"
          />
        </div>
      </template>

      <!-- no results -->
      <template #empty>
        <div class="empty-state">
          <p class="empty-state__desc">
            {{ total === 0 ? t('contacts.noCustomersTitle') : t('contacts.noResultsFoundTitle') }}
          </p>
          <p class="empty-state__desc">
            {{
              total === 0
                ? t('contacts.noCustomersMessage')
                : t('contacts.noResultsFoundMessage', {
                    entities: t('contacts.entities.customer', 2),
                  })
            }}
          </p>

          <Button
            v-if="total > 0"
            type="button"
            severity="secondary"
            variant="outlined"
            icon="pi pi-filter-slash"
            :label="t('contacts.restoreFilters') || 'Limpiar filtros'"
            class="empty-state__btn"
            @click="clearAll"
          />
        </div>
      </template>

      <!-- avatar -->
      <Column
        v-show="!isLoading"
        field="image"
        header=""
        headerClass="lg:hidden"
        bodyClass="lg:hidden"
        :style="{ maxWidth: '40px' }"
        frozen
        :pt="{
          root: {
            style: {
              zIndex: 5,
            },
          },
          headerCell: {
            style: {
              zIndex: 6,
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
            },
          },
          bodyCell: {
            style: {
              zIndex: 2,
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
            },
          },
        }"
      >
        <template #body="{ data }">
          <div class="flex items-center">
            <Avatar
              :image="data.image"
              :label="!data?.image ? firstTwoInitials(data.name) : ''"
              shape="circle"
              :style="{
                width: '24px',
                height: '24px',
                backgroundColor: data.image ? 'white' : '#1F89E1',
                color: 'white',
                fontSize: '12px',
              }"
            />
          </div>
        </template>
      </Column>

      <!-- Name only) -->
      <Column
        v-show="!isLoading"
        field="name"
        :header="t('contacts.fullName')"
        headerClass="lg:hidden"
        bodyClass="lg:hidden"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
        sortable
        :pt="{
          headerCell: {
            style: {
              paddingLeft: '0.25rem',
            },
          },
          bodyCell: {
            style: {
              paddingLeft: '0.25rem',
            },
          },
        }"
      >
        <template #body="{ data }">
          <div class="flex items-center">
            <span class="name">
              {{ data.name }}
            </span>
          </div>
        </template>

        <template #filter="{ filterModel }">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filterModel.value"
              type="text"
              :placeholder="t('contacts.searchByName')"
            />
          </IconField>
        </template>
      </Column>

      <!-- Avatar + name -->
      <Column
        v-show="!isLoading"
        field="name"
        :header="t('contacts.fullName')"
        class="col-name"
        headerClass="hidden lg:table-cell"
        style="max-width: 250px"
        bodyClass="hidden lg:table-cell"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
        sortable
        frozen
      >
        <template #body="{ data }">
          <div class="flex items-center">
            <Avatar
              :image="data.image"
              :label="!data?.image ? firstTwoInitials(data.name) : ''"
              class="mr-2"
              shape="circle"
              :style="{
                width: '24px',
                height: '24px',
                backgroundColor: data.image ? 'white' : '#1F89E1',
                color: 'white',
                fontSize: '12px',
              }"
            />
            <span class="name">
              {{ data.name }}
            </span>
          </div>
        </template>

        <template #filter="{ filterModel }">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filterModel.value"
              type="text"
              :placeholder="t('contacts.searchByName')"
            />
          </IconField>
        </template>
      </Column>

      <!-- VAT -->
      <Column
        v-show="!isLoading"
        field="vat"
        :header="t('contacts.vat')"
        style="min-width: 150px"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
      >
        <template #body="{ data }">
          <Tag severity="secondary" v-if="data.vat">
            <span class="ramon">
              {{ data.vat }}
            </span>
          </Tag>
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="t('contacts.searchByVat')"
          />
        </template>
      </Column>

      <!-- Email -->
      <Column
        v-show="!isLoading"
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
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filterModel.value"
              type="text"
              :placeholder="t('contacts.searchByEmail')"
            />
          </IconField>
        </template>
      </Column>

      <!-- Phones -->
      <Column
        v-show="!isLoading"
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
        :pt="{
          bodyCell: {
            style: {
              padding: '0',
            },
          },
        }"
      >
        <template #body="{ data }">
          <template v-for="(phone, index) in data.phones" :key="`${phone.type}-${index}`">
            <Chip
              :label="phone.number"
              :icon="phone.type === 'phone' ? 'pi pi-phone' : 'pi pi-mobile'"
              :pt="{
                root: {
                  style: {
                    fontSize: '12px',
                    marginBottom: '4px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    backgroundColor: 'transparent',
                  },
                },
              }"
            />
          </template>
        </template>

        <template #filter="{ filterModel, filterCallback, applyFilter }">
          <div class="flex flex-col gap-2">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="phoneFilterDraft"
                type="text"
                placeholder="Search by phone"
                :aria-label="t('contacts.searchByPhone')"
              />
            </IconField>
            <span v-if="phoneFilterDraft.length < 3" class="text-xs">
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
                :disabled="phoneFilterDraft.length < 3"
                class="p-button p-component p-button-sm p-datatable-filter-apply-button"
                @click="onApplyPhoneFilter(filterModel, filterCallback, applyFilter)"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- Country -->
      <Column
        v-show="!isLoading"
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

      <!-- Total Invoiced -->
      <Column
        v-show="!isLoading"
        field="totalInvoiced"
        :header="t('contacts.totalInvoiced')"
        style="min-width: 150px"
        :bodyStyle="{ textAlign: 'right' }"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
      >
        <template #body="{ data }">
          {{
            new Intl.NumberFormat(i18n.global.locale.value, {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: true,
            }).format(Number(data.totalInvoiced ?? 0))
          }}
        </template>
      </Column>

      <template #paginatorstart v-if="numTotalRecords > 0">
        {{
          t('contacts.paginationInfo', {
            first: firstRecord + 1,
            last: Math.min(firstRecord + rows, numTotalRecords),
            total: new Intl.NumberFormat(i18n.global.locale.value, {
              useGrouping: true,
            }).format(numTotalRecords),
            entities: t('contacts.entities.customer', numTotalRecords),
          })
        }}
      </template>
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
import Avatar from 'primevue/avatar';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { FilterMatchMode } from '@primevue/core/api';

import { i18n } from '@/infrastructure/plugins/i18n';
import { CONTACT_TYPES } from '@/domain/types/ContactType';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { firstTwoInitials } from '@/ui/utils/strings';
import ContactDetail from '@/ui/components/contactDetail/ContactDetail.vue';

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
    Avatar,
    CountryFlag,
  },
  props: {
    total: {
      type: Number,
      required: true,
    },
  },
  setup() {
    // stores
    const uiStore = useUIStore();
    const contactsStore = useContactsStore();
    const countriesStore = useCountriesStore();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const useTextMessageStore = useTextMessagesStore();
    const currency = computed(
      () =>
        pmsPropertiesStore.pmsProperties.find(
          (p) => p.id === pmsPropertiesStore.currentPmsPropertyId,
        )?.currency.code,
    );

    // translation
    const { t } = useI18n();

    // dialog
    const { openDialog } = useAppDialog();

    // loading state
    const isLoading = ref(true);

    // pagination
    const rowsPerPageOptions = [50, 100, 200];
    const firstRecord = ref(0);
    const numTotalRecords = ref(0);
    const page = ref(1);
    const rows = ref(50);

    // sorting
    const sortField = ref<string | null>(null);
    const sortOrder = ref<number>(1);

    // filters
    const globalQuery = ref<string>('');
    const phoneFilterDraft = ref('');
    const filters = ref({
      name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      email: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      vat: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      phones: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
    });

    // data
    const customers = computed(() => contactsStore.customers);

    // orderBy: returns undefined when no sort
    const orderBy = computed(() => {
      if (sortField.value !== null && sortField.value !== '') {
        const prefix = sortOrder.value === -1 ? '-' : '';
        return `${prefix}${sortField.value}`;
      }
      return undefined;
    });

    // safe value for DataTable prop
    const safeSortField = computed(() =>
      isNonEmptyString(sortField.value) ? sortField.value : undefined,
    );

    // filter state
    const isFilter = computed(() => {
      const f = filters.value;
      return (
        isNonEmptyString(globalQuery.value) ||
        isNonEmptyString(f.name.value) ||
        isNonEmptyString(f.email.value) ||
        isNonEmptyString(f.vat.value) ||
        (Array.isArray(f.country.value) && f.country.value.length > 0) ||
        (typeof f.country.value === 'string' && f.country.value.trim().length > 0)
      );
    });

    // sorting state
    const isSorting = computed(() => isNonEmptyString(sortField.value));

    // country options for multi-select filter
    const countryOptions = computed(() =>
      (countriesStore.countries ?? []).map((country) => ({
        label: country.name,
        value: country.code,
      })),
    );

    // METHOD DEFINITIONS

    // fetch contacts
    const currentRequest = ref(0);
    const fetchNow = async (): Promise<void> => {
      const id = ++currentRequest.value; // identificador de esta petición
      isLoading.value = true;
      try {
        await contactsStore.fetchCustomers(
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
            vatContains: isNonEmptyString(filters.value.vat.value)
              ? filters.value.vat.value
              : undefined,
            countryIn:
              Array.isArray(filters.value.country.value) && filters.value.country.value.length > 0
                ? (filters.value.country.value as string[])
                : undefined,
            phonesContains: isNonEmptyString(phoneFilterDraft.value)
              ? phoneFilterDraft.value
              : undefined,
          },
          orderBy.value,
        );
        if (id !== currentRequest.value) {
          return;
        }
        numTotalRecords.value = contactsStore.customersCount;
      } finally {
        if (id === currentRequest.value) {
          isLoading.value = false;
        }
      }
    };

    // global query input
    const onGlobalQueryInput = useDebounceFn(
      () => {
        const len = globalQuery.value.length;
        if (len >= 3 || len === 0) {
          void fetchNow();
        }
      },
      250,
      { maxWait: 3000 },
    );

    // clear all filters and sorting
    const clearAll = async (): Promise<void> => {
      globalQuery.value = '';
      sortField.value = null;
      sortOrder.value = 1;
      page.value = 1;
      firstRecord.value = 0;

      filters.value = {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
        vat: { value: null, matchMode: FilterMatchMode.CONTAINS },
        phones: { value: null, matchMode: FilterMatchMode.CONTAINS },
        country: { value: [] as string[] | null, matchMode: FilterMatchMode.IN },
      };
      phoneFilterDraft.value = '';

      await fetchNow();
    };

    // clear global query
    const clearGlobalQuery = async (): Promise<void> => {
      globalQuery.value = '';
      sortField.value = null;
      sortOrder.value = 1;
      await fetchNow();
    };

    // page change
    const handlePageChange = async (e: DataTablePageEvent): Promise<void> => {
      if (typeof e.page === 'number') {
        page.value = e.page + 1;
        rows.value = e.rows;
        await fetchNow();
      }
    };

    // filter change
    const handleFilterChange = async (e: DataTableFilterEvent): Promise<void> => {
      if (e.filters !== null) {
        filters.value = e.filters as typeof filters.value; // TODO: refine type
        page.value = 1;
        await fetchNow();
      }
    };

    // sort change
    const handleSortChange = async (e: DataTableSortEvent): Promise<void> => {
      if (e.sortField !== undefined) {
        sortField.value = (e.sortField as string) ?? null;
        sortOrder.value = typeof e.sortOrder === 'number' ? e.sortOrder : 1;
        page.value = 1;
        await fetchNow();
      }
    };

    // clear phone filter
    const onClearPhoneFilter = (
      filterModel: { value: unknown },
      filterCallback: (value?: unknown) => void,
      applyFilter: () => void,
    ): void => {
      phoneFilterDraft.value = '';
      filterModel.value = null;
      filterCallback();
      applyFilter?.();
    };

    // apply phone filter
    const onApplyPhoneFilter = (
      filterModel: { value: unknown },
      filterCallback: (value?: unknown) => void,
      applyFilter: () => void,
    ): void => {
      if (phoneFilterDraft.value.length < 3) {
        return;
      }
      filterModel.value = phoneFilterDraft.value;
      filterCallback();
      applyFilter?.();
    };

    // open contact detail
    const openContactDetail = async (contactId: number): Promise<void> => {
      uiStore.startLoading();
      try {
        const contact = await contactsStore.fetchContactById(contactId);
        if (!contact) {
          uiStore.stopLoading();
          return;
        }
        contact.id = contactId;
        openDialog(ContactDetail, {
          props: { header: contact.name || t('contacts.detail') },
          data: { contact: contact },
          onClose: ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh === true || data?.action === 'saved') {
              void fetchNow();
            }
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          useTextMessageStore.addTextMessage(t('error.somethingWentWrong'), error.message);
        }
        uiStore.stopLoading();
      }
    };

    // on mounted fetch data and countries
    onMounted(async () => {
      await Promise.all([fetchNow(), countriesStore.fetchCountries()]);
    });

    return {
      t,
      i18n,
      rowsPerPageOptions,
      isLoading,
      firstRecord,
      numTotalRecords,
      rows,
      phoneFilterDraft,
      customers,
      globalQuery,
      filters,
      CONTACT_TYPES,
      sortOrder,
      sortField,
      safeSortField,
      countryOptions,
      isFilter,
      isSorting,
      handlePageChange,
      handleFilterChange,
      handleSortChange,
      fetchNow,
      clearAll,
      openContactDetail,
      onClearPhoneFilter,
      onApplyPhoneFilter,
      onGlobalQueryInput,
      firstTwoInitials,
      clearGlobalQuery,
      currency,
    };
  },
});
</script>

<style lang="scss" scoped>
.table-main-content {
  height: 100%;
  background-color: #f9f9f9;
  position: relative;
  .table-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    @media (min-width: 1024px) {
      flex-direction: row;
      align-items: center;
      button {
        margin-left: 1rem;
      }
    }
    .pi-times {
      cursor: pointer;
    }
    .button {
      margin-top: 1rem;
      @media (min-width: 1024px) {
        margin-top: 0;
      }
    }
  }
  .name {
    display: inline-block;
    width: calc(100% - 32px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    background: #ffffff;
    .empty-state__desc {
      max-width: 500px;
      &:first-child {
        font-size: 1.2rem;
        font-weight: 600;
      }
      &:nth-child(2) {
        margin-top: 8px;
        margin-bottom: 16px;
      }
    }
  }
}
</style>
