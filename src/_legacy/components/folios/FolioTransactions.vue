<template>
  <div
    class="pending-amount-card"
    v-for="saleLine in saleLinesToPay"
    :key="saleLine.defaultInvoiceTo ?? 0"
  >
    <div class="pending-amount-section" :class="{ 'has-charges': saleLine.pendingToPay > 0 }">
      <div class="pending-title">Pdte. de cobrar a {{ saleLine.partnerName }}:</div>
      <div class="pending-amount">
        {{ saleLine.pendingToPay ? saleLine.pendingToPay.toFixed(2) : '0' }} €
      </div>
    </div>
    <div class="charge-section" v-if="saleLine.pendingToPay > 0">
      <div class="date-limit">
        Fecha Límite:
        <span class="text-bold">{{ getDateLimit() }}</span>
      </div>
      <div class="charge-btns">
        <button class="link-btn" @click="openPaymentLinkModal()">Generar link</button>
        <button
          class="charge-btn"
          @click="openChargesModal(saleLine.defaultInvoiceTo ?? 0, saleLine.pendingToPay)"
        >
          Registrar cobro
        </button>
      </div>
    </div>
  </div>
  <template v-if="transactions.length > 0">
    <div
      v-for="partnerTransaction in transactionsToRender"
      :key="partnerTransaction.partnerId"
      class="recorded-charges-card"
    >
      <div class="recorded-transactions-title">
        <span class="title">
          Transacciones realizadas a
          {{ partnerTransaction.partnerName ? partnerTransaction.partnerName : `huésped` }}
        </span>
      </div>
      <div class="recorded-charges-title">
        <span class="title"> Cobros registrados </span>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Modo de pago</th>
            <th scope="col">Importe</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="charge in partnerTransaction.partnerCharges"
            :key="charge.id"
            @click="openCustomerModal(charge, false)"
          >
            <td data-label="Fecha">
              {{
                new Date(charge.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }}
            </td>
            <td data-label="Modo de pago">
              {{ getTransactionMethodName(charge.journalId) }}
            </td>
            <td data-label="Importe">{{ charge.amount.toFixed(2) }} €</td>
            <td data-label="">
              <AppButton
                class="btn-print-down-payment-invoice btn"
                size="small"
                v-if="charge.downPaymentInvoiceId !== 0"
                :href="printDownPaymentInvoice(charge?.downPaymentInvoiceId ?? 0)"
                target="_blank"
                @click.stop
                as="a"
              >
                <span class="hovertext" data-hover="Imprimir Factura"> Factura </span>
              </AppButton>
              <AppButton
                class="btn-create-down-payment-invoice btn"
                size="small"
                v-if="
                  showCreateDownPaymentInvoiceBtn(charge.date) && charge.downPaymentInvoiceId === 0
                "
                @click.stop="openDownPaymentDialog(charge)"
              >
                <span class="hovertext" data-hover="Crear factura de anticipo">
                  Fra. anticipo
                </span>
              </AppButton>
            </td>
          </tr>
        </tbody>
      </table>
      <hr class="separator" />
      <div class="total-amount-row">
        <span class="total-amount"> {{ partnerTransaction.chargesAmountTotal.toFixed(2) }} € </span>
        TOTAL cobrado:
      </div>
      <div class="recorded-charges-title" v-if="partnerTransaction.partnerRefunds.length > 0">
        <span class="title"> Devoluciones registradas </span>
      </div>
      <table v-if="partnerTransaction.partnerRefunds.length > 0">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Modo de pago</th>
            <th scope="col">Importe</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="refund in partnerTransaction.partnerRefunds"
            :key="refund.id"
            @click="openCustomerModal(refund, true)"
          >
            <td data-label="Fecha">
              {{
                new Date(refund.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }}
            </td>
            <td data-label="Modo de pago">
              {{ getTransactionMethodName(refund.journalId) }}
            </td>
            <td data-label="Importe">{{ refund.amount.toFixed(2) }} €</td>
            <td data-label="">
              <AppButton
                class="btn-print-down-payment-invoice btn"
                size="small"
                v-if="refund.downPaymentInvoiceId !== 0"
                :href="printDownPaymentInvoice(refund?.downPaymentInvoiceId ?? 0)"
                target="_blank"
                @click.stop
              >
                <span class="hovertext"> Factura </span>
              </AppButton>
              <AppButton
                class="btn-create-down-payment-invoice btn"
                size="small"
                v-if="
                  showCreateDownPaymentInvoiceBtn(refund.date) && refund.downPaymentInvoiceId === 0
                "
                @click.stop="openDownPaymentDialog(refund)"
              >
                <span class="hovertext"> Fra. anticipo </span>
              </AppButton>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="recorded-refunds-card">
        <div class="recorded-charges-title">
          <span class="title"> Devoluciones </span>
        </div>
        <div class="no-charges-row">No hay ninguna devolución registrada para este huésped</div>
      </div>
      <div class="total-amount-row">
        <span class="total-amount"> {{ partnerTransaction.refundsAmountTotal.toFixed(2) }} € </span>
        TOTAL devuelto:
      </div>
      <div class="repay-container">
        <button class="repay-btn" @click="openRefundModal(partnerTransaction.partnerId)">
          + Devolver
        </button>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="recorded-charges-card">
      <div class="recorded-transactions-title">
        <span class="title"> Transacciones </span>
      </div>
      <div class="no-charges-row">No hay ninguna transacción registrada para esta reserva</div>
    </div>
  </template>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, type Ref, watch, markRaw } from 'vue';
import Button from 'primevue/button';

import { type PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';
import { type TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';
import type { PartnerSaleLines } from '@/_legacy/interfaces/PartnerSaleLines';
import type { PartnerTransactions } from '@/_legacy/interfaces/PartnerTransaction';

import TransactionCharges from '@/_legacy/components/transactions/TransactionCharges.vue';
import DownPaymentInvoiceChanges from '@/_legacy/components/transactions/DownPaymentInvoiceChanges.vue';
import TransactionComponent from '@/_legacy/components/transactions/TransactionComponent.vue';
import FolioDirectPaymentLink from '@/_legacy/components/folios/FolioDirectPaymentLink.vue';
import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    AppButton: Button,
  },
  setup() {
    const store = useStore();

    const isRefund = ref(false);
    const isEdit = ref(false);
    const downPaymentInvoiceDialog = ref(false);
    const customerTransaction = ref(false);
    const currentTransaction: Ref<TransactionInterface | null> = ref(null);
    const transactionId = ref(0);
    const partnerId = ref(0);
    const chargeAmount = ref(0);
    const saleLinesToPay = ref([] as PartnerSaleLines[]);
    const transactionsToRender = ref([] as PartnerTransactions[]);
    const chargesModal = ref(false);

    const folio = computed(() => store.state.folios.currentFolio);
    const invoices = computed(() => store.state.folios.invoices);
    const pendingAmount = computed(() => folio.value?.pendingAmount);

    const transactions = computed(() => {
      const charges = [] as TransactionInterface[];
      store.state.folios.transactions.forEach((el) => {
        if (el.transactionType === 'customer_inbound') {
          charges.push(el);
        }
      });
      return charges;
    });
    const refunds = computed(() => {
      const charges = [] as TransactionInterface[];
      store.state.folios.transactions.forEach((el) => {
        if (el.transactionType === 'customer_outbound') {
          charges.push(el);
        }
      });
      return charges;
    });

    const getTotalChargeAmount = () => {
      let amount = 0;
      transactions.value.forEach((el) => {
        amount += el.amount;
      });
      return amount;
    };

    const getTotalRefundAmount = () => {
      let amount = 0;
      refunds.value.forEach((el) => {
        amount += el.amount;
      });
      return amount;
    };

    const getDateLimit = () => {
      let result = '';
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      let lastCheckout = '';
      if (folio.value && folio.value.lastCheckout) {
        lastCheckout = folio.value?.lastCheckout;
      }
      const dateLimit = new Date(lastCheckout);
      if (
        dateLimit.getDate() === today.getDate() &&
        dateLimit.getUTCMonth() === today.getUTCMonth() &&
        dateLimit.getUTCFullYear() === today.getUTCFullYear()
      ) {
        result = 'Hoy';
      } else if (
        dateLimit.getDate() === tomorrow.getDate() &&
        dateLimit.getUTCMonth() === tomorrow.getUTCMonth() &&
        dateLimit.getUTCFullYear() === tomorrow.getUTCFullYear()
      ) {
        result = 'Mañana';
      } else if (
        dateLimit.getDate() === yesterday.getDate() &&
        dateLimit.getUTCMonth() === yesterday.getUTCMonth() &&
        dateLimit.getUTCFullYear() === yesterday.getUTCFullYear()
      ) {
        result = 'Ayer';
      } else {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        };
        result = dateLimit.toLocaleDateString('es-ES', options);
      }
      return result;
    };

    const getTransactionMethodName = (transactionMethodId: number) => {
      let transactionMethodName = '';
      const indexTransactionMethod = store.state.accountJournals.accountJournals.findIndex(
        (el) => el.id === transactionMethodId
      );
      if (indexTransactionMethod !== -1) {
        transactionMethodName =
          store.state.accountJournals.accountJournals[indexTransactionMethod].name;
      }
      return transactionMethodName;
    };

    const openChargesModal = (idPartner: number, amountToPay: number) => {
      isRefund.value = false;
      isEdit.value = false;
      partnerId.value = idPartner;
      chargeAmount.value = amountToPay;
      chargesModal.value = true;

      dialogService.open({
        header: !isRefund.value ? 'COBRAR' : 'DEVOLVER',
        content: markRaw(TransactionCharges),
        props: {
          isRefund: isRefund.value,
          isEdit: isEdit.value,
          partnerId: partnerId.value,
          chargeAmount: chargeAmount.value,
          transactionId: transactionId.value,
          folioId: folio.value?.id,
        },
      });
    };

    const openRefundModal = (idPartner: number) => {
      partnerId.value = idPartner;
      isRefund.value = true;
      isEdit.value = false;
      chargesModal.value = true;

      dialogService.open({
        header: !isRefund.value ? 'COBRAR' : 'DEVOLVER',
        content: markRaw(TransactionCharges),
        props: {
          isRefund: isRefund.value,
          isEdit: isEdit.value,
          partnerId: partnerId.value,
          chargeAmount: chargeAmount.value,
          transactionId: transactionId.value,
        },
      });
    };

    const openCustomerModal = (transaction: TransactionInterface, openRefund: boolean) => {
      isRefund.value = openRefund;
      currentTransaction.value = transaction;
      customerTransaction.value = true;
      dialogService.open({
        header: !isRefund.value ? 'Datos del cobro a cliente' : 'Datos de devolución a cliente',
        content: markRaw(TransactionComponent),
        props: {
          isRefund: isRefund.value,
          transaction: currentTransaction.value,
          folioId: folio.value?.id,
        },
      });
    };

    const closeTransactionDialog = async () => {
      customerTransaction.value = false;
      void store.dispatch('layout/showSpinner', true);
      await Promise.all([
        store.dispatch('folios/fetchFolioTransactions', folio.value?.id),
        store.dispatch('folios/fetchFolio', folio.value?.id),
        store.dispatch('folios/fetchFolioInvoices', folio.value?.id),
      ]);
      void store.dispatch('layout/showSpinner', false);
    };

    const openDownPaymentDialog = (transaction: TransactionInterface) => {
      currentTransaction.value = transaction;
      downPaymentInvoiceDialog.value = true;
      dialogService.open({
        header: 'Crear factura de anticipo',
        content: markRaw(DownPaymentInvoiceChanges),
        props: {
          transaction: currentTransaction.value,
        },
      });
    };

    const openPaymentLinkModal = () => {
      dialogService.open({
        header: 'Generar link de cobro',
        content: markRaw(FolioDirectPaymentLink),
        props: {
          pendingAmount: pendingAmount.value,
        },
      });
    };

    const printDownPaymentInvoice = (invoiceId: number) => {
      let url = '';
      const downPaymentInvoice = invoices.value.find((el) => el.id === invoiceId);
      if (downPaymentInvoice) {
        url = downPaymentInvoice.portalUrl;
      }
      return url;
    };

    const showCreateDownPaymentInvoiceBtn = (transactionDate: string) => {
      let showBtn = false;
      if (folio.value?.lastCheckout) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastCheckout = new Date(folio.value.lastCheckout);
        lastCheckout.setHours(0, 0, 0, 0);
        const chargeDate = new Date(transactionDate);
        if (
          folio.value?.invoiceStatus === 'to_invoice' &&
          chargeDate.getTime() < lastCheckout.getTime() &&
          lastCheckout.getTime() > today.getTime()
        ) {
          showBtn = true;
        }
      }
      return showBtn;
    };

    const getPendingPayments = async () => {
      saleLinesToPay.value = [];
      await store.dispatch('folios/fetchFolioTransactions', folio.value?.id);
      await store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
      const { saleLines } = store.state.folios;
      await Promise.all(
        saleLines.map(async (sl) => {
          let partnerToInvoice: PartnerInterface | null = null;
          if (sl.displayType !== 'line_section') {
            let pendingToPay = 0;
            let partnerName = '';
            if (sl.defaultInvoiceTo) {
              await store.dispatch('partners/fetchCurrentPartner', sl.defaultInvoiceTo);
              partnerToInvoice = store.state.partners.currentPartner;
              if (partnerToInvoice) {
                partnerName = partnerToInvoice.name;
              }
            } else {
              partnerName = 'huésped';
            }
            const saleLineToPay = saleLinesToPay.value.find(
              (el) => el.defaultInvoiceTo === sl.defaultInvoiceTo
            );

            if (saleLineToPay) {
              saleLineToPay.partnerSaleLines.push(sl);
              saleLineToPay.partnerSaleLines.forEach((el) => {
                pendingToPay += el.priceTotal;
              });
              saleLineToPay.pendingToPay = pendingToPay;
            } else {
              pendingToPay = sl.priceTotal;
              const partnerSaleLines = [sl];
              saleLinesToPay.value.push({
                defaultInvoiceTo: partnerToInvoice ? partnerToInvoice.id : null,
                partnerName,
                partnerSaleLines,
                pendingToPay,
              });
            }
          }
          void store.dispatch('partners/removePartner');
        })
      );
      transactionsToRender.value.forEach((partnerTransaction) => {
        saleLinesToPay.value.forEach((sl) => {
          if (sl.defaultInvoiceTo === partnerTransaction.partnerId) {
            sl.pendingToPay -= partnerTransaction.chargesAmountTotal;
            sl.pendingToPay += partnerTransaction.refundsAmountTotal;
          }
        });
      });
      const transactionsWhitoutPartner = transactionsToRender.value.filter(
        (tr) => !saleLinesToPay.value.some((sl) => sl.defaultInvoiceTo === tr.partnerId)
      );
      if (transactionsWhitoutPartner.length > 0) {
        const saleLinesPartnerNull = saleLinesToPay.value.find(
          (el) => el.defaultInvoiceTo === null
        );
        if (saleLinesPartnerNull) {
          transactionsWhitoutPartner.forEach((el) => {
            saleLinesPartnerNull.pendingToPay -= el.chargesAmountTotal;
            saleLinesPartnerNull.pendingToPay += el.refundsAmountTotal;
          });
        }
      }
    };

    watch(transactions, () => {
      transactionsToRender.value = [];
      if (transactions.value.length > 0) {
        transactions.value.forEach((tr) => {
          const transaction = transactionsToRender.value.find(
            (el) => el.partnerId === tr.partnerId
          );
          if (transaction) {
            transaction.partnerCharges.push(tr);
          } else {
            const partnerCharges = [tr];
            transactionsToRender.value.push({
              partnerId: tr.partnerId,
              partnerName: tr.partnerName,
              partnerCharges,
              chargesAmountTotal: tr.amount,
              partnerRefunds: [],
              refundsAmountTotal: 0,
            });
          }
        });
        transactionsToRender.value.forEach((partnerTransaction) => {
          partnerTransaction.chargesAmountTotal = 0;
          partnerTransaction.partnerCharges.forEach((charge) => {
            partnerTransaction.chargesAmountTotal += charge.amount;
          });
        });
      }
    });

    watch(refunds, () => {
      if (refunds.value.length > 0) {
        refunds.value.forEach((rf) => {
          const transaction = transactionsToRender.value.find(
            (el) => el.partnerId === rf.partnerId
          );
          if (transaction) {
            transaction.partnerRefunds.push(rf);
          } else {
            const partnerRefunds = [rf];
            transactionsToRender.value.push({
              partnerId: rf.partnerId,
              partnerName: rf.partnerName,
              partnerCharges: [],
              chargesAmountTotal: 0,
              partnerRefunds,
              refundsAmountTotal: rf.amount,
            });
          }
        });
        transactionsToRender.value.forEach((partnerRefund) => {
          partnerRefund.refundsAmountTotal = 0;
          partnerRefund.partnerRefunds.forEach((refund) => {
            partnerRefund.refundsAmountTotal += refund.amount;
          });
        });
      }
    });

    watch(folio, async () => {
      if (folio.value) {
        void store.dispatch('layout/showSpinner', true);
        await getPendingPayments();
        void store.dispatch('layout/showSpinner', false);
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      await getPendingPayments();
      void store.dispatch('layout/showSpinner', false);
    });

    return {
      store,
      folio,
      invoices,
      pendingAmount,
      transactions,
      transactionsToRender,
      saleLinesToPay,
      refunds,
      chargesModal,
      isRefund,
      isEdit,
      transactionId,
      customerTransaction,
      currentTransaction,
      downPaymentInvoiceDialog,
      partnerId,
      chargeAmount,
      openDownPaymentDialog,
      openRefundModal,
      openChargesModal,
      openCustomerModal,
      getTransactionMethodName,
      getTotalChargeAmount,
      getTotalRefundAmount,
      getDateLimit,
      getPendingPayments,
      closeTransactionDialog,
      printDownPaymentInvoice,
      showCreateDownPaymentInvoiceBtn,
      openPaymentLinkModal,
    };
  },
});
</script>
<style scoped lang="scss">
.pending-amount-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-bottom: 1rem;
  .pending-amount-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: black;
    color: white;
    font-weight: bold;
    padding: 0.5rem;
    border-radius: 4px;
    &.has-charges {
      border-radius: 4px 4px 0 0 !important;
    }
    .pending-title {
      max-width: 75%;
      margin-left: 0.5rem;
    }
    .pending-amount {
      margin-right: 0.5rem;
    }
  }
  .charge-section {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    .date-limit {
      margin-bottom: 0.5rem;
      margin-left: 0.5rem;
      .text-bold {
        font-weight: bold;
      }
    }
    .charge-btns {
      display: flex;
      flex-direction: column;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
      .link-btn {
        background-color: #f0f0f0;
        border: none;
        border-radius: 3px;
        font-weight: bold;
        cursor: pointer;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
      }
      .charge-btn {
        color: white;
        background-color: $primary;
        border: none;
        border-radius: 3px;
        font-weight: bold;
        cursor: pointer;
        padding: 0.5rem 1rem;
      }
    }
  }
}

