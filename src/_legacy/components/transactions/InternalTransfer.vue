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
        <div class="label">Total (€):</div>
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
          />
        </div>
      </div>
    </div>
    <div class="charges-row">
      <div class="input-group">
        <div class="label">Diario de origen:</div>
        <div class="input">
          <AppSelect
            size="small"
            class="select"
            placeholder="Selecciona opción"
            :options="accountJournals"
            v-model="originAccountJournal"
            optionLabel="label"
            optionValue="value"
            :disabled="transaction && isReconcilied"
          />
        </div>
      </div>

      <div class="input-group">
        <div class="label">Diario de destino:</div>
        <div class="input">
          <AppSelect
            size="small"
            class="select"
            placeholder="Selecciona opción"
            :options="destinationAccountJournals"
            v-model="destinationAccountJournal"
            optionLabel="label"
            optionValue="value"
            :disabled="transaction && isReconcilied"
          />
        </div>
      </div>
    </div>
    <div class="charges-row">
      <div class="input-group">
        <div class="label">Motivo del pago:</div>
        <div class="input">
          <InputText
            size="small"
            class="input"
            v-model="reference"
            :disabled="transaction && isReconcilied"
          />
        </div>
      </div>
    </div>
    <div class="buttons">
      <AppButton
        label="Guardar"
        raised
        size="small"
        class="button"
        :disable="transaction && isReconcilied"
        :class="{
          disabled: transaction && isReconcilied,
        }"
        @click="createOrEditTransfer()"
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

    <div class="feedback-row" v-if="amount && amount !== 0 && !transaction">
      Vas a efectuar una transferencia de {{ amount }} €
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, type Ref, onMounted } from 'vue';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import { type TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';

import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    DatePicker,
    InputNumber,
    AppSelect: Select,
    InputText,
    AppButton: Button,
  },
  props: {
    transaction: {
      type: Object as () => TransactionInterface,
      required: false,
    },
  },
  emits: ['transferCreated', 'close'],
  setup(props, context) {
    const store = useStore();
    const today = new Date();
    const amount = ref(0);
    const reference = ref('');
    const isReconcilied = ref(false);
    const originAccountJournal = ref();
    const destinationAccountJournal = ref();
    const chargeDate = ref();

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const accountJournals = computed(() =>
      store.state.accountJournals.accountJournals
        .filter((journal) => journal.allowedPayments)
        .map((el) => ({ value: el.id, label: el.name }))
    );

    const destinationAccountJournals = computed(() =>
      accountJournals.value.filter((el) => el.value !== originAccountJournal.value)
    );

    const createOrEditTransfer = async () => {
      const year = chargeDate.value.getFullYear();
      const month = String(chargeDate.value.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
      const day = String(chargeDate.value.getDate()).padStart(2, '0');

      const date = `${year}-${month}-${day}`;

      const payload = {
        id: props.transaction ? props.transaction.id : 0,
        journalId: originAccountJournal.value,
        destinationJournalId: destinationAccountJournal.value,
        pmsPropertyId: activeProperty.value?.id,
        amount: amount.value,
        date,
        transactionType: 'internal_transfer',
        reference: reference.value,
      };
      void store.dispatch('layout/showSpinner', true);
      try {
        if (props.transaction) {
          await store.dispatch('transactions/editTransaction', payload);
        } else {
          await store.dispatch('transactions/createTransaction', payload);
        }

        const message = props.transaction
          ? 'Transferencia modificada con éxito'
          : 'Transferencia interna creada con éxito';
        dialogService.open({
          header: 'Éxito',
          content: message,
          btnAccept: 'Ok',
        });

        context.emit('transferCreated');
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

    const selectOriginJournalIsOverflow = () => {
      if (originAccountJournal.value && originAccountJournal.value?.label.length >= 25) {
        return true;
      }
      return false;
    };

    const selectDestinationJournalIsOverflow = () => {
      if (destinationAccountJournal.value && destinationAccountJournal.value?.label.length >= 25) {
        return true;
      }
      return false;
    };

    watch(originAccountJournal, () => {
      if (!props.transaction) {
        destinationAccountJournal.value = null;
      }
    });

    onMounted(() => {
      if (props.transaction) {
        amount.value = props.transaction.amount;
        reference.value = props.transaction.reference;
        originAccountJournal.value = props.transaction.journalId;
        destinationAccountJournal.value = props.transaction.destinationJournalId;
        if (props.transaction.date) {
          chargeDate.value = props.transaction.date;
          isReconcilied.value = props.transaction.isReconcilied;
        }
      }
    });
    return {
      store,
      reference,
      accountJournals,
      originAccountJournal,
      destinationAccountJournal,
      destinationAccountJournals,
      amount,
      chargeDate,
      createOrEditTransfer,
      isReconcilied,
      selectOriginJournalIsOverflow,
      selectDestinationJournalIsOverflow,
    };
  },
});
</script>
<style scoped lang="scss">
.main-content {
  height: auto;
  min-width: 500px;
  .read-only-info {
    margin-left: 1.5rem;
    margin-top: 1rem;
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
  .feedback-row {
    font-size: 16px;
    margin-left: 2rem;
    margin-bottom: 1rem;
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
