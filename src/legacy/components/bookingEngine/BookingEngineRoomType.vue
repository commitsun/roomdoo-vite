<template>
  <div class="room-type-container" v-if="roomTypeReservations.reservations.length > 0">
    <div
      class="title-section"
      :class="topBarClass()"
      @click="toggleRoomType(roomTypeReservations.roomTypeId)"
    >
      <div class="title-section-content">
        <div class="left">
          <CustomIcon
            imagePath="/app-images/arrow-right-blue.svg"
            width="10px"
            height="10px"
            class="icon"
            color="white"
            :class="roomTypeReservations.expanded ? 'icon-expanded' : 'icon-not-expanded'"
          />
          <div class="circle circle-first">
            {{ roomTypeReservations.reservations.length }}
          </div>
          <div class="circle circle-2" v-if="roomTypeReservations.reservations.length > 1" />
          <div class="circle circle-3" v-if="roomTypeReservations.reservations.length > 2" />
          <div class="room-type-info">
            <div class="room-type-name">
              {{ roomTypeShortName(roomTypeReservations.roomTypeId) }}
              {{ roomTypeName(roomTypeReservations.roomTypeId) }}
            </div>
            <div class="subtitle" :class="!roomTypeReservations.editable ? 'editable' : ''">
              <CustomIcon
                imagePath="/app-images/night-shelter.svg"
                width="25px"
                height="25px"
                :color="!roomTypeReservations.editable ? 'grey' : 'primary'"
              />
              <div>
                {{ roomTypeReservations.reservations.length }} habitaci{{
                  roomTypeReservations.reservations.length === 1 ? 'ón' : 'ones'
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="right" v-if="selectedReservationType === 'normal'">
          <span class="room-type-price-total"> {{ roomTypePriceTotal.toFixed(2) }} € </span>
        </div>
      </div>
    </div>

    <div class="content-section" v-if="roomTypeReservations.expanded">
      <div
        class="reservation"
        v-for="(r, reservationIndex) in roomTypeReservations.reservations"
        :key="r.id"
      >
        <div @click="toggleReservation(r.roomTypeId, r.id)" class="reservation-header">
          <div
            class="room-type-info"
            :class="
              !r.editable
                ? 'text-grey'
                : r.roomId !== 0 && r.adults > 0
                ? 'text-primary'
                : 'text-red'
            "
          >
            <CustomIcon
              imagePath="/app-images/chevron-right.svg"
              width="28px"
              height="28px"
              :color="!r.editable ? 'grey' : 'primary'"
              class="icon"
              :class="r.expanded ? 'icon-expanded' : ''"
            />
            {{ r.roomId !== 0 ? roomShortName(r.roomId) : '?' }} -
            {{ roomTypeShortName(roomTypeReservations.roomTypeId) }}
          </div>
          <div
            class="dates"
            :class="
              !r.editable
                ? 'text-grey'
                : r.checkin.getTime() !== checkinDateSelected.getTime() ||
                  r.checkout.getTime() !== checkoutDateSelected.getTime()
                ? 'text-red'
                : ''
            "
          >
            {{
              r.checkin.toLocaleDateString('default', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })
            }}
            -
            {{
              r.checkout.toLocaleDateString('default', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })
            }}
            <CustomIcon
              imagePath="/app-images/icon-alert.svg"
              width="14px"
              height="14px"
              :color="!r.editable ? 'grey' : 'red'"
              v-if="
                r.checkin.getTime() !== checkinDateSelected.getTime() ||
                r.checkout.getTime() !== checkoutDateSelected.getTime()
              "
              class="icon-alert-dates"
            />
          </div>
          <div
            class="price"
            :class="!r.editable ? 'read-only' : ''"
            v-if="selectedReservationType === 'normal'"
          >
            {{
              (
                r.roomPrice +
                r.boardServicePrice * r.adults +
                [...r.extraServices.filter((el) => el.perPerson).map((el) => el.items)]
                  .reduce((a, b) => a.concat(b), [])
                  .reduce((a, b) => a + b.priceUnit * r.adults, 0) +
                [...r.extraServices.filter((el) => !el.perPerson).map((el) => el.items)]
                  .reduce((a, b) => a.concat(b), [])
                  .reduce((a, b) => a + b.priceUnit * b.quantity, 0)
              ).toFixed(2)
            }}
            €
          </div>
        </div>
        <div class="reservation-content" v-if="r.expanded">
          <BookingEngineReservationInfo
            :reservation="r"
            :selectedReservationType="selectedReservationType"
            :reservationIndex="reservationIndex"
            @setReservationAdults="setReservationAdults($event)"
            @setReservationChildren="setReservationChildren($event)"
            @setReservationRoomId="setReservationRoomId($event)"
            @addReservationExtraService="addReservationExtraService($event)"
            @removeReservationExtraService="removeReservationExtraService($event)"
            @setReservationBoardService="setReservationBoardService($event)"
            @updateReservationRangeDates="updateReservationRangeDates($event)"
            _toggleReservationAutoAssignRoomChanged="reservation.autoAssignRoom
              = !reservation.autoAssignRoom"
            :instancedFromGrouped="true"
            :selectedPricelistId="selectedPricelistId"
          />
          <!-- TODO REVIEW PREVIUS COMMENTED EMIT TO PARENT AND LISTEN IT FROM PARENT -->
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { type RoomTypeReservationsToCreateInterface } from '@/legacy/interfaces/BookingEngine';
import { useStore } from '@/legacy/store';
import BookingEngineReservationInfo from '@/legacy/components/bookingEngine/BookingEngineReservationInfo.vue';
import CustomIcon from '@/legacy/components/roomdooComponents/CustomIcon.vue';

