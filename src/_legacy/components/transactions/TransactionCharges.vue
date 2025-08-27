<template>
  <div class="main-content">
    <div class="fields-row">
      <div class="input-group">
        <div class="label">Fecha:</div>
        <div class="input">
          <DatePicker
            v-model="chargeDate"
            :showOtherMonths="false"
            class="datepicker"
            showIcon
            inputClass="input-date-picker"
            dateFormat="dd/mm/yy"
            placeholder="DD/MM/YYYY"
            size="small"
          />
        </div>
      </div>
      <div class="input-group">
        <div class="label">Modo de {{ isRefund ? 'devolución' : 'cobro' }}:</div>
        <div class="input">
          <AppSelect
            size="small"
            class="select"
            placeholder="Selecciona opción"
            :options="transactionMethods"
            v-model="selectedTransactionMethod"
            optionLabel="label"
            optionValue="value"
          />
        </div>
      </div>
      <div class="input-group">
        <div class="label">Importe a {{ !isRefund ? 'cobrar' : 'devolver' }}:</div>
        <div class="input">
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
            @update:model-value="checkOverTotal()"
          />
        </div>
      </div>
    </div>

    <div class="toggle-wrapper">
      <ToggleSwitch size="small" v-model="requestedInvoice" class="toggle" />
      <span @click="requestedInvoice = !requestedInvoice">
        ¿El cliente solicita factura de anticipo?
      </span>
    </div>

    <div v-if="requestedInvoice" class="partner-row">
      <div class="doc-number-input" v-if="!selectedPartnerId">
        <AutocompleteComponent
          @textSearchChanges="getGuestFromVatDocNumber($event)"
          @addNew="openNewPartnerForm()"
          id="partners-autocomplete-charge"
          v-model="selectedPartnerId"
          :items="itemsAutocompleteCustomer"
          :disable="forbiddenTransactionMethod()"
          placeholderValue="Busqueda por DNI, NIF..."
          placeholderShowingOptions="Busqueda por DNI, NIF..."
        >
          <template #icon>
            <img src="/app-images/search.svg" />
          </template>
        </AutocompleteComponent>
      </div>
      <div
        v-else-if="selectedPartnerId !== 0 && requestedInvoice"
        :class="requestedInvoice && !selectedPartner ? 'partner-input-error' : 'partner-input'"
        class="selected-partner"
        @click="openPartnerForm()"
      >
        <div class="partner-name">
          {{ currentPartner ? currentPartner.name : partnerName }}
        </div>
        <CustomIcon
          imagePath="/app-images/delete.svg"
          width="17px"
          height="17px"
          color="#3F4443"
          @click.stop="restorePartner"
          class="icon"
        />
      </div>
    </div>
    <div class="return-reason" v-if="isRefund">
      <div class="input-group">
        <div class="label">Motivo de devolución</div>
        <div class="input">
          <AppTextArea
            v-model="reference"
            :rows="1"
            size="small"
            class="textarea"
            :disable="forbiddenTransactionMethod()"
          />
        </div>
      </div>
    </div>

    <div
      class="feedback-row"
      v-if="
        !isEdit && !isRefund && chargeAmount && chargeAmount >= Number(amount) && Number(amount) > 0
      "
    >
      <p>
        Vas a efectuar el cobro de {{ amount.toFixed(2) }} €<span v-if="currentPartner">
          a {{ currentPartner.name }}</span
        ><span v-if="Number(chargeAmount.toFixed(2)) - Number(amount.toFixed(2)) > 0"
          >, quedan pendientes {{ Number(chargeAmount - amount).toFixed(2) }} € a pagar.
        </span>
      </p>
    </div>

    <div class="feedback-row" v-if="!isEdit && isRefund && Number(amount.toFixed(2)) < 0">
      Vas a efectuar la devolución de {{ amount.toFixed(2) }} €
    </div>

    <div
      class="feedback-row"
      v-if="
        folio?.pendingAmount &&
        Number(amount.toFixed(2)) > Number(folio.pendingAmount.toFixed(2)) &&
        !isRefund &&
        !isEdit
      "
    >
      <span class="error">
        Vas a realizar un cobro [{{ amount.toFixed(2) }} €] por encima del total pendiente a pagar
        [{{ folio.pendingAmount }}
        €]
      </span>
    </div>

    <div class="forbidden-journal-row" v-if="forbiddenTransactionMethod()">
      <span class="error" v-if="selectedTransactionMethod">
        {{ !isRefund ? 'Los cobros' : 'Las devoluciones' }} del diario
        {{ journalName(selectedTransactionMethod) }} no se pueden modificar
      </span>
    </div>

    <div class="forbidden-journal-row" v-if="isAmountError">
      <span class="error"> El total a cobrar no puede ser negativo </span>
    </div>

    <div class="forbidden-journal-row" v-if="requestedInvoice && !selectedPartner">
      <span class="error"> Cliente Obligatorio </span>
    </div>

    <div class="buttons">
      <AppButton
        label="Guardar"
        raised
        size="small"
        class="button"
        :disabled="disallowSave"
        :class="{
          disabled: disallowSave,
        }"
        @click="createTransaction()"
      />
      <AppButton
        @click="$emit('close')"
        label="Cancelar"
        raised
        size="small"
        severity="secondary"
        class="button"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  type Ref,
  markRaw,
} from 'vue';
import { type AxiosResponse } from 'axios';
import useVuelidate from '@vuelidate/core';
import { required, decimal } from '@vuelidate/validators';

