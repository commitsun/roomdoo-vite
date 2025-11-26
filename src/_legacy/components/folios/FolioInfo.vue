<template>
  <div class="folio-partner" v-if="currentFolio?.reservationType !== 'out'">
    <div class="folio-partner-title">
      <img src="/app-images/diary.svg" />
      <span> Datos del cliente </span>
    </div>
    <div class="folio-partner-text">
      <div class="partner-rows">
        <span> Nombre </span>
        <span class="partner-name">
          {{ currentFolio?.partnerName }}
        </span>
      </div>
      <hr />
      <div class="partner-rows">
        <span> Email </span>
        <span class="partner-email">
          {{ currentFolio?.partnerEmail }}
        </span>
      </div>
      <hr />
      <div class="partner-rows">
        <span> Teléfono </span>
        <span class="partner-phone">
          {{ currentFolio?.partnerPhone }}
        </span>
      </div>
      <hr />
      <div class="partner-rows">
        <span> Idioma </span>
        <span class="text-bold">
          {{ folioLanguage(currentFolio?.language) }}
        </span>
      </div>
      <div class="partner-btns">
        <span class="open-partner-dialog" @click="openPartnerForm()" v-if="currentFolio?.partnerId">
          Abrir ficha cliente
        </span>
        <span class="open-partner-dialog" @click="openNewPartnerForm()" v-else>
          Crear nuevo cliente
        </span>
        <span class="edit-folio-partner" @click="showFolioPartnerContactData()"> Editar </span>
      </div>
    </div>
  </div>
  <div class="folio-data">
    <div class="folio-partner-title">
      <img src="/app-images/info.svg" />
      <span> Detalles del folio </span>
    </div>
    <div class="folio-partner-text">
      <!-- folio state -->
      <div>
        <span> Estado {{ currentFolio?.reservationType === '' ? 'del folio' : '' }} </span>
        <span class="folio-state" :style="colorFolioState()" v-if="currentFolio">
          {{ folioStateText(currentFolio) }}
        </span>
      </div>
      <hr />

      <!-- sale channel -->
      <div v-if="currentFolio?.reservationType !== 'out'">
        <span> Canal de venta </span>
        <span class="partner-email">
          {{ saleChannelName }}
        </span>
      </div>
      <hr v-if="currentFolio?.reservationType !== 'out'" />

      <!-- agency -->
      <div v-if="currentFolio?.agencyId && currentFolio.reservationType !== 'out'">
        <span> Agencia </span>
        <span class="partner-email">
          {{ agencyName }}
        </span>
      </div>
      <hr v-if="currentFolio?.agencyId && currentFolio.reservationType !== 'out'" />

      <!-- origin pricelist -->
      <div v-if="currentFolio?.reservationType !== 'out'">
        <span> Tarifa de origen </span>
        <span class="partner-phone">
          {{ pricelistName }}
        </span>
      </div>
      <hr v-if="currentFolio?.reservationType !== 'out'" />

      <!-- roomdoo reference -->
      <div>
        <span> Referencia Roomdoo </span>
        <span class="partner-email">
          <img class="roomdoo-logo" src="/icons/favicon-32x32.png" />
          <span>
            {{ currentFolio?.name }}
          </span>
        </span>
      </div>
      <hr />

      <!-- agency reference -->
      <div v-if="currentFolio?.externalReference && currentFolio?.reservationType !== 'out'">
        <span> Referencia {{ agencyName }} </span>
        <span class="partner-email">
          {{ currentFolio?.externalReference }}
        </span>
      </div>
      <hr v-if="currentFolio?.externalReference && currentFolio?.reservationType !== 'out'" />

      <!-- reservation dates -->
      <div v-if="currentFolio?.reservationType !== 'out'">
        <span> Fechas de la reserva </span>
        <span class="partner-email">
          {{ checkinCheckoutDates() }}
          <span
            v-if="checkinCheckoutDates() === 'Varias fechas'"
            @click="$emit('setTabValue', 'reservations')"
            class="see-reservations"
          >
            (Ver habitaciones)
          </span>
        </span>
      </div>
      <hr v-if="currentFolio?.reservationType !== 'out'" />

      <!-- reservation duration -->
      <div>
        <span>
          Duración {{ currentFolio?.reservationType !== 'out' ? 'de la estancia' : '' }}
        </span>
        <span class="partner-email">
          {{ lengthStay() }}
          <span
            v-if="lengthStay() === 'Varias fechas'"
            @click="$emit('setTabValue', 'reservations')"
            class="see-reservations"
          >
            (Ver habitaciones)
          </span>
        </span>
      </div>
      <hr />

      <!-- creation date -->
      <div>
        <span> Fecha de creación </span>
        <span class="partner-email">
          {{ folioCreateDate() }}
        </span>
      </div>
      <hr />

      <!-- total amount -->
      <div v-if="currentFolio?.reservationType !== 'out'">
        <span> Importe total </span>
        <span class="partner-email">
          {{ currentFolio?.amountTotal?.toFixed(2).toString().replace('.', ',') }} €
        </span>
      </div>
      <hr v-if="currentFolio?.reservationType !== 'out'" />

      <!-- pending amount -->
      <div v-if="currentFolio?.reservationType !== 'out'">
        <span> Importe pendiente de pago </span>
        <span class="pending-amount" :class="currentFolio?.pendingAmount === 0 ? 'paid' : ''">
          {{ currentFolio?.pendingAmount?.toFixed(2).toString().replace('.', ',') }} €
        </span>
      </div>

      <!-- creation by -->
      <div v-if="currentFolio?.reservationType === 'out'">
        <span> Creado por </span>
        <span class="partner-email">
          {{ currentFolio?.createdBy }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type PartnerInterface } from '@/_legacy/interfaces/PartnerInterface';