export default defineComponent({
  components: {
    BookingEngineReservationInfo,
    CustomIcon,
  },
  props: {
    roomTypeReservations: {
      type: Object as PropType<RoomTypeReservationsToCreateInterface>,
      required: true,
    },
    selectedReservationType: {
      type: String,
      required: true,
    },
    checkinDateSelected: {
      type: Date,
      required: true,
    },
    checkoutDateSelected: {
      type: Date,
      required: true,
    },
    selectedPricelistId: {
      type: Number,
      required: true,
    },
  },
  emits: [
    'toggleRoomType',
    'toggleReservation',
    'addReservationExtraService',
    'removeReservationExtraService',
    'setReservationBoardService',
    'setReservationAdults',
    'setReservationChildren',
    'setReservationRoomId',
    'updateReservationRangeDates',
  ],
  setup(props, context) {
    const store = useStore();

    const roomTypePriceTotal = computed(() => {
      let rdo = 0;
      props.roomTypeReservations.reservations.forEach((r) => {
        rdo += r.roomPrice + r.boardServicePrice * r.adults;
        rdo +=
          [...r.extraServices.filter((el) => el.perPerson).map((el) => el.items)]
            .reduce((a, b) => a.concat(b), [])
            .reduce((a, b) => a + b.priceUnit * r.adults, 0) +
          [...r.extraServices.filter((el) => !el.perPerson).map((el) => el.items)]
            .reduce((a, b) => a.concat(b), [])
            .reduce((a, b) => a + b.priceUnit * b.quantity, 0);
      });
      return rdo;
    });

    const roomTypeName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.name;

    const roomTypeShortName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.defaultCode;

    const roomShortName = (roomId: number) =>
      store.state.rooms.rooms.find((el) => el.id === roomId)?.shortName;

    const toggleRoomType = (roomTypeId: number) => {
      context.emit('toggleRoomType', roomTypeId);
    };

    const toggleReservation = (roomTypeId: number, reservationId: number) => {
      context.emit('toggleReservation', {
        roomTypeId,
        reservationId,
      });
    };

    const addReservationExtraService = (value: {
      roomTypeId: number;
      reservationId: number;
      productId: number;
      event?: Event;
    }) => {
      context.emit('addReservationExtraService', value);
    };

    const removeReservationExtraService = (value: {
      roomTypeId: number;
      reservationId: number;
      extraServiceIndex: number;
    }) => {
      context.emit('removeReservationExtraService', value);
    };

    const setReservationBoardService = (value: {
      roomTypeId: number;
      reservationId: number;
      boardServiceId: number;
    }) => {
      context.emit('setReservationBoardService', value);
    };

    const setReservationAdults = (value: {
      roomTypeId: number;
      reservationId: number;
      adults: number;
    }) => {
      context.emit('setReservationAdults', value);
    };

    const setReservationChildren = (value: {
      roomTypeId: number;
      reservationId: number;
      children: number;
    }) => {
      context.emit('setReservationChildren', value);
    };

    const setReservationRoomId = (value: {
      roomTypeId: number;
      reservationId: number;
      roomId: number;
    }) => {
      context.emit('setReservationRoomId', value);
    };

    const updateReservationRangeDates = (value: {
      roomTypeId: number;
      reservationId: number;
      checkin: Date;
      checkout: Date;
    }) => {
      context.emit('updateReservationRangeDates', value);
    };

    const topBarClass = () => {
      let result = '';
      if (props.selectedReservationType === 'out') {
        if (!props.roomTypeReservations.editable) {
          result = 'out-not-editable';
        } else {
          result = 'out-editable';
        }
      } else if (!props.roomTypeReservations.editable) {
        result = 'not-editable';
      }
      return result;
    };

    return {
      roomTypePriceTotal,
      topBarClass,
      roomShortName,
      roomTypeShortName,
      roomTypeName,
      toggleRoomType,
      toggleReservation,
      setReservationAdults,
      setReservationChildren,
      addReservationExtraService,
      removeReservationExtraService,
      setReservationBoardService,
      setReservationRoomId,
      updateReservationRangeDates,
    };
  },
});
</script>
<style lang="scss" scoped>
.room-type-container {
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 5px rgb(0 0 0 / 30%), 0 2px 2px rgb(0 0 0 / 14%),
    0 3px 1px -2px rgb(0 0 0 / 12%);
  .title-section {
    cursor: pointer;
    padding: 0.5rem;
    background: $primary;
    color: white;
    border-radius: 5px 5px 0 0;
    font-weight: bold;
    .title-section-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      .left {
        display: flex;
        align-items: center;
        padding-top: 0.25rem;
        padding-bottom: 0.5rem;
        position: relative;
        .icon {
          margin-right: 0.5rem;
          margin-left: 0.25rem;
        }
        .icon-expanded {
          rotate: 90deg;
        }
        .icon-not-expanded {
          rotate: 0;
        }
        .circle {
          border-radius: 50%;
          width: 30px;
          height: 30px;
          border: 2px solid $primary;
          background-color: white;
          color: $primary;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          &.circle-first {
            margin-right: 0.5rem;
          }
          &.circle-2 {
            border: 2px solid $primary;
            left: 18px;
            position: absolute;
            z-index: 2;
          }
          &.circle-3 {
            border: 5px solid $primary;
            left: 25px;
            position: absolute;
            z-index: 1;
          }
        }

        .room-type-info {
          margin-left: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          align-content: center;

          .room-type-name {
            font-size: 1rem;
          }
          .subtitle {
            display: flex;
            align-items: center;
            border-radius: 15px;
            background-color: white;
            padding-left: 0.3rem;
            padding-right: 0.3rem;
            color: $primary;
            font-size: 0.75rem;
            &.editable {
              color: grey;
            }
          }
        }
      }
      .right {
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        .icon-dots {
          top: -2px;
          height: 100%;
        }
      }
    }
    &.out-not-editable {
      background: repeating-linear-gradient(
        -34deg,
        white,
        white 4px,
        grey 4px,
        grey 8px
      ) !important;
      .title-section-content {
        background-color: grey;
        .left {
          .circle {
            border-color: grey;
            color: grey;
            &.circle-2,
            &.circle-3 {
              border-color: grey;
            }
          }
        }
      }
    }
    &.out-editable {
      background: repeating-linear-gradient(
        -34deg,
        white,
        white 4px,
        rgb(171, 222, 254) 4px,
        rgb(171, 222, 254) 8px
      ) !important;
      .title-section-content {
        background-color: rgba(255, 255, 255, 0.75);
        color: $primary !important;
        .left {
          .icon {
            background-color: $primary !important;
          }
        }
      }
    }
    &.not-editable {
      background-color: grey;
      .title-section-content {
        .left {
          .circle {
            border-color: grey;
            color: grey;
            &.circle-2,
            &.circle-3 {
              border-color: grey;
            }
          }
        }
      }
    }
    &.not-editable-out {
      background-color: grey;
      .left {
        .circle {
          border-color: grey;
          color: grey;
          &.circle-2,
          &.circle-3 {
            border-color: grey;
          }
        }
      }
    }
  }
  .content-section {
    padding: 0.5rem;

    .reservation {
      border-bottom: 1px solid lightgrey;
      .reservation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
      }
      &:last-child {
        border: none;
      }
      .room-type-info {
        font-weight: bold;
        display: flex;
        align-items: center;
        &.text-red {
          color: red;
        }
        &.text-grey {
          color: grey;
        }
        &.text-primary {
          color: $primary;
        }
        .icon {
          &.icon-expanded {
            rotate: 90deg;
          }
        }
      }
      .dates {
        display: flex;
        align-items: center;
        font-size: 0.75rem;
        .icon-alert-dates {
          margin-left: 0.5rem;
        }
        &.text-red {
          color: red;
        }
        &.text-grey {
          color: grey;
        }
      }
      .price {
        font-weight: bold;
        &.read-only {
          color: grey;
        }
      }
    }
  }
}

@media (min-width: 1024px) {
  .room-type-container {
    .content-section {
      .reservation {
        .reservation-header {
          .room-type-info,
          .dates,
          .price {
            font-size: 1rem;
          }
        }
      }
    }
  }
}
</style>
