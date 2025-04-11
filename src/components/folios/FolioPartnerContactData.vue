<template>
  <div class="main-container">
    <AutocompleteComponent
      @textSearchChanges="getGuestFromVatDocNumber($event)"
      @addNew="openPartnerForm(true)"
      class="autocomplete"
      icon="search"
      v-model="selectedPartnerId"
      :items="itemsAutocompleteCustomer"
      placeholderShowingOptions="Busqueda por Nombre, DNI, NIF..."
      placeholderValue="Busqueda por Nombre, DNI, NIF..."
      isItemToRemove
      keepResultAfterChoose
      @removeItem="clearData()"
    >
      <template #icon>
        <img src="/app-images/search.svg" />
      </template>
    </AutocompleteComponent>
    <div class="input-field">
      <div class="label">Nombre Completo</div>
      <InputText
        class="input"
        v-model="partnerName"
        :disabled="selectedPartnerId !== 0"
        size="small"
      />
    </div>
    <div class="input-field">
      <div class="label">Email</div>
      <InputText
        class="input"
        v-model="partnerEmail"
        :disabled="selectedPartnerId !== 0"
        size="small"
      />
    </div>
    <div class="input-field">
      <div class="label">Teléfono</div>
      <InputText
        class="input"
        v-model="partnerPhone"
        :disabled="selectedPartnerId !== 0"
        size="small"
      />
    </div>
    <div class="input-field">
      <div class="label">Idioma</div>
      <AppSelect
        class="input"
        size="small"
        v-model="languageSelected"
        :disabled="selectedPartnerId !== 0"
        :optionValue="'id'"
        :optionLabel="'text'"
        :options="
          languages.map((el) => ({
            id: el.code,
            text: el.name,
          }))
        "
      />
    </div>
    <div class="buttons-panel">
      <AppButton
        class="btn"
        @click="savePartner()"
        label="Guardar"
        size="small"
        :class="{
          'btn-disabled': partnerName === '' && (partnerPhone === '' || partnerEmail === ''),
        }"
        :disabled="partnerName === '' && (partnerPhone === '' || partnerEmail === '')"
      />
      <AppButton
        class="btn"
        @click="$emit('close')"
        label="Cancelar"
        size="small"
        severity="secondary"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, markRaw, onMounted, ref, watch, type Ref } from 'vue';
import { useStore } from '@/store';
import { usePartner } from '@/utils/usePartner';
import { usePlanning } from '@/utils/usePlanning';

