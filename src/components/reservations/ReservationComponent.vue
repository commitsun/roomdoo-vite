<template>
  <div
    class="reservation"
    :style="`border-color:${reservationColor(reservation, folio.pendingAmount || 0)}`"
  >
    <div
      class="reservation-left"
      :style="`background-color:${reservationColor(reservation, folio.pendingAmount || 0)}`"
    >
      <div
        class="position-reservation"
        :style="`color:${reservationColor(reservation, folio.pendingAmount || 0)}`"
      >
        {{ reservation.folioSequence }}
      </div>
      <div class="room">
        <div class="room-row">
          <CustomIcon
            imagePath="/app-images/icon-alert.svg"
            color="#FFFFFF"
            width="10px"
            height="10px"
            v-if="reservation.overbooking"
            class="icon-alert"
          />
          <span class="reservation-state">
            {{ reservationStateText(reservation) }}
          </span>
        </div>
        <span class="reservation-room">
          <span v-if="reservation.preferredRoomId">
            {{ roomShortName(reservation.preferredRoomId) }}
          </span>
          {{ roomTypeDefaultCode }}
        </span>
      </div>
    </div>
    <div class="reservation-right">
      <div class="labels">
        <div class="icons">Noches</div>
        <div class="dates">Fechas</div>
        <div class="icons" v-if="reservation.reservationType !== 'out'">Adultos</div>
        <div class="icons" v-if="reservation.reservationType !== 'out'">Servicios</div>
        <div class="amount" v-if="reservation.reservationType !== 'out'">Precio</div>
      </div>
      <div class="reservation-info">
        <div class="dates">
          <div class="date">
            {{ formatedDate(reservation.checkin) }}
          </div>
          <img class="arrow-right-blue" src="/app-images/arrow-right-blue.svg" />
          <div class="date">
            {{ formatedDate(reservation.checkout) }}
          </div>
        </div>
        <div class="icons icon-night">
          <span>
            {{ reservation.nights }}
          </span>
          <CustomIcon
            imagePath="/app-images/icon-nights.svg"
            color="#ACACAC"
            width="10px"
            height="10px"
          />
        </div>
        <div class="icons" v-if="reservation.reservationType !== 'out'">
          <span>
            {{ reservation.adults }}
          </span>
          <CustomIcon
            imagePath="/app-images/icon-users-blue.svg"
            color="#ACACAC"
            width="11px"
            height="11px"
          />
        </div>
        <div
          class="icons"
          :class="reservation.numServices === 0 ? 'no-icon' : ''"
          v-if="reservation.reservationType !== 'out'"
        >
          <span v-if="reservation.numServices !== 0">
            {{ reservation.numServices }}
          </span>
          <CustomIcon
            v-if="reservation.numServices !== 0"
            imagePath="/app-images/icon-room-services.svg"
            color="#ACACAC"
            width="12px"
            height="12px"
          />
          <CustomIcon
            v-if="reservation.numServices === 0"
            imagePath="/app-images/icon-no-room-service.svg"
            color="#ACACAC"
            width="12px"
            height="12px"
          />
        </div>
        <div class="amount" v-if="reservation.reservationType !== 'out'">
          {{ getDecimals(reservation.priceTotal || 0) }}
        </div>
      </div>
    </div>
    <div
      class="three-dots"
      tabindex="1"
      :class="
        reservation.stateCode === 'done' ||
        reservation.stateCode === 'onboard' ||
        reservation.stateCode === 'departure_delayed' ||
        (reservation.stateCode === 'done' && reservation.reservationType === 'out')
          ? 'disabled'
          : ''
      "
      @click.stop="openReservationOptionsMenu = !openReservationOptionsMenu"
      @blur="openReservationOptionsMenu = false"
    >
      <div
        class="circle"
        :style="`background-color:${reservationColor(reservation, folio.pendingAmount || 0)}`"
      />
      <div
        class="circle"
        :style="`background-color:${reservationColor(reservation, folio.pendingAmount || 0)}`"
      />
      <div
        class="circle"
        :style="`background-color:${reservationColor(reservation, folio.pendingAmount || 0)}`"
      />
      <transition name="menu-reservation">
        <div class="reservation-menu" v-if="openReservationOptionsMenu">
          <div
            v-if="
              (reservation.stateCode === 'draft' || reservation.stateCode === 'cancel') && folio.id
            "
            class="option-confirm"
            @click="confirmReservation(folio.id ?? 0, reservation.id)"
          >
            <span> Confirmar Reserva </span>
          </div>
          <div
            class="option-cancel-reservation"
            v-if="
              (reservation.stateCode === 'draft' ||
                reservation.stateCode === 'confirm' ||
                reservation.stateCode === 'arrival_delayed') &&
              folio.id
            "
            @click="cancelReservation(folio.id ?? 0, reservation.id)"
          >
            <CustomIcon
              :imagePath="'/app-images/icon-lock.svg'"
              :color="'primary'"
              :width="'12px'"
              :height="'12px'"
              v-if="reservation?.isBlocked"
            />
            <span> Cancelar reserva </span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, onBeforeMount, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import type { ReservationInterface } from '@/interfaces/ReservationInterface';
