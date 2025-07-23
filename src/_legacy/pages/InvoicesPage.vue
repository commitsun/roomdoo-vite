<template>
  <div class="page-invoices">
    <div class="header-invoices" v-if="!isSearchOpened">
      <div class="header-left">
        <img src="/app-images/icon-burger.svg" @click="openLeftDrawer" class="icon-menu" />
        <div class="select-property-desk" v-if="properties.length > 1">
          <AutocompleteComponent
            id="partners-autocomplete"
            :placeholderValue="activeProperty?.name ?? ''"
            placeholderShowingOptions="Buscar propiedad"
            placeholderColor="#000000"
            icon="apartment"
            v-model="selectedPropertyId"
            :items="sortedProperties.map((el) => ({ value: el?.id ?? 0, name: el?.name ?? '' }))"
            iconExpandCollapse
            :showAddNewOption="false"
            :minChars="0"
            :emptyResultsAfterClick="false"
          >
            <template #icon>
              <img src="/app-images/property.svg" />
            </template>
          </AutocompleteComponent>
        </div>

        <div v-else class="property-desk">
          <img src="/app-images/property.svg" />
          {{ activeProperty?.name ?? '' }}
        </div>
        <span class="mobile-title">Facturas</span>
      </div>
      <div class="header-right">
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
        <div class="action-btns">
          <CustomButton
            class="download-btn"
            text="Descargar"
            backgroundColor="#2563EB"
            borderColor="#2563EB"
            @click="downloadInvoicesByMail()"
            v-if="invoicesSelected.length > 0"
          >
            <template #icon>
              <CustomIcon
                imagePath="/app-images/icon-file-download.svg"
                color="white"
                width="20px"
                height="20px"
              />
            </template>
          </CustomButton>
          <CustomButton
            class="print-btn"
            text="Imprimir"
            backgroundColor="#2563EB"
            borderColor="#2563EB"
            @click="sendOrPrintInvoicesByMail(false, true)"
            v-if="invoicesSelected.length > 0"
          >
            <template #icon>
              <CustomIcon
                imagePath="/app-images/icon-print.svg"
                color="white"
                width="20px"
                height="20px"
              />
            </template>
          </CustomButton>
          <CustomButton
            class="email-btn"
            text="Enviar por email"
            backgroundColor="#2563EB"
            borderColor="#2563EB"
            @click="openMailModal()"
            v-if="invoicesSelected.length > 0"
          >
            <template #icon>
              <CustomIcon
                imagePath="/app-images/icon-email.svg"
                color="white"
                width="20px"
                height="20px"
              />
            </template>
          </CustomButton>
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
          v-model="invoicesTextSearch"
          placeholder="Buscar factura"
          class="input-search"
        />
      </div>
    </Transition>
    <div class="page-container">
      <div class="second-header">
        <InputText
          v-model="invoicesTextSearch"
          placeholder="Buscar factura"
          iconBefore="/app-images/search-black.svg"
          class="filter"
        />
        <CustomSelect
          v-model="selectedPaymentState"
          :options="paymentStates.map((el) => ({ id: el.paymentState, text: el.name }))"
          placeholder="Estado del pago"
          allowRemove
          class="payment-state"
          focusable
        />
        <AutocompleteComponent
          :items="agencies.map((el) => ({ value: el.id, name: el.name }))"
          id="agencies-invoice-autocomplete"
          v-model="selectedAgencyId"
          :minChars="0"
          :showAddNewOption="false"
          keepResultAfterChoose
          :emptyResultsAfterClick="false"
          iconExpandCollapse
          isChangeFocusOnEnter
          placeholderValue="Agencia"
          class="agencies-filter"
        />

        <DatePicker
          v-model="dateRange"
          class="date-range"
          selectionMode="range"
          :manualInput="false"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          size="small"
          :inputStyle="{
            fontSize: '0.9rem',
          }"
        />
        <CheckboxComponent v-model="isAllInvoicesSelected" class="checkbox" />
        <div class="total-invoices">
          {{ totalInvoices }} facturas en total
          <span
            class="selected-invoices"
            v-if="!isAllInvoicesSelected && invoicesSelected.length > 0"
          >
            ({{ invoicesSelected.length }} seleccionada{{ invoicesSelected.length > 1 ? 's' : '' }})
          </span>
        </div>
      </div>
      <div class="main-content">
        <div class="table-desktop">
          <ListComponent
            :schema="schema"
            :listData="invoiceList"
            isMultiSelectable
            @selectItem="openInvoiceDialog($event)"
            @scrollInBottom="fetchMoreInvoices"
            @addItem="addItem($event)"
            @removeItem="removeItem($event)"
            @sort="sortInvoicesByField($event)"
            @addAllItems="selectAllInvoices()"
            @removeAllItems="invoicesSelected = []"
            :multiSelection="invoicesSelected.map((el) => el.id || 0)"
          />
        </div>
        <div class="table-mobile" @scroll="fetchMoreInvoices()">
          <div class="invoice-mobile" v-for="(invoice, index) in invoices" :key="invoice.id ?? 0">
            <div class="checkbox-invoice">
              <CheckboxComponent v-model="isInvoiceSelectedArray[index]" class="checkbox" />
            </div>
            <span class="invoice-name">
              {{ invoice.name }}
            </span>
            <span class="invoice-date">
              {{ getDateFormat(invoice.date as string) }}
            </span>

            <div class="invoice-amount">
              <span class="invoice-amount-wrap"> {{ invoice.amount }} € </span>
            </div>
            <span class="invoice-partner-name">
              {{ invoice.partnerName }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  watch,
  computed,
  type Ref,
  onUnmounted,
  reactive,
  markRaw,
} from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { email } from '@vuelidate/validators';
import { type AxiosResponse } from 'axios';

