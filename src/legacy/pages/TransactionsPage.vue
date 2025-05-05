<template>
  <div class="main-content-transactions" id="page-transactions">
    <div class="header" v-if="!isSearchOpened">
      <div class="header-row">
        <div class="left">
          <img src="/app-images/icon-burger.svg" @click="openLeftDrawer" class="icon-menu" />
          <div class="select-property-desk">
            <AutocompleteComponent
              id="properties-autocomplete"
              :placeholderValue="activeProperty?.name ?? ''"
              :placeholderShowingOptions="'Buscar propiedad'"
              placeholderColor="#000000"
              icon="apartment"
              v-model="selectedPropertyId"
              :items="sortedProperties.map((el) => ({ value: el?.id ?? 0, name: el?.name ?? '' }))"
              iconExpandCollapse
              :showAddNewOption="false"
              :minChars="0"
              :emptyResultsAfterClick="false"
              isWithBorder
              iconDropdown="/app-images/icon-dropdown-black.svg"
            >
              <template #icon>
                <img src="/app-images/property-black.svg" />
              </template>
            </AutocompleteComponent>
          </div>
          <div
            class="cash-selection"
            :class="
              optionsCashJournals && optionsCashJournals?.length > 1 ? 'cash-selection-pointer' : ''
            "
            @click="showJournalOptions = !showJournalOptions"
            tabindex="1"
            @blur="showJournalOptions = false"
          >
            <span class="journal-name">
              {{ getJournalSelectedName() }}
            </span>
            <img
              src="/app-images/arrow-right-blue.svg"
              class="icon-arrow-down"
              :class="showJournalOptions ? 'icon-arrow-up' : ''"
              v-if="optionsCashJournals && optionsCashJournals?.length > 1"
            />
            <img
              src="/app-images/dropdown.svg"
              class="icon-arrow-down-desk"
              :class="showJournalOptions ? 'icon-arrow-up-desk' : ''"
              v-if="optionsCashJournals && optionsCashJournals?.length > 1"
            />
            <div
              class="options-cash-container"
              :class="!showJournalOptions ? 'hidden-options-cash-container' : ''"
              v-if="optionsCashJournals && optionsCashJournals?.length > 1"
            >
              <div
                class="option-cash"
                v-for="journal in optionsCashJournals"
                :key="journal.value"
                @mousedown="cashJournalSelectedId = journal.value"
              >
                {{ journal.label }}
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <img src="/app-images/search.svg" class="icon-search" @click="isSearchOpened = true" />
          <div class="select-property-mobile">
            <div
              @click="openSelectProperty"
              class="property-image"
              :style="{
                backgroundImage: imageActiveProperty ? `url(${imageActiveProperty})` : 'none',
                backgroundColor: imageActiveProperty ? 'none' : 'aquamarine',
              }"
            >
              <span v-if="!imageActiveProperty">
                {{ initialsActiveProperty }}
              </span>
            </div>
          </div>
          <div class="cash-register-desk">
            <div class="toogle-cash-register">
              <label class="switch">
                <input type="checkbox" v-model="isCashRegisterOpen" @click="actionCash = true" />
                <span class="slider round" />
              </label>
            </div>
            <span class="cash-state">
              Caja {{ cashRegister?.state === 'open' ? 'abierta' : 'cerrada' }}
            </span>
            <div class="avatar-container">
              <img class="user-avatar" :src="getUserImage(cashRegister?.userId || 0)" />
            </div>
            <div class="cash-text">
              <span>
                {{ cashRegister?.state === 'open' ? 'Abierta' : 'Cerrada' }}
              </span>
              por {{ userName(cashRegister?.userId || 0) }}, <br />
              {{ dateTimeText(cashRegister?.dateTime || new Date()) }}
            </div>

            <span class="cash-balance">
              <span class="balance"> {{ cashRegister?.balance }} € </span>
              <span class="balance-feedback">
                saldo de {{ cashRegister?.state === 'open' ? 'apertura' : 'cierre' }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="header-row">
        <div class="left">
          <div class="cash-state-wrap">
            <span class="cash-state">
              Caja {{ cashRegister?.state === 'open' ? 'abierta' : 'cerrada' }}
            </span>
            <span class="cash-balance">
              <span class="balance"> {{ cashRegister?.balance }} € </span>
              saldo de {{ cashRegister?.state === 'open' ? 'apertura' : 'cierre' }}
            </span>
          </div>
        </div>
        <div class="right">
          <div class="toogle-cash-register">
            <label class="switch">
              <input type="checkbox" v-model="isCashRegisterOpen" @click="actionCash = true" />
              <span class="slider round" />
            </label>
          </div>
        </div>
      </div>
      <div class="header-row">
        <div class="left">
          <div class="avatar-container">
            <img class="user-avatar" :src="getUserImage(cashRegister?.userId || 0)" />
          </div>
          <div class="cash-text">
            <span>{{ cashRegister?.state === 'open' ? 'Abierta' : 'Cerrada' }}</span>
            por {{ userName(cashRegister?.userId || 0) }},
            {{ dateTimeText(cashRegister?.dateTime || new Date()) }}
          </div>
        </div>
      </div>
    </div>
    <Transition name="search-transition">
      <div class="header-search" v-if="isSearchOpened">
        <img
          src="/app-images/arrow_forward_ios.svg"
          class="arrow-back"
          @click="isSearchOpened = false"
        />
        <input
          type="text"
          v-model="transactionTextSearch"
          placeholder="Buscar movimiento"
          class="input-search"
        />
      </div>
    </Transition>
    <div class="filters-container">
      <div class="filter-items">
        <div class="input-search-desk-wrapper">
          <img
            src="/app-images/search-black.svg"
            class="icon-search-desk"
            @click="isSearchOpened = true"
          />
          <input
            class="input-search-desk"
            v-model="transactionTextSearch"
            placeholder="Buscar movimiento"
          />
        </div>
        <div
          class="select-filters"
          :class="isFilterOpened ? 'select-filters-open' : ''"
          @blur="isFilterOpened = false"
          tabindex="1"
        >
          <div class="filter-top" @click="isFilterOpened = !isFilterOpened">
            <span class="left">
              <img class="filter-img" src="/app-images/filter-icon-tuning-black.svg" />
              <span>
                {{ numFiltersApplied > 0 ? `${numFiltersApplied}` : '' }}
                Filtro{{ numFiltersApplied === 1 ? '' : 's' }} de pagos
              </span>
            </span>
            <img src="/app-images/dropdown.svg" class="dropdown-img" />
          </div>
          <div class="filter-options" v-if="isFilterOpened">
            <div class="multiselect-container">
              <MultiSelect
                title="Modo de pago"
                v-model="selectedJournalIds"
                :options="journals"
                :isSimpleSelect="true"
                v-if="journals.length > 1"
              />
              <MultiSelect
                title="Tipo de pago"
                v-model="selectedTransactionTypesIds"
                :options="transactionTypes"
              />
            </div>
            <div v-if="numFiltersApplied > 0" class="clear-filters">
              <span @click="clearFilters"> Borrar filtros </span>
            </div>
          </div>
        </div>
        <div class="date-range-container">
          <DatePicker
            v-model="transactionDateRange"
            class="datepicker"
            :inputStyle="{ height: '40px', fontSize: '0.9rem' }"
            size="small"
            dateFormat="dd/mm/yy"
            placeholder="DD/MM/YYYY"
            selectionMode="range"
            hideOnRangeSelection
            :manualInput="false"
          />
        </div>
      </div>
      <div class="transaction-creation-buttons">
        <button @click="createNewSupplierTransaction()">
          <CustomIcon
            :imagePath="'/app-images/icon-add-white.svg'"
            :color="'#FFFFFF'"
            :width="'21px'"
            :height="'21px'"
          />
          <span> Pago a proveedor </span>
        </button>
        <button @click="createNewTransfer">
          <CustomIcon
            :imagePath="'/app-images/icon-add-white.svg'"
            :color="'#FFFFFF'"
            :width="'21px'"
            :height="'21px'"
          />
          <span class="text-creation-button-small"> Transf. interna </span>
          <span class="text-creation-button-big"> Transferencia interna </span>
        </button>
      </div>
    </div>
    <div class="transactions-mobile" @scroll="fetchMoreTransactions">
      <div
        class="transaction"
        v-for="transaction in transactions"
        :key="transaction.id"
        @click="openCorrespondingModal(transaction)"
      >
        <div class="transaction-type">
          <img :src="`/app-images/${getTransactionIconPath(transaction.transactionType)}`" />
          <div class="transaction-partner-desktop">
            {{ transaction.partnerName || 'Sin asignar' }}
          </div>
        </div>
        <div class="transaction-partner">
          {{ transaction.partnerName || transaction.name }}
        </div>
        <div class="transaction-code">
          {{ transaction.name }}
        </div>
        <div class="transaction-date">
          {{ dateFormat(transaction.date) }}
        </div>
        <div class="created-by">
          {{ userName(transaction.createUid) }}
        </div>
        <div class="transaction-reference">
          {{ transaction.reference }}
        </div>
        <div class="transaction-type-name">
          {{ getTransactionType(transaction.transactionType) }}
        </div>
        <div class="transaction-amount">
          <span
            class="transaction-amount-wrap"
            :style="`background-color: ${getColor(transaction.transactionType)};`"
          >
            {{ getSign(transaction.amount, transaction.transactionType) }} €
          </span>
        </div>
        <div class="transaction-journal">
          {{ journalName(transaction.journalId) }}
        </div>
      </div>
    </div>
    <div class="transactions-container" :class="{ 'search-opened': isSearchOpened }">
      <ListComponent
        :schema="schema"
        :listData="transactionList"
        @selectItem="openCorrespondingModal($event)"
        @scrollInBottom="fetchMoreTransactions"
        @sort="sortTransactionsByField($event)"
      />
    </div>
  </div>

  <Dialog
    v-model:visible="actionCash"
    :closable="false"
    :header="`${cashRegister?.state === 'open' ? 'Cerrar caja' : 'Abrir caja'}`"
    :modal="true"
  >
    <div class="open-close-cash-container">
      <InputNumber
        class="input"
        v-model="amount"
        size="small"
        :inputStyle="{
          width: '100%',
        }"
        :minFractionDigits="0"
        :maxFractionDigits="2"
        mode="currency"
        currency="EUR"
      />
      <div class="buttons-container">
        <AppButton
          :label="'Cerrar caja'"
          v-if="cashRegister?.state === 'open'"
          raised
          size="small"
          class="button"
          @click="actionOpenCloseCash('open')"
        />
        <AppButton
          :label="'Abrir caja'"
          v-else
          raised
          size="small"
          class="button"
          @click="actionOpenCloseCash('close')"
        />
        <AppButton
          :label="'Cancelar'"
          raised
          size="small"
          severity="secondary"
          class="btn-cancel-action"
          @click="
            (actionCash = false),
              (isCashRegisterOpen = cashRegister?.state === 'open' ? true : false)
          "
        />
      </div>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="openForceDialog"
    :closable="false"
    :header="`${cashRegister?.state === 'open' ? 'Forzar cerrar caja' : 'Forzar abrir caja'}`"
    :modal="true"
  >
    <div class="open-close-cash-container">
      <span v-if="cashRegisterResult"> Diferencia: {{ cashRegisterResult.diff }}</span>

      <div class="buttons-container">
        <AppButton
          :label="'Forzar caja'"
          raised
          size="small"
          class="button"
          @click="force(cashRegister?.state || '')"
        />

        <AppButton
          :label="'Cancelar'"
          raised
          size="small"
          severity="secondary"
          class="btn-cancel-action"
          @click="
            (actionCash = false),
              (isCashRegisterOpen = cashRegister?.state === 'open' ? true : false)
          "
        />
      </div>
    </div>
  </Dialog>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted, watch, ref, type Ref, markRaw } from 'vue';