import { defineComponent, computed, ref, type Ref, onMounted, markRaw } from 'vue';
import { useStore } from '@/_legacy/store';

import { dialogService } from '@/_legacy/services/DialogService';
import { folioStateText } from '@/_legacy/utils/folio';
import utilsDates from '@/_legacy/utils/dates';
import FolioPartnerContactData from '@/_legacy/components/folios/FolioPartnerContactData.vue';
import { useAppDialog } from '@/ui/composables/useAppDialog';
import { useI18n } from 'vue-i18n';
import ContactDetail from '@/ui/components/contacts/ContactDetail.vue';
import { useUIStore } from '@/infrastructure/stores/ui';
import { useContactsStore } from '@/infrastructure/stores/contacts';

export default defineComponent({
  emits: ['setTabValue'],

  setup() {
    const store = useStore();
    const uiStore = useUIStore();
    const contactsStore = useContactsStore();
    const { openDialog } = useAppDialog();
    const { t } = useI18n();

    const openLanguageDialog = ref(false);
    const partnerName = ref('');
    const partnerEmail = ref('');
    const partnerPhone = ref('');
    const languageSelected = ref('0');
    const pricelistName = ref('');

    const selectedPartnerName = ref('');
    const itemsAutocompleteCustomer = ref([] as { value: number; name: string }[]);
    const selectedPartner: Ref<PartnerInterface | null> = ref(null);
    const partnerNameError = ref(false);
    const partnerEmailPhoneError = ref(false);

    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const languages = computed(() => store.state.languages.languages);

    const agencyName = computed(
      () => store.state.agencies.agencies.find((el) => el.id === currentFolio.value?.agencyId)?.name
    );

    const saleChannelName = computed(
      () =>
        store.state.saleChannels.saleChannels.find(
          (el) => el.id === currentFolio.value?.saleChannelId
        )?.name
    );

    const lengthStay = () => {
      let lengthStayValue = '';
      const sameDates = currentReservations.value?.every(
        (el) =>
          currentReservations.value &&
          (currentReservations.value[0].checkin as Date).getTime() &&
          (el.checkin as Date).getTime() ===
            (currentReservations.value[0].checkin as Date).getTime() &&
          (currentReservations.value[0].checkout as Date).getTime() &&
          (el.checkout as Date).getTime() ===
            (currentReservations.value[0].checkout as Date).getTime()
      );

      if (!sameDates) {
        lengthStayValue = 'Varias fechas';
      } else if (currentReservations.value) {
        const firstCheckin = new Date(currentReservations.value[0].checkin);
        const firstCheckout = new Date(currentReservations.value[0].checkout);
        const nights = utilsDates.daysBetween(firstCheckin, firstCheckout);
        if (nights > 1) {
          lengthStayValue = `${nights} noches`;
        } else {
          lengthStayValue = `${nights} noche`;
        }
      }
      return lengthStayValue;
    };

    const checkinCheckoutDates = () => {
      let checkinCheckoutDatesValue = '';
      if (currentReservations.value) {
        const firstCheckin = new Date(currentReservations.value[0].checkin);
        const firstCheckout = new Date(currentReservations.value[0].checkout);
        checkinCheckoutDatesValue = `${firstCheckin.getDate()}/${
          firstCheckin.getMonth() + 1
        }/${firstCheckin.getFullYear()} - ${firstCheckout.getDate()}/${
          firstCheckout.getMonth() + 1
        }/${firstCheckout.getFullYear()}`;

        currentReservations.value.forEach((reservation) => {
          if (
            new Date(reservation.checkin).getTime() !== firstCheckin.getTime() ||
            new Date(reservation.checkout).getTime() !== firstCheckout.getTime()
          ) {
            checkinCheckoutDatesValue = 'Varias fechas';
          }
        });
      }
      return checkinCheckoutDatesValue;
    };

    const folioCreateDate = () => {
      let folioCreateDateValue = '';
      if (currentFolio.value?.createDate) {
        const folioCreate = new Date(currentFolio.value.createDate);
        folioCreateDateValue = `${folioCreate.getDate()}/${
          folioCreate.getMonth() + 1
        }/${folioCreate.getFullYear()} a las ${folioCreate
          .getHours()
          .toString()
          .padStart(2, '0')}:${folioCreate.getMinutes().toString().padStart(2, '0')}`;
      }
      return folioCreateDateValue;
    };

    const colorFolioState = () => {
      let backgroundColor = '#263941';
      if (currentFolio.value?.state === 'confirm') {
        backgroundColor = '#1E9ED9';
      } else if (currentFolio.value?.state === 'cancel') {
        backgroundColor = '#FF0000';
      } else if (currentFolio.value?.state === 'draft') {
        backgroundColor = '#DCA81C';
      }
      const style = {
        backgroundColor,
      };
      return style;
    };

    const folioLanguage = (languageCode: string | undefined) => {
      let result = '';
      store.state.languages.languages.forEach((lang) => {
        let code = '';
        if (languageCode) {
          if (languageSelected.value !== '0') {
            code = languageSelected.value;
          } else {
            code = languageCode;
          }
        }
        if (lang.code === code) {
          result = lang.name;
        }
      });
      return result;
    };

    const showFolioPartnerContactData = () => {
      dialogService.open({
        header: 'Editar datos de cliente',
        content: markRaw(FolioPartnerContactData),
      });
    };

    const openPartnerForm = async () => {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContactSchema();
        const contactId = currentFolio.value?.partnerId as number;
        const contact = await contactsStore.fetchContactById(contactId);
        if (contact) {
          contact.id = contactId;
          openDialog(ContactDetail, {
            props: { header: contact.name || t('contacts.detail') },
            data: { contact },
            onClose: async ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
              if (data?.refresh === true || data?.action === 'saved') {
                await store.dispatch('folios/fetchCurrentFolio', currentFolio.value?.id);
              }
            },
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('Contact not found for id:', contactId);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }
    };

    const openNewPartnerForm = async () => {
      uiStore.startLoading();
      try {
        await contactsStore.fetchContactSchema();
        openDialog(ContactDetail, {
          props: { header: t('contacts.new') },
          onClose: async ({ data }: { data?: { refresh?: boolean; action?: string } } = {}) => {
            if (data?.refresh === true || data?.action === 'saved') {
              await store.dispatch('folios/fetchCurrentFolio', currentFolio.value?.id);
            }
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        uiStore.stopLoading();
      }





    };

    onMounted(async () => {
      if (currentFolio.value) {
        partnerName.value = currentFolio.value.partnerName ?? '';
        partnerEmail.value = currentFolio.value.partnerEmail ?? '';
        partnerPhone.value = currentFolio.value.partnerPhone ?? '';
      }
      if (currentFolio.value?.language) {
        languageSelected.value = currentFolio.value.language;
      }

      const pricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === currentFolio.value?.pricelistId
      );
      if (pricelist) {
        pricelistName.value = pricelist.name;
      } else if (currentFolio.value?.pricelistId) {
        await store.dispatch(
          'pricelists/fetchRestrictedPricelist',
          currentFolio.value?.pricelistId
        );
        pricelistName.value = store.state.pricelists.restrictedPricelist?.name ?? '';
      }
    });

    return {
      currentFolio,
      currentReservations,
      saleChannelName,
      pricelistName,
      agencyName,
      partnerName,
      partnerEmail,
      partnerPhone,
      selectedPartnerName,
      itemsAutocompleteCustomer,
      selectedPartner,
      partnerNameError,
      partnerEmailPhoneError,
      languageSelected,
      languages,
      openLanguageDialog,
      lengthStay,
      checkinCheckoutDates,
      folioCreateDate,
      colorFolioState,
      folioLanguage,
      folioStateText,
      showFolioPartnerContactData,
      openPartnerForm,
      openNewPartnerForm,
    };
  },
});
</script>

<style scoped lang="scss">
.folio-partner {
  display: flex;
  flex-direction: column;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
  border-radius: 10px;
  padding-bottom: 0.75rem;
  margin-bottom: 31px;
  .folio-partner-title {
    height: 35px;
    background-color: #f0fcff;
    border-radius: 10px 10px 0 0;
    display: flex;
    align-items: center;
    img {
      height: 20px;
      width: 20px;
      margin-left: 15px;
    }
    span {
      margin-left: 8px;
      font-size: 14px;
      font-weight: bold;
    }
  }
  .folio-partner-text {
    .partner-rows {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      margin: 0 20px;
      height: 32px;
      .partner-name {
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50%;
        white-space: nowrap;
      }
      .partner-email,
      .partner-phone {
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%;
        white-space: nowrap;
        .see-reservations {
          font-weight: 500;
          cursor: pointer;
          margin-left: 1ch;
        }
      }
    }
    .partner-btns {
      height: 32px;
      margin: 15px 16px;
      justify-content: space-between;
      align-items: center;
      display: none;
      .open-partner-dialog {
        background-color: #f0f0f0;
        text-align: center;
        cursor: pointer;
        padding: 5px 16px;
        border-radius: 5px;
      }
      .edit-folio-partner {
        background-color: $primary;
        color: white;
        border-radius: 5px;
        padding: 5px 1rem;
        font-weight: 500;
        cursor: pointer;
      }
    }
    hr {
      background-color: #e1e0e0;
      height: 1px;
      border: 0;
      margin: 0 8px;
    }
  }
}
.folio-data {
  display: flex;
  flex-direction: column;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
  border-radius: 10px;
  margin-top: 1rem;
  padding-bottom: 0.75rem;
  .folio-partner-title {
    height: 35px;
    background-color: #f0fcff;
    border-radius: 10px 10px 0 0;
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    img {
      height: 20px;
      width: 20px;
      margin-left: 15px;
    }
    span {
      font-size: 14px;
      font-weight: bold;
      margin-left: 8px;
    }
  }
  .folio-partner-text {
    div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      margin: 0 18px;
      height: 32px;
      .partner-name {
        font-weight: bold;
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 0 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .partner-email,
      .partner-phone {
        font-weight: bold;
        display: flex;
        align-items: center;
        overflow: hidden;
        text-overflow: ellipsis;
        .roomdoo-logo {
          height: 20px;
          width: 20px;
          margin-right: 0.5rem;
        }
        .see-reservations {
          font-weight: 500;
          cursor: pointer;
          margin-left: 1ch;
        }
      }
      .pending-amount {
        color: #f25022;
        font-weight: bold;
        display: flex;
        align-items: center;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .paid {
        color: #008000;
      }

      .open-partner-dialog {
        background-color: #f0f0f0;
        border-radius: 30px;
        text-align: center;
        padding: 0.3rem 1.5rem;
        cursor: pointer;
        margin-right: 0.5rem;
        font-size: 14px;
        margin-top: 0.6rem;
      }
      .edit-folio-partner {
        background-color: $primary;
        border-radius: 30px;
        text-align: center;
        padding: 0.3rem 1.5rem;
        cursor: pointer;
        margin-right: 0.5rem;
        color: white;
        font-size: 14px;
        margin-top: 0.6rem;
      }
      .folio-state {
        font-weight: bold;
        border-radius: 10px;
        padding: 0 1rem;
        color: white;
      }
    }
    hr {
      background-color: #e1e0e0;
      height: 1px;
      border: 0;
      margin: 0 8px;
    }
  }
}
.modal-container {
  border-radius: 10px !important;
  .modal-header {
    padding: 0;
    .folio-partner-title {
      width: 100%;
      color: black;
      margin: 12px 0 12px 0;
      display: flex;
      align-items: center;
      img {
        margin-right: 0.5rem;
      }
    }
  }
  .modal-body {
    .buttons {
      margin-left: 1rem;
      margin-right: 2rem;
      display: flex;
      flex-direction: column-reverse;
      .btn-save {
        background-color: $primary;
        color: white;
        border-radius: 10px;
        padding: 0.5rem 1rem;
        font-size: 16px;
        border: none;
        cursor: pointer;
        margin: 1rem 0;
      }
      .btn-cancel {
        color: black;
        border-radius: 10px;
        padding: 0.5rem 1rem;
        font-size: 16px;
        cursor: pointer;
        margin-right: 1rem;
      }
    }
    .folio-partner-text {
      font-size: 16px;
      padding: 0.25rem 0;
      div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.2rem 1rem;
        padding: 0.25rem 0;
        .input-login {
          padding: 0.5rem 0;
          width: 50%;
        }
      }
      .language-row {
        .select-language {
          width: 50%;
          max-width: 70%;
        }
      }
    }
    .partner-row {
      display: flex;
      width: 100%;
      padding: 1rem 0 2rem 0;
      .doc-number-input {
        width: 100%;
        margin-left: 1rem;
      }
      .partner-input {
        width: 100%;
        margin-right: 1rem;
      }
      .q-field--readonly :before {
        border: 1px solid #d2ecf2;
        cursor: pointer;
        border-radius: 10px;
      }
      .search-box {
        height: 40px;
        border-radius: 15px;
        width: 100%;
        margin: 0 2rem 0 1rem;
      }
    }
  }
}

@media (min-width: 1024px) {
  .folio-partner {
    display: flex;
    flex-direction: column;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
    border-radius: 10px;
    padding-bottom: 0;
    margin: 0 20px;

    .folio-partner-title {
      height: 40px;
      background-color: #f0fcff;
      border-radius: 10px 10px 0 0;
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      img {
        height: 20px;
        width: 20px;
        margin: 0 10px 0 21px;
      }
      span {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .folio-partner-text {
      padding-bottom: 0.5rem;
      .partner-rows {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        margin: 0 25px 0 40px;
        height: 36px;
        .partner-name {
          font-weight: bold;
          background-color: #f7f7f7;
          border-radius: 10px;
          padding: 0 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
          max-height: 28px;
          white-space: nowrap;
        }
        .partner-email,
        .partner-phone {
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
          max-height: 28px;
          margin-right: 0.7rem;
          white-space: nowrap;
          .see-reservations {
            font-weight: 500;
            cursor: pointer;
            margin-left: 1ch;
          }
        }
        .open-partner-dialog {
          background-color: #f0f0f0;
          border-radius: 30px;
          text-align: center;
          padding: 0.3rem 1.5rem;
          cursor: pointer;
          margin-right: 0.5rem;
          font-size: 14px;
          margin-top: 0.6rem;
        }
        .edit-folio-partner {
          background-color: $primary;
          border-radius: 30px;
          text-align: center;
          padding: 0.3rem 1.5rem;
          cursor: pointer;
          color: white;
          font-size: 14px;
          margin-top: 0.6rem;
        }
      }
      hr {
        background-color: #e1e0e0;
        height: 1px;
        border: 0;
        margin: 0 1rem;
      }
      .partner-btns {
        display: flex;
        margin: 25px;
      }
    }
  }
  .folio-data {
    display: flex;
    flex-direction: column;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
    border-radius: 10px;
    margin: 30px 20px 0 20px;
    .folio-partner-title {
      height: 40px;
      background-color: #f0fcff;
      border-radius: 10px 10px 0 0;
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      img {
        height: 20px;
        width: 20px;
        margin: 0 10px 0 21px;
      }
      span {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .folio-partner-text {
      padding-bottom: 0.5rem;
      div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 1xpx;
        height: 36px;
        margin: 0 25px 0 40px;

        .partner-name {
          font-weight: bold;
          background-color: #f7f7f7;
          border-radius: 10px;
          padding: 0 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .partner-email,
        .partner-phone {
          font-weight: bold;
          display: flex;
          align-items: center;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 0.7rem;
          .roomdoo-logo {
            height: 25px;
            width: 25px;
            margin-right: 0.5rem;
          }
          .see-reservations {
            font-weight: 500;
            cursor: pointer;
            margin-left: 1ch;
          }
        }
        .pending-amount {
          color: #f25022;
          font-weight: bold;
          display: flex;
          align-items: center;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 0.65rem;
        }

        .open-partner-dialog {
          background-color: #f0f0f0;
          border-radius: 30px;
          text-align: center;
          padding: 0.3rem 1.5rem;
          cursor: pointer;
          margin-right: 0.5rem;
          font-size: 14px;
          margin-top: 0.6rem;
        }
        .edit-folio-partner {
          background-color: $primary;
          border-radius: 30px;
          text-align: center;
          padding: 0.3rem 1.5rem;
          cursor: pointer;
          margin-right: 0.5rem;
          color: white;
          font-size: 14px;
          margin-top: 0.6rem;
        }
        .folio-state {
          font-weight: bold;
          border-radius: 10px;
          padding: 0 1rem;
        }
      }
      hr {
        background-color: #e1e0e0;
        height: 1px;
        border: 0;
        margin: 0 1rem;
      }
    }
  }
  .modal-container {
    border-radius: 10px !important;
    .modal-header {
      padding: 0;
      .folio-partner-title {
        width: 100%;
        color: black;
        margin: 12px 0 12px 0;
        display: flex;
        align-items: center;
        img {
          margin-right: 0.5rem;
        }
      }
    }
    .modal-body {
      .buttons {
        flex-direction: row;
        align-items: center;
        width: calc(50% - 1rem);
        margin-left: auto;
        .btn-save {
          background-color: $primary;
          color: white;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 16px;
          border: none;
          cursor: pointer;
        }
        .btn-cancel {
          background-color: #f0f0f0;
          color: black;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 16px;
          border: none;
          cursor: pointer;
          margin-left: 1rem;
        }
      }
      .folio-partner-text {
        width: 600px;
        font-size: 16px;

        div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0.2rem 1rem;
          .input-login {
            padding: 0.5rem 0;
            width: 50%;
          }
        }
        hr {
          background-color: #e1e0e0;
          height: 1px;
          border: 0;
          margin: 0 1rem;
        }
        .language-row {
          .select-language {
            width: 50%;
            max-width: 70%;
          }
        }
      }
      .partner-row {
        display: flex;
        width: 100%;
        padding: 1rem 0 2rem 0;
        .doc-number-input {
          width: 100%;
          margin-left: 1rem;
        }
        .partner-input {
          width: 100%;
          margin-right: 1rem;
        }
        .q-field--readonly :before {
          border: 1px solid #d2ecf2;
          cursor: pointer;
          border-radius: 10px;
        }
      }
    }
  }
}
</style>
