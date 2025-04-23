<template>
  <div class="modal-payment-link-container">
    <div class="amount-container">
      <div class="amount-label">Cantidad</div>
      <div class="amount-input-container">
        <div class="input-wrapper" :class="{ error: v.amount.$error }" @click="focusOnInput()">
          <input
            type="number"
            v-model="amount"
            class="amount-input"
            ref="amountInput"
            @input="v.amount.$touch()"
          />
          <div class="currency-label">€</div>
        </div>
      </div>
    </div>
    <div class="error-message">
      <span v-if="v.amount.minValue.$invalid"> La cantidad no puede ser menor que 0 </span>
      <span v-if="v.amount.maxValue.$invalid">
        La cantidad no puede superar {{ pendingAmount }} €
      </span>
      <span v-if="v.amount.required.$invalid"> La cantidad es obligatoria </span>
    </div>
    <div class="link-container">
      <div class="link-label">Link</div>
      <div
        v-if="link"
        class="link"
        @click="copyLinkToClipboard()"
        @mouseenter="showTooltip = true"
        @mouseleave="hideTooltip()"
        :class="{ hovered: isButtonHovered }"
      >
        <span class="link-text">
          {{ link }}
        </span>
        <div class="tooltip" :class="{ 'show-tooltip': showTooltip }" ref="tooltip">Copiar</div>
      </div>
      <button
        v-if="link"
        class="copy-button"
        @click.stop="copyLinkToClipboard()"
        @mouseenter="
          showTooltip = true;
          isButtonHovered = true;
        "
        @mouseleave="
          hideTooltip();
          isButtonHovered = false;
        "
      >
        <CustomIcon
          class="icon-copy"
          imagePath="/app-images/copy-to-clipboard-icon.svg"
          color="white"
          width="20px"
          height="20px"
        />
      </button>
    </div>
    <div class="button-container">
      <button @click="generateLink()" class="button-link" :disabled="v.amount.$invalid">
        Generar link
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, Ref, computed, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, maxValue, minValue } from '@vuelidate/validators';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';

export default defineComponent({
  components: {
    CustomIcon,
  },
  props: {
    pendingAmount: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    const amount = ref(0);
    const link = ref('');
    const amountInput: Ref<HTMLInputElement | null> = ref(null);
    const tooltip = ref<HTMLDivElement | null>(null);
    const showTooltip = ref(false);
    const isButtonHovered = ref(false);

    const folio = computed(() => store.state.folios.currentFolio);

    const rules = computed(() => ({
      amount: {
        required,
        minValue: minValue(0),
        maxValue: maxValue(props.pendingAmount),
      },
    }));

    const v = useVuelidate(rules, { amount });

    const generateLink = async () => {
      v.value.$touch();
      if (v.value.$invalid) {
        return;
      }
      const response = (await store.dispatch('folios/fetchFolioPaymentLink', {
        folioId: folio.value?.id,
        amount: amount.value,
      })) as AxiosResponse<{ paymentLink: string }>;
      if (response.data) {
        if (response.data.paymentLink) {
          link.value = response.data.paymentLink;
        }
      }
    };

    const focusOnInput = () => {
      if (amountInput.value) {
        amountInput.value.focus();
      }
    };

    const copyLinkToClipboard = () => {
      if (link.value) {
        void navigator.clipboard.writeText(link.value);
        if (tooltip.value) {
          tooltip.value.textContent = '¡Copiado!';
          tooltip.value.style.right = '20px';
        }
      }
    };

    const hideTooltip = () => {
      showTooltip.value = false;
      if (tooltip.value) {
        tooltip.value.textContent = 'Copiar';
        tooltip.value.style.right = '30px';
      }
    };

    watch(amount, () => {
      link.value = '';
    });
    onMounted(() => {
      amount.value = props.pendingAmount;
    });
    return {
      amount,
      link,
      amountInput,
      v,
      showTooltip,
      isButtonHovered,
      tooltip,
      generateLink,
      focusOnInput,
      copyLinkToClipboard,
      hideTooltip,
    };
  },
});
</script>
<style scoped lang="scss">
.modal-payment-link-container {
  overflow-x: hidden;
  .amount-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
    .amount-label {
      font-weight: bold;
    }
    .amount-input-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      .input-wrapper {
        display: flex;
        align-items: center;
        border: 1px solid lightgray;
        border-radius: 8px;
        padding: 0.25rem 0.5rem;
        width: fit-content;
        transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
        cursor: text;
        .amount-input {
          width: 10ch;
          border: none;
          border-radius: 8px;
          outline: none;
          padding-right: 0.5rem;
          text-align: center;
        }

        &:focus-within {
          border: 1px solid $primary;
        }
        &.error {
          border: 1px solid red;
          .amount-input {
            color: red;
          }
          .currency-label {
            color: red;
          }
        }
      }
    }
  }
  .error-message {
    color: red;
    font-size: 0.7rem;
    text-align: right;
    margin-right: 1rem;
    height: 14px;
  }
  .link-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    .link-label {
      font-weight: bold;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .link {
      position: relative;
      width: 76%;
      padding: 0.5rem 1rem;
      border-radius: 8px 0 0 8px;
      background-color: #f0f0f0;
      cursor: pointer;
      margin-left: 1rem;
      color: $primary;
      display: flex;
      align-items: center;
      font-size: 13px;
      height: 36px;
      &:hover,
      &.hovered {
        background-color: #e0e0e0;
        font-weight: bold;
        text-decoration: underline;
      }

      .link-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }

      .tooltip {
        position: absolute;
        background-color: $primary;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
        width: fit-content;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        font-weight: bold;
        font-size: 14px;
        transition: transform 0.3s ease, opacity 0.3s ease;
        visibility: hidden;
        opacity: 0;
        z-index: 10000;
      }

      .tooltip::before {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: $primary transparent transparent;
      }

      .show-tooltip {
        visibility: visible;
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    .copy-button {
      height: 36px;
      background-color: $primary;
      border: none;
      border-radius: 0 8px 8px 0;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .button-container {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-right: 1rem;
    padding-top: 1rem;
    .button-link {
      background-color: $primary;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-weight: bold;
    }
  }
}
@media (min-width: 1024px) {
  .modal-payment-link-container {
    width: 550px;
    padding-bottom: 1rem;
    .link-container {
      .link {
        width: 85%;
      }
    }
  }
}
</style>
