<template>
  <div class="main-content">
    <span class="read-only-info text-orange" v-if="transaction && isReconcilied">
      Datos en modo solo lectura
    </span>
    <div class="charges-row">
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
            :disabled="transaction && isReconcilied"
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
            :options="accountJournals"
            v-model="accountJournal"
            optionLabel="label"
            optionValue="value"
            :disabled="transaction && isReconcilied"
          />
        </div>
      </div>
      <div class="input-group">
        <div class="label">Importe {{ !isRefund ? 'cobrado' : 'devuelto' }}:</div>
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
            :disabled="transaction && isReconcilied"
            :prefix="isRefund && amount !== 0 ? '-' : ''"
            @update:model-value="checkOverTotal()"
          />
        </div>
      </div>
    </div>

    <div class="partner-row">
      <div class="label">{{ isCustomer ? 'Cliente' : 'Proveedor' }}:</div>
      <div class="doc-number-input" v-if="!selectedPartner">
        <AutocompleteComponent
          @textSearchChanges="getGuestFromVatDocNumber($event)"
          @addNew="openNewPartnerDialog()"
          id="partners-autocomplete-charge"
          v-model="selectedPartnerId"
          :items="itemsAutocompleteCustomer"
          :disable="transaction && isReconcilied"
          :placeholderValue="'Busqueda por DNI, NIF...'"
          :placeholderShowingOptions="'Busqueda por DNI, NIF...'"
        >
          <template #icon>
            <img src="/app-images/search.svg" />
          </template>
        </AutocompleteComponent>
      </div>
      <div v-else class="selected-partner" @click="openPartnerDialog()">
        <div class="partner-name">
          {{ selectedPartner.name ?? '' }}
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
    <div class="charges-row">
      <div class="input-group">
        <div class="label">Referencia:</div>
        <div class="input">
          <InputText
            v-model="reference"
            :disabled="transaction && isReconcilied"
            class="input-text"
            size="small"
            :style="{
              width: '100%',
            }"
          />
        </div>
      </div>
    </div>
    <div class="buttons">
      <AppButton
        :label="'Guardar'"
        raised
        size="small"
        class="button"
        :disable="isAmountError || (transaction && isReconcilied)"
        :class="{
          disabled: isAmountError || (transaction && isReconcilied),
        }"
        @click="createOrEditTransaction()"
      />
      <AppButton
        @click="$emit('close')"
        :label="'Cancelar'"
        raised
        size="small"
        severity="secondary"
        class="button"
      />
    </div>
    <div class="feedback-row" v-if="amount !== 0 && amount && !transaction">
      Vas a efectuar un pago de {{ amount }} €
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, type Ref, watch, onMounted, markRaw } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, decimal } from '@vuelidate/validators';

import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import AutocompleteComponent from '@/components/roomdooComponents/AutocompleteComponent.vue';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';

import { type PartnerInterface } from '@/interfaces/PartnerInterface';
import { type TransactionInterface } from '@/interfaces/TransactionInterface';

import PartnerForm from '@/components/partners/PartnerForm.vue';

import { useStore } from '@/store';
import { usePartner } from '@/utils/usePartner';
import { dialogService } from '@/services/DialogService';

