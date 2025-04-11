<template>
  <div class="header-partner">
    <img src="/app-images/arrow-left-blue.svg" class="back-icon" @click="backToPartnersList" />
    <div class="avatar" :style="getBackgroundColor()">
      {{ getFirstLetters(currentPartner?.name || '') }}
    </div>
    <div class="partner-name">
      <span class="detail-title">Ficha de cliente</span>
      <div class="partner-contact">
        <span class="">{{ currentPartner?.name }}</span>
      </div>
      <div>
        <span class="partner-type-mobile" v-if="currentPartner?.isAgency">Agencia</span>
        <span class="partner-type-mobile" v-else-if="currentPartner?.isCompany">Empresa</span>
        <span class="partner-type-mobile" v-else>Particular</span>
      </div>
    </div>
    <span class="partner-type" v-if="currentPartner?.isAgency">Agencia</span>
    <span class="partner-type" v-else-if="currentPartner?.isCompany">Empresa</span>
    <span class="partner-type" v-else>Particular</span>
  </div>
  <div class="partner-main-container">
    <!-- personal data -->
    <div class="partner-detail">
      <div class="detail-header">
        <img src="/app-images/diary.svg" class="header-icon" />
        <span class="detail-header-title">Datos del cliente</span>
      </div>
      <div class="partner-data-content">
        <span class="partner-field"> Nombre completo </span>
        <span class="partner-data">
          {{ currentPartner?.name }}
        </span>
      </div>
      <hr />
      <div class="partner-data-content">
        <span class="partner-field"> Email </span>
        <span class="partner-data">
          {{ currentPartner?.email }}
        </span>
      </div>
      <hr />
      <div class="partner-data-content">
        <span class="partner-field">Teléfono</span>
        <span class="partner-data" v-if="currentPartner?.mobile">
          {{ currentPartner.mobile }}
        </span>
        <span class="partner-data" v-else>
          {{ currentPartner?.phone }}
        </span>
      </div>
      <hr />
      <div class="partner-data-content">
        <span class="partner-field"> Tipo de documento </span>
        <span class="partner-data">
          {{ getDocumentType() }}
        </span>
      </div>
      <hr />
      <div class="partner-data-content">
        <span class="partner-field"> Número de documento </span>
        <span class="partner-data">
          {{ currentPartner?.vatNumber }}
        </span>
      </div>
      <hr />
      <div class="partner-data-content">
        <span class="partner-field"> País </span>
        <span class="partner-data">
          <img
            :src="`/country-flags/${countryCode(currentPartner?.nationality)}.svg`"
            class="flag"
            v-if="currentPartner?.nationality && countryCode(currentPartner?.nationality)"
          />
          {{ countryName(currentPartner?.nationality || 0) }}
        </span>
      </div>
      <hr />
      <div class="partner-data-content">
        <span class="partner-field"> Dirección </span>
        <span class="partner-data" v-if="!currentPartner?.isAgency && !currentPartner?.isCompany">
          {{ getPartnerAddress() }}
        </span>
        <span class="partner-data" v-else>
          {{ agencyAddress() }}
        </span>
      </div>
      <div class="btns">
        <button class="btn-open" @click="openPartnerForm()">Abrir ficha cliente</button>
        <button class="btn-edit" @click="openPartnerForm()">Editar</button>
      </div>
    </div>
    <!-- Invoicing data -->
    <div class="partner-detail">
      <div class="detail-header">
        <img src="/app-images/icon_send_money.svg" class="header-icon" />
        <span class="detail-header-title">Datos de facturación</span>
      </div>
      <div class="partner-data-content" v-if="sameAddressData">
        <span>Los datos de contacto y facturación son los mismos</span>
        <input type="checkbox" checked="true" class="checkbox" />
      </div>
      <div v-else>
        <div class="partner-data-content">
          <span class="partner-field"> País </span>
          <span class="partner-data">
            <img
              :src="`/country-flags/${countryCode(currentPartner?.residenceCountryId)}.svg`"
              class="flag"
              v-if="
                currentPartner?.residenceCountryId &&
                countryCode(currentPartner?.residenceCountryId)
              "
            />
            {{ countryName(currentPartner?.residenceCountryId || 0) }}
          </span>
        </div>
        <hr />
        <div class="partner-data-content">
          <span class="partner-field">Dirección</span>
          <span class="partner-data">{{ agencyAddress() }}</span>
        </div>
      </div>
    </div>
    <!-- Partner invoices -->
    <div class="partner-detail">
      <div class="detail-header">
        <img src="/app-images/icon-folded-page.svg" class="header-icon" />
        <span class="detail-header-title">Facturas</span>
      </div>
      <div class="no-invoices" v-if="partnerInvoices.length === 0">
        No hay facturas para este cliente
      </div>
      <div v-for="(invoice, index) in partnerInvoices" :key="invoice.id || 0">
        <div
          class="invoice"
          @click="openInvoiceDialog(index, invoice.folioId || 0)"
          v-if="index <= 2 || (showAllInvoices && index > 2)"
        >
          <div class="invoice-name">
            {{ invoice.name?.replace(/\/([^/]+)$/, ' /$1') }}
            <a :href="invoice.portalUrl" target="_blank" @click.stop>
              <img src="/app-images/icon-pdf.svg" class="header-icon" />
            </a>
          </div>
          <div class="invoice-date">{{ invoice.date }}</div>
          <div class="invoice-state">
            <span>
              {{ getInvoiceState(invoice.state || '', invoice.paymentState || '') }}
            </span>
          </div>
          <div class="invoice-amount">{{ invoice.amount }}€</div>
        </div>
        <hr v-if="index <= 1 || (showAllInvoices && index > 1)" />
      </div>
      <div
        v-if="partnerInvoices.length > 3"
        class="show-more"
        :class="showAllInvoices ? 'show-more-displayed' : ''"
      >
        <img
          src="/app-images/arrow_forward_ios.svg"
          :class="showAllInvoices ? 'rotate-dropdown' : ''"
          @click="showAllInvoices = !showAllInvoices"
        />
        <span class="span-hover" @click="showAllInvoices = !showAllInvoices">
          <span v-if="showAllInvoices"> Ver {{ partnerInvoices.length - 3 }} menos </span>
          <span v-if="!showAllInvoices"> Ver {{ partnerInvoices.length - 3 }} más </span>
        </span>
      </div>
    </div>

    <!-- Partner transactions -->
    <div class="partner-detail">
      <div class="detail-header">
        <img src="/app-images/icon-folded-page.svg" class="header-icon" />
        <span class="detail-header-title">Pagos</span>
      </div>
      <div class="no-invoices" v-if="partnerTransactions.length === 0">
        No hay pagos para este cliente
      </div>
      <div v-for="(transaction, index) in partnerTransactions" :key="transaction.id || 0">
        <div
          class="invoice"
          v-if="index <= 2 || (showAllTransactions && index > 2)"
          @click="openTransactionDialog(transaction)"
        >
          <div class="invoice-name">
            {{ transaction.name?.replace(/\/([^/]+)$/, ' /$1') }}
          </div>
          <div class="invoice-date">{{ formatTransactionDate(transaction.date) }}</div>
          <div class="invoice-state">
            <span>
              {{ getTransactionType(transaction.transactionType || '') }}
            </span>
          </div>
          <div class="invoice-amount">{{ transaction.amount }}€</div>
        </div>
        <hr v-if="index <= 1 || (showAllTransactions && index > 1)" />
      </div>
      <div
        v-if="partnerTransactions.length > 3"
        class="show-more"
        :class="showAllTransactions ? 'show-more-displayed' : ''"
      >
        <img
          src="/app-images/arrow_forward_ios.svg"
          :class="showAllTransactions ? 'rotate-dropdown' : ''"
          @click="showAllTransactions = !showAllTransactions"
        />
        <span class="span-hover" @click="showAllTransactions = !showAllTransactions">
          <span v-if="showAllTransactions"> Ver {{ partnerTransactions.length - 3 }} menos </span>
          <span v-if="!showAllTransactions"> Ver {{ partnerTransactions.length - 3 }} más </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, watch, markRaw } from 'vue';