import DatePicker from 'primevue/datepicker';

import { type SchemaInterface } from '@/_legacy/interfaces/Lists';
import { type TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';
import { type InvoiceInterface } from '@/_legacy/interfaces/InvoiceInterface';
import { type PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';

import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';
import InputText from '@/_legacy/components/roomdooComponents/InputText.vue';
import CustomSelect from '@/_legacy/components/roomdooComponents/CustomSelect.vue';

import InvoiceDialog from '@/_legacy/components/invoices/InvoiceChanges.vue';
import ListComponent from '@/_legacy/components/roomdooComponents/ListComponent.vue';
import CheckboxComponent from '@/_legacy/components/roomdooComponents/CheckboxComponent.vue';
import CustomButton from '@/_legacy/components/roomdooComponents/CustomButton.vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import PartnerForm from '@/_legacy/components/partners/PartnerForm.vue';
import InvoiceChanges from '@/_legacy/components/invoices/InvoiceChanges.vue';

import { usePartner } from '@/_legacy/utils/usePartner';
import { useInvoices } from '@/_legacy/utils/useInvoices';
import { dialogService } from '@/_legacy/services/DialogService';
import { useStore } from '@/_legacy/store';
import { useUserStore } from '@/infrastructure/stores/user';
import InvoiceMailComponent from '@/_legacy/components/mails/InvoiceMailComponent.vue';

export default defineComponent({
  components: {
    AutocompleteComponent,
    InvoiceDialog,
    ListComponent,
    InputText,
    CustomSelect,
    DatePicker,
    CustomButton,
    CustomIcon,
    CheckboxComponent,
    PartnerForm,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const { fetchPartners } = usePartner();
    const { fetchInvoices } = useInvoices();
    const userStore = useUserStore();
    const rules = {
      email: {
        email,
      },
    };

    const limit = 80;
    const orderOptions = [
      { order: 'name', name: 'Nombre (A-Z)' },
      { order: 'name desc', name: 'Nombre (Z-A)' },
    ];
    const paymentStates = [
      { paymentState: 'paid', name: 'Pagada' },
      { paymentState: 'not_paid', name: 'No pagada' },
      { paymentState: 'partial', name: 'Parcialmente pagada' },
    ];
    const selectedPropertyId = ref(0);

    const invoiceDialog = ref(false);
    const currentInvoiceId = ref(0);
    const isRenderSaleLines = ref(false);
    const isRenderInvoiceLines = ref(false);
    const dateStart: Ref<Date | null> = ref(null);
    const dateEnd: Ref<Date | null> = ref(null);
    const template = ref('');
    const invoiceId = ref(0);
    const subject = ref('');
    const invoicesTextSearch = ref('');
    const selectedOrder = ref({
      field: '',
      isDesc: false,
    });
    const selectedPaymentState = ref('');
    const selectedAgencyId = ref(0);
    const maxPage = ref(0);
    const currentPage = ref(1);
    const dateRange = ref([] as Date[]);
    const invoicesSelected = ref([] as InvoiceInterface[]);
    const partnerList = ref([] as number[]);
    const showMailSendFeedback = ref(false);
    const isInvoiceSelectedArray: Ref<boolean[]> = ref([]);
    const isSearchOpened = ref(false);
    const isOpenPartnersMail = ref(false);
    const emails = ref([] as string[]);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const selectedPartnerId = ref(0);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const emailToAdd = ref('');
    const showBtnToAddEmail = ref(false);
    const showPartnerDialog = ref(false);
    const partnerName = ref('');
    const partnerWithoutMailAddress = ref(false);
    const invalidAddress = ref(false);
    const partners = ref([] as PartnerInterface[]);
    const isAllInvoicesSelected = ref(false);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const invoices = computed(() => store.state.invoices.invoices);
    const totalInvoices = computed(() => store.state.invoices.totalInvoices);
    const agencies = computed(() => store.state.agencies.agencies);
    const total = computed(() => store.state.invoices.total);
    const activeUser = computed(() => userStore.user);
    const properties = computed(() => store.state.properties.properties);
    const imageActiveProperty = computed(() => activeProperty.value?.hotelImageUrl);
    const partnersComputed = computed(() => store.state.partners.partners);
    const sortedProperties = computed(() => {
      const result = store.state.properties.properties.filter(
        (el) => el.id !== (activeUser.value?.defaultProperty?.id as number | undefined)
      );
      const defaultProperty = store.state.properties.properties.find(
        (el) => el.id === (activeUser.value?.defaultProperty?.id as number | undefined)
      );
      if (defaultProperty) {
        result.unshift(defaultProperty);
      }
      return result;
    });

    const state = reactive({
      email: '',
    });

    const v = useVuelidate(rules, state);

    const dateFormat = (dateTimeStr: string) => {
      if (dateTimeStr === null) {
        return dateTimeStr;
      }
      const dateFormatStr = `${dateTimeStr.substr(8, 2)}/${dateTimeStr.substr(
        5,
        2
      )}/${dateTimeStr.substr(0, 4)}`;
      return dateFormatStr;
    };

    const openInvoiceDialog = async (transaction: TransactionInterface) => {
      if (transaction.folioId !== 0) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('folios/fetchFolio', transaction.folioId);
          await store.dispatch('folios/fetchFolioInvoices', transaction.folioId);
          await store.dispatch('folios/fetchFolioSaleLines', transaction.folioId);
        } catch (error) {
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        currentInvoiceId.value = transaction.id;
        isRenderSaleLines.value = false;
        isRenderInvoiceLines.value = true;
        invoiceDialog.value = true;
      } else {
        currentInvoiceId.value = transaction.id;
        isRenderInvoiceLines.value = true;
        invoiceDialog.value = true;
      }
      dialogService.open({
        header: 'Factura',
        content: markRaw(InvoiceChanges),
        props: {
          invoiceId: currentInvoiceId.value,
          isRenderSaleLines: isRenderSaleLines.value,
          isRenderInvoiceLines: isRenderInvoiceLines.value,
        },
        closable: true,
      });
    };

    const base64ToArrayBuffer = (data: string) => {
      const bString = window.atob(data);
      const bLength = bString.length;
      const bytes = new Uint8Array(bLength);
      for (let i = 0; i < bLength; i += 1) {
        const ascii = bString.charCodeAt(i);
        bytes[i] = ascii;
      }
      return bytes;
    };

    const downloadInvoicesByMail = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store
          .dispatch('invoices/sendMailOrPrintInvoices', {
            invoiceIds: invoicesSelected.value.map((el) => el.id),
            isEmail: false,
            isPrint: true,
          })
          .then((response: AxiosResponse<{ binary: string }>) => {
            const a: HTMLAnchorElement = document.createElement('a');
            if (response.data && response.data.binary) {
              a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data.binary}`;
            }
            a.download = 'invoices.pdf';
            document.body.appendChild(a);
            a.click();
            isInvoiceSelectedArray.value = invoices.value.map(() => false);
            isAllInvoicesSelected.value = false;
          });
      } catch (error) {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const openPartnerDialog = async (partnerId: number) => {
      if (partnerId === 0) {
        await store.dispatch('partners/removePartner');
        await store.dispatch('countryStates/removeCountryStates');
      } else {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('partners/fetchCurrentPartner', partnerId);
        } catch (error) {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
      }
      showPartnerDialog.value = true;
    };

    const sendOrPrintInvoicesByMail = async (isEmail: boolean, isPrint: boolean) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        const response = (await store.dispatch('invoices/sendMailOrPrintInvoices', {
          invoiceIds: invoicesSelected.value.map((el) => el.id),
          partnerIds: partners.value.map((el) => el.id),
          emailAddresses: emails.value,
          isEmail,
          isPrint,
        })) as AxiosResponse<{ binary: string }>;
        if (isEmail) {
          showMailSendFeedback.value = true;
        } else if (isPrint) {
          if (response.data) {
            const content = base64ToArrayBuffer(`${response.data.binary}`);
            const blob = new Blob([content], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            if (iframe) {
              iframe.contentWindow?.print();
            }
          }
        }
        invoicesSelected.value = [];
        isInvoiceSelectedArray.value = invoices.value.map(() => false);
        isAllInvoicesSelected.value = false;
        isOpenPartnersMail.value = false;
      } catch (error) {
        showMailSendFeedback.value = false;
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    const getColor = (paymentState: string) => {
      let color = 'tag-style';

      if (paymentState === 'paid') {
        color += ' bg-light-green-3';
      } else if (paymentState === 'partial') {
        color += ' bg-amber-3';
      } else if (paymentState === 'not_paid') {
        color += ' bg-red-5';
      }
      return color;
    };

    const amountWithSign = (isReversed: boolean, invoiceAmount: number) => {
      let amountStr = '';
      if (isReversed) {
        amountStr = `-${invoiceAmount}`;
      } else {
        amountStr = `+${invoiceAmount}`;
      }
      if (invoiceAmount === 0) {
        amountStr = '';
      }
      return amountStr;
    };

    const schema: SchemaInterface[] = [
      {
        fieldName: 'name',
        label: 'Factura',
        fieldType: 'textBold',
        mobileAllowed: true,
        isSortable: true,
      },
      {
        fieldName: 'ref',
        label: 'Referencia',
        fieldType: 'text',
        mobileAllowed: true,
        isSortable: true,
        columnWidth: 2,
      },
      {
        fieldName: 'moveType',
        label: 'Tipo',
        fieldType: 'text',
      },
      {
        fieldName: 'state',
        label: 'Estado',
        fieldType: 'text',
      },
      {
        fieldName: 'paymentState',
        label: 'Estado del pago',
        fieldType: 'tagColor',
      },
      {
        fieldName: 'date',
        label: 'Fecha',
        fieldType: 'text',
        isSortable: true,
      },
      {
        fieldName: 'partnerName',
        label: 'Cliente',
        fieldType: 'text',
        mobileAllowed: true,
        columnWidth: 2,
      },
      {
        fieldName: 'amount',
        label: 'Importe total',
        secondaryLabel: `${total.value}`,
        fieldType: 'tagMoney',
        align: 'right',
        mobileAllowed: true,
        isSortable: true,
      },
    ];
    const invoiceList = computed(() =>
      invoices.value.map((invoice) => ({
        id: invoice.id,
        folioId: invoice.folioId,
        name: invoice.name,
        ref: invoice.ref,
        moveType: invoice.moveType === 'out_invoice' ? 'Normal' : 'Rectificación',
        state: invoice.state === 'draft' ? 'Borrador' : 'Validada',
        paymentState:
          invoice.paymentState === 'paid'
            ? 'Pagada'
            : invoice.paymentState === 'partial'
            ? 'Parcialmente pagada'
            : 'No pagada',
        date: dateFormat(invoice.date ?? ''),
        partnerName: invoice.partnerName,
        amount: amountWithSign(invoice.isReversed, invoice.amount ?? 0),
        color: invoice.paymentState === 'paid' ? 'rgb(226, 251, 226)' : '#FFDDDD8A',
      }))
    );

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

    const sortInvoicesByField = (field: string) => {
      currentPage.value = 1;
      selectedOrder.value = { field, isDesc: !selectedOrder.value.isDesc };
    };

    const addItem = (event: number) => {
      invoicesSelected.value.push(invoices.value.find((el) => el.id === event) as InvoiceInterface);
    };

    const removeItem = (event: number) => {
      invoicesSelected.value = invoicesSelected.value.filter((el) => el.id !== event);
    };

    const openLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', true);
    };

    const openMailModal = () => {
      void store.dispatch('partners/removePartner');
      void store.dispatch('partners/removePartners');
      partners.value = [];
      emails.value = [];
      invalidAddress.value = false;
      partnerWithoutMailAddress.value = false;
      showBtnToAddEmail.value = false;
      isOpenPartnersMail.value = true;
      dialogService.open({
        header: 'Enviar factura/s por email',
        content: markRaw(InvoiceMailComponent),
        onAccept: async (result?: unknown) => {
          (result as string[]).forEach((element) => {
            addMailAddressToMails(element);
          });
          await sendOrPrintInvoicesByMail(true, false);
        },
        closable: true,
      });
    };

    const openSelectProperty = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'PropertySelector');
      void store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const getDateFormat = (date: string) => {
      if (date === null) {
        return date;
      }
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    };

    const removePartner = (partnerId: number) => {
      const partnerIndex = partners.value.findIndex((el) => el.id === partnerId);
      if (partnerIndex !== -1) {
        partners.value.splice(partnerIndex, 1);
      }
    };

    const removeEmail = (mailToRemove: string) => {
      emails.value.splice(emails.value.indexOf(mailToRemove), 1);
    };

    const getGuestFromVatDocNumber = async (name: string) => {
      partnerName.value = name;
      selectedPartnerId.value = 0;
      await store.dispatch('partners/removePartners');
      if (name.length >= 5) {
        fetchPartners({
          limit: 20,
          offset: 0,
          multiFieldSearch: name,
        });
      }
      emailToAdd.value = name;
      invalidAddress.value = false;
      partnerWithoutMailAddress.value = false;
      showBtnToAddEmail.value = false;
      state.email = name;
      v.value.$touch();
      if (!v.value.$invalid) {
        showBtnToAddEmail.value = true;
      }
    };

    const addMailAddressToMails = (mail: string) => {
      if (partners.value.length > 0 && partners.value.some((el) => !el.email)) {
        partnerWithoutMailAddress.value = true;
      } else {
        partnerWithoutMailAddress.value = false;
      }
      if (emails.value.includes(mail)) {
        return;
      }
      state.email = mail;
      v.value.$touch();
      if (!v.value.$invalid && mail !== '') {
        const mailExists = emails.value.find((el) => el === mail);
        const partnerMailExists = partners.value.find((el) => el.email === mail);
        if (!mailExists && !partnerMailExists) {
          emails.value.push(mail);
          invalidAddress.value = false;
        }
        emailToAdd.value = '';
        selectedPartner.value = null;
        selectedPartnerId.value = 0;
        itemsAutocompleteCustomer.value = [];
      } else {
        invalidAddress.value = true;
      }
      showBtnToAddEmail.value = false;
    };

    const addMailToPartner = () => {
      const partner = partners.value.find((el) => el.id === selectedPartnerId.value);
      if (partner && store.state.partners.currentPartner?.email) {
        partner.email = store.state.partners.currentPartner?.email;
      } else if (!partner && store.state.partners.currentPartner) {
        partners.value.push(store.state.partners.currentPartner);
        itemsAutocompleteCustomer.value = [];
        emailToAdd.value = '';
        selectedPartner.value = null;
        selectedPartnerId.value = 0;
      }
      if (partners.value.some((el) => !el.email)) {
        partnerWithoutMailAddress.value = true;
      } else {
        partnerWithoutMailAddress.value = false;
        showPartnerDialog.value = false;
      }
      void store.dispatch('partners/removePartner');
      void store.dispatch('partners/removePartners');
    };

    const fetchMoreInvoices = () => {
      const element = document.querySelector('.table-mobile');
      if (element) {
        const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
        if (bottom) {
          void store.dispatch('layout/showSpinner', true);
          currentPage.value += 1;
          const payload = {
            limit,
            offset: (currentPage.value - 1) * limit,
            filter: invoicesTextSearch.value,
            orderBy: selectedOrder.value.field ?? undefined,
            orderDesc: selectedOrder.value.isDesc,
            pmsPropertyId: activeProperty.value?.id,
            dateStart: dateRange.value[0],
            dateEnd: dateRange.value[1],
          };
          fetchInvoices({
            ...payload,
            pmsPropertyId: payload.pmsPropertyId ?? 0, // Ensure pmsPropertyId is a number
          });
        }
      }
    };
    const selectAllInvoices = () => {
      isInvoiceSelectedArray.value = invoices.value.map(() => true);
    };

    watch(activeProperty, async () => {
      currentPage.value = 1;
      await store.dispatch('invoices/clearInvoices');
      fetchInvoices({
        limit,
        offset: (currentPage.value - 1) * limit,
        filter: invoicesTextSearch.value,
        orderBy: selectedOrder.value.field ?? undefined,
        orderDesc: selectedOrder.value.isDesc,
        pmsPropertyId: activeProperty.value?.id ?? 0,
        dateStart: dateRange.value[0],
        dateEnd: dateRange.value[1],
      });
      invoicesSelected.value = [];
    });

    watch(invoices, () => {
      maxPage.value = Math.ceil(totalInvoices.value / limit);
    });

    watch(
      [invoicesTextSearch, selectedOrder, selectedPaymentState, selectedAgencyId, dateRange],
      async () => {
        let payload;
        currentPage.value = 1;
        if (invoicesTextSearch.value.length >= 5) {
          payload = {
            limit,
            offset: (currentPage.value - 1) * limit,
            filter: invoicesTextSearch.value,
            orderBy: selectedOrder.value.field ?? undefined,
            orderDesc: selectedOrder.value.isDesc,
            pmsPropertyId: activeProperty.value?.id,
          };
        } else {
          payload = {
            limit,
            offset: (currentPage.value - 1) * limit,
            orderBy: selectedOrder.value.field ?? undefined,
            orderDesc: selectedOrder.value.isDesc,
            pmsPropertyId: activeProperty.value?.id,
          };
        }
        if (selectedPaymentState.value !== '0') {
          Object.assign(payload, { paymentState: selectedPaymentState.value });
        } else {
          Object.assign(payload, { paymentState: '' });
        }
        if (selectedAgencyId.value !== 0) {
          Object.assign(payload, { originAgencyId: selectedAgencyId.value });
        } else {
          Object.assign(payload, { originAgencyId: '' });
        }
        if (dateRange.value[0] && dateRange.value[1]) {
          Object.assign(payload, { dateStart: dateRange.value[0], dateEnd: dateRange.value[1] });
        }
        if (dateRange.value[1] !== null && dateRange.value[0] !== null) {
          await store.dispatch('invoices/clearInvoices');
          fetchInvoices({
            ...payload,
            pmsPropertyId: payload.pmsPropertyId ?? 0, // Ensure pmsPropertyId is a number
          });
        }
      }
    );

    watch(selectedPropertyId, async () => {
      if (selectedPropertyId.value !== activeProperty.value?.id && selectedPropertyId.value !== 0) {
        await store.dispatch('properties/setActiveProperty', selectedPropertyId.value);
        void router.push(`/invoices/${selectedPropertyId.value}`);
      }
    });

    watch(showMailSendFeedback, () => {
      setTimeout(() => {
        showMailSendFeedback.value = false;
      }, 5000);
    });

    watch(
      invoicesSelected,
      () => {
        if (invoicesSelected.value.length > 0) {
          partnerList.value = invoicesSelected.value
            .map((el) => el.partnerId)
            .filter((id) => id !== null)
            .map((id) => id as number);
        } else {
          partnerList.value = [];
        }
      },
      { deep: true }
    );

    watch(
      isInvoiceSelectedArray,
      () => {
        invoicesSelected.value = invoices.value.filter(
          (el, index) => isInvoiceSelectedArray.value[index]
        );
      },
      { deep: true }
    );

    watch(isAllInvoicesSelected, () => {
      if (isAllInvoicesSelected.value) {
        selectAllInvoices();
      } else {
        invoicesSelected.value = [];
        isInvoiceSelectedArray.value = invoices.value.map(() => false);
      }
    });

    watch(selectedPartnerId, () => {
      if (selectedPartnerId.value === 0) {
        emailToAdd.value = '';
        showBtnToAddEmail.value = false;
        void store.dispatch('partners/removePartner');
        void store.dispatch('partners/removePartners');
        return;
      }
      const partner =
        store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
      const parterMailExists = partners.value.find((el) => el.id === partner?.id);
      if (partner && !parterMailExists) {
        partners.value.push(partner);
        partnerWithoutMailAddress.value = false;
        if (partners.value.some((el) => !el.email)) {
          partnerWithoutMailAddress.value = true;
        }
        selectedPartnerId.value = 0;
      }
      invalidAddress.value = false;
    });

    watch(partnersComputed, () => {
      itemsAutocompleteCustomer.value = partnersComputed.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
          el.vatNumber ? ')' : ''
        }`,
      }));
      if (partnersComputed.value.length > 0) {
        showBtnToAddEmail.value = true;
      }
    });

    watch(total, () => {
      const schemaAmount = schema.find((el) => el.fieldName === 'amount');
      if (schemaAmount) {
        schemaAmount.secondaryLabel = `${total.value.toFixed(2)} €`;
      }
    });

    onMounted(async () => {
      const dateRangeEnd = new Date();
      const dateRangeStart = new Date(
        dateRangeEnd.getFullYear(),
        dateRangeEnd.getMonth(),
        dateRangeEnd.getDate() - 30
      );
      dateRange.value = [dateRangeStart, dateRangeEnd];
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('agencies/fetchAgencies');
      } catch (error) {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
      isInvoiceSelectedArray.value = invoices.value.map(() => false);
    });

    onUnmounted(() => {
      void store.dispatch('invoices/clearInvoices');
    });

    return {
      dateRange,
      activeProperty,
      sortedProperties,
      selectedPropertyId,
      properties,
      imageActiveProperty,
      partners,
      maxPage,
      currentPage,
      invoices,
      agencies,
      total,
      orderOptions,
      selectedOrder,
      invoicesTextSearch,
      paymentStates,
      selectedPaymentState,
      selectedAgencyId,
      dateStart,
      dateEnd,
      v,
      totalInvoices,
      openInvoiceDialog,
      sendOrPrintInvoicesByMail,
      sortInvoicesByField,
      fetchMoreInvoices,
      schema,
      invoiceList,
      selectAllInvoices,
      addItem,
      removeItem,
      downloadInvoicesByMail,
      removeEmail,
      removePartner,
      getGuestFromVatDocNumber,
      openPartnerDialog,
      addMailAddressToMails,
      PartnerForm,
      addMailToPartner,
      openMailModal,
      invalidAddress,
      partnerName,
      emailToAdd,
      showBtnToAddEmail,
      showPartnerDialog,
      selectedPartnerId,
      itemsAutocompleteCustomer,
      isInvoiceSelectedArray,
      isSearchOpened,
      isOpenPartnersMail,
      emails,
      template,
      invoiceId,
      subject,
      getColor,
      invoiceDialog,
      currentInvoiceId,
      isRenderSaleLines,
      isRenderInvoiceLines,
      isAllInvoicesSelected,
      dateFormat,
      openLeftDrawer,
      openSelectProperty,
      getDateFormat,
      invoicesSelected,
      showMailSendFeedback,
      initialsActiveProperty,
      partnerWithoutMailAddress,
    };
  },
});
</script>
<style lang="scss" scoped>
.page-invoices {
  height: 100%;
  position: relative;
  .header-invoices {
    background-color: #f8f8f8;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1rem 0.5rem;
    padding-left: 30px;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
    justify-content: space-between;
    .header-left {
      display: flex;
      position: relative;
      align-items: center;
      height: 100%;
      .mobile-title {
        font-size: 20px;
        font-weight: bold;
      }
      .icon-menu {
        margin-right: 13px;
        width: 20px;
      }
      .select-property-desk {
        height: 40px;
        width: 300px;
        font-size: 15px;
        z-index: 8;
        display: none;
      }

      .property-desk {
        display: none;
        font-size: 17px;
        margin-left: 2rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: bold;
        img {
          margin-right: 1rem;
        }
      }
    }
    .header-right {
      display: flex;
      align-items: center;
      margin-right: 0.5rem;
      .action-btns {
        padding: 0.5rem;
        position: absolute;
        left: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        z-index: 50;
        .download-btn {
          margin-bottom: 0.5rem;
        }
        .print-btn {
          margin-bottom: 0.5rem;
        }
      }
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
  .second-header {
    display: grid;
    grid-template-areas:
      'payment-state date-range date-range'
      'checkbox total-invoices total-invoices';
    align-items: center;
    padding-bottom: 0.5rem;
    margin: 1rem 0.5rem 0 0.5rem;
    column-gap: 0.2rem;
    .filter {
      grid-area: search;
      height: 40px;
      display: none;
    }
    .payment-state {
      grid-area: payment-state;
      height: 40px;
      min-width: 185px;
    }
    .agencies-filter {
      grid-area: agencies;
      height: 40px;
      display: none;
    }
    .date-range {
      grid-area: date-range;
      height: 40px;
      .input-date-range {
        font-size: 0.8rem;
      }
    }
    .checkbox {
      width: 25px;
      height: 25px;
      margin-left: 1rem;
      margin-top: 0.5rem;
      grid-area: checkbox;
    }
    .total-invoices {
      font-size: 15px;
      font-weight: bold;
      grid-area: total-invoices;
      margin-left: auto;
      align-self: center;
      display: flex;
      flex-direction: column;
      .selected-invoices {
        margin-left: 1ch;
        font-weight: normal;
      }
    }
  }
  .page-container {
    position: relative;
    height: calc(100% - 50px);
    .main-content {
      height: 100%;
      margin-left: 1rem;
      .table-desktop {
        display: none;
      }
      .table-mobile {
        overflow-y: scroll;
        height: 100vh;
        padding-bottom: 300px;
        .invoice-mobile {
          display: grid;
          grid-template-columns: min-content auto;
          grid-template-areas:
            'checkbox name name name name name name amount'
            'checkbox date partner partner partner partner partner partner';
          border-bottom: 1px solid #e0e0e0;
          align-items: center;
          padding: 0.5rem;
          row-gap: 5px;
          .checkbox-invoice {
            grid-area: checkbox;
            justify-self: flex-start;
            .checkbox {
              width: 25px;
              height: 25px;
            }
          }
          .invoice-name {
            grid-area: name;
            font-weight: bold;
            font-size: 13px;
            max-width: 200px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            justify-self: flex-start;
            margin-left: 1rem;
          }
          .invoice-date {
            grid-area: date;
            font-size: 11px;
            justify-self: flex-start;
            margin-left: 1rem;
          }
          .invoice-amount {
            grid-area: amount;
            text-align: right;
            font-size: 13px;
            font-weight: bold;
            justify-self: end;
            .invoice-amount-wrap {
              background-color: rgb(226, 251, 226);
              padding: 2px 7px;
              border-radius: 30px;
            }
          }
          .invoice-partner-name {
            grid-area: partner;
            justify-self: end;
            font-size: 13px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            justify-self: end;
            max-width: 200px;
          }
        }
      }
    }
    .mail-send-feedback-tooltip {
      position: fixed;
      bottom: 0;
      right: 0;
      margin: 2rem;
      z-index: 100;
      .mail-send-feedback-text {
        background-color: #4caf50;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.17);
        font-weight: bold;
      }
    }
  }
}
.mail-content {
  padding-left: 1rem;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  .add-partner {
    margin: 1rem 1rem 1rem 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .search-partner-input {
      border-radius: 4px;
      height: 43px;
      flex: 3;
      max-width: 70%;
    }
    .add-partner-btn {
      margin-left: 1rem;
      background-color: $primary;
      color: white;
      border-radius: 4px;
      padding: 0.5rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      flex: 1;
      cursor: pointer;

      .add-partner-btn-text {
        margin-left: 5px;
        margin-top: 3px;
      }
    }
  }
  .partners-title {
    margin-bottom: 0.5rem;
  }

  .partners {
    border: 1px solid lightgrey;
    border-radius: 8px;
    padding: 0.25rem 0;
    .partner {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0.75rem;
      .partner-title {
        font-weight: bold;
      }
      .partner-name {
        .name-and-delete {
          display: flex;
          align-items: center;
        }
        .delete-icon {
          margin-left: 0.5rem;
          &:hover {
            cursor: pointer;
          }
        }
      }
      .add-email-address {
        color: $primary;
        text-decoration: underline;
        cursor: pointer;
        &:hover {
          color: $corduroy;
        }
      }
    }
  }
  .error {
    display: flex;
    align-items: center;
    margin-top: 1rem;
    color: red;
    .error-text {
      margin-left: 0.5rem;
      margin-top: 3px;
    }
  }

  .send-email-btn {
    margin-top: 1rem;
    justify-self: flex-end;
    background-color: $primary;
    color: white;
    border-radius: 4px;
    font-weight: bold;
    border: none;
    height: 40px;
    cursor: pointer;
  }
}

@media (min-width: 1024px) {
  .page-invoices {
    .header-invoices {
      height: 75px;
      margin-left: 1rem;
      padding-left: 7px;
      .header-left {
        .icon-menu {
          display: none;
        }
        .mobile-title {
          display: none;
        }
        .select-property-desk {
          display: block;
        }
      }
      .header-right {
        .select-property-mobile {
          display: none;
        }
        .icon-search {
          display: none;
        }
        .action-btns {
          flex-direction: row;
          position: relative;
          margin-right: 1rem;
          padding-bottom: 0;
          .download-btn,
          .print-btn,
          .email-btn {
            margin-bottom: 0;
            margin-left: 1rem;
          }
        }
      }
    }
    .second-header {
      display: flex;
      align-items: flex-start;
      margin-left: 1rem;
      gap: 0 1rem;
      background-color: #f8f8f8;
      margin-top: 0;
      margin-right: 0;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
      padding: 1rem 0.5rem;
      z-index: 5;
      position: relative;
      .filter {
        display: flex;
        min-width: 200px;
      }
      .date-range {
        height: 40px;
        max-width: 210px;
      }
      .agencies-filter {
        display: flex;
        max-width: 200px;
      }
      .payment-state {
        display: flex;
        max-width: 200px;
      }
      .checkbox {
        display: none;
      }
      .total-invoices {
        margin-left: 3rem;
        flex-direction: row;
      }
    }
    .page-container {
      .main-content {
        height: 100%;
        margin-left: 1rem;
        .table-desktop {
          display: flex;
          height: 100%;
        }
        .table-mobile {
          display: none;
        }
      }
      .title-dialog {
        color: black;
        font-size: 20px;
        margin-left: 1rem;
      }
    }
  }
  .mail-content {
    width: 600px;
    min-height: 300px;
    .add-partner-btn {
      justify-content: flex-start;
      .add-partner-btn-text {
        margin-top: 0;
        margin-bottom: 3px;
        font-size: 15px;
      }
    }
    .send-email-btn {
      margin-top: auto;
      margin-bottom: 1rem;
    }
    .title-dialog {
      color: black;
      font-size: 20px;
      margin-left: 1rem;
    }
  }
}
</style>
