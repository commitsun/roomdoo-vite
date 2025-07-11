<template>
  <div class="data-reservation-room" v-if="!currentReservation?.isSplitted">
    <div class="data-reservation-first-row">
      <div class="left">
        <img src="/app-images/bed-blue.svg" />
        <span>
          Habitación
          {{ currentReservation?.reservationType !== 'out' ? 'de la reserva' : 'fuera de venta' }}
        </span>
      </div>
      <div class="right" v-if="currentReservation?.toAssign" @click="toggleShowRoomsDialog(true)">
        <img src="/app-images/icon-room-preferences-white.svg" />
        <span> Confirmar asignación </span>
      </div>
      <div class="right-link" @click="toggleShowRoomsDialog(false)" v-else>
        <span> Gestionar habitación</span>
      </div>
    </div>
    <div class="data-reservation-row">
      <span class="reservation-title">
        Habitación {{ currentReservation?.reservationType !== 'out' ? 'asignada' : '' }}
      </span>
      <span class="reservation-data-nights">
        <CustomIcon
          imagePath="/app-images/bed-black.svg"
          color="#000000"
          width="16px"
          height="16px"
        />
        <span>
          {{ getRoomName(currentReservation?.preferredRoomId || 0) }}
        </span>
      </span>
    </div>
    <hr v-if="currentReservation?.reservationType !== 'out'" />
    <div class="data-reservation-row" v-if="extraBedsAmount() > 0">
      <span class="reservation-title"> Camas supletorias </span>
      <span class="reservation-data">
        +{{ extraBedsAmount() }} cama{{ extraBedsAmount() > 1 ? 's' : '' }} supletoria{{
          extraBedsAmount() > 1 ? 's' : ''
        }}
      </span>
    </div>
    <hr v-if="extraBedsAmount() > 0" />
    <div class="data-reservation-row" v-if="currentReservation?.reservationType !== 'out'">
      <span class="reservation-title"> Capacidad total </span>
      <span class="reservation-data">
        {{ currentReservation?.adults ? currentReservation?.adults + extraBedsAmount() : 0 }}
        personas
      </span>
    </div>
    <hr v-if="roomUbication(currentReservation?.id || 0)" />
    <div class="data-reservation-row" v-if="roomUbication(currentReservation?.id || 0)">
      <span class="reservation-title"> Zona </span>
      <span class="reservation-data">
        {{ roomUbication(currentReservation?.id || 0) }}
      </span>
    </div>
    <hr v-if="amenityNames(currentReservation?.id || 0)" />
    <div class="data-reservation-row" v-if="amenityNames(currentReservation?.id || 0)">
      <span class="reservation-title"> Características </span>
      <span class="reservation-data-amenities">
        {{ amenityNames(currentReservation?.id || 0) }}
      </span>
    </div>
  </div>

  <div class="data-reservation-room" v-else>
    <div class="data-reservation-first-row">
      <div class="left">
        <img src="/app-images/icon-call-split.svg" class="icon-split" />
        <span> Reserva dividida </span>
      </div>
      <div class="right" v-if="currentReservation?.toAssign" @click="toggleShowRoomsDialog(false)">
        <img src="/app-images/icon-room-preferences-white.svg" />
        <span> Confirmar asignación </span>
      </div>
      <div class="right-link" @click="toggleShowRoomsDialog(true)" v-else>
        <span> Gestionar habitación </span>
      </div>
    </div>
    <div class="reservation-line">
      <div
        v-for="(reservationLines, index) in groupedReservationLines"
        class="data-reservation-line"
        :key="index"
      >
        <div class="data-reservation-line-row">
          <span class="reservation-line-title">
            <span class="reservation-line-index"> {{ index + 1 }}ª </span> Desde
            <span class="text-bold">
              {{ reservationLineDate(reservationLines[0].date as Date) }}
            </span>
            al
            <span class="text-bold">
              {{
                reservationLineDate(
                  addDayToDate(reservationLines[reservationLines.length - 1].date as Date),
                )
              }}
            </span>
          </span>
          <span class="reservation-line-data">
            <img src="/app-images/bed-black.svg" />
            <span>
              {{ getRoomName(reservationLines[0].roomId) }}
            </span>
          </span>
        </div>
        <hr v-if="index + 1 !== groupedReservationLines.length" />
      </div>
    </div>

    <div
      v-for="(room, index) in diferentRoomsInSplittedReservations"
      :key="room.id"
      class="reservation-line"
    >
      <div class="data-reservation-line">
        <div class="data-reservation-first-row">
          <div class="left">
            <img src="/app-images/bed-blue.svg" />
            <span> {{ index + 1 }} ª Habitación - {{ room.name }} </span>
          </div>
        </div>
        <div class="data-reservation-row">
          <span class="reservation-title"> Habitación asignada </span>
          <span class="reservation-data-nights">
            <CustomIcon
              imagePath="/app-images/bed-black.svg"
              color="#000000"
              width="16px"
              height="16px"
            />
            <span>
              {{ room.name }}
            </span>
          </span>
        </div>
        <hr />
        <div class="data-reservation-row" v-if="extraBedsAmount() > 0">
          <span class="reservation-title"> Camas supletorias </span>
          <span class="reservation-data">
            +{{ extraBedsAmount() }} cama{{ extraBedsAmount() > 1 ? 's' : '' }} supletoria{{
              extraBedsAmount() > 1 ? 's' : ''
            }}
          </span>
        </div>
        <hr v-if="extraBedsAmount() > 0" />
        <div class="data-reservation-row">
          <span class="reservation-title"> Capacidad total </span>
          <span class="reservation-data">
            {{ currentReservation?.adults ? currentReservation?.adults + extraBedsAmount() : 0 }}
            personas
          </span>
        </div>
        <hr v-if="roomUbication(room.id)" />
        <div class="data-reservation-row" v-if="roomUbication(room.id || 0)">
          <span class="reservation-title"> Zona </span>
          <span class="reservation-data">
            {{ roomUbication(room.id) }}
          </span>
        </div>
        <hr v-if="amenityNames(room.id)" />
        <div class="data-reservation-row" v-if="amenityNames(room.id)">
          <span class="reservation-title"> Características </span>
          <span class="reservation-data-amenities">
            {{ amenityNames(room.id) }}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div class="partner-requests">
    <div class="partner-requests-title">
      <div class="partner-request-title-left">
        <img src="/app-images/icon-voice-over.svg" />
        <span>Peticiones especiales del cliente</span>
      </div>
      <div class="partner-requests-title-right">
        <span v-if="!currentReservation?.partnerRequests" @click="openPartnerRequests()">
          Añadir
        </span>
        <span v-else @click="openPartnerRequests()"> Editar </span>
      </div>
    </div>
    <div class="partner-requests-body" v-if="currentReservation?.partnerRequests">
      {{ currentReservation?.partnerRequests }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, markRaw } from 'vue';