import PartnerForm from '@/components/partners/PartnerForm.vue';
import InvoiceChanges from '@/components/invoices/InvoiceChanges.vue';
import TransactionComponent from '@/components/transactions/TransactionComponent.vue';
import { useStore } from '@/store';
import { dialogService } from '@/services/DialogService';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';

export default defineComponent({
  setup() {
    const store = useStore();
    const sameAddressData = ref(true);
    const openPartnerDialog = ref(false);
    const showAllInvoices = ref(false);
    const showAllTransactions = ref(false);
    const showInvoiceDialog = ref([] as boolean[]);
    const showTransactionDialog = ref([] as boolean[]);

    const currentPartner = computed(() => store.state.partners.currentPartner);
    const countries = computed(() => store.state.countries.countries);
    const states = computed(() => store.state.countryStates.countryStates);
    const partnerTransactions = computed(() => store.state.partners.currentPartnerTransactions);
    const partnerInvoices = computed(() => store.state.partners.currentPartnerInvoices);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const invoiceSaleLines = computed(() => store.state.folios.saleLines);

    const reservationsAsHost = computed(
      () => store.state.reservations.reservationsForPartnerAsHost
    );

    const reservationsAsCustomer = computed(
      () => store.state.reservations.reservationsForPartnerAsCustomer
    );

    const openPartnerForm = (isNew?: boolean) => {
      dialogService.open({
        header: isNew ? 'Nuevo cliente' : 'Editar cliente',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const countryName = (countryId: number) =>
      countries.value.find((el) => el.id === countryId)?.name;

    const stateName = (stateId: number) => {
      const name = states.value?.find((el) => el.id === stateId)?.name;
      return name || '';
    };

    const backToPartnersList = () => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
      void store.dispatch('partners/setCurrentPartner', null);
    };

    const getPartnerAddress = () => {
      let address = '';
      if (currentPartner.value?.residenceStreet) {
        address += currentPartner.value.residenceStreet
          ? `${currentPartner.value.residenceStreet}, `
          : '';
        address += currentPartner.value.residenceStreet2
          ? `${currentPartner.value.residenceStreet2}, `
          : '';
        address += currentPartner.value.residenceZip
          ? `${currentPartner.value.residenceZip}, `
          : '';
        address += currentPartner.value.residenceCity
          ? `${currentPartner.value.residenceCity}, `
          : '';
        address += currentPartner.value.residenceStateId
          ? `${stateName(currentPartner.value.residenceStateId)}`
          : '';
      }
      return address;
    };

    const getDocumentType = () => {
      let documentType = '';
      if (currentPartner.value?.vatDocumentType === '02' && currentPartner.value?.nationality) {
        if (!currentPartner.value?.isAgency && !currentPartner.value?.isCompany) {
          const nameCountry = countries.value.find(
            (el) => el.id === currentPartner.value?.nationality
          )?.name;
          if (nameCountry === 'Spain' || nameCountry === 'España') {
            documentType = 'NIF / Documento Identidad';
          } else {
            documentType = 'Documento Nacional Oficial';
          }
        }
      } else if (currentPartner.value?.vatDocumentType === '03') {
        documentType = 'Pasaporte';
      } else if (currentPartner.value?.vatDocumentType === '05') {
        documentType = 'Certificado de Residencia';
      } else if (currentPartner.value?.vatDocumentType === '06') {
        documentType = 'Otro Documento';
      } else if (
        currentPartner.value?.vatNumber &&
        (currentPartner.value?.isAgency || currentPartner.value?.isCompany)
      ) {
        documentType = 'CIF';
      }
      return documentType;
    };

    const agencyAddress = () => {
      let address = '';
      if (currentPartner.value?.street) {
        address += currentPartner.value.street ? `${currentPartner.value.street}, ` : '';
        address += currentPartner.value.street2 ? `${currentPartner.value.street2}, ` : '';
        address += currentPartner.value.zip ? `${currentPartner.value.zip}, ` : '';
        address += currentPartner.value.city ? `${currentPartner.value.city}, ` : '';
        address += currentPartner.value.stateId ? `${stateName(currentPartner.value.stateId)}` : '';
      }
      return address;
    };

    const getReservations = (isAgency: boolean) => {
      if (isAgency) {
        return reservationsAsCustomer;
      }
      return reservationsAsHost;
    };

    const getBackgroundColor = () => {
      let color = '#1E9ED9';
      if (currentPartner.value?.isAgency) {
        color = '#475D66';
      } else if (currentPartner.value?.isCompany) {
        color = '#FFB900';
      }
      return `background-color: ${color};`;
    };

    const backgroundColorTransaction = (paymentState: string) => {
      let color = 'bg-';
      if (paymentState === 'not_paid') {
        color += 'red';
      } else if (paymentState === 'paid') {
        color += 'green';
      } else {
        color += 'orange';
      }
      return color;
    };

    const backgroundColorReservation = (state: string, paymentState: string) => {
      let style = 'background-color: ';
      if (activeProperty.value?.colorOptionConfig === 'advanced') {
        if (state === 'confirm' || state === 'arrival_delayed') {
          style += activeProperty.value.confirmedReservationColor;
        }
        if (state === 'draft') {
          style += activeProperty.value?.preReservationColor;
        }
        if (state === 'onboard' || state === 'departure_delayed') {
          if (paymentState === 'paid') {
            style += activeProperty.value.paidCheckinReservationColor;
          } else {
            style += activeProperty.value.onBoardReservationColor;
          }
        }
        if (state === 'done') {
          if (paymentState === 'paid') {
            style += activeProperty.value.paidReservationColor;
          } else {
            style += activeProperty.value.outReservationColor;
          }
        }
      } else {
        if (state === 'cancel' || state === 'done') {
          style += activeProperty.value?.simpleOutColor;
        }
        if (state === 'onboard' || state === 'departure_delayed') {
          style += activeProperty.value?.simpleInColor;
        }
        if (state === 'confirm' || state === 'arrival_delayed' || state === 'draft') {
          style += activeProperty.value?.simpleFutureColor;
        }
      }
      return style;
    };

    const getFirstLetters = (name: string) => {
      const firstLetters = name.split(' ').map((word) => word[0]);
      return firstLetters.join('').substring(0, 2).toUpperCase();
    };

    const getState = (state: string) => {
      if (state === 'done') {
        return 'Finalizada';
      }
      if (state === 'confirm') {
        return 'Confirmada';
      }
      if (state === 'onboard' || state === 'departure_delayed' || state === 'arrival_delayed') {
        return 'Alojada';
      }
      if (state === 'draft') {
        return 'Borrador';
      }
      return '';
    };

    const getInvoiceState = (invoiceState: string, invoicePaymentState: string) => {
      if (invoiceState === 'draft') {
        return 'Borrador';
      }
      if (invoiceState === 'cancel') {
        return 'Cancelada';
      }
      if (invoiceState === 'posted') {
        if (invoicePaymentState === 'not_paid') {
          return 'No cobrada';
        }
        if (invoicePaymentState === 'paid') {
          return 'Pagada';
        }
        if (invoicePaymentState === 'partial') {
          return 'Parcial';
        }
      }
      return '';
    };

    const getTransactionType = (transactionType: string) => {
      let type = '';
      if (transactionType === 'internal_transfer') {
        type = 'Transferencia Interna';
      } else if (transactionType === 'customer_inbound') {
        type = 'Cobro de Cliente';
      } else if (transactionType === 'customer_outbound') {
        type = 'Devolución a Cliente';
      } else if (transactionType === 'supplier_outbound') {
        type = 'Pago a Proveedor';
      } else if (transactionType === 'supplier_inbound') {
        type = 'Devolución de Proveedor';
      }
      return type;
    };

    const formatTransactionDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;
    };

    const countryCode = (countryId: number | undefined) =>
      store.state.countries.countries.find((el) => el.id === countryId)?.code.toLowerCase();

    const openInvoiceDialog = async (index: number, folioId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (folioId) {
          await store.dispatch('folios/fetchFolioInvoices', folioId);
          await store.dispatch('folios/fetchFolioSaleLines', folioId);
        }
        showInvoiceDialog.value[index] = true;

        dialogService.open({
          header: 'Modificar factura',
          content: markRaw(InvoiceChanges),
          closable: true,
          props: {
            isRenderSaleLines: false,
            isRenderInvoiceLines: true,
            invoiceId: partnerInvoices.value[index].id || 0,
            idPartner: currentPartner.value?.id,
          },
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
    };

    const openTransactionDialog = (transaction: TransactionInterface) => {
      dialogService.open({
        header: 'DATOS DEL COBRO A CLIENTE',
        content: markRaw(TransactionComponent),
        closable: true,
        props: {
          transaction,
          isRefund: transaction.transactionType === 'customer_outbound' ? true : false,
        },
      });
    };

    watch(currentPartner, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (currentPartner.value) {
          await Promise.all([
            store.dispatch(
              'reservations/fetchReservationsForPartnerAsHost',
              currentPartner.value?.id
            ),
            store.dispatch(
              'reservations/fetchReservationsForPartnerAsCustomer',
              currentPartner.value?.id
            ),
            store.dispatch('partners/fetchCurrentPartnerTransactions', currentPartner.value?.id),
            store.dispatch('partners/fetchCurrentPartnerInvoices', currentPartner.value?.id),
          ]);
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
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('countryStates/fetchCountryStates', currentPartner.value?.countryId),
          store.dispatch(
            'reservations/fetchReservationsForPartnerAsHost',
            currentPartner.value?.id
          ),
          store.dispatch(
            'reservations/fetchReservationsForPartnerAsCustomer',
            currentPartner.value?.id
          ),
          store.dispatch('partners/fetchCurrentPartnerTransactions', currentPartner.value?.id),
          store.dispatch('partners/fetchCurrentPartnerInvoices', currentPartner.value?.id),
          store.dispatch('accountJournals/fetchAccountJournals', {
            pmsPropertyId: activeProperty.value?.id,
          }),
        ]);
        if (
          currentPartner.value?.street !== currentPartner.value?.residenceStreet ||
          currentPartner.value?.zip !== currentPartner.value?.residenceZip ||
          currentPartner.value?.city !== currentPartner.value?.residenceCity ||
          currentPartner.value?.stateId !== currentPartner.value?.residenceStateId ||
          currentPartner.value?.countryId !== currentPartner.value?.residenceCountryId
        ) {
          sameAddressData.value = false;
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
      showInvoiceDialog.value = partnerInvoices.value.map(() => false);
      showTransactionDialog.value = partnerTransactions.value.map(() => false);
    });

    return {
      activeProperty,
      showAllInvoices,
      showAllTransactions,
      sameAddressData,
      openPartnerDialog,
      currentPartner,
      reservationsAsCustomer,
      reservationsAsHost,
      partnerTransactions,
      partnerInvoices,
      invoiceSaleLines,
      showInvoiceDialog,
      showTransactionDialog,
      openTransactionDialog,
      openPartnerForm,
      getReservations,
      getState,
      countryName,
      stateName,
      getInvoiceState,
      formatTransactionDate,
      getTransactionType,
      backgroundColorReservation,
      getPartnerAddress,
      getDocumentType,
      agencyAddress,
      backToPartnersList,
      getBackgroundColor,
      backgroundColorTransaction,
      countryCode,
      openInvoiceDialog,
      getFirstLetters,
    };
  },
});
</script>
<style scoped lang="scss">
.header-partner {
  font-size: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 1rem 0;
  .back-icon {
    width: 15px;
    height: 15px;
    margin-left: 12px;
  }
  .avatar {
    width: 37px;
    height: 37px;
    border-radius: 50%;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    margin-left: 1rem;
  }
  .partner-type {
    display: none;
  }
}
.partner-name {
  margin-left: 1rem;
  font-size: 16px;
  font-weight: bold;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 70%;
  .detail-title {
    display: none;
  }
  .partner-contact {
    margin-bottom: 0;
  }
  .partner-type-mobile {
    font-weight: normal;
    font-size: 14px;
    margin-bottom: 4px;
  }
}
.detail {
  font-size: 10px;
  color: $primary;
  font-weight: bold;
}

hr {
  border: none;
  height: 1px;
  background-color: #e1e0e0;
  width: 95%;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 5%;
}
#cabecera {
  margin-left: 1.1rem;
  margin-right: 1.1rem;
}

.partner-main-container {
  overflow-y: scroll;
  padding-bottom: 1rem;
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  .partner-detail {
    font-size: 12px;
    margin: 20px 10px 0 10px;
    border-radius: 10px;
    box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.49);
    padding-bottom: 20px;
    .detail-header {
      background-color: #f0fcff;
      height: 35px;
      border-radius: 10px 10px 0px 0px;
      display: flex;
      align-items: center;
      font-size: 14px;
      margin-bottom: 11px;
      .header-icon {
        margin: 0 8px 0 15px;
      }
      .detail-header-title {
        font-weight: bold;
      }
    }
    .partner-data-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 20px;
      font-size: 14px;
      flex-wrap: nowrap;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      .partner-field {
        color: #263941;
        margin-right: 1rem;
      }
      .partner-data {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-weight: bold;
        display: flex;
        align-items: center;
        .flag {
          width: 15px;
          height: 15px;
          margin-right: 5px;
          border-radius: 50%;
        }
      }
      .checkbox {
        height: 15px;
        min-width: 15px;
        appearance: none;
        border-radius: 4px;
        outline: none;
        background-color: #e2e2e2;
        accent-color: white;
        pointer-events: none;
      }
      .checkbox:checked {
        background-color: $primary;
        background-image: url('/app-images/check-mark.svg');
        background-position: center center;
        background-size: 80%;
        background-repeat: no-repeat;
      }
    }
    .reservation {
      color: white;
      height: 30px;
      border-radius: 16px;
      font-size: 11px;
    }
    .transaction-cell {
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
    }
    .btns {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 30px 20px 0 20px;
      .btn-open {
        background-color: #f0f0f0;
        border-radius: 5px;
        border: none;
        padding: 5px 20px;
        font-size: 14px;
        cursor: pointer;
      }
      .btn-edit {
        background-color: $primary;
        border-radius: 5px;
        border: none;
        padding: 5px 20px;
        font-size: 14px;
        font-weight: bold;
        color: white;
        cursor: pointer;
      }
    }
    .invoice {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      align-items: center;

      .invoice-name {
        margin-left: 20px;
        font-weight: bold;
        display: flex;
        align-items: center;
        flex: 2;
        a {
          img {
            margin-left: 3px;
          }
        }
      }

      .invoice-date {
        flex: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .invoice-state {
        flex: 2;
        display: flex;
        align-items: center;
        span {
          margin-left: 1rem;
        }
      }

      .invoice-amount {
        flex: 1;
        margin-right: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .no-invoices {
      font-size: 14px;
      margin-left: 20px;
    }
    .show-more {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 0.5rem;
      border-top: 1px dashed #e2e2e2;
      margin: 0.5rem 8px 0 8px;
      img {
        cursor: pointer;
        width: 14px;
        height: 14px;
        margin-top: 12px;
      }
      .span-hover {
        margin-left: 0.5rem;
        font-size: 14px;
        cursor: pointer;
        margin-top: 10px;
      }
      .rotate-dropdown {
        transform: rotate(180deg);
      }
    }
    .show-more-displayed {
      border-top: none;
    }
  }
}

@media (min-width: 1024px) {
  .header-partner {
    background-color: #f0fcff;
    box-shadow: none;
    .back-icon {
      display: none;
    }
    .detail-title {
      display: block;
      color: #34464d;
      font-size: 14px;
    }
    .avatar {
      margin-left: 32px;
      width: 40px;
      height: 40px;
      font-size: 24px;
    }
    .partner-name {
      font-size: 22px;
      .partner-type-mobile {
        display: none;
      }
    }
    .partner-type {
      display: inline;
      align-self: flex-start;
      color: #34464d;
      font-size: 14px;
    }
  }
  .partner-main-container {
    .partner-detail {
      margin: 30px;
      .detail-header {
        font-size: 16px;
        height: 38px;
        margin-bottom: 20px;
        .header-icon {
          width: 22px;
          height: 22px;
          margin-left: 25px;
        }
      }
      .partner-data-content {
        font-size: 14px;
        margin: 0 40px;
      }
      hr {
        width: 92% !important;
      }
      .invoice {
        font-size: 14px;
        cursor: pointer;
        &:hover {
          background-color: #f0f0f0;
        }
        .invoice-name {
          margin-left: 30px;
          font-weight: bold;
          display: flex;
          align-items: center;
          flex: 2;
          a {
            img {
              margin-left: 10px;
              margin-top: 5px;
              &:hover {
                background-color: $primary;
              }
            }
          }
        }
      }
      .no-invoices {
        font-size: 14px;
        margin-left: 40px;
      }
      .show-more {
        font-size: 14px;
        margin-left: 25px;
        margin-right: 25px;
      }
      .title-dialog {
        color: black;
        font-size: 20px;
        margin-left: 1rem;
      }
      .btns {
        margin: 30px 25px 0 25px;
      }
    }
  }
}
</style>
