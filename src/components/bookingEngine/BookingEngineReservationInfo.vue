<template>
  <div class="reservation-info">
    <div class="field">
      <div class="label" :class="!reservation.editable ? 'not-editable' : ''">
        <CustomIcon
          imagePath="/app-images/icon-alert.svg"
          width="12px"
          height="12px"
          color="red"
          class="icon"
          v-if="reservation.roomId === 0 && !reservation.autoAssignRoom"
        />
        Habitación
      </div>
      <div class="value">
        <div
          class="toggle-container"
          v-if="
            !reservation.availRoomIds.some((availRoomId) =>
              rooms
                .filter((r) => r.roomTypeId === reservation.roomTypeId)
                .map((r) => r.id)
                .includes(availRoomId)
            ) &&
            reservation.isSplittedAvailability &&
            utilsDates.daysBetween(reservation.checkin, reservation.checkout) > 1
          "
        >
          <span
            class="label"
            @click="$emit('toggleReservationAutoAssignRoomChanged', reservation.id)"
          >
            Crear reserva dividida
          </span>
          <ToggleSwitch
            size="small"
            :modelValue="reservation.autoAssignRoom"
            @click="$emit('toggleReservationAutoAssignRoomChanged', reservation.id)"
          />
        </div>
        <select
          v-if="!reservation.autoAssignRoom"
          :disabled="!reservation.editable"
          :value="reservation.roomId"
          :class="{
            'no-room-id': reservation.roomId === 0 && !reservation.autoAssignRoom,
            'not-editable': !reservation.editable,
          }"
          @change="
            setReservationRoomId(
              reservation.roomTypeId,
              reservation.id,
              parseInt(($event.target as HTMLSelectElement).value, 10)
            )
          "
        >
          <option v-if="!reservation.editable" :value="reservation.roomId">
            {{ rooms.find((el) => el.id === reservation.roomId)?.shortName }}-{{
              reservationRoomTypeCode(reservation.roomTypeId)
            }}
          </option>
          <template v-if="reservation.editable">
            <option :value="0" :key="0">
              {{
                reservation.availRoomIds.length === 0
                  ? 'Sin disponibilidad -'
                  : reservation.roomId === 0
                  ? 'Seleccione habitación'
                  : ''
              }}
            </option>
            <option
              v-for="room in rooms.filter((el) => reservation.availRoomIds.includes(el.id))"
              :key="room.id"
              :value="room.id"
            >
              {{ room.shortName }}-{{ reservationRoomTypeCode(room.roomTypeId) }}
            </option>
          </template>
        </select>
      </div>
    </div>
    <hr v-if="selectedReservationType !== 'out'" />
    <div v-if="selectedReservationType !== 'out'" class="field">
      <div class="label" :class="!reservation.editable ? 'not-editable' : ''">Alojamiento</div>
      <div class="value">
        <select
          :disabled="!reservation.editable"
          v-if="boardServices.filter((el) => el.roomTypeId === reservation.roomTypeId).length > 0"
          :value="reservation.boardServiceId"
          :class="{
            'not-editable': !reservation.editable,
          }"
          @change="
            setReservationBoardService(
              reservation.roomTypeId,
              reservation.id,
              parseInt(($event.target as HTMLSelectElement).value, 10)
            )
          "
        >
          <option :value="0">Solo alojamiento</option>
          <option
            v-for="boardService in boardServices.filter(
              (el) => el.roomTypeId === reservation.roomTypeId
            )"
            :key="boardService.id"
            :value="boardService.id"
          >
            {{ boardService.name }}
          </option>
        </select>
        <select v-else :disabled="!reservation.editable">
          <option :value="0">Solo alojamiento</option>
        </select>
      </div>
    </div>
    <hr v-if="selectedReservationType !== 'out'" />
    <div v-if="selectedReservationType !== 'out' && reservation.editable" class="field">
      <div class="label">Añadir servicios extra</div>
      <div class="value">
        <select
          @change="
            addReservationExtraService(
              reservation.roomTypeId,
              reservation.id,
              parseInt(($event.target as HTMLSelectElement).value, 10),
              $event
            )
          "
        >
          <option :value="0" />
          <option v-for="product in extraServices" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="services q-py-sm">
      <Chip
        v-for="(service, serviceIndex) in reservation.extraServices.filter(
          (el) => !el.isBoardService
        )"
        :removable="reservation.editable"
        @remove="
          removeReservationExtraService(reservation.roomTypeId, reservation.id, serviceIndex)
        "
        :key="service._uuid"
        :label="service.name"
        class="chip"
      />
    </div>

    <hr />

    <div class="dates-adults-children">
      <div class="dates">
        <div class="label" :class="!reservation.editable ? 'not-editable' : ''">Fechas</div>
        <DatePicker
          v-model="dates"
          class="datepicker"
          :class="!reservation.editable ? 'not-editable' : ''"
          inputClass="input-date-picker"
          dateFormat="DD dd M yy"
          placeholder="DD/MM/YYYY"
          size="small"
          selectionMode="range"
          hideOnRangeSelection
          :manualInput="false"
          :disabled="!reservation.editable"
        />
      </div>
      <hr />

      <div class="adults-children">
        <div class="adults">
          <div class="label" :class="!reservation.editable ? 'not-editable' : ''">Adultos</div>
          <div class="value">
            <AppButton
              icon="pi pi-minus"
              class="btn icon"
              :pt="{
                root: {
                  style: {
                    padding: 0,
                    backgroundColor: !reservation.editable ? 'grey' : '#1e9ed9',
                    cursor: !reservation.editable ? 'not-allowed' : 'pointer',
                    border: 'none',
                  },
                },
                icon: { style: 'font-size: 10px; font-weight: bold;' },
              }"
              :class="reservation.adults === 0 || !reservation.editable ? 'disabled' : ''"
              :disabled="!reservation.editable"
              @click="
                decrementReservationAdults(
                  reservation.roomTypeId,
                  reservation.id,
                  reservation.adults
                )
              "
            />
            <input
              type="number"
              :class="{
                'text-red': reservation.adults === 0,
                'not-editable': !reservation.editable,
              }"
              :value="reservation.adults"
              :disabled="!reservation.editable"
              @input="
                setReservationAdults(
                  reservation.roomTypeId,
                  reservation.id,
                  parseInt(($event.target as HTMLInputElement).value, 10)
                )
              "
            />
            <AppButton
              icon="pi pi-plus"
              class="btn icon"
              :pt="{
                root: {
                  style: {
                    padding: 0,
                    backgroundColor: !reservation.editable ? 'grey' : '#1e9ed9',
                    cursor: !reservation.editable ? 'not-allowed' : 'pointer',
                    border: 'none',
                  },
                },
                icon: { style: 'font-size: 10px; font-weight: bold;' },
              }"
              :class="
                reservation.adults === maxRoomCapacity || !reservation.editable ? 'disabled' : ''
              "
              :disabled="!reservation.editable"
              @click="
                incrementReservationAdults(
                  reservation.roomTypeId,
                  reservation.id,
                  reservation.adults
                )
              "
            />
          </div>
        </div>
        <div class="children">
          <div class="label" :class="!reservation.editable ? 'not-editable' : ''">Niños</div>
          <div class="value">
            <AppButton
              icon="pi pi-minus"
              class="btn icon"
              :pt="{
                root: {
                  style: {
                    padding: 0,
                    backgroundColor: !reservation.editable ? 'grey' : '#1e9ed9',
                    cursor: !reservation.editable ? 'not-allowed' : 'pointer',
                    border: 'none',
                  },
                },
                icon: { style: 'font-size: 10px; font-weight: bold;' },
              }"
              :class="reservation.children === 0 || !reservation.editable ? 'disabled' : ''"
              :disabled="!reservation.editable"
              @click="
                decrementReservationChildren(
                  reservation.roomTypeId,
                  reservation.id,
                  reservation.children
                )
              "
            />
            <input
              :class="!reservation.editable ? 'not-editable' : ''"
              type="number"
              :value="reservation.children"
              @input="
                setReservationChildren(
                  reservation.roomTypeId,
                  reservation.id,
                  parseInt(($event.target as HTMLInputElement).value, 10)
                )
              "
              :disabled="!reservation.editable"
            />
            <AppButton
              icon="pi pi-plus"
              class="btn icon"
              :pt="{
                root: {
                  style: {
                    padding: 0,
                    backgroundColor: !reservation.editable ? 'grey' : '#1e9ed9',
                    cursor: !reservation.editable ? 'not-allowed' : 'pointer',
                    border: 'none',
                  },
                },
                icon: { style: 'font-size: 10px; font-weight: bold;' },
              }"
              :class="!reservation.editable ? 'disabled' : ''"
              :disabled="!reservation.editable"
              @click="
                incrementReservationChildren(
                  reservation.roomTypeId,
                  reservation.id,
                  reservation.children
                )
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed, onMounted, ref, watch } from 'vue';

