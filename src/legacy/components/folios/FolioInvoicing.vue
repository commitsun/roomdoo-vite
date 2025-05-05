<template>
  <div class="invoice-card">
    <div
      class="to-invoice-title"
      :style="`background-color: ${getTotalToInvoiceWithoutPartner() === 0 ? '#c0c0c0' : ''}`"
    >
      <span>Por facturar al huésped</span>
      <span>{{ getTotalToInvoiceWithoutPartner() }} €</span>
    </div>
    <div v-for="(saleLine, index) in saleLinesWithoutPartner" :key="saleLine.id">
      <div
        v-if="saleLine.qtyToInvoice > 0 && !saleLine.defaultInvoiceTo"
        class="sale-lines"
        :style="getMoveLineRowStyle(saleLine.displayType, index)"
      >
        <div class="sale-line-name">
          {{ saleLine.name }}
        </div>
        <div
          v-if="
            saleLine.reservationId && !saleLine.serviceId && saleLine.displayType !== 'line_section'
          "
          class="sale-line-qty"
        >
          {{ saleLine.qtyToInvoice }} Noche{{ saleLine.qtyToInvoice > 1 ? 's' : '' }}
        </div>
        <div
          v-if="
            saleLine.reservationId && saleLine.serviceId && saleLine.displayType !== 'line_section'
          "
          class="sale-line-qty"
        >
          {{ saleLine.qtyToInvoice }} Ud{{ saleLine.qtyToInvoice > 1 ? 's' : '' }}
        </div>
        <div v-if="saleLine.displayType !== 'line_section'" class="sale-line-amount">
          {{ getAmountLineToInvoice(saleLine.id) }} €
        </div>
      </div>
    </div>
    <button
      v-if="getTotalToInvoiceWithoutPartner() !== 0"
      @click="openInvoiceChanges()"
      class="btn-open-dialog"
    >
      Crear Factura
    </button>
  </div>
  <div class="invoice-card" v-for="partnerId in partnersToInvoice" :key="partnerId">
    <div
      class="to-invoice-title"
      :style="`background-color: ${getTotalToInvoiceWithPartner(partnerId) === 0 ? '#c0c0c0' : ''}`"
    >
      <span>Por facturar a {{ partnerName(partnerId) }}</span>
      <span>{{ getTotalToInvoiceWithPartner(partnerId) }} €</span>
    </div>
    <div v-for="(saleLine, index) in partnerSaleLines" :key="saleLine.id">
      <div
        v-if="saleLine.qtyToInvoice > 0 && saleLine.defaultInvoiceTo === partnerId"
        class="sale-lines"
        :style="getMoveLineRowStyle(saleLine.displayType, index)"
      >
        <div class="sale-line-name">
          {{ saleLine.name }}
        </div>
        <div
          v-if="
            saleLine.reservationId && !saleLine.serviceId && saleLine.displayType !== 'line_section'
          "
          class="sale-line-qty"
        >
          {{ saleLine.qtyToInvoice }} Noche{{ saleLine.qtyToInvoice > 1 ? 's' : '' }}
        </div>
        <div
          v-if="
            saleLine.reservationId && saleLine.serviceId && saleLine.displayType !== 'line_section'
          "
          class="sale-line-qty"
        >
          {{ saleLine.qtyToInvoice }} Ud{{ saleLine.qtyToInvoice > 1 ? 's' : '' }}
        </div>
        <div v-if="saleLine.displayType !== 'line_section'" class="sale-line-amount">
          {{ getAmountLineToInvoice(saleLine.id) }} €
        </div>
      </div>
    </div>
    <button
      v-if="getTotalToInvoiceWithPartner(partnerId) !== 0"
      @click="openInvoiceChanges(partnerId)"
      class="btn-open-dialog"
    >
      Crear Factura
    </button>
  </div>
  <div
    class="invoice-card"
    v-for="(draftInvoice, index) in draftInvoices()"
    :key="draftInvoice.id ?? 0"
  >
    <div class="draft-invoice-title">
      <span>Proforma</span>
      <div class="title-right">
        <span>{{ draftInvoice.amount }} €</span>
        <div class="three-dots-menu">
          <img
            src="/app-images/three-dots-white.svg"
            @click="openDraftInvoiceMenu[index] = !openDraftInvoiceMenu[index]"
            @blur="openDraftInvoiceMenu[index] = false"
            tabindex="1"
          />
          <transition name="menu">
            <div class="draft-invoice-menu" v-if="openDraftInvoiceMenu[index]">
              <div @click="deleteInvoice(draftInvoice.id ?? 0)">Borrar proforma</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="partner-date-row">
      <div class="partner-date-column">
        <div>
          <span class="partner-date-title"> Cliente: </span>
          <span class="partner-date-name">
            {{ draftInvoice.partnerName }}
          </span>
        </div>
        <div>
          <span class="partner-date-title"> Fecha: </span>
          <span class="partner-date-name">
            {{ draftInvoice.date }}
          </span>
        </div>
      </div>
      <button
        class="btn-validate"
        @click="validateDraftInvoice(draftInvoice.id as number)"
        v-if="showValidateButton(draftInvoice.date as string)"
      >
        Validar
      </button>
    </div>
    <div
      v-for="(draftMoveLine, index) in draftInvoice.moveLines"
      :key="draftMoveLine.id as number"
      :style="getMoveLineRowStyle(draftMoveLine.displayType, index)"
      class="move-lines"
    >
      <div class="invoice-line-name">
        {{ draftMoveLine.name }}
      </div>
      <div class="invoice-line-qty" v-if="draftMoveLine.displayType !== 'line_section'">
        {{ draftMoveLine.quantity }}
        {{ moveLineUnit(draftInvoice.id as number, draftMoveLine.id as number) }}
      </div>
      <div class="invoice-line-amount" v-if="draftMoveLine.displayType !== 'line_section'">
        {{ draftMoveLine.total }} €
      </div>
    </div>
    <div class="btns">
      <button class="btn" @click="openMailInvoiceDialog(draftInvoice.id as number)">
        <CustomIcon
          imagePath="/app-images/icon-email.svg"
          color="#000000"
          width="15px"
          height="15px"
          class="icon"
        />
        Mail
      </button>
      <button class="btn" @click="openModifyInvoiceDialog(draftInvoice.id as number)">
        <CustomIcon
          imagePath="/app-images/icon-change.svg"
          color="#000000"
          width="16px"
          height="16px"
          class="icon"
        />
        Modificar
      </button>
      <a class="btn" :href="draftInvoice.portalUrl" target="_blank">
        <CustomIcon
          imagePath="/app-images/icon-print.svg"
          color="#000000"
          width="16px"
          height="16px"
          class="icon"
        />
        Imprimir
      </a>
    </div>
  </div>
  <div class="invoice-card" v-for="postedInvoice in postedInvoices()" :key="postedInvoice.id ?? 0">
    <div class="posted-invoice-title">
      <span>{{ postedInvoice.name }}</span>
      <span>{{ postedInvoice.amount }} €</span>
    </div>
    <div class="partner-date-row">
      <div class="partner-date-column">
        <div>
          <span class="partner-date-title"> Cliente: </span>
          <span class="partner-date-name">
            {{ postedInvoice.partnerName }}
          </span>
        </div>

        <div>
          <span class="partner-date-title"> Fecha: </span>
          <span class="partner-date-name">
            {{ postedInvoice.date }}
          </span>
        </div>
      </div>
    </div>
    <div
      v-for="(postedMoveLine, index) in postedInvoice.moveLines"
      :key="postedMoveLine.id as number"
      :style="getMoveLineRowStyle(postedMoveLine.displayType, index)"
      class="move-lines"
    >
      <div class="invoice-line-name">
        {{ postedMoveLine.name }}
      </div>
      <div class="invoice-line-qty" v-if="postedMoveLine.displayType !== 'line_section'">
        {{ postedMoveLine.quantity }}
        {{ moveLineUnit(postedInvoice.id as number, postedMoveLine.id as number) }}
      </div>
      <div class="invoice-line-amount" v-if="postedMoveLine.displayType !== 'line_section'">
        {{ postedMoveLine.total }} €
      </div>
    </div>
    <div class="btns">
      <button class="btn" @click="openMailInvoiceDialog(postedInvoice.id as number)">
        <CustomIcon
          imagePath="/app-images/icon-email.svg"
          color="#000000"
          width="15px"
          height="15px"
          class="icon"
        />
        Mail
      </button>
      <button class="btn" @click="openModifyInvoiceDialog(postedInvoice.id as number)">
        <CustomIcon
          imagePath="/app-images/icon-change.svg"
          color="#000000"
          width="16px"
          height="16px"
          class="icon"
        />
        Modificar
      </button>
      <a class="btn" :href="postedInvoice.portalUrl" target="_blank">
        <CustomIcon
          imagePath="/app-images/icon-print.svg"
          color="#000000"
          width="16px"
          height="16px"
          class="icon"
        />
        Imprimir
      </a>
    </div>
  </div>