import { reservationStateText } from '@/utils/reservation';
import { useStore } from '../../store';
import type { FolioInterface } from '../../interfaces/FolioInterface';
import { usePlanning } from '../../utils/usePlanning';
import { dialogService } from '@/services/DialogService';
import FolioOrReservationCancelBlocked from '@/components/alerts/FolioOrReservationCancelBlocked.vue';
export default defineComponent({
  components: {
    CustomIcon,
  },
  props: {
    reservation: {
      type: Object as () => ReservationInterface,
      required: true,
    },
    folio: {
      type: Object as () => FolioInterface,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const { refreshPlanning } = usePlanning();
    const roomTypeDefaultCode = ref('no-room-type-name');
    const openReservationOptionsMenu = ref(false);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const currentReservation = computed(() => store.state.reservations.currentReservation);

    const reservationColor = (reservation: ReservationInterface, folioPendingAmount: number) => {
      let result;
      if (activeProperty.value?.colorOptionConfig === 'advanced') {
        if (reservation.stateCode === 'confirm' || reservation.stateCode === 'arrival_delayed') {
          result = activeProperty.value.confirmedReservationColor;
        }
        if (reservation.stateCode === 'draft') {
          result = activeProperty.value?.preReservationColor;
        }
        if (reservation.stateCode === 'onboard' || reservation.stateCode === 'departure_delayed') {
          if (folioPendingAmount > 0) {
            result = activeProperty.value.onBoardReservationColor;
          } else if (folioPendingAmount === 0) {
            result = activeProperty.value.paidCheckinReservationColor;
          }
        }
        if (reservation.stateCode === 'done') {
          if (folioPendingAmount > 0) {
            result = activeProperty.value.outReservationColor;
          } else if (folioPendingAmount === 0) {
            result = activeProperty.value.paidReservationColor;
          }
        }
        if (reservation.toAssign === true) {
          result = activeProperty.value.toAssignReservationColor;
        }
        if (folioPendingAmount < 0) {
          result = activeProperty.value.overPaymentColor;
        }
        if (reservation.reservationType === 'staff') {
          result = activeProperty.value.staffReservationColor;
        }
        if (reservation.isReselling) {
          result = '#ebbfd6';
        }
      } else {
        if (reservation.stateCode === 'done') {
          result = activeProperty.value?.simpleOutColor;
        }
        if (reservation.stateCode === 'onboard' || reservation.stateCode === 'departure_delayed') {
          result = activeProperty.value?.simpleInColor;
        }
        if (
          reservation.stateCode === 'confirm' ||
          reservation.stateCode === 'arrival_delayed' ||
          reservation.stateCode === 'draft'
        ) {
          result = activeProperty.value?.simpleFutureColor;
        }
      }
      if (reservation.reservationType === 'out') {
        result = '#284E73';
      }
      if (reservation.overbooking) {
        result = '#FF4E00';
      }

      if (reservation.stateCode === 'cancel') {
        result = '#7C7C7C';
      }
      return result;
    };

    const roomShortName = (roomId: number) => {
      const index = store.state.rooms.rooms.findIndex((el) => el.id === roomId);
      let result = 'no room name';
      if (index !== -1) {
        result = store.state.rooms.rooms[index].shortName;
      }
      return result;
    };

    const formatedDate = (dateFormat: string | Date) => {
      const date = new Date(dateFormat);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.toLocaleString('default', { year: '2-digit' });
      let result = '';
      if (date.getDay() === 0) {
        result = 'Dom, ';
      } else if (date.getDay() === 1) {
        result = 'Lun, ';
      } else if (date.getDay() === 2) {
        result = 'Mar, ';
      } else if (date.getDay() === 3) {
        result = 'Mie, ';
      } else if (date.getDay() === 4) {
        result = 'Jue, ';
      } else if (date.getDay() === 5) {
        result = 'Vie, ';
      } else if (date.getDay() === 6) {
        result = 'Sab, ';
      }
      result += `${date.getDate()} ${month.charAt(0).toUpperCase() + month.slice(1, 3)} ${year}`;
      return result;
    };

    const getDecimals = (price: number) => {
      const parts = price.toString().split('.');
      if (parts.length === 1) {
        parts[1] = '00';
      } else if (parts[1].length === 1) {
        parts[1] += '0';
      }
      return `${parts[0]},${parts[1]}€`;
    };

    const getAgencyName = () =>
      store.state.agencies.agencies.find((el) => el.id === currentReservation.value?.agencyId)
        ?.name;

    const cancelReservation = async (folioId: number, reservationId: number) => {
      if (props.reservation?.isBlocked) {
        let messageDialog = '';
        const agencyName = store.state.agencies.agencies.find(
          (el) => el.id === props.reservation.agencyId
        )?.name;
        if (agencyName) {
          messageDialog = `Reserva bloqueada por ${agencyName}`;
        } else {
          messageDialog = 'Reserva bloqueada';
        }
        dialogService.open({
          iconHeader: '/app-images/icon-lock.svg',
          header: messageDialog,
          content: markRaw(FolioOrReservationCancelBlocked),
          props: {
            agencyName: agencyName,
          },
        });
      } else {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch('reservations/cancelReservation', reservationId);
          const payload = {
            propertyId: store.state.properties.activeProperty?.id,
            filter: store.state.layout.rightDrawerSearchParam,
            limit: 40,
            offset: 0,
          };
          await store.dispatch('reservations/fetchReservation', reservationId);
          await store.dispatch('reservations/fetchReservations', folioId);
          await store.dispatch('folios/fetchFolios', payload);
          openReservationOptionsMenu.value = false;
          if (router.currentRoute.value.path === '/planning/') {
            await refreshPlanning();
          }
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
    };
    const confirmReservation = async (folioId: number, reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/confirmReservation', reservationId);
        const payload = {
          propertyId: store.state.properties.activeProperty?.id,
          filter: store.state.layout.rightDrawerSearchParam,
          limit: 40,
          offset: 0,
        };

        await store.dispatch('reservations/fetchReservation', reservationId);
        await store.dispatch('reservations/fetchReservations', folioId);
        await store.dispatch('reservations/fetchReservations', folioId);
        await store.dispatch('folios/fetchFolios', payload);
        openReservationOptionsMenu.value = false;
        if (router.currentRoute.value.path === '/planning/') {
          await refreshPlanning();
        }
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }
    };

    onBeforeMount(async () => {
      const roomType = store.state.roomTypes.roomTypes.find(
        (el) => el.id === props.reservation.roomTypeId
      );
      roomTypeDefaultCode.value = roomType?.defaultCode ?? '';
      if (!roomType && props.reservation.roomTypeId) {
        await store.dispatch('roomTypes/fetchRestrictedRoomType', props.reservation.roomTypeId);
        roomTypeDefaultCode.value = store.state.roomTypes.restrictedRoomType?.defaultCode ?? '';
      }
    });

    return {
      reservationColor,
      reservationStateText,
      roomShortName,
      formatedDate,
      getDecimals,
      cancelReservation,
      confirmReservation,
      getAgencyName,
      roomTypeDefaultCode,
      openReservationOptionsMenu,
      currentReservation,
    };
  },
});
</script>
<style lang="scss" scoped>
.reservation {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 12px;
  height: 35px;
  border: 1px solid;
  border-radius: 20px;
  font-size: 12px;
  background-color: white;
  .reservation-left {
    border-radius: 20px 0px 0px 20px;
    height: 100%;
    display: flex;
    align-items: center;
    width: 35%;
    padding: 0 8px;
    .position-reservation {
      font-size: 10px;
      border-radius: 50%;
      background-color: #ffffff;
      width: 15px;
      height: 15px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .room {
      padding-left: 5px;
      display: flex;
      flex-direction: column;
      color: white;
      line-height: 14px;
      .room-row {
        display: flex;
        align-items: center;
        .icon-alert {
          margin: 2px 5px 0 0;
        }
      }
      .reservation-room {
        font-weight: bold;
      }
    }
  }
  .reservation-right {
    display: flex;
    flex-direction: row;
    width: 68%;
    .labels {
      display: none;
    }
    .reservation-info {
      display: flex;
      width: 100%;
      justify-content: space-between;
      .dates {
        padding-top: 2px;
        padding-left: 8px;
        height: 100%;
        line-height: 14px;
        display: flex;
        flex-direction: column;
        img {
          display: none;
        }
      }
      .icons {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .no-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .amount {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .menu-reservation-enter-active,
  .menu-leave-active {
    transition: all 0.2s ease-in-out;
  }
  .menu-reservation-enter-from,
  .menu-leave-to {
    opacity: 0;
    transform: scale(1.1);
  }
  .three-dots {
    position: relative;
    height: 100%;
    padding-top: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 10px;
    .circle {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      margin-top: 3px;
    }
    .circle:first-child {
      margin-top: 0px;
    }
    cursor: pointer;
    .reservation-menu {
      user-select: none;
      position: absolute;
      width: 180px;
      display: flex;
      flex-direction: column;
      background-color: #ffffff;
      color: black;
      font-size: 14px;
      box-shadow: 0px 4px 14px rgb(0 0 0 / 20%);
      border-radius: 10px;
      cursor: pointer;
      padding: 0.2rem 0;
      left: -185px;
      top: -10px;
      div {
        padding: 0.3rem 1rem;
        &:hover {
          font-weight: bold;
        }
      }
      .option-cancel {
        display: flex;
        align-items: center;
        color: #f21e1e;
        .menu-len-reservations {
          margin-left: 0.2rem;
        }
      }
      .option-confirm {
        display: flex;
        align-items: center;
        color: $primary;
        .menu-len-reservations {
          margin-left: 0.2rem;
        }
      }
      .option-cancel-reservation {
        display: flex;
        align-items: center;
      }
    }
  }
}
.reservation-blocked-modal {
  height: 100%;
  .reservation-blocked-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: $primary;
    margin-left: 0.5rem;
    .title {
      margin-left: 0.5rem;
      color: black;
    }
  }
  .reservation-blocked-content {
    height: 100%;
    padding: 1rem;
    font-size: 14px;
    .reservation-blocked {
      padding-bottom: 1rem;
      .first-row {
        font-weight: bold;
      }
    }
  }
}
@media (min-width: 1024px) {
  .reservation {
    .reservation-left {
      width: 22%;
      .room {
        .reservation-room {
          font-size: 14px;
        }
      }
    }
    .reservation-right {
      flex-direction: column;
      height: 100%;
      width: 73%;
      .labels {
        display: flex;
        height: 40%;
        width: 100%;
        font-weight: 400;
        font-size: 9px;
        color: #797979;
        .dates {
          width: 49%;
          padding-left: 10px;
        }
        .icons {
          width: 11%;
          display: flex;
          justify-content: center;
        }
        .amount {
          display: flex;
          justify-content: center;
          width: 18%;
          padding-left: 15px;
        }
      }
      .reservation-info {
        font-size: 13px;
        height: 50%;
        width: 100%;
        justify-content: start;
        .dates {
          padding-top: 0px;
          width: 49%;
          display: flex;
          flex-direction: row;
          padding-left: 10px;
          align-items: center;
          order: 2;
          img {
            margin-left: 6px;
            margin-right: 7px;
            display: block;
            width: 4px;
            height: 6px;
          }
        }
        .icons {
          padding-top: 2px;
          width: 11%;
          order: 3;
          flex-direction: row;
          justify-content: center;

          span {
            margin-right: 4px;
          }
        }
        .icon-night {
          order: 1;
        }
        .amount {
          width: 18%;
          order: 4;
          padding-top: 0;
          padding-left: 15px;
        }
      }
    }
    .three-dots {
      width: 5%;
    }
  }
  .reservation-blocked-modal {
    height: 100%;
    .reservation-blocked-title {
      height: 60px;
      margin-left: 1.5rem;
      font-size: 18px;
      .title {
        margin-left: 0.5rem;
      }
    }
    .reservation-blocked-content {
      width: 600px;
      padding: 1rem 1.5rem;
      font-size: 16px;
      border-top: 1px solid #d9d9d9;
    }
  }
}
</style>