.recorded-charges-card {
  margin-top: 1rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  border-radius: 4px !important;
  .recorded-transactions-title {
    font-weight: bold;
    background: #899b9e;
    color: white;
    padding: 0.5rem;
    border-radius: 4px 4px 0 0 !important;
    .title {
      margin-left: 0.5rem;
    }
  }
  .recorded-charges-title {
    padding: 0.5rem;
    font-weight: bold;
    background: #daf7fc;
    .title {
      margin-left: 0.5rem;
    }
  }

  table {
    width: 100%;
    font-size: 0.8rem;
    thead {
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
      user-select: none;
    }
    tr {
      padding: 0.5rem;
      display: block;
      margin-bottom: 0.625em;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
    td {
      display: block;
      text-align: right;
    }
    td::before {
      content: attr(data-label);
      float: left;
      font-weight: bold;
    }
    tbody {
      tr {
        border-bottom: 1px solid grey;
        &:last-child {
          border-bottom: none;
        }
        td:last-child {
          display: flex;
          .btn-print-down-payment-invoice,
          .btn-create-down-payment-invoice {
            cursor: pointer;
            font-weight: bold;
            border: 2px solid;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 30px;
            margin-top: 1rem;
          }

          .btn-print-down-payment-invoice {
            text-align: center;
            background-color: white;
            color: $primary;
            border-color: $primary;
            padding: 0 1rem;
          }

          .btn-create-down-payment-invoice {
            background-color: $primary;
            color: white;
            border-color: $primary;
            padding: 0.1rem 0.8rem;
            border-radius: 3px;
            margin-bottom: 0.2rem;
          }

          .btn-print-down-payment-invoice .hovertext,
          .btn-create-down-payment-invoice .hovertext {
            position: relative;
          }

          .btn-print-down-payment-invoice .hovertext:before,
          .btn-create-down-payment-invoice .hovertext:before {
            content: attr(data-hover);
            visibility: hidden;
            opacity: 0;
            background-color: black;
            color: #fff;
            text-align: center;
            border-radius: 5px;
            padding: 5px 0;

            position: absolute;
            z-index: 1;
            right: -30%;
            bottom: 120%;
            transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
          }

          .btn-print-down-payment-invoice .hovertext:hover:before,
          .btn-create-down-payment-invoice .hovertext:hover:before {
            opacity: 0.9;
            visibility: visible;
          }
        }
      }
    }
  }

  .separator {
    margin: 0.5rem 0;
  }

  .total-amount-row {
    display: flex;
    flex-direction: row-reverse;
    padding: 0.5rem;
    margin-right: 0.5rem;
    .total-amount {
      font-weight: bold;
      margin-left: 0.5rem;
    }
  }

  .recorded-refunds-card {
    .recorded-charges-title {
      padding: 0.5rem;
      font-weight: bold;
      background: #daf7fc;
    }

    .no-charges-row-btn {
      display: flex;
      justify-content: center;
    }
  }

  .repay-container {
    padding: 0.5rem;
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    .repay-btn {
      width: 100%;
      height: 30px;
      color: $primary;
      background: white;
      border: 2px solid $primary;
      border-radius: 3px;
      padding: 0 1.5rem;
      font-weight: bold;
      cursor: pointer;
    }
  }

  .no-charges-row {
    padding: 0.5rem;
  }

  .saved-charges-row {
    display: flex;
    align-items: center;
    color: $primary;
    &:hover {
      color: $corduroy;
      cursor: pointer;
    }
  }

  .btn-print-down-payment-invoice {
    background-color: white;
    color: $primary;
    border: 2px solid $primary;
    cursor: pointer;
    padding: 0 1rem;
    border-radius: 3px;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }

  .btn-create-down-payment-invoice {
    background-color: $primary;
    color: white;
    border: 2px solid $primary;
    cursor: pointer;
    padding: 0.1rem 0.8rem;
    border-radius: 3px;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }
}

@media (min-width: 1024px) {
  .pending-amount-card {
    .pending-amount-section {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .charge-section {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding-right: 0;
      .date-limit {
        margin-bottom: 0;
      }
      .charge-btns {
        flex-direction: row;
        margin-right: 0;
        .link-btn {
          margin: 0.7rem 1rem;
          padding: 0 1rem;
          height: 30px;
          font-size: 14px;
        }
        .charge-btn {
          margin: 0.7rem;
          font-size: 14px;
          padding: 0 2rem;
          height: 30px;
        }
      }
    }
  }
  .recorded-charges-card {
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      table-layout: fixed;
      thead {
        display: table-header-group;
        border: none;
        clip: auto;
        height: auto;
        margin: 0;
        overflow: visible;
        padding: 0;
        position: static;
        width: 100%;
        text-align: center;
      }
      tr {
        cursor: pointer;
        display: table-row;
        border-radius: 0;
        padding: 0 !important;
        background-color: transparent;
        &:not(thead tr):hover {
          background-color: #f5f5f5;
        }
      }
      th {
        padding: 0.5em;
        color: $primary;
        font-weight: bold;
        padding: 12px;
      }

      td {
        display: table-cell;
        text-align: center;
        padding: 0.5em;
        margin-right: 0.5rem;
        .checkbox {
          display: flex;
        }
        &.toggle-button-container {
          display: none;
        }
        &::before {
          content: none;
        }
        .btn {
          min-width: 120px;
        }
      }
      tbody {
        tr {
          td:last-child {
            .btn-print-down-payment-invoice,
            .btn-create-down-payment-invoice {
              margin-top: 0 !important;
              font-size: 14px;
            }
          }
        }
      }
      th,
      td {
        width: 25%;
        text-align: center;
        padding: 0.5em;
      }

      td:not(:last-child) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      td:last-child {
        white-space: normal;
        width: 155px;
      }
    }
    .repay-container {
      display: flex;
      justify-content: center;
      .repay-btn {
        width: auto;
      }
    }
  }
}
</style>