import ToggleSwitch from 'primevue/toggleswitch';
import Chip from 'primevue/chip';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';

import { type ReservationsToCreateInterface } from '@/interfaces/BookingEngine';
import utilsDates from '@/utils/dates';
import { useStore } from '@/store';

import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
export default defineComponent({
  components: {
    CustomIcon,
    ToggleSwitch,
    Chip,
    AppButton: Button,
    DatePicker,
  },
  props: {
    reservation: {
      type: Object as PropType<ReservationsToCreateInterface>,
      required: true,
    },
    reservationIndex: {
      type: Number,
      required: true,
    },
    selectedReservationType: {
      type: String,
      required: true,
    },
    instancedFromGrouped: {
      required: false,
      default: false,
    },
  },
  emits: [
    'addReservationExtraService',
    'removeReservationExtraService',
    'setReservationBoardService',
    'setReservationAdults',
    'setReservationChildren',
    'setReservationRoomId',
    'updateReservationRangeDates',
    'toggleReservationAutoAssignRoomChanged',
  ],
  setup(props, context) {
    const store = useStore();
    const rooms = computed(() => store.state.rooms.rooms);
    const boardServices = computed(() => store.state.boardServices.boardServices);
    const dates = ref([] as Date[]);

    const maxRoomCapacity = computed(
      () => store.state.rooms.rooms.find((el) => el.id === props.reservation.roomId)?.capacity
    );

    const extraServices = computed(() => store.state.products.products);

    const addReservationExtraService = (
      roomTypeId: number,
      reservationId: number,
      productId: number,
      event?: Event
    ) => {
      context.emit('addReservationExtraService', { roomTypeId, reservationId, productId });
      if (event && event.target) {
        (event.target as HTMLSelectElement).selectedIndex = 0;
      }
    };
    const removeReservationExtraService = (
      roomTypeId: number,
      reservationId: number,
      extraServiceIndex: number
    ) => {
      context.emit('removeReservationExtraService', {
        roomTypeId,
        reservationId,
        extraServiceIndex,
      });
    };

    const setReservationBoardService = (
      roomTypeId: number,
      reservationId: number,
      boardServiceId: number
    ) => {
      context.emit('setReservationBoardService', { roomTypeId, reservationId, boardServiceId });
    };

    const setReservationAdults = (roomTypeId: number, reservationId: number, adults: number) => {
      context.emit('setReservationAdults', { roomTypeId, reservationId, adults });
      context.emit('setReservationBoardService', {
        roomTypeId,
        reservationId,
        boardServiceId: props.reservation.boardServiceId,
      });
    };

    const decrementReservationAdults = (
      roomTypeId: number,
      reservationId: number,
      adults: number
    ) => {
      if (adults > 0) {
        context.emit('setReservationAdults', { roomTypeId, reservationId, adults: adults - 1 });
        context.emit('setReservationBoardService', {
          roomTypeId,
          reservationId,
          boardServiceId: props.reservation.boardServiceId,
        });
      }
    };
    const incrementReservationAdults = (
      roomTypeId: number,
      reservationId: number,
      adults: number
    ) => {
      if (maxRoomCapacity.value !== props.reservation.adults) {
        context.emit('setReservationAdults', { roomTypeId, reservationId, adults: adults + 1 });
        context.emit('setReservationBoardService', {
          roomTypeId,
          reservationId,
          boardServiceId: props.reservation.boardServiceId,
        });
      }
    };

    const setReservationChildren = (
      roomTypeId: number,
      reservationId: number,
      children: number
    ) => {
      context.emit('setReservationChildren', { roomTypeId, reservationId, children });
      context.emit('setReservationBoardService', {
        roomTypeId,
        reservationId,
        boardServiceId: props.reservation.boardServiceId,
      });
    };

    const decrementReservationChildren = (
      roomTypeId: number,
      reservationId: number,
      children: number
    ) => {
      if (children > 0) {
        context.emit('setReservationChildren', {
          roomTypeId,
          reservationId,
          children: children - 1,
        });
        context.emit('setReservationBoardService', {
          roomTypeId,
          reservationId,
          boardServiceId: props.reservation.boardServiceId,
        });
      }
    };
    const incrementReservationChildren = (
      roomTypeId: number,
      reservationId: number,
      children: number
    ) => {
      context.emit('setReservationChildren', { roomTypeId, reservationId, children: children + 1 });
      context.emit('setReservationBoardService', {
        roomTypeId,
        reservationId,
        boardServiceId: props.reservation.boardServiceId,
      });
    };

    const setReservationRoomId = (roomTypeId: number, reservationId: number, roomId: number) => {
      context.emit('setReservationRoomId', { roomTypeId, reservationId, roomId });
    };

    const updateReservationRangeDates = (
      roomTypeId: number,
      reservationId: number,
      checkin: Date,
      checkout: Date
    ) => {
      context.emit('updateReservationRangeDates', { roomTypeId, reservationId, checkin, checkout });
    };

    const reservationRoomTypeCode = (roomTypeId: number) => {
      const roomType = store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId);
      if (roomType) {
        return roomType.defaultCode;
      }
      return '';
    };

    watch(dates, () => {
      if (dates.value.length === 2) {
        const checkin = new Date(dates.value[0]);
        const checkout = new Date(dates.value[1]);
        checkin.setHours(0, 0, 0, 0);
        checkout.setHours(0, 0, 0, 0);

        updateReservationRangeDates(
          props.reservation.roomTypeId,
          props.reservation.id,
          checkin,
          checkout
        );
      }
    });

    onMounted(() => {
      if (props.reservation.roomTypeId !== 0 && props.reservation.boardServiceId !== 0) {
        setReservationBoardService(
          props.reservation.roomTypeId,
          props.reservation.id,
          props.reservation.boardServiceId
        );
      }
      if (props.reservation.checkin && props.reservation.checkout) {
        const checkin = new Date(props.reservation.checkin);
        const checkout = new Date(props.reservation.checkout);
        checkin.setHours(0, 0, 0, 0);
        checkout.setHours(0, 0, 0, 0);
        dates.value = [props.reservation.checkin, props.reservation.checkout];
      }
    });

    return {
      utilsDates,
      dates,
      rooms,
      maxRoomCapacity,
      boardServices,
      extraServices,
      setReservationAdults,
      decrementReservationAdults,
      incrementReservationAdults,
      setReservationChildren,
      decrementReservationChildren,
      incrementReservationChildren,
      addReservationExtraService,
      removeReservationExtraService,
      setReservationBoardService,
      setReservationRoomId,
      reservationRoomTypeCode,
    };
  },
});
</script>
<style lang="scss" scoped>
.reservation-info {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  .field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .label {
      font-weight: bold;
      display: flex;
      align-items: center;
      user-select: none;
      .icon {
        margin-right: 0.5rem;
      }
      &.not-editable {
        color: grey;
      }
    }
    select {
      width: 10rem;
      background-color: white;
      border: 1px solid black;
      margin: 0.25rem 0;
      font-size: 0.8rem;
      &.not-editable {
        border-color: grey;
        color: grey;
        cursor: not-allowed;
      }
      &.no-room-id {
        border: 1px solid red;
      }
    }
    .value {
      display: flex;
      flex-direction: column;
      .toggle-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 0.5rem;
        .label {
          margin-right: 0.5rem;
          cursor: pointer;
          user-select: none;
        }
      }
    }
  }

  .services {
    .chip {
      margin-left: 0;
      font-size: 0.7rem;
      padding: 0.25rem;
      font-size: 0.7rem;
      margin-left: 0.25rem;
      margin-bottom: 0.25rem;
    }
  }
  .dates-adults-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .dates {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      flex: 1;
      .label {
        font-weight: bold;
        user-select: none;
        &.not-editable {
          color: grey;
        }
      }
      .datepicker {
        width: 100%;
      }
    }
    .adults-children {
      padding-top: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      .adults,
      .children {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        .label {
          font-weight: bold;
          user-select: none;
          &.not-editable {
            color: grey;
          }
        }
        &:last-child {
          .label {
            padding-left: 1rem;
          }
        }
        .value {
          width: 100%;
          display: flex;
          align-items: space-between;
          flex: 1;
          padding: 0.5rem 0.5rem 0.5rem 0;
          .btn {
            border-radius: 0 !important;
            max-width: 25px;
            height: 25px !important;
            flex: 1;
          }
          input {
            max-width: 25px;
            height: 25px;
            text-align: center;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            border: 1px solid black;
            flex: 1;

            &.not-editable {
              border-color: grey;
              color: grey;
              cursor: not-allowed;
            }
          }
        }
        &:last-child {
          .value {
            padding-left: 1rem;
            padding-right: 0 !important;
          }
        }
      }
    }
  }
}

@media (min-width: 1024px) {
  .reservation-info {
    .dates-adults-children {
      hr {
        display: none;
      }
      flex-direction: row;
      .dates {
        margin-right: 1rem;
      }
      .adults-children {
        flex-direction: row;
      }
    }
    .field {
      select {
        font-size: 14px;
      }
    }
  }
}
</style>