import { useRouter } from 'vue-router';

import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';

import MultiSelect from '@/legacy/components/roomdooComponents/MultiSelect.vue';
import AutocompleteComponent from '@/legacy/components/roomdooComponents/AutocompleteComponent.vue';
import ListComponent from '@/legacy/components/roomdooComponents/ListComponent.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

import { type TransactionInterface } from '@/legacy/interfaces/TransactionInterface';
import { type SchemaInterface } from '@/legacy/interfaces/Lists';

import TransactionComponent from '@/legacy/components/transactions/TransactionComponent.vue';

import { localeSpain } from '@/legacy/utils/dates';
import { useStore } from '@/legacy/store';

import { dialogService } from '@/legacy/services/DialogService';
import InternalTransfer from '@/legacy/components/transactions/InternalTransfer.vue';

export default defineComponent({
  components: {
    MultiSelect,
    AutocompleteComponent,
    TransactionComponent,
    ListComponent,
    CustomIcon,
    DatePicker,
    Dialog,
    AppButton: Button,
    InputNumber,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const limit = 20;
    const transactionTypes = [
      { id: 0, name: 'Cobro cliente' },
      { id: 1, name: 'Devolución cliente' },
      { id: 2, name: 'Pago proveedor' },
      { id: 3, name: 'Devolución proveedor' },
      { id: 4, name: 'Transferencia interna' },
    ];

    const selectedJournalIds = ref([] as number[]);
    const selectedTransactionTypesIds = ref([] as number[]);
    const isFilterOpened = ref(false);
    const transactionDateRange = ref([] as Date[]);
    const isSearchOpened = ref(false);
    const selectedPropertyId = ref(0);
    const openForceDialog = ref(false);
    const newTransfer = ref(false);
    const newSupplierTransaction = ref(false);
    const customerTransaction = ref(false);
    const currentTransaction: Ref<TransactionInterface | null> = ref(null);
    const cashJournalSelectedId = ref(0);
    const optionsCashJournals: Ref<null | { value: number; label: string }[]> = ref(null);
    const cashJournalId: Ref<number> = ref(0);
    const actionCash = ref(false);
    const amount = ref(0);
    const transactionTextSearch = ref('');
    const selectedJournalId = ref(0);
    const localValue = ref(localeSpain);
    const maxPage = ref(0);
    const currentPage = ref(1);
    const showJournalOptions = ref(false);
    const isCashRegisterOpen = ref(false);
    const selectedOrder = ref({
      field: '',
      isDesc: false,
    });

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const imageActiveProperty = computed(() => activeProperty.value?.hotelImageUrl);
    const transactions = computed(() => store.state.transactions.transactions);
    const totalTransactions = computed(() => store.state.transactions.totalTransactions);
    const journals = computed(() => store.state.accountJournals.accountJournals);
    const users = computed(() => store.state.users.users);
    const total = computed(() => store.state.transactions.total);
    const cashRegister = computed(() => store.state.cashRegister.cashRegister);
    const cashRegisterResult = computed(() => store.state.cashRegister.cashRegisterResult);
    const activeUser = computed(() => store.state.user.activeUser);

    const numFiltersApplied = computed(() => {
      const numFilters = selectedJournalIds.value.length + selectedTransactionTypesIds.value.length;
      return numFilters;
    });

    const initialsActiveProperty = computed(() => {
      const result = '';
      if (activeProperty.value && activeProperty.value.name) {
        if (activeProperty.value.name.split(' ').length === 1) {
          return activeProperty.value.name[0].toUpperCase();
        }

        return (
          activeProperty.value.name.split(' ')[0][0].toUpperCase() +
          activeProperty.value.name.split(' ')[1][0].toUpperCase()
        );
      }
      return result;
    });

    const sortedProperties = computed(() => {
      const result = store.state.properties.properties.filter(
        (el) => el.id !== activeUser.value?.defaultPropertyId
      );
      const defaultProperty = store.state.properties.properties.find(
        (el) => el.id === activeUser.value?.defaultPropertyId
      );
      if (defaultProperty) {
        result.unshift(defaultProperty);
      }
      return result;
    });

    const journalName = (journalId: number) =>
      journals.value.find((el) => el.id === journalId)?.name;

    const userName = (userId: number) => users.value.find((el) => el.id === userId)?.name;

    const dateStr = (cashRegisterDate: Date) => {
      const today = new Date();
      let result = '';
      if (cashRegisterDate === null) {
        result = '';
      } else if (cashRegisterDate.getDate() === today.getDate()) {
        result = 'hoy';
      } else {
        const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        result += `a ${weekdays[cashRegisterDate.getDay()]} `;
        result += `${cashRegisterDate.getDate()} de `;
        result += localValue.value.months[cashRegisterDate.getMonth()];
      }
      return result;
    };

    const dateFormat = (dateTimeStr: string) => {
      const dateTimeDate = new Date(dateTimeStr);
      const dateFormatted = `${dateTimeDate.getDate()}/${
        dateTimeDate.getMonth() + 1
      }/${dateTimeDate.getFullYear()}`;
      return dateFormatted;
    };

    const hour = (cashRegisterDate: Date) => {
      const cashRegisterHour = `${cashRegisterDate.getHours()}:${cashRegisterDate
        .getMinutes()
        .toString()
        .padStart(2, '0')} `;
      return cashRegisterHour;
    };

    const dateTimeText = (cashRegisterDate: Date) => {
      if (cashRegisterDate === null) {
        return '';
      }
      return `${dateStr(cashRegisterDate)}, ${hour(cashRegisterDate)}`;
    };

    const getTransactionType = (transactionType: string) => {
      let type = '';
      if (transactionType === 'internal_transfer') {
        type = 'Transferencia interna';
      } else if (transactionType === 'customer_inbound') {
        type = 'Cobro a cliente';
      } else if (transactionType === 'customer_outbound') {
        type = 'Devolución a cliente';
      } else if (transactionType === 'supplier_outbound') {
        type = 'Pago a proveedor';
      } else if (transactionType === 'supplier_inbound') {
        type = 'Devolución de proveedor';
      }
      return type;
    };

    const getColor = (transactionType: string) => {
      let color = '';

      if (transactionType === 'customer_inbound' || transactionType === 'supplier_inbound') {
        color += '#E2FBE2';
      } else if (
        transactionType === 'customer_outbound' ||
        transactionType === 'supplier_outbound'
      ) {
        color += 'rgba(255, 221, 221, 0.54); ';
      } else if (transactionType === 'internal_transfer') {
        color += '#FFDDDD8A';
      }
      return color;
    };

    const getSign = (transactionAmount: number, transactionType: string) => {
      let amountStr = '';
      if (transactionType === 'customer_inbound' || transactionType === 'supplier_inbound') {
        amountStr += `+ ${transactionAmount}`;
      }
      if (transactionType === 'customer_outbound' || transactionType === 'supplier_outbound') {
        amountStr += `- ${transactionAmount}`;
      }
      if (transactionType === 'internal_transfer') {
        amountStr += transactionAmount;
      }
      return amountStr;
    };

    const amountWithSign = (transactionAmount: number, transactionType: string) => {
      let amountStr = '';
      if (transactionType === 'customer_inbound' || transactionType === 'supplier_inbound') {
        amountStr += `+ ${transactionAmount}`;
      }
      if (transactionType === 'customer_outbound' || transactionType === 'supplier_outbound') {
        amountStr += `- ${transactionAmount}`;
      }
      if (transactionType === 'internal_transfer') {
        amountStr += transactionAmount;
      }
      return amountStr;
    };

    const getJournalSelectedName = () => {
      const journalSelected = journals.value.find((el) => el.id === cashJournalSelectedId.value);
      if (journalSelected) {
        return journalSelected.name;
      }
      return '';
    };

    const getUserImage = (userId: number) => {
      const userImage = users.value.find((el) => el.id === userId)?.userImageBase64;
      if (userImage) {
        return `data:image/png;base64,${userImage}`;
      }
      return '/app-images/avatar.png';
    };

    const getTransactionIconPath = (transactionType: string) => {
      let iconPath = '';
      if (transactionType === 'internal_transfer') {
        iconPath = 'icon-internal-transaction.svg';
      } else if (transactionType === 'supplier_inbound') {
        iconPath = 'icon-supplier-transaction.svg';
      } else if (transactionType === 'customer_inbound') {
        iconPath = 'icon-customer-transaction.svg';
      } else if (
        transactionType === 'customer_outbound' ||
        transactionType === 'supplier_outbound'
      ) {
        iconPath = 'icon-refund.svg';
      }
      return iconPath;
    };

    const closeTransactionDialog = (transactionType: string) => {
      if (transactionType === 'transfer') {
        newTransfer.value = false;
      } else if (transactionType === 'supplier') {
        newSupplierTransaction.value = false;
      } else if (transactionType === 'customer') {
        customerTransaction.value = false;
      }
    };

    const actionOpenCloseCash = async (stateCash: string) => {
      const payload = {
        action: '',
        pmsPropertyId: activeProperty.value?.id,
        amount: amount.value,
        journalId: cashJournalId.value,
        forceAction: false,
      };
      if (stateCash === 'open') {
        payload.action = 'close';
      } else {
        payload.action = 'open';
      }
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('cashRegister/actionCash', payload);
        if (cashRegisterResult.value && cashRegisterResult.value?.result) {
          actionCash.value = false;
          amount.value = 0;
          await store.dispatch('cashRegister/fetchCashRegister', cashJournalId.value);
        } else {
          openForceDialog.value = true;
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const force = async (stateCash: string) => {
      const payload = {
        action: '',
        pmsPropertyId: activeProperty.value?.id,
        amount: amount.value,
        journalId: cashJournalId.value,
        forceAction: true,
      };
      if (stateCash === 'open') {
        payload.action = 'close';
      } else {
        payload.action = 'open';
      }
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('cashRegister/actionCash', payload);
        actionCash.value = false;
        openForceDialog.value = false;
        amount.value = 0;
        await store.dispatch('cashRegister/fetchCashRegister', cashJournalId.value);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const sortTransactionsByField = (field: string) => {
      selectedOrder.value = { field, isDesc: !selectedOrder.value.isDesc };
    };

    const openCorrespondingModal = async (transaction: TransactionInterface) => {
      const selectedTransaction = transactions.value.find((el) => el.id === transaction.id);
      if (selectedTransaction) {
        currentTransaction.value = selectedTransaction;
        if (window.innerWidth >= 1024) {
          if (selectedTransaction.transactionType === 'internal_transfer') {
            newTransfer.value = true;
            dialogService.open({
              header: `Transferencia interna`,
              content: markRaw(InternalTransfer),
              closable: true,
              props: {
                transaction: currentTransaction.value,
              },
            });
          } else if (selectedTransaction.transactionType === 'supplier_outbound') {
            newSupplierTransaction.value = true;

            dialogService.open({
              header: 'Datos de pago a proveedor',
              content: markRaw(TransactionComponent),
              closable: true,
              props: {
                transaction: currentTransaction.value,
                isCustomer: false,
              },
            });
          } else if (
            selectedTransaction.transactionType === 'customer_inbound' ||
            selectedTransaction.transactionType === 'customer_outbound'
          ) {
            customerTransaction.value = true;
            const isCustomerRefund =
              currentTransaction?.value?.transactionType === 'customer_outbound' ? true : false;
            dialogService.open({
              header: `Datos de ${isCustomerRefund ? 'devolución' : 'cobro'} a cliente`,
              content: markRaw(TransactionComponent),
              closable: true,
              props: {
                transaction: currentTransaction.value,
                isRefund: isCustomerRefund,
              },
            });
          }
        } else {
          await store.dispatch('transactions/setCurrentTransaction', transaction);
          void store.dispatch('layout/changeRightDrawerContent', 'TransactionDetailMobile');
          void store.dispatch('layout/rightDrawerDisplayed', true);
        }
      }
    };

    const openSelectProperty = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'PropertySelector');
      void store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const openLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', true);
    };

    const clearFilters = () => {
      selectedJournalIds.value = [];
      selectedTransactionTypesIds.value = [];
    };

    const fetchMoreTransactions = async () => {
      if (currentPage.value < maxPage.value) {
        currentPage.value += 1;
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('transactions/fetchTransactions', {
            limit,
            offset: (currentPage.value - 1) * limit,
            pmsPropertyId: activeProperty.value?.id,
            filter: transactionTextSearch.value,
            dateStart: transactionDateRange.value[0],
            dateEnd: transactionDateRange.value[1],
            journalIds: selectedJournalIds.value,
            transactionTypes: selectedTransactionTypesIds.value,
            transactionMethodId: selectedJournalId.value,
          });
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
      }
    };

    const schema: SchemaInterface[] = [
      {
        fieldName: 'partnerName',
        label: 'Contacto relacionado',
        fieldType: 'textBoldWithAvatar',
        avatarImage: 'avatarImage',
        mobileAllowed: true,
      },
      {
        fieldName: 'name',
        label: 'Código',
        fieldType: 'text',
        isSortable: true,
      },
      {
        fieldName: 'date',
        label: 'Fecha',
        fieldType: 'text',
        mobileAllowed: true,
        isSortable: true,
      },
      {
        fieldName: 'createUid',
        label: 'Creado por',
        fieldType: 'text',
      },
      {
        fieldName: 'reference',
        label: 'Referencia',
        fieldType: 'text',
        isSortable: true,
        columnWidth: 2,
      },
      {
        fieldName: 'transactionType',
        label: 'Tipo de movimiento',
        fieldType: 'text',
      },
      {
        fieldName: 'journalId',
        label: 'Modo de pago',
        fieldType: 'text',
        mobileAllowed: true,
      },
      {
        fieldName: 'amount',
        label: 'Importe total',
        secondaryLabel: `${total.value} €`,
        fieldType: 'tagMoney',
        align: 'right',
        mobileAllowed: true,
        isSortable: true,
      },
    ];

    const transactionList = computed(() =>
      transactions.value.map((transaction) => ({
        partnerName: transaction.partnerName || 'Sin asignar',
        name: transaction.name,
        date: dateFormat(transaction.date),
        createUid: userName(transaction.createUid),
        reference: transaction.reference,
        transactionType: getTransactionType(transaction.transactionType),
        journalId: journalName(transaction.journalId),
        amount: `${amountWithSign(transaction.amount, transaction.transactionType)}`,
        id: transaction.id,
        folioId: transaction.folioId,
        avatarImage: `/app-images/${getTransactionIconPath(transaction.transactionType)}`,
      }))
    );

    const createNewTransfer = () => {
      newTransfer.value = true;
      dialogService.open({
        header: 'Transferencia interna',
        content: markRaw(InternalTransfer),
        closable: true,
      });
    };

    const createNewSupplierTransaction = () => {
      newSupplierTransaction.value = true;
      dialogService.open({
        header: 'Pago a proveedor',
        content: markRaw(TransactionComponent),
        closable: true,
        props: {
          isCustomer: false,
        },
      });
    };

    watch(activeProperty, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('accountJournals/fetchAccountJournals', {
          pmsPropertyId: activeProperty.value?.id,
        });
        await store.dispatch('transactions/removeTransactions');
        await store.dispatch('transactions/fetchTransactions', {
          limit,
          offset: 0,
          pmsPropertyId: activeProperty.value?.id,
          dateStart: transactionDateRange.value[0],
          dateEnd: transactionDateRange.value[1],
        });
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    });

    watch(cashRegister, () => {
      isCashRegisterOpen.value = cashRegister.value?.state === 'open';
    });

    watch(transactions, () => {
      maxPage.value = Math.ceil(totalTransactions.value / limit);
    });

    watch(
      selectedJournalIds,
      () => {
        if (selectedJournalIds.value.length > 0) {
          if (selectedJournalIds.value.length > 1) {
            selectedJournalIds.value = [
              selectedJournalIds.value[selectedJournalIds.value.length - 1],
            ];
          }
          [selectedJournalId.value] = selectedJournalIds.value;
        } else {
          selectedJournalId.value = 0;
        }
      },
      {
        deep: true,
      }
    );

    watch(
      [
        transactionTextSearch,
        selectedJournalId,
        transactionDateRange,
        selectedJournalId,
        selectedTransactionTypesIds,
        selectedOrder,
      ],
      async () => {
        if (
          selectedJournalId.value !== 0 ||
          (transactionDateRange.value.length === 2 &&
            transactionDateRange.value[0] &&
            transactionDateRange.value[1]) ||
          transactionTextSearch.value.length >= 5 ||
          selectedJournalId.value !== 0 ||
          selectedTransactionTypesIds.value.length > 0
        ) {
          const payload = {
            pmsPropertyId: activeProperty.value?.id,
            limit,
            offset: 0,
            orderBy: selectedOrder.value.field,
            orderDesc: selectedOrder.value.isDesc,
          };
          if (selectedJournalId.value !== 0) {
            Object.assign(payload, { journalIds: [selectedJournalId.value] });
          }
          if (
            transactionDateRange.value.length === 2 &&
            transactionDateRange.value[0] &&
            transactionDateRange.value[1]
          ) {
            Object.assign(payload, {
              dateStart: transactionDateRange.value[0],
              dateEnd: transactionDateRange.value[1],
            });
          }
          if (transactionTextSearch.value) {
            Object.assign(payload, { filter: transactionTextSearch.value });
          }
          if (selectedJournalId.value !== 0) {
            Object.assign(payload, { transactionMethodId: selectedJournalId.value });
          }
          if (selectedTransactionTypesIds.value.length > 0) {
            Object.assign(payload, { transactionType: selectedTransactionTypesIds.value });
          }
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('transactions/removeTransactions');
            await store.dispatch('transactions/fetchTransactions', payload);
          } catch {
            dialogService.open({
              header: 'Error',
              content: 'Algo ha ido mal',
              btnAccept: 'Ok',
            });
          } finally {
            void store.dispatch('layout/showSpinner', false);
          }
        }
      },
      {
        deep: true,
      }
    );

    watch(journals, async () => {
      if (journals.value.length !== 0) {
        const journalsIds: Array<number> = [];
        journals.value.forEach((journal) => {
          if (journal.type === 'cash') {
            journalsIds.push(journal.id);
          }
        });
        [cashJournalId.value] = journalsIds;
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('cashRegister/fetchCashRegister', journalsIds[0]);
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }

        [cashJournalSelectedId.value] = journalsIds;
        if (journalsIds.length > 1) {
          optionsCashJournals.value = journals.value
            .filter((journal) => journalsIds.includes(journal.id))
            .map((el) => ({ value: el.id, label: el.name }));
        } else {
          optionsCashJournals.value = null;
        }
      }
    });

    watch(cashJournalSelectedId, async () => {
      cashJournalId.value = cashJournalSelectedId.value;
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('cashRegister/fetchCashRegister', cashJournalSelectedId.value);
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    });

    watch(selectedPropertyId, async () => {
      if (selectedPropertyId.value !== activeProperty.value?.id && selectedPropertyId.value !== 0) {
        await store.dispatch('properties/setActiveProperty', selectedPropertyId.value);
        void router.push(`/transactions/${selectedPropertyId.value}`);
      }
    });

    watch(total, () => {
      const schemaAmount = schema.find((el) => el.fieldName === 'amount');
      if (schemaAmount) {
        schemaAmount.secondaryLabel = `${total.value} €`;
      }
    });

    onMounted(() => {
      const dateEnd = new Date();
      const dateStart = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() - 30);

      transactionDateRange.value = [dateStart, dateEnd];
      void store.dispatch('accountJournals/fetchAccountJournals', {
        pmsPropertyId: activeProperty.value?.id,
      });
      void store.dispatch('users/fetchUsers', activeProperty.value?.id);
    });

    return {
      activeProperty,
      imageActiveProperty,
      sortedProperties,
      selectedPropertyId,
      amount,
      cashJournalId,
      maxPage,
      currentPage,
      transactions,
      cashJournalSelectedId,
      optionsCashJournals,
      cashRegister,
      cashRegisterResult,
      localValue,
      actionCash,
      openForceDialog,
      newTransfer,
      newSupplierTransaction,
      customerTransaction,
      total,
      transactionTextSearch,
      selectedJournalId,
      journals,
      currentTransaction,
      initialsActiveProperty,
      showJournalOptions,
      isCashRegisterOpen,
      selectedJournalIds,
      transactionTypes,
      selectedTransactionTypesIds,
      numFiltersApplied,
      isFilterOpened,
      transactionDateRange,
      isSearchOpened,
      schema,
      transactionList,
      createNewSupplierTransaction,
      createNewTransfer,
      dateStr,
      hour,
      dateTimeText,
      dateFormat,
      getSign,
      getColor,
      amountWithSign,
      actionOpenCloseCash,
      force,
      journalName,
      userName,
      getTransactionType,
      getUserImage,
      openCorrespondingModal,
      getJournalSelectedName,
      openLeftDrawer,
      openSelectProperty,
      fetchMoreTransactions,
      clearFilters,
      getTransactionIconPath,
      closeTransactionDialog,
      sortTransactionsByField,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content-transactions {
  height: 100%;
  min-width: 380px;
  .header {
    background-color: #f8f8f8;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
    padding: 15px 21px;
    display: flex;
    flex-direction: column;
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left {
        display: flex;
        align-items: center;
        .icon-menu {
          margin-right: 13px;
          width: 20px;
        }
        .cash-selection {
          border: none;
          font-size: 18px;
          background-color: #f0fcff;
          position: relative;
          min-width: 200px;
          user-select: none;
          &:focus {
            outline: none;
          }
          .icon-arrow-down {
            margin-left: 10px;
            margin-bottom: 1px;
            transform: rotate(90deg);
          }
          .icon-arrow-up {
            margin-left: 10px;
            margin-bottom: 1px;
            transform: rotate(-90deg);
          }
          .icon-arrow-down-desk {
            display: none;
          }
          .options-cash-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);
            position: absolute;
            top: 30px;
            left: -5px;
            font-size: 16px;
            padding: 10px;
            z-index: 100;
          }
          .hidden-options-cash-container {
            visibility: hidden;
          }
        }
        .cash-state-wrap {
          display: flex;
          flex-direction: column;
          .cash-state {
            font-size: 14px;
            font-weight: bold;
            margin-top: 0.5rem;
          }
          .cash-balance {
            .balance {
              font-size: 14px;
              font-weight: bold;
            }
          }
        }
        .avatar-container {
          width: 25px;
          height: 25px;
          margin-top: 5px;
          .user-avatar {
            border-radius: 50%;
            width: 100%;
            height: 100%;
          }
        }
        .cash-text {
          font-size: 12px;
          margin-left: 0.5rem;
          margin-top: 5px;
        }
        .select-property-desk {
          display: none;
        }
      }
      .right {
        display: flex;
        align-items: center;
        .icon-search {
          margin-right: 1rem;
        }
        .select-property-mobile {
          width: 35px;
          height: 35px;
          .property-image {
            cursor: pointer;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.3rem;
            display: flex;
            height: 100%;
            justify-content: center;
            align-items: center;
            border: 1px solid black;
            background-size: cover;
          }
        }
        .toogle-cash-register {
          display: flex;
          margin-top: 1rem;
          align-items: center;
          .switch {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 32px;
          }
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #e0e0e0;
            -webkit-transition: 0.4s;
            transition: 0.4s;
          }
          .slider:before {
            position: absolute;
            content: '';
            height: 26px;
            width: 26px;
            left: 4px;
            top: 3px;
            background-color: white;
            -webkit-transition: 0.4s;
            transition: 0.4s;
          }
          input:checked + .slider {
            background-color: $primary;
          }
          input:focus + .slider {
            box-shadow: 0 0 1px $primary;
          }
          input:checked + .slider:before {
            -webkit-transform: translateX(20px);
            -ms-transform: translateX(20px);
            transform: translateX(15px);
          }
          .slider.round {
            border-radius: 34px;
          }

          .slider.round:before {
            border-radius: 50%;
          }
        }
        .cash-register-desk {
          display: none;
        }
      }
    }
  }
  .header-search {
    display: flex;
    background-color: #f0fcff;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
    padding: 15px 10px;
    align-items: center;
    .arrow-back {
      width: 17px;
      height: 17px;
      margin-right: 5px;
      margin-left: 10px;
      transform: rotate(90deg);
    }
    .input-search {
      font-size: 18px;
      border: none;
      background-color: #f0fcff;
      color: #263941;
      margin-top: 2px;
      margin-left: 7px;
      &:focus {
        outline: none;
      }
      &::placeholder {
        color: #5f6367;
      }
    }
  }
  .filters-container {
    display: flex;
    margin: 16px;
    align-items: center;
    justify-content: space-between;
    .filter-items {
      display: flex;
      width: 100%;
      justify-content: space-between;
      .input-search-desk-wrapper {
        display: none;
        background-color: white;
      }
      .select-filters {
        margin-right: 10px;
        position: relative;
        height: 40px;
        border: 1px solid #d2ecf2;
        border-radius: 10px;
        cursor: pointer;
        user-select: none;
        outline: none;
        width: 180px;
        background-color: white;
        .filter-top {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 5px;
          padding-right: 5px;
          .left {
            display: flex;
            align-items: center;
            .filter-img {
              width: 15px;
              height: 15px;
            }
            span {
              font-size: 14px;
              margin-left: 10px;
            }
          }
          .dropdown-img {
            width: 11px;
            height: 7px;
            margin-top: 0.3rem;
          }
        }
        .filter-options {
          position: absolute;
          top: 35px;
          left: -1px;
          z-index: 120;
          border-right: 1px solid #d2ecf2;
          border-left: 1px solid #d2ecf2;
          border-bottom: 1px solid #d2ecf2;
          background-color: white;
          border-radius: 0 0 10px 10px;
          display: flex;
          flex-direction: column;
          box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);

          .multiselect-container {
            max-height: 60vh;
            overflow-y: scroll;
          }
          .clear-filters {
            border-top: 1px solid grey;
            color: $primary;
            padding: 0.5rem 1rem;
          }
        }
      }
      .select-filters-open {
        background-color: white;
        border-radius: 10px 10px 0 0;
        box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.25);
        .dropdown-img {
          transform: rotate(180deg);
        }
      }
      .date-range-container {
        height: 40px;
        border-radius: 10px;
        width: 175px;
      }
    }
    .transaction-creation-buttons {
      display: none;
    }
  }
  .transactions-container {
    height: calc(100% - 60px);
    display: none;
    &.search-opened {
      height: calc(100% - 180px);
    }

    .transactions-container-header {
      background-color: white;
      .transactions-container-header-item {
        display: none;
      }
      .total-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        .total-text {
          font-size: 16px;
          color: #405158;
          margin-left: 1rem;
          text-align: right;
        }
        .total-amount {
          font-size: 16px;
          font-weight: bold;
          margin-right: 1rem;
          white-space: nowrap;
        }
      }
    }
  }
  .transactions-mobile {
    overflow-y: scroll;
    padding-bottom: 2rem;
    height: 100vh;
    margin: 0 1rem;
    &::-webkit-scrollbar {
      display: none;
    }
    .transaction {
      display: grid;
      grid-template-areas:
        'type partner partner partner partner partner partner amount'
        'type date journal journal journal journal journal journal';
      border-bottom: 1px solid #d2ecf2;
      padding: 10px 0;
      row-gap: 7px;
      .transaction-type {
        grid-area: type;
        align-self: center;
        margin-left: 10px;
        .transaction-partner-desktop {
          display: none;
        }
      }
      .transaction-partner {
        grid-area: partner;
        color: #263941;
        font-weight: 600;
        font-size: 15px;
        align-self: center;
      }
      .transaction-amount {
        grid-area: amount;
        justify-self: end;
        color: #263941;
        font-size: 15px;
        font-weight: 600;
        align-self: center;
        .transaction-amount-wrap {
          padding: 2px 7px;
          border-radius: 30px;
          white-space: nowrap;
        }
      }
      .transaction-date {
        grid-area: date;
        color: #263941;
        font-size: 13px;
        align-self: center;
      }
      .transaction-journal {
        grid-area: journal;
        justify-self: end;
        color: #263941;
        font-size: 13px;
        margin-right: 5px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 200px;
        // margin-right: 15px;
        align-self: center;
        text-align: right;
      }
      .transaction-code {
        display: none;
      }
      .created-by {
        display: none;
      }
      .transaction-reference {
        display: none;
      }
      .transaction-type-name {
        display: none;
      }
    }
  }
  .no-transactions {
    font-size: 16px;
    margin-left: 1rem;
    margin-top: 1rem;
  }
}
.open-close-cash-container {
  display: flex;
  flex-direction: column;
  .input {
    margin-bottom: 1rem;
  }
  .button:first-child {
    margin-right: 1rem;
  }
  span {
    font-size: 16px;
    margin-bottom: 1rem;
  }
}