import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';

import { type PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';
import { type ReservationInterface } from '@/_legacy/interfaces/ReservationInterface';
import { type ServiceInterface } from '@/_legacy/interfaces/ServiceInterface';

import { useStore } from '@/_legacy/store';
import { usePartner } from '@/_legacy/utils/usePartner';
import { dialogService } from '@/_legacy/services/DialogService';

import PartnerForm from '@/_legacy/components/partners/PartnerForm.vue';
import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';

interface ServiceToPayInterface {
  isSelectedToPay: boolean;
  service: ServiceInterface;
}

interface ReservationsToPayInterface {
  isSelectedToPay: boolean;
  reservation: ReservationInterface;
  amount: number;
  services: ServiceToPayInterface[];
}
export default defineComponent({
  emits: ['textSearchChanges', 'close'],
  components: {
    DatePicker,
    AppSelect: Select,
    InputNumber,
    AppTextArea: Textarea,
    ToggleSwitch,
    AutocompleteComponent,
    CustomIcon,
    AppButton: Button,
  },
  props: {
    isRefund: {
      type: Boolean,
      required: false,
    },
    isEdit: {
      type: Boolean,
      required: false,
    },
    transactionId: {
      type: Number,
      required: false,
    },
    partnerId: {
      type: Number,
      required: false,
    },
    chargeAmount: {
      type: Number,
      required: false,
    },
  },
  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();
    const today = new Date();
    const router = useRouter();

    const requestedInvoice = ref(false);
    const partnerName: Ref<string | null> = ref('');
    const documentNumber = ref('');
    const reference = ref('');
    const reservationsToPay = ref([] as ReservationsToPayInterface[]);
    const partnerDialog = ref(false);
    const isAmountError = ref(false);
    const selectedTransactionMethod = ref(0);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const selectedPartnerId = ref(0);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const roomIds = ref([] as number[]);
    const amount = ref(0);
    const chargeDate = ref(new Date());

    const folio = computed(() => store.state.folios.currentFolio);
    const reservations = computed(() => store.state.reservations.reservations);
    const currentPartner = computed(() => store.state.partners.currentPartner);
    const partners = computed(() => store.state.partners.partners);

    const transaction = computed(() =>
      store.state.folios.transactions.find((el) => el.id === props.transactionId),
    );

    const transactionMethod = computed(() => {
      let payMethod;
      if (transaction.value?.journalId) {
        payMethod = store.state.accountJournals.accountJournals.find(
          (el) => el.id === transaction.value?.journalId,
        )?.name;
      }
      return payMethod;
    });

    const transactionMethods = computed(() =>
      store.state.accountJournals.accountJournals
        .filter((journal) => journal.allowedPayments)
        .map((el) => ({ value: el.id, label: el.name })),
    );

    const transactionDate = computed(() => {
      let date = new Date(0);
      if (transaction.value?.date) {
        date = new Date(transaction.value.date);
      }
      return date;
    });

    const disallowSave = computed(() => {
      let result = false;
      if (
        !chargeDate.value ||
        !selectedTransactionMethod.value ||
        !amount.value ||
        amount.value === 0 ||
        isAmountError.value ||
        (requestedInvoice.value && !selectedPartner.value) ||
        forbiddenTransactionMethod()
      ) {
        result = true;
      }
      return result;
    });

    const notNegativeNumber = () => {
      if (!props.isRefund && amount.value && Number(amount.value) < 0) {
        return false;
      }
      return true;
    };

    const validationRules = computed(() => ({
      amount: {
        required,
        decimal,
        notNegativeNumber,
      },
    }));

    const validator = useVuelidate(validationRules, {
      amount,
    });

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
    };

    const forbiddenTransactionMethod = () => {
      if (selectedTransactionMethod.value) {
        const journal = store.state.accountJournals.accountJournals.find(
          (el) => el.id === selectedTransactionMethod.value,
        );
        if (journal && !journal.allowedPayments) {
          return true;
        }
      }
      return false;
    };

    const createTransaction = async () => {
      if (amount.value === 0) {
        return;
      }
      const journalId = store.state.accountJournals.accountJournals.find(
        (el) => el.id === selectedTransactionMethod.value,
      )?.id;

      const date = chargeDate.value;
      let partnerId = null;

      if (partnerName.value && store.state.partners.currentPartner) {
        partnerId = store.state.partners.currentPartner?.id;
      }
      let payload = null;
      payload = {
        id: -1,
        amount: amount.value,
        journalId,
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        partnerId,
        folioId: folio.value?.id,
        reference: '',
      };
      let transactionId = 0;
      let folioTransactionIds: AxiosResponse<number[]>;
      void store.dispatch('layout/showSpinner', true);
<<<<<<< HEAD
      try {
        if (!props.isRefund) {
          if (!props.isEdit) {
            payload = { ...payload, requestedInvoice: requestedInvoice.value };
          }
          folioTransactionIds = (await store.dispatch(
            'folios/createFolioCharge',
            payload,
          )) as AxiosResponse<number[]>;
          if (requestedInvoice.value) {
            const result = folioTransactionIds.data.filter(
              (id) => !store.state.folios.transactions.some((tr) => tr.id === id),
            );
            if (result.length > 0) {
              transactionId = result[0];
            }
            await store.dispatch('transactions/createDownPaymentInvoice', {
              originDownPaymentId: transactionId,
              partnerId: selectedPartner.value?.id,
            });
            await store.dispatch('folios/fetchFolioTransactions', folio.value?.id);
            await store.dispatch('folios/fetchFolioInvoices', folio.value?.id);
            await store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
            if (router.currentRoute.value.name === 'planning') {
              await store.dispatch('planning/fetchPlanning', {
                dateStart: store.state.planning.dateStart,
                dateEnd: store.state.planning.dateEnd,
                propertyId: store.state.properties.activeProperty?.id,
                availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
              });
            }
          }
        } else {
          if (reference.value !== '') {
            payload.reference = reference.value;
          }
          await store.dispatch('folios/createFolioRefund', payload);
        }
        await store.dispatch('folios/fetchFolio', folio.value?.id);
        await store.dispatch('folios/fetchFolioTransactions', folio.value?.id);
        await store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
        if (router.currentRoute.value.name === 'planning') {
=======
      if (!props.isRefund) {
        if (!props.isEdit) {
          payload = { ...payload, requestedInvoice: requestedInvoice.value };
        }
        folioTransactionIds = (await store.dispatch(
          'folios/createFolioCharge',
          payload
        )) as AxiosResponse<number[]>;
        if (requestedInvoice.value) {
          const result = folioTransactionIds.data.filter(
            (id) => !store.state.folios.transactions.some((tr) => tr.id === id)
          );
          if (result.length > 0) {
            transactionId = result[0];
          }
          await store.dispatch('transactions/createDownPaymentInvoice', {
            originDownPaymentId: transactionId,
            partnerId: selectedPartner.value?.id,
          });
          await store.dispatch('folios/fetchFolioTransactions', folio.value?.id);
          await store.dispatch('folios/fetchFolioInvoices', folio.value?.id);
          await store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
>>>>>>> e90bdfc ([REF] pms-pwa: Refactor error handling in various pages and utilities)
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
        }
<<<<<<< HEAD
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
        void store.dispatch('layout/setForceMoveFolioTab', 'charges');
        context.emit('close');
=======
      } else {
        if (reference.value !== '') {
          payload.reference = reference.value;
        }
        await store.dispatch('folios/createFolioRefund', payload);
>>>>>>> e90bdfc ([REF] pms-pwa: Refactor error handling in various pages and utilities)
      }
      await store.dispatch('folios/fetchFolio', folio.value?.id);
      await store.dispatch('folios/fetchFolioTransactions', folio.value?.id);
      await store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
      await store.dispatch('planning/fetchPlanning', {
        dateStart: store.state.planning.dateStart,
        dateEnd: store.state.planning.dateEnd,
        propertyId: store.state.properties.activeProperty?.id,
        availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
      });
      void store.dispatch('layout/showSpinner', false);
      void store.dispatch('layout/setForceMoveFolioTab', 'charges');
      context.emit('close');
    };

    const openPartnerForm = () => {
      dialogService.open({
        header: 'Editar cliente',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const openNewPartnerForm = async () => {
      await store.dispatch('partners/removePartner');
      await store.dispatch('countryStates/removeCountryStates');
      partnerName.value = '';
      partnerDialog.value = true;
      dialogService.open({
        header: 'Nuevo cliente',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const checkOverTotal = () => {
      validator.value.amount.$touch();
      if (validator.value.amount.$invalid) {
        isAmountError.value = true;
      } else {
        isAmountError.value = false;
      }
    };

    const restorePartner = () => {
      if (selectedPartnerId.value) {
        void store.dispatch('partners/removePartner');
        partnerName.value = '';
        selectedPartner.value = null;
        selectedPartnerId.value = 0;
      }
    };

    const showRequestInvoiceToogle = () => {
      let showBtn = false;
      if (folio.value?.lastCheckout) {
        today.setHours(0, 0, 0, 0);
        const lastCheckout = new Date(folio.value.lastCheckout);
        lastCheckout.setHours(0, 0, 0, 0);
        const dateCharge = new Date(chargeDate.value);
        if (
          folio.value?.invoiceStatus === 'to_invoice' &&
          dateCharge.getTime() < lastCheckout.getTime() &&
          lastCheckout.getTime() > today.getTime() &&
          !props.isRefund &&
          !props.isEdit
        ) {
          showBtn = true;
        }
      }
      return showBtn;
    };

    const journalName = (journalId: number) =>
      store.state.accountJournals.accountJournals.find((el) => el.id === journalId)?.name;

    watch(selectedPartnerId, () => {
      const partner =
        store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
      selectedPartner.value = partner;
      partnerName.value = partner?.name ?? null;
      if (partner) {
        void store.dispatch('partners/setCurrentPartner', partner);
      }
    });

    watch(currentPartner, () => {
      const partner = currentPartner.value;
      selectedPartner.value = partner;
      partnerName.value = partner?.name ?? null;
      if (partner) {
        void store.dispatch('partners/setCurrentPartner', partner);
      }
    });

    watch(partners, () => {
      itemsAutocompleteCustomer.value = partners.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${
          el.vatNumber ? ')' : ''
        }`,
      }));
    });

    onMounted(async () => {
      amount.value =
        !props.isEdit && !props.isRefund
          ? (props.chargeAmount ?? 0)
          : (transaction.value?.amount ?? 0);
      if (props.isEdit) {
        chargeDate.value = new Date(transactionDate.value);
      }
      void store.dispatch('layout/showSpinner', true);
      if (reservations.value) {
        await Promise.all(
          reservations.value.map(async (reservation: ReservationInterface) => {
            await store.dispatch('reservationLines/fetchReservationLines', reservation.id);
            if (store.state.reservationLines.reservationLines) {
              const newRoomIds = store.state.reservationLines.reservationLines
                .map((el) => el.roomId)
                .filter((roomId): roomId is number => roomId !== undefined);

<<<<<<< HEAD
                // avoid duplicates when adding to the array
                newRoomIds.forEach((roomId) => {
                  if (!roomIds.value.includes(roomId)) {
                    roomIds.value.push(roomId);
                  }
                });
              }
            }),
          );
          await store.dispatch('accountJournals/fetchAccountJournals', {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            roomIds: roomIds.value,
          });
        }

        await store.dispatch(
          'folioServices/fetchFolioServices',
          store.state.folios.currentFolio?.id,
        );
        reservations.value?.forEach((reservation) => {
          const services: ServiceToPayInterface[] = [];
          let reservationAmount = reservation.priceTotal ? reservation.priceTotal : 0;
          store.state.folioServices.folioServices.forEach((service) => {
            if (reservation.id === service.reservationId && !service.isBoardService) {
              if (service.priceTotal) {
                reservationAmount -= service.priceTotal;
              }
              const serviceToPay = {
                isSelectedToPay: false,
                service,
              };
              services.push(serviceToPay);
=======
              // avoid duplicates when adding to the array
              newRoomIds.forEach((roomId) => {
                if (!roomIds.value.includes(roomId)) {
                  roomIds.value.push(roomId);
                }
              });
>>>>>>> e90bdfc ([REF] pms-pwa: Refactor error handling in various pages and utilities)
            }
          })
        );
        await store.dispatch('accountJournals/fetchAccountJournals', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          roomIds: roomIds.value,
        });
      }

      await store.dispatch('folioServices/fetchFolioServices', store.state.folios.currentFolio?.id);
      reservations.value?.forEach((reservation) => {
        const services: ServiceToPayInterface[] = [];
        let reservationAmount = reservation.priceTotal ? reservation.priceTotal : 0;
        store.state.folioServices.folioServices.forEach((service) => {
          if (reservation.id === service.reservationId && !service.isBoardService) {
            if (service.priceTotal) {
              reservationAmount -= service.priceTotal;
            }
            const serviceToPay = {
              isSelectedToPay: false,
              service,
            };
            services.push(serviceToPay);
          }
        });
        if (reservation.priceTotal) {
          reservationsToPay.value.push({
            reservation,
            amount: reservationAmount,
            isSelectedToPay: false,
            services,
          });
        }
<<<<<<< HEAD
        if (props.isEdit) {
          selectedTransactionMethod.value =
            store.state.accountJournals.accountJournals.find(
              (el) =>
                el.id ===
                store.state.folios.transactions.find((trans) => trans.id === props.transactionId)
                  ?.journalId,
            )?.id ?? 0;
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
=======
      });
      if (props.partnerId) {
        void store.dispatch('partners/fetchCurrentPartner', props.partnerId);
>>>>>>> e90bdfc ([REF] pms-pwa: Refactor error handling in various pages and utilities)
      }
      if (props.isEdit) {
        selectedTransactionMethod.value =
          store.state.accountJournals.accountJournals.find(
            (el) =>
              el.id ===
              store.state.folios.transactions.find((trans) => trans.id === props.transactionId)
                ?.journalId
          )?.id ?? 0;
      }

      void store.dispatch('layout/showSpinner', false);
    });

    onUnmounted(() => {
      void store.dispatch('accountJournals/fetchAccountJournals', {
        pmsPropertyId: store.state.properties.activeProperty?.id,
      });
      if (currentPartner.value) {
        void store.dispatch('partners/removePartner');
      }
    });

    return {
      store,
      folio,
      reservations,
      transaction,
      transactionDate,
      transactionMethods,
      transactionMethod,
      selectedTransactionMethod,
      amount,
      requestedInvoice,
      chargeDate,
      disallowSave,
      partnerName,
      currentPartner,
      documentNumber,
      reference,
      reservationsToPay,
      partnerDialog,
      selectedPartnerId,
      selectedPartner,
      itemsAutocompleteCustomer,
      isAmountError,
      journalName,
      getGuestFromVatDocNumber,
      createTransaction,
      checkOverTotal,
      openPartnerForm,
      openNewPartnerForm,
      forbiddenTransactionMethod,
      restorePartner,
      showRequestInvoiceToogle,
    };
  },
});
</script>
<style scoped lang="scss">
.main-content {
  .fields-row {
    display: flex;
    flex-direction: column;
    .input-group {
      .label {
        font-weight: bold;
      }
      .datepicker,
      .select,
      .input {
        width: 100%;
      }
    }
  }
  .toggle-wrapper {
    display: flex;
    align-items: center;
    margin-top: 0.5rem;
    user-select: none;
    cursor: pointer;
    .toggle {
      margin-right: 0.5rem;
    }
  }
  .partner-row {
    margin-top: 0.5rem;
    .doc-number-input {
      height: 33px;
    }
    .selected-partner {
      user-select: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: lightgrey 1px solid;
      padding: 0.5rem;
      border-radius: 5px;
      .icon {
        cursor: pointer;
      }
    }
  }
  .return-reason {
    margin-top: 0.5rem;
    .label {
      font-weight: bold;
    }
    .textarea {
      margin-top: 0.5rem;
      width: 100%;
      height: 100px;
    }
  }
  .feedback-row {
    margin-top: 0.5rem;
    font-weight: bold;
  }
  .forbidden-journal-row {
    margin-top: 0.5rem;
    .error {
      color: red;
      font-weight: bold;
    }
  }
  .buttons {
    padding: 1rem 0;
    .button {
      display: block;
      width: 100%;
      margin-top: 1rem;
      &:first-child {
        margin-top: 0;
      }
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}
@media (min-width: 1024px) {
  .main-content {
    height: auto;
    .fields-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .input-group {
        margin-right: 0.5rem;
        &:last-child {
          margin-right: 0;
        }
        .datepicker,
        .select,
        .input {
          flex: 1;
        }
      }
    }
    .buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 0;
      padding-bottom: 0;
      .button {
        width: auto;
        margin: 0;
        margin-left: 1rem;
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
