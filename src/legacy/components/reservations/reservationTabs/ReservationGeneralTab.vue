<template>
  <div class="data-reservation">
    <div class="wizard-state" v-if="showWizardState">
      <div class="header">
        <CustomIcon
          imagePath="/app-images/magic_button.svg"
          color="#2563EB"
          width="17px"
          height="17px"
        />
        <span>Asistente</span>
        <div class="div-icon-close">
          <img
            src="/app-images/icon-close.svg"
            @click="showWizardState = false"
            class="icon-close"
          />
        </div>
      </div>
      <div class="wizard-content">
        <div class="wizard-state-info">
          {{ wizardState?.text }}
        </div>
        <div
          class="wizard-button"
          @click="wizardStateClick()"
          v-if="
            wizardState?.code != 'overbooking_without_availability' &&
            wizardState?.code != 'splitted_without_availability'
          "
        >
          {{ wizardStateButtonText() }}
        </div>
      </div>
    </div>
    <div class="data-reservation-first-row">
      <div class="left">
        <img src="/app-images/icon-calendar-blue.svg" class="icon-calendar" />
        <span>
          Fechas de
          {{ currentReservation?.reservationType !== 'out' ? 'la reserva' : 'fuera de venta' }}
        </span>
      </div>
      <div class="right" @click="openChangeDatesModal()">
        <CustomIcon
          imagePath="/app-images/icon-lock.svg"
          color="primary"
          width="12px"
          height="12px"
          v-if="currentReservation?.isBlocked"
        />
        <span class="change-dates-text"> Cambiar fechas </span>
      </div>
    </div>
    <div class="data-reservation-row" v-if="currentReservation?.overbooking">
      <div class="btn-overbooking" @click="toggleShowRoomsDialog(true)">
        <CustomIcon
          imagePath="/app-images/icon-alert-2.svg"
          color="#FFFFFF"
          width="12px"
          height="12px"
          class="icon-alert"
        />
        <span> Gestionar Overbooking </span>
      </div>
    </div>
    <div class="data-reservation-row">
      <span class="reservation-title">
        {{ currentReservation?.reservationType !== 'out' ? 'Check-in reserva' : 'Inicio' }}
      </span>
      <span class="reservation-data">
        {{ getDateFormat(currentReservation?.checkin) }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row">
      <span class="reservation-title">
        {{ currentReservation?.reservationType !== 'out' ? 'Check-out reserva' : 'Fin' }}
      </span>
      <span class="reservation-data">
        {{ getDateFormat(currentReservation?.checkout) }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row">
      <span class="reservation-title">
        {{
          currentReservation?.reservationType !== 'out' ? 'Noches de estancia' : 'Número de noches'
        }}
      </span>
      <span class="reservation-data-nights">
        <CustomIcon
          imagePath="/app-images/icon-nights.svg"
          color="#000000"
          width="12px"
          height="12px"
        />
        <span> {{ getAmountNights() }} {{ getAmountNights() > 1 ? 'noches' : 'noche' }} </span>
      </span>
    </div>
  </div>

  <div class="data-reservation" v-if="currentReservation?.reservationType !== 'out'">
    <div class="data-reservation-first-row">
      <div class="left">
        <img src="/app-images/icon-alarm.svg" class="icon-calendar" />
        <span> Horarios previstos </span>
      </div>
    </div>
    <div class="data-reservation-row">
      <span class="reservation-title"> Horario de llegada previsto </span>
      <span class="reservation-data">
        {{ currentReservation?.arrivalHour }},
        {{ getShortDateFormat(currentReservation?.checkin) }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row">
      <span class="reservation-title"> Horario de salida previsto </span>
      <span class="reservation-data">
        {{ currentReservation?.departureHour }},
        {{ getShortDateFormat(currentReservation?.checkout) }}
      </span>
    </div>
  </div>

  <div class="data-reservation">
    <div class="data-reservation-first-row">
      <div class="left">
        <img src="/app-images/icon-loupe.svg" class="icon-calendar" />
        <span> Detalles de la reserva </span>
      </div>
    </div>
    <div class="data-reservation-row">
      <span class="reservation-title"> Estado de la reserva </span>
      <span
        class="reservation-data-state"
        v-if="currentReservation"
        :style="`background-color: ${getReservationColor(
          currentReservation,
          currentFolio?.pendingAmount || 0
        )}`"
      >
        {{ reservationStateText(currentReservation) }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row" v-if="currentReservation?.reservationType !== 'out'">
      <span class="reservation-title"> Tarifa aplicada a la reserva </span>
      <span class="reservation-data">
        {{ pricelistName }}
      </span>
    </div>
    <hr v-if="currentReservation?.reservationType !== 'out'" />
    <div class="data-reservation-row">
      <span class="reservation-title"> Referencia Roomdoo </span>
      <span class="reservation-data">
        {{ currentReservation?.name }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row">
      <span class="reservation-title"> Fecha de creación </span>
      <span class="reservation-data">
        {{ getDateTimeFormat(currentReservation?.createDate) }}
      </span>
    </div>
    <hr />
    <div class="data-reservation-row" v-if="currentReservation?.reservationType === 'out'">
      <span class="reservation-title"> Creada por </span>
      <span class="reservation-data">
        {{ currentReservation?.createdBy }}
      </span>
    </div>
    <hr v-if="currentReservation?.reservationType === 'out'" />
    <div class="data-reservation-row" v-if="currentReservation?.reservationType !== 'out'">
      <span class="reservation-title"> Canal de venta </span>
      <span class="reservation-data">
        {{ getSaleChannel() }}
      </span>
    </div>
    <hr v-if="currentReservation?.agencyId" />
    <div class="data-reservation-row" v-if="currentReservation?.agencyId">
      <span class="reservation-title"> Agencia </span>
      <span class="reservation-data">
        {{ agencyName }}
      </span>
    </div>
  </div>

  <!-- CHECKIN FLOW -->
  <Transition name="checkin-flow-transition">
    <div class="checkin-flow-overlay" v-if="isCheckinModalOpen">
      <PrivateCheckinFlow
        @closeCheckinFlow="$emit('setTabValue', 'guests')"
        v-if="isCheckinModalOpen"
      />
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, markRaw } from 'vue';
import type { ReservationInterface } from '@/legacy/interfaces/ReservationInterface';
import type { AxiosResponse } from 'axios';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';
import ReservationDateChanges from '@/legacy/components/reservations/ReservationDateChanges.vue';
import { reservationStateText } from '@/legacy/utils/reservation';
import MailComponent from '@/legacy/components/mails/MailComponent.vue';
import { useCheckinPartner } from '@/legacy/utils/useCheckinPartner';
import PrivateCheckinFlow from '@/legacy/components/checkinFlow/PrivateCheckinFlow.vue';
import TransactionCharges from '@/legacy/components/transactions/TransactionCharges.vue';

import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';
import ReservationRoomChanges from '@/legacy/components/reservations/ReservationRoomChanges.vue';
import ReservationSegmentation from '@/legacy/components/reservations/ReservationSegmentation.vue';

export default defineComponent({
  components: {
    CustomIcon,
    PrivateCheckinFlow,
  },
  emits: ['setTabValue', 'moveToRoomTab'],
  setup(props, context) {
    const store = useStore();
    const { doAllCheckins } = useCheckinPartner();

    const changeDatesModal = ref(false);
    const changeRoomsModal = ref(false);
    const isReservationBlockedModalOpen = ref(false);
    const splitMode = ref(false);
    const isCheckinModalOpen = ref(false);
    const mailDialog = ref(false);
    const bodyMail = ref('');
    const subject = ref('');
    const showDeleteCancelPenalty = ref(false);
    const chargesModal = ref(false);
    const showWizardState = ref(false);
    const showSegmentationModal = ref(false);
    const pricelistName = ref('');

    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const wizardState = computed(() => store.state.reservations.reservationsWizardState);

    const agencyName = computed(
      () => store.state.agencies.agencies.find((el) => el.id === currentFolio.value?.agencyId)?.name
    );

    const getDateFormat = (date: string | Date | undefined) => {
      if (date === undefined) return '';

      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      const dateObj = new Date(date);
      const dayOfWeek = daysOfWeek[dateObj.getDay()];
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString('es-ES', { month: 'long' });
      const year = dateObj.getFullYear();

      return `${dayOfWeek} ${day} de ${month} de ${year}`;
    };

    const getDateTimeFormat = (datetime: string | Date | undefined) => {
      if (datetime === undefined) return '';
      const dateObj = new Date(datetime);

      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();

      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();

      const formattedDate = `${day}/${month}/${year}`;
      const formattedTime = `${hours}:${minutes}`;

      return `${formattedDate} a las ${formattedTime}`;
    };

    const getShortDateFormat = (datetime: string | Date | undefined) => {
      if (datetime === undefined) return '';
      const dateObj = new Date(datetime);

      const day = dateObj.getDate();
      const month = dateObj.toLocaleString('es-ES', { month: 'short' });
      const year = dateObj.getFullYear().toString().slice(-2);

      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayOfWeek = daysOfWeek[dateObj.getDay()];

      const formattedDate = `${dayOfWeek} ${day} ${month} ${year}`;

      return formattedDate;
    };

    const getAmountNights = () => {
      if (currentReservation.value?.checkin && currentReservation.value?.checkout) {
        const checkin = new Date(currentReservation.value?.checkin);
        const checkout = new Date(currentReservation.value?.checkout);
        const diffTime = Math.abs(checkout.getTime() - checkin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      return 0;
    };

    const getSaleChannel = () => {
      let saleChannel: string | undefined = '';
      if (store.state.saleChannels.saleChannels && currentReservation.value?.saleChannelId) {
        saleChannel = store.state.saleChannels.saleChannels.find(
          (el) => el.id === currentReservation.value?.saleChannelId
        )?.name;
      }
      return saleChannel;
    };

    const getReservationColor = (
      onGoingReservation: ReservationInterface | null,
      folioPendingAmount: number
    ) => {
      let result;
      if (onGoingReservation) {
        if (activeProperty.value?.colorOptionConfig === 'advanced') {
          if (
            onGoingReservation.stateCode === 'confirm' ||
            onGoingReservation.stateCode === 'arrival_delayed'
          ) {
            result = activeProperty.value.confirmedReservationColor;
          }
          if (onGoingReservation.stateCode === 'draft') {
            result = activeProperty.value?.preReservationColor;
          }
          if (
            onGoingReservation.stateCode === 'onboard' ||
            onGoingReservation.stateCode === 'departure_delayed'
          ) {
            if (folioPendingAmount > 0) {
              result = activeProperty.value.onBoardReservationColor;
            } else if (folioPendingAmount === 0) {
              result = activeProperty.value.paidCheckinReservationColor;
            }
          }
          if (onGoingReservation.stateCode === 'done') {
            if (folioPendingAmount > 0) {
              result = activeProperty.value.outReservationColor;
            } else if (folioPendingAmount === 0) {
              result = activeProperty.value.paidReservationColor;
            }
          }
          if (onGoingReservation.toAssign === true) {
            result = activeProperty.value.toAssignReservationColor;
          }
          if (folioPendingAmount < 0) {
            result = activeProperty.value.overPaymentColor;
          }
          if (onGoingReservation.reservationType === 'staff') {
            result = activeProperty.value.staffReservationColor;
          }
          if (onGoingReservation.stateCode === 'cancel') {
            result = '#7C7C7C';
          }
          if (onGoingReservation.isReselling) {
            result = '#ebbfd6';
          }
        } else {
          if (
            onGoingReservation.stateCode === 'cancel' ||
            onGoingReservation.stateCode === 'done'
          ) {
            result = activeProperty.value?.simpleOutColor;
          }
          if (
            onGoingReservation.stateCode === 'onboard' ||
            onGoingReservation.stateCode === 'departure_delayed'
          ) {
            result = activeProperty.value?.simpleInColor;
          }
          if (
            onGoingReservation.stateCode === 'confirm' ||
            onGoingReservation.stateCode === 'arrival_delayed' ||
            onGoingReservation.stateCode === 'draft'
          ) {
            result = activeProperty.value?.simpleFutureColor;
          }
        }
        if (onGoingReservation.reservationType === 'out') {
          result = '#ABDEFE';
        }
        if (onGoingReservation.overbooking) {
          result = '#FF4E00';
        }
      }
      return result;
    };

    const getAgencyName = () =>
      store.state.agencies.agencies.find((el) => el.id === currentReservation.value?.agencyId)
        ?.name;

    const openChangeDatesModal = () => {
      if (currentReservation.value?.isBlocked) {
        isReservationBlockedModalOpen.value = true;
        dialogService.open({
          iconHeader: '/app-images/icon-lock.svg',
          header: 'Reserva bloqueada',
          content: 'No es posible modificar las fechas de esta reserva',
          btnAccept: 'Ok',
        });
      } else {
        dialogService.open({
          header: 'CAMBIO DE FECHAS',
          content: markRaw(ReservationDateChanges),
        });
        changeDatesModal.value = true;
      }
    };

    const closeSegmentationAndDoCheckin = async () => {
      if (currentReservation.value?.segmentationId) {
        showSegmentationModal.value = false;
        await doAllCheckins(currentReservation.value?.id);
        context.emit('setTabValue', 'guests');
      }
    };

    const wizardStateClick = async () => {
      if (wizardState.value?.code) {
        const code = wizardState.value?.code;
        // MODAL ROOM CHANGES
        if (
          code === 'overbooking_with_availability' ||
          code === 'splitted_with_availability' ||
          code === 'to_assign'
        ) {
          splitMode.value = false;
          changeRoomsModal.value = true;
          dialogService.open({
            header: 'CAMBIO DE HABITACIÓN',
            content: markRaw(ReservationRoomChanges),
            props: {
              splitMode: code === 'splitted_with_availability',
            },
            onClose: async () => {
              await store.dispatch(
                'reservations/fetchReservationWizardState',
                store.state.reservations.currentReservation?.id
              );
            },
          });
        }
        // CONFIRM RESERVATION AND UPDATE DATA TAB
        if (code === 'to_confirm') {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('reservations/confirmReservation', currentReservation.value?.id);
            void store.dispatch('reservations/fetchReservation', currentReservation.value?.id);
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
        // SEGMENTATION / CHECKIN TAB
        if (code === 'checkin_done_precheckin') {
          if (
            !currentReservation.value?.segmentationId &&
            store.state.categories.categories.length > 0
          ) {
            showSegmentationModal.value = true;
            dialogService.open({
              header: 'Segmentación ' + currentReservation.value?.name,
              content: markRaw(ReservationSegmentation),
              props: {
                parentName: 'ReservationGeneralTab',
                isOpenFromGeneralTab: true,
              },
              onAccept: async () => {
                await doAllCheckins(currentReservation.value?.id ?? 0);
                await store.dispatch('planning/fetchPlanning', {
                  dateStart: store.state.planning.dateStart,
                  dateEnd: store.state.planning.dateEnd,
                  propertyId: store.state.properties.activeProperty?.id,
                  availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
                });
                context.emit('setTabValue', 'guests');
              },
            });
          } else {
            await doAllCheckins(currentReservation.value?.id ?? 0);
            context.emit('setTabValue', 'guests');
          }
        }
        // MAILING
        if (
          code === 'confirmed_without_payment_and_precheckin' ||
          code === 'confirmed_without_payment' ||
          code === 'confirmed_without_precheckin'
        ) {
          const payload = {
            folioId: currentFolio.value?.id,
            mailType: 'confirm',
          };
          void store.dispatch('layout/showSpinner', true);
          try {
            const response = (await store.dispatch(
              'folios/fetchFolioMailData',
              payload
            )) as AxiosResponse<{ bodyMail: string; subject: string }>;
            if (response.data) {
              if (response.data.bodyMail) {
                bodyMail.value = response.data.bodyMail;
              }
              if (response.data.subject) {
                subject.value = response.data.subject;
              }
            }
            mailDialog.value = true;
            dialogService.open({
              header: 'Enviar correo de confirmación',
              content: markRaw(MailComponent),
              closable: true,
              props: {
                template: bodyMail.value,
                defaultSubject: subject.value,
              },
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

        // open checkin modal
        if (code === 'checkin_partial_precheckin' || code === 'checkin_no_precheckin') {
          isCheckinModalOpen.value = true;
        }
        // remove penalty cancel amount
        if (code === 'cancelled') {
          dialogService.open({
            header: 'Eliminar penalización',
            content: '¿Estás seguro de que quieres eliminar la penalización?',
            btnAccept: 'Eliminar penalización',
            btnCancel: 'Cancelar',
            onAccept: () => {
              deleteCancelPenalty();
            },
          });
          showDeleteCancelPenalty.value = true;
        }
        if (code === 'onboard_without_payment' || code === 'done_without_payment') {
          chargesModal.value = true;
          dialogService.open({
            header: 'Cobros',
            content: markRaw(TransactionCharges),
            props: {
              isRefund: false,
              isEdit: false,
              chargeAmount: currentFolio.value?.pendingAmount ?? 0,
            },
          });
        }
        if (code === 'checkout') {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch('reservations/checkoutReservation', {
              reservationId: currentReservation.value?.id,
              toCheckout: true,
            });
            await Promise.all([
              store.dispatch('reservations/fetchReservation', currentReservation.value?.id),
              store.dispatch('planning/fetchPlanning', {
                dateStart: store.state.planning.dateStart,
                dateEnd: store.state.planning.dateEnd,
                propertyId: store.state.properties.activeProperty?.id,
                availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
              }),
            ]);
          } catch {
            dialogService.open({
              header: 'Error',
              content: 'Algo ha ido mal',
              btnAccept: 'Ok',
            });
          } finally {
            void store.dispatch('layout/showSpinner', false);
            context.emit('setTabValue', 'guests');
          }
        }
      }
      await store.dispatch(
        'reservations/fetchReservationWizardState',
        store.state.reservations.currentReservation?.id
      );
    };

    const wizardStateButtonText = () => {
      let text = '';
      if (wizardState.value?.code) {
        const code = wizardState.value?.code;
        if (code === 'overbooking_with_availability') {
          text = 'Gestionar hab';
        }
        if (code === 'splitted_with_availability') {
          const roomTypeClassName = store.state.roomTypeClasses.roomTypeClasses.find(
            (rtc) => rtc.id === currentReservation.value?.roomTypeClassId
          )?.name;
          if (roomTypeClassName) {
            text = `Unificar ${roomTypeClassName}`;
          } else {
            text = 'Unificar';
          }
        }
        if (code === 'to_assign') {
          text = 'Confirmar asignación';
        }
        if (code === 'to_confirm') {
          text = 'Confirmar';
        }
        if (code === 'checkin_done_precheckin') {
          text = 'Marcar llegada';
        }
        if (code === 'checkin_partial_precheckin') {
          text = 'Iniciar check-in';
        }
        if (code === 'checkin_no_precheckin') {
          text = 'Iniciar check-in';
        }
        if (code === 'confirmed_without_payment_and_precheckin') {
          text = 'Enviar email';
        }
        if (code === 'confirmed_without_payment') {
          text = 'Enviar email';
        }
        if (code === 'confirmed_without_precheckin') {
          text = 'Enviar email';
        }
        if (code === 'cancelled') {
          text = 'Quitar penalización';
        }
        if (code === 'onboard_without_payment') {
          text = 'Registrar cobro';
        }
        if (code === 'done_without_payment') {
          text = 'Registrar cobro';
        }
        if (code === 'checkout') {
          text = 'Hacer check-out';
        }
      }
      return text;
    };

    const deleteCancelPenalty = async () => {
      const serviceIsCancelPenalty = store.state.services.services.find((s) => s.isCancelPenalty);
      if (serviceIsCancelPenalty) {
        await store.dispatch('services/deleteService', serviceIsCancelPenalty.id);
        await store.dispatch(
          'reservations/fetchReservationWizardState',
          store.state.reservations.currentReservation?.id
        );
        await store.dispatch('reservations/fetchReservation', store.state.reservations.currentReservation?.id);
        await store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id);
        await store.dispatch('services/fetchServices', store.state.reservations.currentReservation?.id);
        showDeleteCancelPenalty.value = false;
      }
    };

    const toggleShowRoomsDialog = (param: boolean) => {
      splitMode.value = param;
      dialogService.open({
        header: 'CAMBIO DE HABITACIÓN',
        content: markRaw(ReservationRoomChanges),
        props: {
          splitMode: param,
        },
        onClose: async () => {
          await store.dispatch(
            'reservations/fetchReservationWizardState',
            store.state.reservations.currentReservation?.id
          );
        },
        onAccept: (result?: unknown) => context.emit('setTabValue', 'room'),
      });
    };

    watch(wizardState, () => {
      if (wizardState.value?.code) {
        showWizardState.value = true;
      } else {
        showWizardState.value = false;
      }
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      const pricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === currentReservation.value?.pricelistId
      );
      if (pricelist) {
        pricelistName.value = pricelist.name;
      } else if (currentReservation.value?.pricelistId) {
        await store.dispatch(
          'pricelists/fetchRestrictedPricelist',
          currentReservation.value?.pricelistId
        );
        pricelistName.value = store.state.pricelists.restrictedPricelist?.name ?? '';
      }
      try {
        await store.dispatch(
          'reservations/fetchReservationWizardState',
          store.state.reservations.currentReservation?.id
        );
        await store.dispatch(
          'services/fetchServices',
          store.state.reservations.currentReservation?.id
        );
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
      currentFolio,
      currentReservations,
      currentReservation,
      wizardState,
      changeDatesModal,
      changeRoomsModal,
      isReservationBlockedModalOpen,
      agencyName,
      splitMode,
      isCheckinModalOpen,
      mailDialog,
      bodyMail,
      subject,
      showDeleteCancelPenalty,
      chargesModal,
      showWizardState,
      showSegmentationModal,
      pricelistName,
      toggleShowRoomsDialog,
      getDateFormat,
      getAgencyName,
      getDateTimeFormat,
      getShortDateFormat,
      getAmountNights,
      getSaleChannel,
      getReservationColor,
      reservationStateText,
      openChangeDatesModal,
      wizardStateClick,
      wizardStateButtonText,
      deleteCancelPenalty,
      closeSegmentationAndDoCheckin,
    };
  },
});
</script>
<style scoped lang="scss">
.data-reservation {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  .wizard-state {
    border-radius: 9px;
    background: #f4f4f4;
    margin: 1.5rem 0.5rem 0rem 0.5rem;
    padding: 9px 13px 18px 9px;

    .header {
      color: $call_to_action_color;
      font-size: 13px;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      span {
        margin-left: 5px;
      }
      .div-icon-close {
        margin-left: auto;
        .icon-close {
          width: 10px;
          height: 10px;
          cursor: pointer;
        }
      }
    }
    .wizard-content {
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .wizard-state-info {
        color: #263941;
        margin-right: 15px;
        margin-left: 4px;
      }
      .wizard-button {
        border-radius: 5px;
        background-color: $call_to_action_color;
        color: white;
        cursor: pointer;
        min-width: 15ch;
        padding: 5px 0;
        text-align: center;
      }
    }
  }
  .data-reservation-first-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 1rem 0.8rem 1rem;
    .left {
      display: flex;
      align-items: center;
      font-weight: bold;
      img {
        margin-right: 0.5rem;
      }
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: $call_to_action_color;
      font-weight: 600;
      border-radius: 5px;
      height: 30px;
      .change-dates-text {
        margin-left: 0.2rem;
        text-align: right;
      }
    }
  }
  .data-reservation-row {
    display: flex;
    justify-content: space-between;
    .reservation-title {
      margin-left: 1.4rem;
    }
    .reservation-data {
      margin-right: 1.4rem;
      font-weight: bold;
    }
    .reservation-data-state {
      color: white;
      margin-right: 1rem;
      padding: 0 0.5rem;
      border-radius: 30px;
      font-weight: bold;
    }
    .btn-overbooking {
      background-color: #ff4e00;
      border-radius: 4px;
      display: flex;
      align-items: center;
      color: white;
      margin-left: 25px;
      width: fit-content;
      height: 30px;
      font-size: 14px;
      font-weight: 600;
      padding-right: 1rem;
      cursor: pointer;
      margin-bottom: 25px;
      .icon-alert {
        margin-left: 1rem;
        margin-right: 12px;
      }
    }
    .reservation-data-nights {
      margin-right: 1rem;
      padding: 0 0.5rem;
      border-radius: 30px;
      background-color: #f7f7f7;
      display: flex;
      align-items: center;
      font-weight: bold;
      span {
        margin-left: 0.5rem;
      }
    }
  }
  hr {
    border: none;
    height: 1px;
    background-color: #e1e0e0;
    width: 95%;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    margin-left: 5%;
  }
}

.checkin-flow-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}
@media (min-width: 1024px) {
  .data-reservation {
    font-size: 14px;
    .wizard-state {
      margin: 1.5rem 1.5rem 0rem 1.5rem;
      .header {
        font-size: 14px;
        .div-icon-close {
          margin-bottom: 2px;
          .icon-close {
            width: 12px;
            height: 12px;
          }
        }
      }
      .wizard-content {
        .wizard-state-info {
          font-size: 14px;
        }
        .wizard-button {
          width: 160px;
          font-size: 14px;
          padding-right: 15px;
          padding-left: 13px;
        }
      }
    }
    .data-reservation-first-row {
      margin: 1.5rem 1rem 0.8rem 1rem;
      .left {
        padding-left: 10px;
        img {
          height: 20px;
          width: 20px;
        }
      }
      .right {
        margin-right: 10px;
        width: 155px !important;
        cursor: pointer;
        img {
          height: 20px;
          width: 20px;
          margin-left: 0.75rem;
        }
        .change-dates-text {
          margin-left: 0.2rem;
          margin-right: 0.75rem;
        }
      }
    }
    .data-reservation-row {
      .reservation-title {
        margin-left: 2.5rem !important;
      }
      .reservation-data,
      .reservation-data-state {
        margin-right: 2.5rem !important;
      }
      .reservation-data-nights {
        margin-right: 2rem !important;
      }
    }
    hr {
      width: 92% !important;
    }
  }
}

.checkin-flow-transition-enter-active,
.checkin-flow-transition-leave-active {
  transition: all 0.3s linear;
}
.checkin-flow-transition-enter-to,
.checkin-flow-transition-leave-from {
  transform: translateX(0);
}
.checkin-flow-transition-enter-from,
.checkin-flow-transition-leave-to {
  transform: translateX(100%);
}
</style>