@media (min-width: 1024px) {
  .main-content-transactions {
    .header {
      margin-left: 1rem;
      .header-row {
        display: flex;
        justify-content: space-between;
        .left {
          height: 43px;
          font-size: 16px;
          width: 45%;
          display: flex;
          .icon-menu {
            display: none;
          }
          .select-property-desk {
            display: inline;
            height: 43px;
            width: 375px;
            margin-right: 10px;
          }
          .cash-selection {
            border: 1px solid #d2ecf2;
            font-size: 16px;
            background-color: white;
            padding: 0 10px 0 20px;
            height: 43px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .icon-arrow-down {
              display: none;
            }
            .icon-arrow-up {
              display: none;
            }
            .icon-arrow-down-desk {
              display: inline;
              margin-left: 10px;
              margin-bottom: 1px;
              width: 11px;
              height: 7px;
            }
            .icon-arrow-up-desk {
              display: inline;
              margin-left: 10px;
              margin-bottom: 1px;
              transform: rotate(-180deg);
            }
            .options-cash-container {
              background-color: white;
              border-radius: 0 0 8px 8px;
              border-right: 1px solid #d2ecf2;
              border-left: 1px solid #d2ecf2;
              border-bottom: 1px solid #d2ecf2;
              box-shadow: none;
              position: absolute;
              top: 30px;
              left: -1px;
              font-size: 16px;
              padding: 0.5rem 0;
              width: 101%;
              .option-cash {
                padding: 0.3rem 0 0.3rem 20px;
                &:hover {
                  background-color: $primary;
                  color: white;
                }
              }
            }
            .hidden-options-cash-container {
              visibility: hidden;
            }
          }
          .cash-selection-pointer {
            cursor: pointer;
          }
        }
        .right {
          margin-left: 10px;
          width: 55%;
          display: flex;
          justify-content: flex-end;
          .icon-search,
          .select-property-mobile {
            display: none;
          }
          .cash-register-desk {
            height: 43px;
            display: flex;
            align-items: center;
            border: 1px solid #d2ecf2;
            padding: 0 7px;
            border-radius: 10px;
            background-color: white;
            .toogle-cash-register {
              display: flex;
              margin-top: 0;
              align-items: center;
              .switch {
                position: relative;
                display: inline-block;
                width: 46px;
                height: 30px;
              }

              .switch input {
                opacity: 0;
                width: 0;
                height: 0;
              }

              .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #e0e0e0;
                -webkit-transition: 0.4s;
                transition: 0.4s;
              }

              .slider:before {
                position: absolute;
                content: '';
                height: 24px;
                width: 24px;
                left: 4px;
                top: 3px;
                background-color: white;
                -webkit-transition: 0.4s;
                transition: 0.4s;
              }

              input:checked + .slider {
                background-color: $primary;
              }

              input:focus + .slider {
                box-shadow: 0 0 1px $primary;
              }

              input:checked + .slider:before {
                -webkit-transform: translateX(20px);
                -ms-transform: translateX(20px);
                transform: translateX(15px);
              }

              .slider.round {
                border-radius: 34px;
              }

              .slider.round:before {
                border-radius: 50%;
              }
            }
            .avatar-container {
              width: 25px;
              height: 25px;
              margin-left: 10px;
              .user-avatar {
                border-radius: 50%;
                width: 100%;
                height: 100%;
              }
            }
            .cash-state {
              margin-left: 10px;
              font-size: 14px;
            }

            .cash-text {
              font-size: 12px;
              margin-left: 0.5rem;
              color: #828282;
              flex-wrap: wrap;
              margin-right: 20px;
            }

            .cash-balance {
              display: flex;
              flex-direction: column;
              margin-right: 13px;
              text-align: right;
              text-wrap: nowrap;
              .balance {
                font-size: 16px;
                font-weight: bold;
                color: #263941;
                line-height: 100%;
              }
              .balance-feedback {
                color: #263941;
                font-size: 12px;
              }
            }
          }
        }
      }
      .header-row:nth-of-type(2),
      .header-row:nth-of-type(3) {
        display: none;
      }
    }
    .filters-container {
      display: flex;
      padding: 21px;
      margin: 0;
      margin-left: 1rem;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
      background-color: #f8f8f8;
      justify-content: space-between;
      z-index: 50;
      .filter-items {
        justify-content: start;
        .input-search-desk-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #d2ecf2;
          border-radius: 10px;
          height: 40px;
          margin-right: 10px;
          overflow: hidden;
          .icon-search-desk {
            width: 25px;
            height: 25px;
            margin-left: 5px;
          }
          .input-search-desk {
            margin-left: 5px;
            border: none;
            font-size: 14px;

            &:focus {
              outline: none;
            }
            &::placeholder {
              color: #263941;
            }
          }
        }
        .select-filters {
          width: 230px;
          font-size: 16px;
          margin-right: 0;
          .filter-top {
            justify-content: flex-start;
            .filter-img {
              margin-left: 5px;
            }
            span {
              font-size: 16px;
              margin: 0;
            }
            .dropdown-img {
              width: 11px;
              height: 7px;
              margin-top: 0.3rem;
              margin-left: auto;
              margin-right: 5px;
            }
          }
          .filter-options {
            position: absolute;
            top: 35px;
            left: -1px;
            width: 101%;
            z-index: 120;
            border-right: 1px solid #d2ecf2;
            border-left: 1px solid #d2ecf2;
            border-bottom: 1px solid #d2ecf2;
            background-color: white;
            border-radius: 0 0 10px 10px;
            display: flex;
            flex-direction: column;
            box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);

            .multiselect-container {
              max-height: 850px;
              overflow-y: scroll;
            }
            .clear-filters {
              border-top: 1px solid grey;
              color: $primary;
            }
          }
        }
        .date-range-container {
          font-size: 16px;
          margin-left: 10px;
          margin-right: 10px;
          height: 40px;
          width: 220px;
        }
      }
      .transaction-creation-buttons {
        display: flex;
        justify-content: flex-end;
        height: 40px;
        width: 90%;
        button {
          display: flex;
          align-items: center;
          border: none;
          cursor: pointer;
          background-color: $primary;
          color: white;
          border-radius: 10px;
          font-size: 14px;
          padding: 0 12px;
          font-weight: 600;
          span {
            margin-left: 5px;
          }
          .text-creation-button-small {
            display: block;
          }
          .text-creation-button-big {
            display: none;
          }
          &:last-child {
            margin-left: 10px;
          }
          img {
            width: 14px;
            height: 14px;
          }
        }
      }
    }
    .transactions-mobile {
      display: none;
    }
    .transactions-container {
      display: flex;
      margin-left: 1rem;
      .transactions-container-header {
        background-color: #f0fcff;
        display: grid;
        // grid-template-columns: 3fr 2fr 1fr 2fr 2fr 2fr;
        grid-template-columns: minmax(185px, 3fr) 2fr 1fr 2fr 2fr 2fr;

        border-radius: 10px 10px 0 0;
        align-items: center;
        row-gap: 0;
        column-gap: 20px;
        padding-right: 8px;
        .transactions-container-header-item {
          display: inline;
          font-size: 16px;
          font-weight: bold;
        }
        .transactions-container-header-item:nth-child(4),
        .transactions-container-header-item:nth-child(6) {
          display: none;
        }
        .transactions-container-header-item:nth-child(1) {
          margin-left: 10px;
        }

        .total-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-right: 12px;
          margin-bottom: 0;
          .total-text {
            font-size: 16px;
            font-weight: bold;
            color: black;
            margin-left: 0;
          }
          .total-amount {
            font-size: 16px;
            font-weight: normal;
            margin-right: 0;
          }
        }
      }
      .transactions {
        &::-webkit-scrollbar {
          display: block;
        }
        .transaction {
          width: 100%;
          display: grid;
          grid-template-areas: 'type code date reference journal amount';
          // grid-template-columns: 3fr 2fr 1fr 2fr 2fr 2fr;

          grid-template-columns: minmax(185px, 3fr) 2fr 1fr 2fr 2fr 2fr;
          // padding: 10px 0;
          // padding: 10px 0;
          row-gap: 0;
          column-gap: 20px;
          cursor: pointer;
          align-items: center;
          .transaction-type {
            grid-area: type;
            align-self: center;
            display: flex;
            align-items: center;
            img {
              width: 35px;
              height: 35px;
            }
            .transaction-partner-desktop {
              display: inline;
              font-weight: bold;
              color: #263941;
              font-size: 15px;
              margin-left: 12px;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            }
          }
          .transaction-partner {
            display: none;
          }
          .transaction-amount {
            grid-area: amount;
            justify-self: end;
            color: #263941;
            font-size: 15px;
            font-weight: 600;
            align-self: center;
            .transaction-amount-wrap {
              padding: 6px 12px;
              border-radius: 30px;
            }
          }
          .transaction-date {
            grid-area: date;
            color: #263941;
            font-size: 13px;
            align-self: center;
            font-size: 15px;
          }
          .transaction-journal {
            grid-area: journal;
            justify-self: start;
            color: #263941;
            font-size: 14px;
            text-overflow: initial;
            overflow: visible;
            white-space: wrap;
            align-self: center;
            text-align: left;
            width: fit-content;
          }
          .transaction-code {
            display: inline;
            grid-area: code;
            font-size: 15px;
            color: #263941;
          }
          .created-by {
            display: none;
            grid-area: created-by;
            font-size: 15px;
            color: #263941;
          }
          .transaction-reference {
            display: inline;
            grid-area: reference;
            font-size: 14px;
            color: #263941;
          }
          .transaction-type-name {
            display: none;
            grid-area: type-text;
            font-size: 15px;
            color: #263941;
          }
          &:hover {
            background-color: #f0fcff;
            border-bottom: 1px solid transparent;
            box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
              rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
          }
        }
      }
    }
  }
}