export default defineComponent({
  components: {
    DatePicker,
    AppSelect: Select,
    InputNumber,
    InputText,
    CustomIcon,
    AutocompleteComponent,
    AppButton: Button,
  },
  props: {
    transaction: {
      type: Object as () => TransactionInterface,
      required: false,
    },
    isRefund: {
      type: Boolean,
      required: false,
    },
    isCustomer: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: ['transactionCreated', 'close'],
  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();

    const accountJournal = ref(0);
    const reference = ref('');
    const amount = ref(0);
    const isReconcilied = ref(false);
    const partnerName: Ref<string | null> = ref('');
    const documentNumber = ref('');
    const partnerDialog = ref(false);
    const isAmountError = ref(false);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const selectedPartnerId = ref(0);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const chargeDate = ref();

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const currentPartner = computed(() => store.state.partners.currentPartner);
    const partners = computed(() => store.state.partners.partners);

    const accountJournals = computed(() =>
      store.state.accountJournals.accountJournals
        .filter((journal) => journal.allowedPayments)
        .map((el) => ({ value: el.id, label: el.name }))
    );

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

    const createOrEditTransaction = async () => {
      let partnerId = null;

      if (partnerName.value && store.state.partners.currentPartner) {
        partnerId = store.state.partners.currentPartner?.id;
      }
      const payload = {
        id: props.transaction ? props.transaction.id : 0,
        journalId: accountJournal.value,
        pmsPropertyId: activeProperty.value?.id,
        amount: amount.value,
        date: chargeDate.value,
        transactionType:
          props.isCustomer && props.transaction
            ? props.transaction.transactionType
            : 'supplier_outbound',
        reference: reference.value,
        partnerId,
      };
      void store.dispatch('layout/showSpinner', true);
      try {
        if (props.transaction) {
          await store.dispatch('transactions/editTransaction', payload);
        } else {
          await store.dispatch('transactions/createTransaction', payload);
        }

        dialogService.open({
          header: props.transaction ? 'Pago modificado' : 'Pago realizado',
          content: props.transaction ? 'Pago modificado con éxito' : 'Pago realizado con éxito',
          btnAccept: 'Ok',
        });

        context.emit('transactionCreated');
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
        context.emit('close');
      }
    };

    const openPartnerDialog = () => {
      partnerDialog.value = true;
    };

    const openNewPartnerDialog = async () => {
      await store.dispatch('partners/removePartner');
      await store.dispatch('countryStates/removeCountryStates');
      partnerName.value = '';
      partnerDialog.value = true;
      dialogService.open({
        header: 'Nuevo contacto',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };
    const restorePartner = () => {
      console.log('restorePartner');
      void store.dispatch('partners/removePartner');
      partnerName.value = '';
      selectedPartner.value = null;
      selectedPartnerId.value = 0;

      console.log('selectedPartnerId', selectedPartner.value);
    };

    const notNegativeNumber = () => {
      if (!props.isRefund && amount.value && amount.value < 0) {
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

    const checkOverTotal = () => {
      validator.value.amount.$touch();
      if (validator.value.amount.$invalid) {
        isAmountError.value = true;
      } else {
        isAmountError.value = false;
      }
    };

    watch(selectedPartnerId, () => {
      console.log('selectedPartnerId', selectedPartnerId.value);
      const partner =
        store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
      selectedPartner.value = partner;
      partnerName.value = partner ? partner.name : '';
      if (partner) {
        void store.dispatch('partners/setCurrentPartner', partner);
      }
    });

    watch(currentPartner, () => {
      console.log('currentPartner', currentPartner.value);
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
      if (props.transaction) {
        amount.value = props.transaction.amount;
        reference.value = props.transaction.reference;
        const journal = accountJournals.value.find(
          (el) => props.transaction && el.value === props.transaction.journalId
        );
        if (journal) {
          accountJournal.value = journal.value;
        }
        chargeDate.value = props.transaction.date;
        isReconcilied.value = props.transaction.isReconcilied;
        if (props.transaction.partnerId) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store
              .dispatch('partners/fetchCurrentPartner', props.transaction.partnerId)
              .then(() => {
                console.log(
                  'store.state.partners.currentPartner',
                  store.state.partners.currentPartner
                );
                if (store.state.partners.currentPartner) {
                  partnerName.value = store.state.partners.currentPartner.name ?? '';
                  selectedPartner.value = store.state.partners.currentPartner;
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
        }
      }
    });
    return {
      store,
      currentPartner,
      reference,
      accountJournals,
      accountJournal,
      amount,
      isReconcilied,
      chargeDate,
      partnerName,
      partnerDialog,
      selectedPartnerId,
      selectedPartner,
      documentNumber,
      itemsAutocompleteCustomer,
      isAmountError,
      restorePartner,
      createOrEditTransaction,
      openPartnerDialog,
      openNewPartnerDialog,
      getGuestFromVatDocNumber,
      checkOverTotal,
    };
  },
});
</script>
<style scoped lang="scss">
.main-content {
  .read-only-info {
    font-size: 1rem;
    font-weight: bold;
    text-decoration: underline;
  }
  .charges-row {
    display: flex;
    flex-direction: column;
    .input-group {
      .label {
        margin-top: 1rem;
        font-weight: bold;
        user-select: none;
      }
      .datepicker,
      .select,
      .input {
        width: 100%;
      }
    }
  }
  .partner-row {
    margin-top: 0.5rem;
    .label {
      font-weight: bold;
      user-select: none;
    }
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
    width: 700px;
    min-height: auto;
    .charges-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .input-group {
        margin-right: 0.5rem;
        flex: 1;
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