import AutocompleteComponent from '@/components/roomdooComponents/AutocompleteComponent.vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import PartnerForm from '@/components/partners/PartnerForm.vue';
import { dialogService } from '@/services/DialogService';
export default defineComponent({
  components: {
    AutocompleteComponent,
    InputText,
    AppSelect: Select,
    AppButton: Button,
  },
  setup(props, context) {
    const store = useStore();
    const { fetchPartners } = usePartner();
    const { refreshPlanning } = usePlanning();
    const selectedPartnerId = ref(0);
    const partnerName = ref('');
    const partnerEmail = ref('');
    const partnerPhone = ref('');
    const languageSelected = ref('');
    const partnerNameError = ref(false);
    const partnerEmailPhoneError = ref(false);
    const itemsAutocompleteCustomer: Ref<{ value: number; name: string }[]> = ref([]);
    const languages = computed(() => store.state.languages.languages);
    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const currentPartner = computed(() => store.state.partners.currentPartner);
    const partners = computed(() => store.state.partners.partners);

    const clearData = () => {
      selectedPartnerId.value = 0;
      partnerName.value = '';
      partnerEmail.value = '';
      partnerPhone.value = '';
      languageSelected.value = '';
    };

    const getGuestFromVatDocNumber = async (name: string) => {
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

    const openPartnerForm = async (isNew?: boolean) => {
      await store.dispatch('partners/removePartner');
      await store.dispatch('countryStates/removeCountryStates');
      dialogService.open({
        header: isNew ? 'Nuevo cliente' : 'Editar cliente',
        content: markRaw(PartnerForm),
        closable: true,
      });
    };

    const savePartner = async () => {
      if (!partnerName.value) {
        partnerNameError.value = true;
        partnerEmailPhoneError.value = false;
        return;
      }
      partnerNameError.value = false;

      if (partnerName.value && !partnerEmail.value && !partnerPhone.value) {
        partnerEmailPhoneError.value = true;
        return;
      }
      const payload = {
        folioId: currentFolio.value?.id,
        partnerName: partnerName.value,
        partnerEmail: partnerEmail.value,
        partnerPhone: partnerPhone.value,
        partnerId: selectedPartnerId.value ? selectedPartnerId.value : '0',
      };
      const payloadLang = {
        folioId: currentFolio.value?.id,
        language: languageSelected.value,
      };
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('folios/updatePartnerFolio', payload);
        await store.dispatch('folios/updateLanguageFolio', payloadLang);
        if (currentReservations.value) {
          await Promise.all(
            currentReservations.value.map(async (reservation) => {
              await store.dispatch('reservations/updateReservation', {
                reservationId: reservation.id,
                partnerName: partnerName.value,
                partnerEmail: partnerEmail.value,
                partnerPhone: partnerPhone.value,
                partnerId: selectedPartnerId.value ? selectedPartnerId.value : '0',
              });
            }),
          );
        }
        if (currentFolio.value) {
          await store.dispatch('folios/fetchFolio', currentFolio.value.id);
        }
        await refreshPlanning();
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

    watch(partners, () => {
      itemsAutocompleteCustomer.value = partners.value.map((el) => ({
        value: el.id,
        name: `${el.name} ${el.vatNumber ? '(' : ''}${el.vatNumber ? el.vatNumber : ''}${el.vatNumber ? ')' : ''}`,
      }));
    });

    watch(selectedPartnerId, async () => {
      if (store.state.partners.partners.length > 0) {
        const partner =
          store.state.partners.partners.find((el) => el.id === selectedPartnerId.value) ?? null;
        if (partner) {
          void store.dispatch('partners/setCurrentPartner', partner).then(() => {
            void store.dispatch('partners/removePartners');
          });
        }
      } else if (selectedPartnerId.value) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('partners/fetchCurrentPartner', selectedPartnerId.value);
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

    watch(currentPartner, () => {
      const partner = currentPartner.value;
      selectedPartnerId.value = partner?.id ?? 0;
      partnerName.value = currentPartner.value?.name ?? '';
      partnerEmail.value = currentPartner.value?.email ?? '';
      partnerPhone.value = currentPartner.value?.mobile ?? '';
      if (partner) {
        void store.dispatch('partners/setCurrentPartner', partner);
      }
    });

    onMounted(() => {
      if (currentFolio.value) {
        selectedPartnerId.value = currentFolio.value.partnerId ?? 0;
        partnerName.value = currentFolio.value.partnerName ?? '';
        partnerEmail.value = currentFolio.value.partnerEmail ?? '';
        partnerPhone.value = currentFolio.value.partnerPhone ?? '';
        languageSelected.value = currentFolio.value.language ?? '';
      }
    });

    return {
      selectedPartnerId,
      partnerName,
      partnerEmail,
      partnerPhone,
      languageSelected,
      partnerNameError,
      partnerEmailPhoneError,
      itemsAutocompleteCustomer,
      languages,
      clearData,
      getGuestFromVatDocNumber,
      openPartnerForm,
      savePartner,
    };
  },
});
</script>
<style lang="scss" scoped>
.main-container {
  .autocomplete {
    height: 35px;
  }
  .input-field {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    .label {
      user-select: none;
      font-weight: bold;
    }
    .input {
      width: 100%;
    }
  }
  .buttons-panel {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    .btn {
      width: 100%;
      margin-top: 0.5rem;
    }
    .btn.btn-disabled {
      cursor: not-allowed;
    }
  }
}
@media (min-width: 1024px) {
  .main-container {
    width: 400px;
    .buttons-panel {
      flex-direction: row;
      justify-content: flex-end;
      .btn {
        width: auto;
      }
      .btn:last-child {
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