@media (min-width: 1240px) {
  .main-content-transactions {
    .header {
      padding: 18px 60px;
    }
    .filters-container {
      position: relative;
      z-index: 5;
      .transaction-creation-buttons {
        button {
          font-size: 15px;
          img {
            width: 22px;
            height: 22px;
          }
          .text-creation-button-small {
            display: none;
          }
          .text-creation-button-big {
            display: block;
          }
        }
      }
    }
    .transactions-container {
      .transactions-container-header {
        grid-template-columns: minmax(185px, 3fr) 2fr 1fr 2fr 2fr 2fr 2fr;
        .transactions-container-header-item:nth-child(4) {
          display: inline;
        }
        .transactions-container-header-item:nth-child(6) {
          display: none;
        }
      }
      .transactions {
        .transaction {
          grid-template-areas: 'type code date created-by reference journal amount';
          grid-template-columns: minmax(185px, 3fr) 2fr 1fr 2fr 2fr 2fr 2fr;
          .created-by {
            display: inline;
          }
          .transaction-type-name {
            display: none;
          }
        }
      }
    }
  }
}
@media (min-width: 1416px) {
  .main-content-transactions {
    .transactions-container {
      padding-top: 0.2rem;
      margin-left: 1rem;
      .transactions-container-header {
        grid-template-columns: minmax(185px, 3fr) 2fr 1fr 2fr 2fr 2fr 2fr 2fr;
        .transactions-container-header-item:nth-child(4) {
          display: inline;
        }
        .transactions-container-header-item:nth-child(6) {
          display: inline;
        }
      }
      .transactions {
        .transaction {
          grid-template-areas: 'type code date created-by reference type-text journal amount';
          grid-template-columns: minmax(185px, 3fr) 2fr 1fr 2fr 2fr 2fr 2fr 2fr;
          .created-by {
            display: inline;
          }
          .transaction-type-name {
            display: inline;
          }
        }
      }
    }
  }
}
.search-transition-enter-actfive {
  transition: transform 0.5s;
}

.search-transition-enter-from {
  transform: translateX(100%);
}
</style>
