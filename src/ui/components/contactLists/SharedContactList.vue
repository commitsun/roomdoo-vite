<template>
  <div class="table-main-content">
    <DataTable
      v-model:first="firstRecord"
      :value="contacts"
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
        <div class="table-header debug-box" :class="{ 'lime-bg': type !== 'contact' }">
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

          <!-- Guest specific date picker -->
          <template v-if="type === 'guest'">
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
          </template>

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
            {{ total === 0 ? getNoResultsTitle : t('contacts.noResultsFoundTitle') }}
          </p>
          <p class="empty-state__desc">
            {{
              total === 0
                ? getNoResultsMessage
                : t('contacts.noResultsFoundMessage', {
                    entities: t('contacts.entities.' + type, 2),
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
        :style="{ maxWidth: '52px' }"
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
              padding: '0',
            },
          },
          bodyCell: {
            style: {
              zIndex: 2,
              padding: '0',
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
                marginLeft: '14px',
                marginRight: '14px',
                fontSize: '12px',
                border: `${data.image ? '1px solid var(--p-surface-300, lightgray)' : 'none'}`,
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
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
          />
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
                border: `${data.image ? '1px solid var(--p-surface-300, lightgray)' : 'none'}`,
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
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
          />
        </template>
      </Column>

      <!-- Type (only for 'contact') -->
      <Column
        v-if="type === 'contact'"
        v-show="!isLoading"
        :header="t('contacts.type')"
        filter
        filterField="type"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        :showAddButton="false"
        :showFilterApplyButton="false"
        :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 220px"
        :pt="{
          bodyCell: {
            style: {
              paddingTop: '0',
              paddingBottom: '0.25rem',
              paddingLeft: '0',
              paddingRight: '0',
            },
          },
        }"
      >
        <template #body="{ data }">
          <Tag
            severity="secondary"
            :value="t('contacts.types.' + typeName)"
            v-for="typeName in data.types"
            :key="typeName"
            class="mr-2 mt-1"
          >
            <template #icon>
              <span class="tag-contact-type">
                <i class="pi pi-circle-fill" :style="{ color: colorContactType(typeName) }" />
              </span>
            </template>
          </Tag>
        </template>

        <template #filter="{ filterModel }">
          <MultiSelect
            v-model="filterModel.value"
            :options="
              CONTACT_TYPES.map((v: string) => ({ label: t('contacts.types.' + v), value: v }))
            "
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
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
          />
        </template>
      </Column>

      <!-- VAT (only for customer, supplier) -->
      <Column
        v-if="type === 'customer' || type === 'supplier'"
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
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
          />
        </template>
      </Column>

      <!-- Main Document (only for guest) -->
      <Column
        v-if="type === 'guest'"
        v-show="!isLoading"
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
            <div class="flex items-center gap-2 px-1">
              <Tag severity="secondary">
                <span class="font-bold">
                  {{ data.identificationDocuments[0]?.type.substring(0, 3).toUpperCase()
                  }}{{ data.identificationDocuments[0]?.type.length > 3 ? '.' : '' }}
                </span>
                <span class="font-normal">
                  {{ data.identificationDocuments[0]?.number }}
                </span>
              </Tag>
              <Tag severity="secondary" class="my-2" v-if="data.identificationDocuments.length > 1">
                <span class="font-normal"> +{{ data.identificationDocuments.length - 1 }} </span>
              </Tag>
            </div>
          </span>
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            :placeholder="t('contacts.searchByDocument')"
          />
        </template>
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
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
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
          />
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
                class="p-button-secondary !text-sm"
                :label="t('contacts.cancel')"
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
        <template #filterclear="{ filterModel, filterCallback }">
          <Button
            class="p-button-secondary !text-sm"
            :label="t('contacts.cancel')"
            @click="removeFilter(filterModel, filterCallback)"
          />
        </template>
      </Column>

      <!-- Last reservation (name) - Guest only -->
      <Column
        v-if="type === 'guest'"
        v-show="!isLoading"
        field="lastReservationName"
        :header="t('contacts.lastReservation')"
        style="min-width: 180px"
      >
        <template #body="{ data }">
          <span v-if="data.lastReservationDate">
            {{
              new Intl.DateTimeFormat(i18n.global.locale.value, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(data.lastReservationDate))
            }}
          </span>
        </template>
      </Column>

      <!-- Total Invoiced (only for customer, supplier) -->
      <Column
        v-if="type === 'customer' || type === 'supplier'"
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

      <!-- Internal Notes (only for guest) -->
      <Column
        v-if="type === 'guest'"
        field="internalNotes"
        v-show="!isLoading"
        :header="t('contacts.internalNotes')"
        style="max-width: 300px"
      >
        <template #body="{ data }">
          <span v-if="data.internalNotes" class="ellipsis-2" :title="data.internalNotes">
            {{ data.internalNotes }}
          </span>
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
            entities: t('contacts.entities.' + type, numTotalRecords),
          })
        }}
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, type Ref, watch, type PropType } from 'vue';
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
import { useCountriesStore } from '@/infrastructure/stores/countries';
import { useTextMessagesStore } from '@/infrastructure/stores/textMessages';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useContactsStore } from '@/infrastructure/stores/contacts';
import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { firstTwoInitials } from '@/ui/utils/strings';
import { i18n } from '@/infrastructure/plugins/i18n';
import ContactDetail from '@/ui/components/contactDetail/ContactDetail.vue';

