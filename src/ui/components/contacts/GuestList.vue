<template>
  <div class="table-main-content">
    <DataTable
      v-model:first="firstRecord"
      :value="guests"
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
      @rowClick="openContactDetail($event.data.id)"
      :pt="{
        thead: { style: { zIndex: 5, backgroundColor: 'red' } },
        headerRow: { style: { zIndex: 5 } },
        headerCell: {
          style: {
            zIndex: 5,
            position: 'sticky',
          },
        },
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
              style="width: 100%"
            />
            <InputIcon
              class="pi pi-times"
              @click="clearGlobalQuery"
              v-if="globalQuery && globalQuery.length >= 3"
            />
          </IconField>

          <DatePicker
            ref="datePickerRefMobile"
            v-model="dates"
            class="datepicker-mobile"
            :placeholder="t('contacts.datePicker.placeHolder')"
            selectionMode="range"
            :manualInput="true"
            :showHeader="false"
            showIcon
            :showClear="true"
            :minDate="minDate"
            :maxDate="maxDate"
            appendTo="body"
            :numberOfMonths="1"
            :inputStyle="{ width: '100%' }"
            inputClass="datepicker-input-mobile"
            :showButtonBar="false"
            @value-change="fetchIfDatesCleared()"
          >
            <template #footer>
              <div class="calendar-footer">
                <span class="title-calendar-footer">
                  {{ t('contacts.datePicker.presetRanges') }}
                </span>
                <div class="first-row">
                  <div class="first-row-filters-1">
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.today')"
                      severity="secondary"
                      @click="setToday()"
                    />
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.last7Days')"
                      severity="secondary"
                      @click="setLast7Days()"
                    />
                  </div>
                  <div class="first-row-filters-2">
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.last30Days')"
                      severity="secondary"
                      @click="setLast30Days()"
                    />
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.thisMonth')"
                      severity="secondary"
                      @click="setThisMonth()"
                    />
                  </div>
                </div>
                <div class="second-row">
                  <Button
                    class="button"
                    size="small"
                    :label="t('contacts.datePicker.clear')"
                    severity="secondary"
                    @click="clearDateFilter()"
                  />
                  <Button
                    class="button"
                    size="small"
                    :label="t('contacts.datePicker.apply')"
                    severity="primary"
                    @click="apply()"
                  />
                </div>
              </div>
            </template>
          </DatePicker>

          <DatePicker
            ref="datePickerRefDesktop"
            v-model="dates"
            class="datepicker-desktop"
            :placeholder="t('contacts.datePicker.placeHolder')"
            selectionMode="range"
            :manualInput="true"
            :showHeader="false"
            showIcon
            :showClear="true"
            :minDate="minDate"
            :maxDate="maxDate"
            appendTo="body"
            :numberOfMonths="2"
            :inputStyle="{ width: '100%' }"
            :showButtonBar="false"
            @value-change="fetchIfDatesCleared()"
          >
            <template #footer>
              <div class="calendar-footer">
                <span class="title-calendar-footer">{{
                  t('contacts.datePicker.presetRanges')
                }}</span>
                <div class="first-row">
                  <div class="first-row-filters-1">
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.today')"
                      severity="secondary"
                      @click="setToday()"
                    />
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.last7Days')"
                      severity="secondary"
                      @click="setLast7Days()"
                    />
                  </div>
                  <div class="first-row-filters-2">
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.last30Days')"
                      severity="secondary"
                      @click="setLast30Days()"
                    />
                    <Button
                      class="button"
                      size="small"
                      :label="t('contacts.datePicker.thisMonth')"
                      severity="secondary"
                      @click="setThisMonth()"
                    />
                  </div>
                </div>
                <div class="second-row">
                  <Button
                    class="button"
                    size="small"
                    :label="t('contacts.datePicker.clear')"
                    severity="secondary"
                    @click="clearDateFilter()"
                  />
                  <Button
                    class="button"
                    size="small"
                    :label="t('contacts.datePicker.apply')"
                    severity="primary"
                    @click="apply()"
                  />
                </div>
              </div>
            </template>
          </DatePicker>

          <Select
            v-model="inHouseSelection"
            class="select"
            :options="[
              { name: t('contacts.allGuests'), code: 'all' },
              { name: t('contacts.inHouseGuests'), code: 'inHouse' },
            ]"
            optionLabel="name"
            optionValue="code"
            @change="fetchNow"
          />

          <Button
            icon="pi pi-filter-slash"
            v-if="(isFilter || isSorting) && numTotalRecords > 0"
            type="button"
            :label="isFilter ? t('contacts.restoreFilters') : t('contacts.restoreSorting')"
            :aria-label="t('contacts.clear') + ' ' + t('contacts.globalSearch')"
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
            {{ total === 0 ? t('contacts.noGuestsTitle') : t('contacts.noResultsFoundTitle') }}
          </p>
          <p class="empty-state__desc">
            {{
              total === 0
                ? t('contacts.noGuestsMessage')
                : t('contacts.noResultsFoundMessage', {
                    entities: t('contacts.entities.guest', 2),
                  })
            }}
          </p>

          <Button
            v-if="total > 0"
            type="button"
            variant="outlined"
            icon="pi pi-filter-slash"
            :label="t('contacts.restoreFilters') || 'Limpiar filtros'"
            class="empty-state__btn"
            @click="clearAll"
          />
        </div>
      </template>

      <!-- Name -->
      <Column
        field="name"
        :header="t('contacts.fullName')"
        :style="{ maxWidth: '220px' }"
        frozen
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        filter
        sortable
        :pt="{
          root: {
            style: {
              zIndex: 5,
            },
          },
          headerCell: {
            style: {
              zIndex: 6,
            },
          },
          bodyCell: {
            style: {
              zIndex: 2,
            },
          },
        }"
      >
        <template #body="{ data }">
          <div class="flex items-center">
            <Avatar
              :label="firstTwoInitials(data.name)"
              class="mr-2"
              shape="circle"
              style="min-width: 28px"
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
            <Tag severity="secondary" class="mr-2">
              <div class="flex items-center gap-2 px-1">
                <span class="font-bold">
                  {{ data.identificationDocuments[0]?.type.substring(0, 3).toUpperCase()
                  }}{{ data.identificationDocuments[0]?.type.length > 3 ? '.' : '' }}
                </span>
                <span class="font-normal">
                  {{ data.identificationDocuments[0]?.number }}
                </span>
              </div>
            </Tag>
            <Tag severity="secondary" v-if="data.identificationDocuments.length > 1">
              <span class="font-normal"> +{{ data.identificationDocuments.length - 1 }} </span>
            </Tag>
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

      <!-- Last reservation (name) -->
      <Column
        field="lastReservationName"
        :header="t('contacts.lastReservation')"
        style="min-width: 180px"
        >xxº
        <template #body="{ data }">
          <!-- <span>{{ data.lastReservationDate }}</span> -->
          <span>
            {{
              new Intl.DateTimeFormat(i18n.global.locale.value, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(data.lastReservationDate)
            }}
          </span>
        </template>
      </Column>

      <!-- Internal Notes -->
      <Column field="internalNotes" :header="t('contacts.internalNotes')" style="max-width: 300px">
        <template #body="{ data }">
          <span v-if="data.internalNotes" class="ellipsis-2" :title="data.internalNotes">
            {{ data.internalNotes }}
          </span>
        </template>
      </Column>

      <template #paginatorstart v-if="numTotalRecords > 0">
        <div class="contacts-paginator__left">
          <span class="contacts-paginator__info">
            {{
              t('contacts.paginationInfo', {
                first: firstRecord + 1,
                last: Math.min(firstRecord + rows, numTotalRecords),
                total: numTotalRecords,
                entities: t('contacts.entities.guest', numTotalRecords),
              })
            }}
          </span>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, type Ref } from 'vue';
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
import DatePicker from 'primevue/datepicker';
import { FilterMatchMode } from '@primevue/core/api';

