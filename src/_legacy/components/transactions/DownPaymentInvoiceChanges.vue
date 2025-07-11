<template>
  <div class="down-payment-dialog-content">
    <div :style="dialogContentExtendStyle">
      <div class="partner-row">
        <div class="doc-number-input" v-if="!selectedPartner">
          <AutocompleteComponent
            @textSearchChanges="getGuestFromVatDocNumber($event)"
            @addNew="openNewPartnerDialog()"
            id="partners-autocomplete-charge"
            v-model="selectedPartnerId"
            :items="itemsAutocompleteCustomer"
            placeholderValue="Busqueda por DNI, NIF..."
            placeholderShowingOptions="Busqueda por DNI, NIF..."
          >
            <template #icon>
              <img src="/app-images/search.svg" />
            </template>
          </AutocompleteComponent>
        </div>
        <div v-else class="selected-partner" @click="openPartnerDialog()">
          <div class="partner-name">
            {{ selectedPartner?.name }}
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
    </div>
    <div class="buttons">
      <AppButton
        label="Crear factura"
        raised
        size="small"
        class="button"
        :disabled="disallowSave"
        :class="{
          disabled: disallowSave,
        }"
        @click="createDownPaymentInvoice()"
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
  computed,
  ref,
  type Ref,
  watch,
  onMounted,
  onUnmounted,
  markRaw,
} from 'vue';

import { type PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';
import { type TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';

import Button from 'primevue/button';

import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';

import PartnerForm from '@/_legacy/components/partners/PartnerForm.vue';
import { dialogService } from '@/_legacy/services/DialogService';

import { useStore } from '@/_legacy/store';
import { usePartner } from '@/_legacy/utils/usePartner';

export default defineComponent({
  components: {
    AutocompleteComponent,
    CustomIcon,
    AppButton: Button,
  },
  props: {
    transaction: {
      type: Object as () => TransactionInterface,
      default: () => ({}),
    },
  },
  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();
    const selectedPartnerId = ref(0);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const partnerDialog = ref(false);
    const dialogContentExtendStyle = ref('');

    const folio = computed(() => store.state.folios.currentFolio);
    const currentPartner = computed(() => store.state.partners.currentPartner);
    const partners = computed(() => store.state.partners.partners);

    const getGuestFromVatDocNumber = async (name: string) => {
      selectedPartnerId.value = 0;
      await store.dispatch('partners/removePartners');
      if (name.length >= 5) {
        fetchPartners({
          limit: 20,
          offset: 0,
          multiFieldSearch: name,
        });
        if (store.state.partners.partners) {
          dialogContentExtendStyle.value = `height: ${
            150 + 33.8 * store.state.partners.partners.length
          }px`;
        } else {
          dialogContentExtendStyle.value = '';
        }
      } else {
        dialogContentExtendStyle.value = '';
      }
    };

    const createDownPaymentInvoice = () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        void store
          .dispatch('transactions/createDownPaymentInvoice', {
            originDownPaymentId: props.transaction.id,
            partnerId: selectedPartner.value?.id,
          })
          .then(() => {
            void store.dispatch('folios/fetchFolioTransactions', folio.value?.id);
            void store.dispatch('folios/fetchFolioInvoices', folio.value?.id);
            void store.dispatch('folios/fetchFolioSaleLines', folio.value?.id);
          });
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
      dialogService.open({
        header: selectedPartner.value?.name ? selectedPartner.value?.name : 'Nuevo cliente',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const openNewPartnerDialog = async () => {
      await store.dispatch('partners/removePartner');
      await store.dispatch('countryStates/removeCountryStates');
      dialogContentExtendStyle.value = '';
      partnerDialog.value = true;
      dialogService.open({
        header: selectedPartner.value?.name ? selectedPartner.value?.name : 'Nuevo cliente',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const restorePartner = () => {
      void store.dispatch('partners/removePartner');
      selectedPartner.value = null;
      selectedPartnerId.value = 0;
    };

    const disallowSave = computed(() => {
      if (!selectedPartner.value) {
        return true;
      }
      return false;
    });

    watch(selectedPartnerId, () => {
      const partner =
        store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
      selectedPartner.value = partner;
      if (partner) {
        void store.dispatch('partners/setCurrentPartner', partner);
        dialogContentExtendStyle.value = '';
      }
    });

    watch(currentPartner, () => {
      const partner = currentPartner.value;
      selectedPartner.value = partner;
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

    onMounted(() => {
      if (props.transaction && props.transaction.partnerId) {
        void store.dispatch('layout/showSpinner', true);
        try {
          void store
            .dispatch('partners/fetchCurrentPartner', props.transaction.partnerId)
            .then(() => {
              if (store.state.partners.currentPartner) {
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
    });

    onUnmounted(() => {
      void store.dispatch('partners/removePartner');
    });
    return {
      store,
      folio,
      selectedPartnerId,
      selectedPartner,
      itemsAutocompleteCustomer,
      partnerDialog,
      dialogContentExtendStyle,
      disallowSave,
      getGuestFromVatDocNumber,
      createDownPaymentInvoice,
      openPartnerDialog,
      openNewPartnerDialog,
      restorePartner,
    };
  },
});
</script>
<style lang="scss" scoped>
.down-payment-dialog-content {
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
  .down-payment-dialog-content {
    width: 500px;
    height: auto;
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