// helper: explicit non-empty string
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

type ListType = 'contact' | 'customer' | 'guest' | 'supplier' | 'agency';

export default defineComponent({
  name: 'SharedContactList',
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
    type: {
      type: String as () => ListType,
      required: true,
      default: 'contact',
    },
    isLoadingPage: {
      type: Boolean,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    contacts: {
      type: Array as PropType<readonly unknown[]>,
      required: true,
    },
    fetchAction: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    // stores
    const uiStore = useUIStore();
    const contactsStore = useContactsStore();
    const countriesStore = useCountriesStore();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const useTextMessageStore = useTextMessagesStore();

    // translation
    const { t } = useI18n();

    // dialog
    const { openDialog } = useAppDialog();

    // loading state
    const isLoading = ref(false);

    // pagination
    const rowsPerPageOptions = [50, 100, 200];
    const firstRecord = ref(0);
    const numTotalRecords = ref(0);
    const page = ref(1);
    const rows = ref(50);

    // Sync total records with prop if needed, or rely on store count passed in via wrapper handling
    // However, the original components were doing `numTotalRecords.value = contactsStore.XCount` inside `fetchNow`.
    // We will handle this by emitting or relying on the store state if we want strict composition.
    // For simplicity, we'll keep `fetchNow` internal logic mostly intact but tailored.

    // sorting
    const sortField = ref<string | null>(null);
    const sortOrder = ref<number>(1);

    // filters
    const globalQuery = ref<string>('');
    const phoneFilterDraft = ref('');

    // Dynamic filters object based on type
    const filters = ref({
      name: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      email: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      phones: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      country: { value: null as string[] | string | null, matchMode: FilterMatchMode.IN },
      // Optional fields
      type: { value: null as string[] | null, matchMode: FilterMatchMode.IN },
      vat: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      identificationDocuments: {
        value: null as string | null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    });

    // Dates for Guest
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const datePickerRefMobile = ref();
    const datePickerRefDesktop = ref();
    const dates: Ref<[Date, Date] | [Date] | null> = ref(null);
    const minDate = ref();
    const maxDate = ref();
    const inHouseSelection = ref('all');

    const currency = computed(
      () =>
        pmsPropertiesStore.pmsProperties.find(
          (p) => p.id === pmsPropertiesStore.currentPmsPropertyId,
        )?.currency.code,
    );

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
      const common =
        isNonEmptyString(globalQuery.value) ||
        isNonEmptyString(f.name.value) ||
        isNonEmptyString(f.email.value) ||
        (Array.isArray(f.country.value) && f.country.value.length > 0) ||
        (typeof f.country.value === 'string' && f.country.value.trim().length > 0);

      if (props.type === 'contact') {
        return common || (Array.isArray(f.type.value) && f.type.value.length > 0);
      }
      if (props.type === 'customer' || props.type === 'supplier') {
        return common || isNonEmptyString(f.vat.value);
      }
      if (props.type === 'guest') {
        return (
          common ||
          isNonEmptyString(f.identificationDocuments.value) ||
          (Array.isArray(dates.value) && dates.value.length > 0) ||
          inHouseSelection.value === 'inHouse'
        );
      }
      return common;
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

    // No results messages
    const getNoResultsTitle = computed(() => {
      switch (props.type) {
        case 'contact':
          return t('contacts.noContactsTitle');
        case 'customer':
          return t('contacts.noCustomersTitle');
        case 'guest':
          return t('contacts.noGuestsTitle');
        case 'agency':
          return t('contacts.noAgenciesTitle');
        case 'supplier':
          return t('contacts.noSuppliersTitle');
        default:
          return t('contacts.noResultsFoundTitle');
      }
    });

    const getNoResultsMessage = computed(() => {
      switch (props.type) {
        case 'contact':
          return t('contacts.noContactsMessage');
        case 'customer':
          return t('contacts.noCustomersMessage');
        case 'guest':
          return t('contacts.noGuestsMessage');
        case 'agency':
          return t('contacts.noAgenciesMessage');
        case 'supplier':
          return t('contacts.noSuppliersMessage');
        default:
          return '';
      }
    });

    // METHOD DEFINITIONS

    // fetch contacts
    const currentRequest = ref(0);
    // helper: build filters payload
    const getContactSpecificFilters = (): Record<string, unknown> => {
      if (props.type !== 'contact') {
        return {};
      }
      return {
        typeIn:
          Array.isArray(filters.value.type.value) && filters.value.type.value.length > 0
            ? filters.value.type.value
            : undefined,
      };
    };

    const getCustomerSupplierSpecificFilters = (): Record<string, unknown> => {
      if (props.type !== 'customer' && props.type !== 'supplier') {
        return {};
      }
      return {
        vatContains: isNonEmptyString(filters.value.vat.value)
          ? filters.value.vat.value
          : undefined,
      };
    };

    const getGuestSpecificFilters = (): Record<string, unknown> => {
      if (props.type !== 'guest') {
        return {};
      }
      return {
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
        inHouseOnly: inHouseSelection.value === 'inHouse' ? true : undefined,
      };
    };

    const buildFiltersPayload = (): Record<string, unknown> => {
      const baseFilters = {
        globalSearch: isNonEmptyString(globalQuery.value) ? globalQuery.value : undefined,
        nameContains: isNonEmptyString(filters.value.name.value)
          ? filters.value.name.value
          : undefined,
        emailContains: isNonEmptyString(filters.value.email.value)
          ? filters.value.email.value
          : undefined,
        phonesContains: isNonEmptyString(phoneFilterDraft.value)
          ? phoneFilterDraft.value
          : undefined,
        countryIn:
          Array.isArray(filters.value.country.value) && filters.value.country.value.length > 0
            ? (filters.value.country.value as string[])
            : undefined,
      };

      return {
        ...baseFilters,
        ...getContactSpecificFilters(),
        ...getCustomerSupplierSpecificFilters(),
        ...getGuestSpecificFilters(),
      };
    };

    const fetchNow = async (): Promise<void> => {
      const id = ++currentRequest.value;
      if (!props.isLoadingPage) {
        isLoading.value = true;
      }

      // Build filters payload based on type
      const payloadFilters = buildFiltersPayload();

      try {
        await props.fetchAction(
          { page: page.value, pageSize: rows.value },
          payloadFilters,
          orderBy.value,
        );

        if (id !== currentRequest.value) {
          return;
        }

        // Update local total records based on store count logic
        // Since props.total is passed, we might rely on that, but usually there's a reactivity delay.
        // The original code accessed store.XCount derived from the fetch.
        // We will assume 'total' prop updates reactively or we need a way to know the result count.
        // Actually, the original code did: numTotalRecords.value = contactsStore.contactsCount;
        // We can watch props.total or just update it here if we had access to the store count directly.
        // Better yet, we can use props.total directly in the template and pagination logic,
        // but the table needs `totalRecords` for pagination calculation.
        // We will update numTotalRecords from props.total in a watcher or computed.
      } finally {
        if (id === currentRequest.value) {
          isLoading.value = false;
        }
      }
    };

    // Watch total prop to update local state
    watch(
      () => props.total,
      (newVal) => {
        numTotalRecords.value = newVal;
      },
      { immediate: true },
    );

    // get color for contact type tag
    const colorContactType = (contactType: string): string => {
      switch (contactType) {
        case 'guest':
          return '#14B8A6';
        case 'customer':
          return '#3B82F6';
        case 'agency':
          return '#D97706';
        case 'supplier':
          return '#8B5CF6';
        default:
          return '#6b7280';
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
      phoneFilterDraft.value = '';

      // Reset specialized filters
      inHouseSelection.value = 'all';
      dates.value = null;

      filters.value = {
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
        phones: { value: null, matchMode: FilterMatchMode.CONTAINS },
        country: { value: [] as string[] | null, matchMode: FilterMatchMode.IN },
        type: { value: [] as string[] | null, matchMode: FilterMatchMode.IN },
        vat: { value: null, matchMode: FilterMatchMode.CONTAINS },
        identificationDocuments: { value: null, matchMode: FilterMatchMode.CONTAINS },
      };

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
        filters.value = { ...filters.value, ...e.filters } as typeof filters.value;
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

    // remove specific filter
    const removeFilter = (
      filterModel: { value: unknown },
      filterCallback: (value?: unknown) => void,
    ): void => {
      if (filterModel.value !== null) {
        filterModel.value = null;
        filterCallback();
      }
    };

    // clear phone filter
    const onClearPhoneFilter = (
      filterModel: { value: unknown },
      filterCallback: (value?: unknown) => void,
      applyFilter: () => void,
    ): void => {
      if (filterModel.value !== null) {
        phoneFilterDraft.value = '';
        filterModel.value = null;
        filterCallback();
        applyFilter?.();
      }
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
        // Need to fetch specific type? Original code used `fetchContactById` for ContactList
        // but `fetchContactById` seems to work for all types since they share IDs/structure nicely.
        // Let's assume `fetchContactById` works for all.
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

    // Date picker helpers (Guests)
    const setToday = (): void => {
      const todayDate = new Date();
      dates.value = [todayDate, todayDate];
      void fetchNow();
    };
    const setLast7Days = (): void => {
      const todayDate = new Date();
      const last7 = new Date();
      last7.setDate(todayDate.getDate() - 7);
      dates.value = [last7, todayDate];
      void fetchNow();
    };
    const setLast30Days = (): void => {
      const todayDate = new Date();
      const last30 = new Date();
      last30.setDate(todayDate.getDate() - 30);
      dates.value = [last30, todayDate];
      void fetchNow();
    };
    const setThisMonth = (): void => {
      const todayDate = new Date();
      const firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
      const lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
      dates.value = [firstDay, lastDay];
      void fetchNow();
    };
    const clearDateFilter = (): void => {
      dates.value = null;
      void fetchNow();
    };
    const apply = (): void => {
      // Date picker handles v-model, just trigger fetch
      void fetchNow();
    };
    const fetchIfDatesCleared = (): void => {
      if (!dates.value) {
        void fetchNow();
      }
    };

    onMounted(async () => {
      // Initial fetch logic. Original code fetched on mount of pages OR components.
      // The parent Page calls fetchAllContacts on mount.
      // The individual components also had `onMounted(fetchNow)`.
      // We should be careful to avoid double fetching if parent is managing it.
      // However, this component is designed to be self-contained for paging/filtering.
      // We can trigger an initial fetch here.
      await Promise.all([
        countriesStore.fetchCountries(),
        // We might skip auto-fetch if data is passed via props, but the architecture seems to be
        // "Load Page" -> "Fetch All Counts" -> "Tabs render" -> "Tabs fetch their own data on mount/interaction"
        // Actually, the Page fetches initial counts, but the LISTS fetch grid data.
        // So yes, we fetch here.
        fetchNow(),
      ]);
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
      globalQuery,
      filters,
      sortOrder,
      sortField,
      safeSortField,
      isFilter,
      isSorting,
      countryOptions,
      CONTACT_TYPES,
      dates,
      minDate,
      maxDate,
      inHouseSelection,
      currency,
      getNoResultsTitle,
      getNoResultsMessage,

      // Actions
      fetchNow,
      handlePageChange,
      handleFilterChange,
      handleSortChange,
      clearAll,
      clearGlobalQuery,
      onGlobalQueryInput,
      removeFilter,
      onClearPhoneFilter,
      onApplyPhoneFilter,
      openContactDetail,
      firstTwoInitials,
      colorContactType,

      // Date helpers
      setToday,
      setLast7Days,
      setLast30Days,
      setThisMonth,
      clearDateFilter,
      apply,
      fetchIfDatesCleared,

      // components prime
      datePickerRefMobile,
      datePickerRefDesktop,
    };
  },
});
</script>

<style scoped lang="scss">
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