import { CONTACT_TYPES } from '@/domain/types/ContactType';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { firstTwoInitials } from '@/ui/utils/strings';
import { i18n } from '@/infrastructure/plugins/i18n';
import ContactDetail from '@/ui/components/contacts/ContactDetail.vue';

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
    DatePicker,
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

    // translation
    const { t } = useI18n();

    // dates related
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const datePickerRefMobile = ref();
    const datePickerRefDesktop = ref();
    const dates: Ref<[Date, Date] | [Date] | null> = ref(null);
    const minDate = ref();
    const maxDate = ref();

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
      identificationDocuments: {
        value: null as string | null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
    });
    const inHouseSelection = ref('all');

    // data
    const guests = computed(() => contactsStore.guests);

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
        isNonEmptyString(f.identificationDocuments.value) ||
        (Array.isArray(dates.value) && dates.value.length > 0) ||
        (Array.isArray(f.country.value) && f.country.value.length > 0) ||
        (typeof f.country.value === 'string' && f.country.value.trim().length > 0) ||
        inHouseSelection.value === 'inHouse'
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
      const id = ++currentRequest.value;
      uiStore.startLoading();
      isLoading.value = true;
      const inHouseOnly = inHouseSelection.value === 'inHouse' ? true : undefined;
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
            countryIn:
              Array.isArray(filters.value.country.value) && filters.value.country.value.length > 0
                ? (filters.value.country.value as string[])
                : undefined,
            documentContains: isNonEmptyString(filters.value.identificationDocuments.value)
              ? filters.value.identificationDocuments.value
              : undefined,
            checkinDateFrom:
              Array.isArray(dates.value) && dates.value.length > 0 && dates.value[0] instanceof Date
                ? dates.value[0]
                : undefined,
            checkinDateTo:
              Array.isArray(dates.value) && dates.value.length > 1 && dates.value[1] instanceof Date
                ? dates.value[1]
                : undefined,
            inHouseOnly,
          },
          orderBy.value,
        );
        if (id !== currentRequest.value) {
          return;
        }
        numTotalRecords.value = contactsStore.guestsCount;
      } finally {
        if (id === currentRequest.value) {
          isLoading.value = false;
          uiStore.stopLoading();
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

    // set today
    const setToday = (): void => {
      dates.value = [today, today];
    };

    // set last 7 days
    const setLast7Days = (): void => {
      const last7 = new Date();
      last7.setDate(today.getDate() - 6);
      last7.setHours(0, 0, 0, 0);
      dates.value = [last7, today];
    };

    // set last 30 days
    const setLast30Days = (): void => {
      const last30 = new Date();
      last30.setDate(today.getDate() - 29);
      last30.setHours(0, 0, 0, 0);
      dates.value = [last30, today];
    };

    // set this month
    const setThisMonth = (): void => {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDay.setHours(0, 0, 0, 0);
      dates.value = [firstDay, lastDay];
    };

    // clear date filter
    const clearDateFilter = (): void => {
      dates.value = null;
    };
    // apply date filter
    const apply = (): void => {
      datePickerRefDesktop.value.overlayVisible = false;
      datePickerRefMobile.value.overlayVisible = false;
      void fetchNow();
    };

    // dates changed and if cleared apply immediately
    const fetchIfDatesCleared = (): void => {
      if (dates.value === null) {
        void fetchNow();
      }
    };

    // clear all filters and sorting
    const clearAll = async (): Promise<void> => {
      globalQuery.value = '';
      sortField.value = null;
      sortOrder.value = 1;
      page.value = 1;
      firstRecord.value = 0;
      dates.value = null;
      inHouseSelection.value = 'all';
      filters.value = {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        identificationDocuments: {
          value: null as string | null,
          matchMode: FilterMatchMode.CONTAINS,
        },
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
        await contactsStore.fetchContactSchema();
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
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    };

    watch(dates, (newDates) => {
      // si no hay fechas, reseteamos límites
      if (newDates === null || newDates[0] === null) {
        minDate.value = null;
        maxDate.value = null;
        return;
      }
      const start = newDates[0];
      minDate.value = start;
      const max = new Date(start);
      max.setDate(max.getDate() + 31);
      maxDate.value = max;
    });

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
      guests,
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
      datePickerRefMobile,
      datePickerRefDesktop,
      dates,
      minDate,
      maxDate,
      setToday,
      setLast7Days,
      setLast30Days,
      setThisMonth,
      clearDateFilter,
      apply,
      inHouseSelection,
      fetchIfDatesCleared,
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
    .pi-times {
      cursor: pointer;
    }
    .button {
      margin-top: 1rem;
    }
    .datepicker-desktop {
      display: none;
    }
    .datepicker-mobile {
      margin-top: 1rem;
    }
    .select {
      margin-top: 1rem;
      width: 100%;
    }
  }
  .name {
    display: inline-block;
    max-width: 220px; /* ajusta según tu columna */
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
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
    }
  }
}

.calendar-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  .title-calendar-footer {
    margin-top: 0.5rem;
  }
  .first-row {
    display: flex;
    flex-direction: column;
    .first-row-filters-1,
    .first-row-filters-2 {
      display: flex;
      justify-content: space-between;
      .button {
        width: 49%;
        margin: 0.25rem 0;
      }
    }
  }
  .second-row {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
  }
}

@media (min-width: 1024px) {
  .table-main-content {
    .table-header {
      flex-direction: row;
      .datepicker-mobile {
        display: none;
      }
      .datepicker-desktop {
        margin-left: 1rem;
        width: 265px;
        display: flex;
      }
      .select {
        margin-top: 0;
        margin-left: 1rem;
        width: 220px;
      }
      .button {
        margin-top: 0;
        margin-left: 1rem;
      }
    }
  }
}
</style>