</template>
<script lang="ts">
import { type InvoiceInterface } from '@/legacy/interfaces/InvoiceInterface';
import { type AxiosResponse } from 'axios';
import { defineComponent, computed, ref, onMounted, watch, markRaw } from 'vue';
import { type FolioSaleLineInterface } from '@/legacy/interfaces/FolioSaleLineInterface';
import { type PartnerInterface } from '@/legacy/interfaces/PartnerInterface';

import { useStore } from '@/legacy/store';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import { dialogService } from '@/legacy/services/DialogService';

import InvoiceChanges from '@/legacy/components/invoices/InvoiceChanges.vue';
import MailComponent from '@/legacy/components/mails/MailComponent.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  setup() {
    const store = useStore();
    const invoiceDialog = ref(false);
    const isRenderSaleLines = ref(false);
    const isRenderInvoiceLines = ref(false);
    const mailInvoiceDialog = ref(false);
    const invoiceId = ref(0);
    const partnersToInvoice = ref([] as number[]);
    const partnerSaleLines = ref([] as FolioSaleLineInterface[]);
    const saleLinesWithoutPartner = ref([] as FolioSaleLineInterface[]);
    const partners = ref([] as PartnerInterface[]);
    const saleLineIds = ref([] as number[]);
    const openDraftInvoiceMenu = ref([] as boolean[]);
    const idPartner = ref(0);
    const template = ref('');
    const subject = ref('');
    const folio = computed(() => store.state.folios.currentFolio);
    const saleLines = computed(() => store.state.folios.saleLines);
    const invoices = computed(() => store.state.folios.invoices);

    const draftInvoices = () => {
      const invoicesInDraft: InvoiceInterface[] = [];
      invoices.value.forEach((el) => {
        if (el.state === 'draft') {
          invoicesInDraft.push(el);
        }
      });
      return invoicesInDraft;
    };

    const postedInvoices = () => {
      const invoicesPosted: InvoiceInterface[] = [];
      invoices.value.forEach((el) => {
        if (
          el.state === 'posted' &&
          !el.isDownPaymentInvoice &&
          !el.isReversed &&
          el.moveType !== 'out_refund'
        ) {
          invoicesPosted.push(el);
        }
      });
      return invoicesPosted;
    };

    const getTotalToInvoiceWithoutPartner = () => {
      let total = 0;
      saleLinesWithoutPartner.value.forEach((el) => {
        let subTotal = 0;
        if (el.qtyToInvoice > 0) {
          subTotal = el.qtyToInvoice * el.priceUnit;
        }
        if (el.discount) {
          subTotal -= ((el.discount * el.priceUnit) / 100) * el.qtyToInvoice;
        }
        total += subTotal;
      });
      return total;
    };

    const getTotalToInvoiceWithPartner = (partnerId: number) => {
      let total = 0;
      saleLines.value.forEach((el) => {
        if (el.defaultInvoiceTo === partnerId) {
          let subTotal = 0;
          if (el.qtyToInvoice > 0) {
            subTotal = el.qtyToInvoice * el.priceUnit;
          }
          if (el.discount) {
            subTotal -= ((el.discount * el.priceUnit) / 100) * el.qtyToInvoice;
          }
          total += subTotal;
        }
      });
      return total;
    };

    const getAmountLineToInvoice = (saleLineId: number) => {
      let amount = 0;
      const saleLine = saleLines.value.find((el) => el.id === saleLineId);
      if (saleLine) {
        amount =
          saleLine.qtyToInvoice * saleLine.priceUnit -
          ((saleLine.discount * saleLine.priceUnit) / 100) * saleLine.qtyToInvoice;
      }
      return amount.toFixed(2);
    };

    const getMoveLineRowStyle = (displayType: string, numberRow: number) => {
      let backgroundColor = '';
      let fontWeight = '';
      let padding = '';

      if (displayType === 'line_section') {
        backgroundColor = '#d6ebf2';
        padding = '.2rem 0';
        fontWeight = 'bold';
      } else {
        padding = '.5rem 0';
        if (numberRow % 2 === 0) {
          backgroundColor = '#EEF7FA';
        }
      }

      const style: Record<string, string> = {
        backgroundColor,
        fontWeight,
        padding,
      };

      return style;
    };

    const openNewInvoiceDialog = () => {
      void store.dispatch('partners/removePartner').then(() => {
        saleLineIds.value = [];
        isRenderSaleLines.value = true;
        isRenderInvoiceLines.value = false;
        invoiceDialog.value = true;
        saleLines.value.forEach((el) => {
          if (!el.defaultInvoiceTo || el.qtyToInvoice < 0) {
            saleLineIds.value.push(el.id);
          }
        });
      });
    };

    const openNewInvoiceDialogWithPartner = async (partnerId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('partners/fetchCurrentPartner', partnerId);
        saleLineIds.value = [];
        idPartner.value = partnerId;
        isRenderSaleLines.value = true;
        isRenderInvoiceLines.value = false;
        invoiceDialog.value = true;
        saleLines.value.forEach((el) => {
          if (el.defaultInvoiceTo === partnerId) {
            saleLineIds.value.push(el.id);
          }
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

    const openInvoiceChanges = async (partnerId?: number) => {
      saleLineIds.value = [];
      isRenderSaleLines.value = true;
      isRenderInvoiceLines.value = false;
      invoiceDialog.value = true;

      if (partnerId) {
        await store.dispatch('partners/fetchCurrentPartner', partnerId);
        idPartner.value = partnerId;
        saleLines.value.forEach((el) => {
          if (el.defaultInvoiceTo === partnerId) {
            saleLineIds.value.push(el.id);
          }
        });
      } else {
        await store.dispatch('partners/removePartner');
        saleLines.value.forEach((el) => {
          if (!el.defaultInvoiceTo || el.qtyToInvoice < 0) {
            saleLineIds.value.push(el.id);
          }
        });
      }

      dialogService.open({
        header: 'Crear factura',
        content: markRaw(InvoiceChanges),
        props: {
          isRenderSaleLines: isRenderSaleLines.value,
          isRenderInvoiceLines: isRenderInvoiceLines.value,
          invoiceId: invoiceId.value,
          saleLineIds: saleLineIds.value,
          idPartner: idPartner.value,
        },
      });
    };

    const openModifyInvoiceDialog = (moveId: number) => {
      isRenderSaleLines.value = false;
      isRenderInvoiceLines.value = true;
      invoiceId.value = moveId;
      invoiceDialog.value = true;

      dialogService.open({
        header: 'Modificar factura',
        content: markRaw(InvoiceChanges),
        props: {
          isRenderSaleLines: isRenderSaleLines.value,
          isRenderInvoiceLines: isRenderInvoiceLines.value,
          invoiceId: invoiceId.value,
          saleLineIds: saleLineIds.value,
          idPartner: idPartner.value,
        },
      });
    };

    const deleteInvoice = async (moveId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('invoices/deleteInvoice', moveId);
        await Promise.all([
          store.dispatch('folios/fetchFolioSaleLines', folio.value?.id),
          store.dispatch('folios/fetchFolioInvoices', folio.value?.id),
        ]);
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

    const openMailInvoiceDialog = async (moveId: number) => {
      invoiceId.value = moveId;
      const payload = {
        invoiceId: moveId,
      };
      void store.dispatch('layout/showSpinner', true);
      try {
        const response = (await store.dispatch(
          'folios/fetchInvoiceMailData',
          payload
        )) as AxiosResponse<{ bodyMail: string; subject: string }>;
        if (response.data) {
          if (response.data.bodyMail) {
            template.value = response.data.bodyMail;
          }
          if (response.data.subject) {
            subject.value = response.data.subject;
          }
          dialogService.open({
            header: 'Enviar factura por email',
            content: markRaw(MailComponent),
            closable: true,
            props: {
              invoiceId: invoiceId.value,
              template: template.value,
              defaultSubject: subject.value,
            },
          });
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        mailInvoiceDialog.value = true;
      }
    };

    const moveLineUnit = (invId: number, invoiceLineId: number) => {
      let unit = '';
      const invoice = invoices.value.find((el) => el.id === invId);
      if (invoice) {
        const invoiceLine = invoice.moveLines.find((el) => el.id === invoiceLineId);
        if (invoiceLine) {
          const saleLine = saleLines.value.find((el) => el.id === invoiceLine.saleLineId);
          if (saleLine && saleLine.reservationId && !saleLine.serviceId) {
            unit = 'Noche';
          } else {
            unit = 'Ud';
          }
          if (invoiceLine.quantity > 1) {
            unit += 's';
          }
        }
      }
      return unit;
    };

    const validateDraftInvoice = async (idInvoice: number) => {
      const invoice = invoices.value.find((el) => el.id === idInvoice);
      if (invoice && invoice.date) {
        const invoiceDate = `${invoice.date?.substr(6, 4)}-${invoice.date?.substr(
          3,
          2
        )}-${invoice.date?.substr(0, 2)}`;
        const payload = {
          date: invoiceDate,
          partnerId: invoice.partnerId,
          moveLines: invoice.moveLines,
          invoiceId: invoice.id,
          state: 'confirm',
          isSimplifiedInvoice: invoice.isSimplifiedInvoice,
        };
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('folios/updateFolioInvoice', payload);
          await Promise.all([
            store.dispatch('folios/fetchFolioSaleLines', folio.value?.id),
            store.dispatch('folios/fetchFolioInvoices', folio.value?.id),
          ]);
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

    const showValidateButton = (invoiceDate: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateInvoice = new Date(
        `${invoiceDate?.substr(3, 2)}-${invoiceDate?.substr(0, 2)}-${invoiceDate?.substr(6, 4)}`
      );
      if (invoiceDate && today.getTime() >= dateInvoice.getTime()) {
        return true;
      }
      return false;
    };

    const partnerName = (partnerId: number) => {
      let namePartner = '';
      const partner = partners.value.find((el) => el.id === partnerId);
      if (partner) {
        namePartner = partner.name;
      }
      return namePartner;
    };

    watch(saleLines, () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        partnersToInvoice.value = [];
        saleLinesWithoutPartner.value = [];
        partnerSaleLines.value = [];
        saleLines.value.forEach((el) => {
          if (el.defaultInvoiceTo && !partnersToInvoice.value.includes(el.defaultInvoiceTo)) {
            partnersToInvoice.value.push(el.defaultInvoiceTo);
          } else if (!el.defaultInvoiceTo) {
            saleLinesWithoutPartner.value.push(el);
          }
        });
        saleLines.value.forEach((saleLine) => {
          partnersToInvoice.value.forEach((partnerId) => {
            if (
              saleLine.defaultInvoiceTo === partnerId &&
              !partnerSaleLines.value.includes(saleLine)
            ) {
              partnerSaleLines.value.push(saleLine);
            }
          });
        });
        partnersToInvoice.value.forEach((el) => {
          void store.dispatch('partners/fetchCurrentPartner', el).then(() => {
            if (
              store.state.partners.currentPartner &&
              !partners.value.includes(store.state.partners.currentPartner)
            ) {
              partners.value.push(store.state.partners.currentPartner);
            }
          });
        });
        void store.dispatch('partners/removePartner');
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
          store.dispatch('folios/fetchFolioSaleLines', folio.value?.id),
          store.dispatch('folios/fetchFolioInvoices', folio.value?.id),
        ]);
        invoices.value.forEach((el) => {
          if (el.state === 'draft') {
            openDraftInvoiceMenu.value.push(false);
          }
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

    return {
      store,
      folio,
      saleLines,
      invoices,
      invoiceDialog,
      mailInvoiceDialog,
      isRenderSaleLines,
      isRenderInvoiceLines,
      invoiceId,
      partnerSaleLines,
      saleLinesWithoutPartner,
      partnersToInvoice,
      partners,
      saleLineIds,
      idPartner,
      template,
      subject,
      openDraftInvoiceMenu,
      getTotalToInvoiceWithoutPartner,
      getTotalToInvoiceWithPartner,
      draftInvoices,
      postedInvoices,
      getMoveLineRowStyle,
      openNewInvoiceDialogWithPartner,
      getAmountLineToInvoice,
      moveLineUnit,
      openNewInvoiceDialog,
      openModifyInvoiceDialog,
      deleteInvoice,
      openMailInvoiceDialog,
      validateDraftInvoice,
      showValidateButton,
      partnerName,
      openInvoiceChanges,
    };
  },
});
</script>
<style scoped lang="scss">
.to-invoice-title {
  display: flex;
  justify-content: space-between;
  border-radius: 5px 5px 0 0;
  font-weight: bold;
  color: white;
  background-color: #ff0000;
  padding: 0.5rem 1rem;
}
.invoice-card {
  margin: 0 0 1rem 0;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  vertical-align: top;
  background: #fff;
  position: relative;
  .title-right {
    display: flex;
    align-items: center;
    .three-dots-menu {
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
      }
      .draft-invoice-menu {
        user-select: none;
        position: absolute;
        width: fit-content;
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        color: black;
        font-size: 14px;
        box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.08);
        border-radius: 10px;
        cursor: pointer;
        z-index: 100;
        padding: 0.2rem 0;
        left: -120px;
        bottom: 25px;
        div {
          padding: 0.3rem 1rem;
          &:hover {
            font-weight: bold;
          }
        }
        .option-cancel {
          display: flex;
          align-items: center;
          color: #f21e1e;
          .menu-len-reservations {
            margin-left: 0.2rem;
          }
        }
        .option-confirm {
          display: flex;
          align-items: center;
          color: #00b5e2;
          .menu-len-reservations {
            margin-left: 0.2rem;
          }
        }
      }
    }
  }
}
.sale-lines {
  display: flex;
  .sale-line-name {
    width: 60%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 1rem;
    padding-right: 0.5rem;
  }
  .sale-line-qty {
    width: 18%;
    text-align: center;
  }
  .sale-line-amount {
    font-weight: bold;
    width: 22%;
    text-align: right;
    padding-right: 1rem;
  }
}
.draft-invoice-title {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: white;
  background-color: black;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  border-radius: 5px 5px 0 0;
}
.posted-invoice-title {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: white;
  background-color: $primary;
  padding: 0.5rem 1rem;
  border-radius: 5px 5px 0 0;
}
.partner-date-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0 0.5rem 1rem;
  .partner-date-column {
    display: flex;
    flex-direction: column;
    .partner-date-title {
      font-weight: bold;
    }
    .partner-date-name {
      margin-left: 0.2rem;
    }
  }
  .btn-validate {
    background-color: $primary;
    cursor: pointer;
    color: white;
    font-weight: bold;
    margin-right: 1rem;
    border: none;
    border-radius: 3px;
    height: 2rem;
    padding: 0 1rem;
  }
}
.move-lines {
  display: flex;
  .invoice-line-name {
    width: 60%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 1rem;
    padding-right: 0.5rem;
  }
  .invoice-line-qty {
    width: 18%;
    text-align: center;
  }
  .invoice-line-amount {
    font-weight: bold;
    width: 22%;
    text-align: right;
    padding-right: 1rem;
  }
}
.btn-open-dialog {
  background-color: $primary;
  margin: 1rem 0 1rem 1rem;
  border: 2px solid $primary;
  border-radius: 5px;
  width: 40%;
  height: 30px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.btns {
  display: flex;
  justify-content: center;
  padding: 1rem 0.4rem 1rem 0.4rem;
  .btn {
    background-color: white;
    border-radius: 5px;
    width: 25%;
    margin: 0 0.1rem;
    height: 30px;
    background-color: #f0f0f0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    text-decoration: none;
    border: none;
    .icon {
      margin-right: 0.2rem;
      margin-top: 2px;
    }
  }
}
.title-dialog {
  color: black;
  font-size: 20px;
  margin-left: 1rem;
}

.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease-in-out;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