import { type ReservationLineInterface } from '@/_legacy/interfaces/ReservationLineInterface';
import ReservationRoomChanges from '@/_legacy/components/reservations/ReservationRoomChanges.vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import ReservationPartnerRequests from '@/_legacy/components/reservations/ReservationPartnerRequests.vue';
import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    CustomIcon,
  },

  setup() {
    const store = useStore();

    const changeRoomModal = ref(false);
    const splitMode = ref(false);

    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const reservationLines = computed(() => store.state.reservationLines.reservationLines);

    const diferentRoomsInSplittedReservations = computed(() => {
      const rooms = reservationLines.value.map((reservationLine) => reservationLine.roomId);
      return store.state.rooms.rooms.filter((room) => rooms.includes(room.id));
    });

    const groupedReservationLines = computed(() => {
      const groupedLines: ReservationLineInterface[][] = [];
      let currentGroup: ReservationLineInterface[] = [];
      const oneDay = 24 * 60 * 60 * 1000;
      const lines = reservationLines.value;

      const sortedLines = lines.sort(
        (a, b) => (a.date as Date).getTime() - (b.date as Date).getTime(),
      );

      for (let i = 0; i < sortedLines.length; i += 1) {
        const line = sortedLines[i];
        const prevLine = currentGroup[currentGroup.length - 1];

        if (
          currentGroup.length === 0 ||
          line.roomId !== prevLine.roomId ||
          !Math.round(
            Math.abs(((line.date as Date).getTime() - (prevLine.date as Date).getTime()) / oneDay),
          )
        ) {
          if (currentGroup.length > 0) {
            groupedLines.push(currentGroup);
          }
          currentGroup = [line];
        } else {
          currentGroup.push(line);
        }
      }

      if (currentGroup.length > 0) {
        groupedLines.push(currentGroup);
      }
      return groupedLines;
    });

    const getRoomName = (preferredRoomId: number) =>
      store.state.rooms.rooms.find((el) => el.id === preferredRoomId)?.name;

    const amenityNames = (roomId: number) => {
      const room = store.state.rooms.rooms.find((el) => el.id === roomId);
      return room?.roomAmenityIds
        ?.map((id) => {
          const amenity = store.state.amenities.amenities.find((el) => el.id === id);
          return amenity?.name;
        })
        .join(', ');
    };

    const extraBedsAmount = () =>
      store.state.services.services.reduce((count, service) => {
        const matchingBeds = store.state.extraBeds.extraBeds.filter(
          (extraBed) => extraBed.id === service.productId,
        );
        return count + matchingBeds.length;
      }, 0);

    const roomUbication = (roomId: number) => {
      const room = store.state.rooms.rooms.find((el) => el.id === roomId);
      const ubication = store.state.ubications.ubications.find((el) => el.id === room?.ubicationId);
      return ubication?.name;
    };

    const getDayOfWeek = (date: Date) => {
      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const dayIndex = date.getDay();
      return daysOfWeek[dayIndex];
    };

    const getMonthName = (date: Date) => {
      const months = [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ];
      const monthIndex = date.getMonth();
      return months[monthIndex];
    };

    const reservationLineDate = (dateString: Date) => {
      const dayOfWeek = getDayOfWeek(dateString);
      const dayOfMonth = dateString.getDate();
      const month = getMonthName(dateString);
      const year = dateString.getFullYear().toString().substring(2);
      return `${dayOfWeek}, ${dayOfMonth} de ${month} ${year}`;
    };

    const addDayToDate = (date: Date) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      return newDate;
    };

    const toggleShowRoomsDialog = (param: boolean) => {
      splitMode.value = param;
      changeRoomModal.value = true;
      dialogService.open({
        header: 'CAMBIO DE HABITACIÓN',
        content: markRaw(ReservationRoomChanges),
        props: {
          splitMode: param,
        },
        onClose: async () => {
          await store.dispatch(
            'reservations/fetchReservationWizardState',
            store.state.reservations.currentReservation?.id,
          );
        },
      });
    };

    const openPartnerRequests = () => {
      dialogService.open({
        iconHeader: '/app-images/icon-voice-over.svg',
        header: 'Editar peticiones especiales del cliente',
        content: markRaw(ReservationPartnerRequests),
      });
    };

    onMounted(async () => {
      let dateFrom;
      let dateTo;
      if (currentReservation.value?.checkin && currentReservation.value.checkout) {
        dateFrom = new Date(currentReservation.value.checkin);
        dateTo = new Date(currentReservation.value.checkout);
      }
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('extraBeds/fetchExtraBeds', {
            pmsPropertyId: store.state.properties.activeProperty?.id,
            dateFrom,
            dateTo,
          }),
          store.dispatch('services/fetchServices', store.state.reservations.currentReservation?.id),
        ]);
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
      changeRoomModal,
      splitMode,
      currentReservation,
      reservationLines,
      diferentRoomsInSplittedReservations,
      groupedReservationLines,
      amenityNames,
      getRoomName,
      extraBedsAmount,
      roomUbication,
      reservationLineDate,
      toggleShowRoomsDialog,
      addDayToDate,
      openPartnerRequests,
    };
  },
});
</script>
<style scoped lang="scss">
.data-reservation-room {
  display: flex;
  flex-direction: column;
  font-size: 13px;
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
      .icon-split {
        width: 18px;
        height: 18px;
      }
    }
    .right {
      display: flex;
      align-items: center;
      background-color: $call_to_action_color;
      color: white;
      font-weight: 600;
      border-radius: 5px;
      height: 30px;
      padding: 0 0.75rem;
      img {
        margin-right: 10px;
      }
    }
    .right-link {
      display: flex;
      align-items: center;
      color: $call_to_action_color;
      font-weight: 600;
      height: 30px;
      cursor: pointer;
      padding-right: 0.5rem;
      img {
        margin-right: 10px;
      }
    }
  }
  .data-reservation-row {
    display: flex;
    justify-content: space-between;
    .reservation-title {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      margin-left: 1.4rem;
    }
    .reservation-data {
      font-weight: bold;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      margin-right: 1.4rem;
    }
    .reservation-data-state {
      font-weight: bold;
      margin-right: 1rem;
      padding: 0 0.5rem;
      border-radius: 30px;
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
      font-weight: bold;
      padding: 0 0.5rem;
      border-radius: 30px;
      background-color: #f7f7f7;
      display: flex;
      align-items: center;
      margin-right: 1rem;
      span {
        margin-left: 0.5rem;
      }
    }
    .reservation-data-amenities {
      font-weight: bold;
      max-width: 45%;
      margin-right: 1.5rem;
      text-align: right;
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

  .reservation-line {
    margin-bottom: 20px;
    .data-reservation-line {
      display: flex;
      flex-direction: column;
      .data-reservation-line-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        .reservation-line-title {
          margin-left: 1rem;

          .reservation-line-index {
            color: $primary;
            margin-right: 0.2rem;
          }
        }
        .reservation-line-data {
          margin-right: 1rem;
          display: flex;
          align-items: center;
          background-color: $roomdoo_lightgray5;
          padding: 0 1rem;
          border-radius: 20px;
          img {
            margin-right: 10px;
          }
        }
      }
    }
  }
}
.partner-requests {
  margin: 0.5rem;
  background-color: #faf8f8;
  border-radius: 10px;
  .partner-requests-title {
    display: flex;
    align-items: center;
    background-color: #f0fcff;
    border-radius: 10px 10px 0px 0px;
    height: 30px;
    font-weight: bold;
    .partner-request-title-left {
      display: flex;
      align-items: center;
      flex-grow: 1;
      padding-left: 10px;
      img {
        width: 17px;
        height: 17px;
        margin: 0 7px;
      }
    }
    .partner-requests-title-right {
      display: flex;
      align-items: center;
      margin-right: 12px;
      span {
        background-color: #f0f0f0;
        border-radius: 5px;
        text-align: center;
        padding: 0 0.5rem;
        cursor: pointer;
        &:hover {
          background-color: #c8c8c8;
          color: white;
          font-weight: bold;
        }
      }
    }
  }
  .partner-requests-body {
    padding: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .data-reservation-room {
    font-size: 14px;
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
        margin-right: 1rem;
        cursor: pointer;
        img {
          height: 20px;
          width: 20px;
          margin-left: 0.75rem;
        }
        span {
          margin-right: 0.75rem;
        }
      }
      .right-link {
        width: 200px !important;
        cursor: pointer;
        justify-content: flex-end;
        margin-right: 1rem;
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
      .reservation-data-amenities {
        max-width: 60%;
        margin-right: 2rem !important;
      }
    }
    hr {
      width: 92% !important;
    }
    .reservation-line {
      margin-bottom: 8px;
      .reservation-line-title {
        margin-left: 2.5rem !important;
      }
      .reservation-line-data,
      .reservation-line-data-state {
        margin-right: 2rem !important;
      }
      .reservation-line-data-nights {
        margin-right: 1.5rem !important;
      }
    }
  }
  .partner-requests {
    font-size: 14px;
    margin: 2.5rem 1.2rem 2rem 1.2rem;
    .partner-requests-title {
      height: 35px;
      img {
        width: 19px;
        height: 19px;
        margin: 0 5px 0 10px;
      }
    }
    .partner-requests-body {
      padding-left: 20px;
    }
  }
}
</style>
