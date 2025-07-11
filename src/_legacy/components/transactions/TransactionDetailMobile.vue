<template>
  <div class="header">
    <div class="left">
      <img src="/app-images/arrow_forward_ios.svg" class="arrow-back" @click="goBack" />
      <div class="transaction-type">
        <img class="transaction-type-icon" :src="`/app-images/${getTransactionIconPath()}`" />
      </div>
    </div>
    <div class="middle">
      <div class="transaction-partner">
        {{ currentTransaction?.partnerName || currentTransaction?.name }}
      </div>
      <div class="transaction-type-text">
        {{ getTransactionType() }}
      </div>
    </div>
    <div class="right">
      <div class="transaction-amount">
        <span class="transaction-amount-wrap" :style="`background-color: ${getColor()};`">
          {{ getSign() }}€
        </span>
      </div>
    </div>
  </div>
  <div class="transaction-content">
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Código identificador</div>
      <div class="transaction-content-item-value-bold">
        {{ currentTransaction?.name }}
      </div>
    </div>
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Fecha</div>
      <div class="transaction-content-item-value">
        {{ getTransactionDate() }}
      </div>
    </div>
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Creado por</div>
      <div class="transaction-content-item-value">
        {{ getUserName() }}
      </div>
    </div>
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Referencia</div>
      <div class="transaction-content-item-value">
        {{ currentTransaction?.reference }}
      </div>
    </div>
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Tipo de movimiento</div>
      <div class="transaction-content-item-value-bold">
        {{ getTransactionType() }}
      </div>
    </div>
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Modo de pago</div>
      <div class="transaction-content-item-value-bold">
        {{ getJournalName() }}
      </div>
    </div>
    <div class="transaction-content-item">
      <div class="transaction-content-item-title">Importe</div>
      <div class="transaction-content-item-value">{{ getSign() }}€</div>
    </div>
    <div class="transaction-content-item" v-if="currentTransaction?.partnerName">
      <div class="transaction-content-item-title">Contacto relacionado</div>
      <div class="transaction-content-item-value">
        {{ currentTransaction?.partnerName }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from '@/_legacy/store';

export default defineComponent({
  setup() {
    const store = useStore();
    const currentTransaction = computed(() => store.state.transactions.currentTransaction);

    const goBack = () => {
      void store.dispatch('transactions/setCurrentTransaction', null);
      void store.dispatch('layout/rightDrawerDisplayed', false);
    };

    const getTransactionIconPath = () => {
      let iconPath = '';
      if (currentTransaction.value?.transactionType === 'internal_transfer') {
        iconPath = 'icon-internal-transaction.svg';
      } else if (currentTransaction.value?.transactionType === 'supplier_inbound') {
        iconPath = 'icon-supplier-transaction.svg';
      } else if (currentTransaction.value?.transactionType === 'customer_inbound') {
        iconPath = 'icon-customer-transaction.svg';
      } else if (
        currentTransaction.value?.transactionType === 'customer_outbound' ||
        currentTransaction.value?.transactionType === 'supplier_outbound'
      ) {
        iconPath = 'icon-refund.svg';
      }
      return iconPath;
    };

    const getTransactionType = () => {
      let type = '';
      if (currentTransaction.value?.transactionType === 'internal_transfer') {
        type = 'Transferencia interna';
      } else if (currentTransaction.value?.transactionType === 'customer_inbound') {
        type = 'Cobro a cliente';
      } else if (currentTransaction.value?.transactionType === 'customer_outbound') {
        type = 'Devolución a cliente';
      } else if (currentTransaction.value?.transactionType === 'supplier_outbound') {
        type = 'Pago a proveedor';
      } else if (currentTransaction.value?.transactionType === 'supplier_inbound') {
        type = 'Devolución de proveedor';
      }
      return type;
    };

    const getColor = () => {
      let color = '';

      if (
        currentTransaction.value?.transactionType === 'customer_inbound' ||
        currentTransaction.value?.transactionType === 'supplier_inbound'
      ) {
        color += '#E2FBE2';
      } else if (
        currentTransaction.value?.transactionType === 'customer_outbound' ||
        currentTransaction.value?.transactionType === 'supplier_outbound'
      ) {
        color += 'rgba(255, 221, 221, 0.54); ';
      } else if (currentTransaction.value?.transactionType === 'internal_transfer') {
        color += '#FFDDDD8A';
      }
      return color;
    };

    const getSign = () => {
      let amountStr = '';
      if (
        currentTransaction.value?.transactionType === 'customer_inbound' ||
        currentTransaction.value?.transactionType === 'supplier_inbound'
      ) {
        amountStr += `+ ${currentTransaction.value?.amount}`;
      }
      if (
        currentTransaction.value?.transactionType === 'customer_outbound' ||
        currentTransaction.value?.transactionType === 'supplier_outbound'
      ) {
        amountStr += `- ${currentTransaction.value?.amount}`;
      }
      if (currentTransaction.value?.transactionType === 'internal_transfer') {
        amountStr += currentTransaction.value?.amount;
      }
      return amountStr;
    };

    const getTransactionDate = () => {
      const date = new Date(currentTransaction.value?.date as string);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const getUserName = () =>
      store.state.users.users.find((el) => el.id === currentTransaction.value?.createUid)?.name;

    const getJournalName = () =>
      store.state.accountJournals.accountJournals.find(
        (el) => el.id === currentTransaction.value?.journalId
      )?.name;

    return {
      currentTransaction,
      getTransactionIconPath,
      getTransactionType,
      getColor,
      getSign,
      getUserName,
      goBack,
      getJournalName,
      getTransactionDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.header {
  background-color: #f0fcff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 15px 0;
  display: flex;
  .left {
    display: flex;
    align-items: center;
    .arrow-back {
      width: 17px;
      height: 17px;
      margin-right: 5px;
      margin-left: 10px;
      transform: rotate(90deg);
    }
    .transaction-type {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      .transaction-type-icon {
        width: 40px;
        height: 40px;
      }
    }
  }
  .middle {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    .transaction-partner {
      font-size: 16px;
      font-weight: 600;
      color: #263941;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 20ch;
    }
    .transaction-type-text {
      font-size: 14px;
      color: #263941;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: auto;
    margin-right: 20px;
    .transaction-amount {
      .transaction-amount-wrap {
        padding: 5px 10px;
        border-radius: 30px;
        font-size: 18px;
        font-weight: 600;
        color: #263941;
      }
    }
  }
}
.transaction-content {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 0 20px;
  .transaction-content-item {
    display: flex;
    padding: 5px 0;
    border-bottom: 1px solid #e1e0e0;
    .transaction-content-item-title {
      font-size: 14px;
      color: #263941;
      margin-left: 5px;
    }
    .transaction-content-item-value {
      font-size: 14px;
      color: #263941;
      margin-right: 5px;
      max-width: 190px;
      margin-left: auto;
      text-align: right;
    }
    .transaction-content-item-value-bold {
      font-size: 14px;
      font-weight: 600;
      color: #263941;
      margin-right: 5px;
      max-width: 190px;
      margin-left: auto;
      text-align: right;
    }
  }
}
</style>
