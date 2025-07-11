<template>
  <div class="section-card reservation">
    <div
      class="top-bar"
      :class="{
        'bg-grey': !reservation.editable,
        'bg-red':
          (reservation.roomId === 0 && !reservation.autoAssignRoom) ||
          reservation.adults === 0 ||
          !reservation.adults,
        out: selectedReservationType === 'out' && reservation.editable,
        'out-grey': selectedReservationType === 'out' && !reservation.editable,
        'bg-primary':
          (reservation.roomId !== 0 || (reservation.roomId === 0 && reservation.autoAssignRoom)) &&
          reservation.editable,
      }"
    >
      <div class="top-bar-content">
        <div @click="toggleReservation(reservation.roomTypeId, reservation.id)" class="left">
          <div class="arrow">
            <CustomIcon
              imagePath="/app-images/arrow-right-blue.svg"
              width="10px"
              height="10px"
              class="icon"
              color="white"
              :class="reservation.expanded ? 'icon-expanded' : 'icon-not-expanded'"
            />
          </div>
          <div class="middle">
            <div class="room-warning-services">
              <div class="room-warning">
                <div class="room">
                  Hab. {{ reservationIndex + 1 }} ({{ roomTypeShortName(reservation.roomTypeId) }})
                </div>
                <div
                  class="warning"
                  v-if="
                    (reservation.adults === 0 ||
                      !reservation.adults ||
                      (reservation.roomId === 0 && !reservation.autoAssignRoom)) &&
                    selectedReservationType !== 'out'
                  "
                >
                  <CustomIcon
                    imagePath="/app-images/icon-alert.svg"
                    width="12px"
                    height="12px"
                    class="icon"
                    color="white"
                    :class="reservation.expanded ? 'icon-expanded' : 'icon-not-expanded'"
                  />
                  <span class="text" v-if="reservation.roomId === 0 && !reservation.autoAssignRoom">
                    Seleccionar habitación
                  </span>
                  <span class="text" v-else> Indicar nº de adultos </span>
                </div>
                <div
                  class="warning"
                  v-else-if="
                    reservation.checkin.getTime() !== checkinDateSelected.getTime() ||
                    reservation.checkout.getTime() !== checkoutDateSelected.getTime()
                  "
                >
                  <CustomIcon
                    imagePath="/app-images/icon-alert.svg"
                    width="12px"
                    height="12px"
                    class="icon"
                    color="white"
                    :class="reservation.expanded ? 'icon-expanded' : 'icon-not-expanded'"
                  />
                  <span class="text"> Fechas diferentes </span>
                </div>
              </div>
              <div v-show="!reservation.expanded" class="services">
                <div v-if="reservation.boardServiceId !== 0" class="tag">
                  {{ boardServiceName(reservation.boardServiceId) }}
                </div>
                <div
                  v-if="reservation.extraServices.filter((el) => !el.isBoardService).length > 0"
                  class="tag"
                >
                  +
                  {{ reservation.extraServices.filter((el) => !el.isBoardService).length }}
                  servicio{{ reservation.extraServices.length === 1 ? '' : 's' }} extra
                </div>
              </div>
            </div>
            <div
              class="price"
              v-if="
                reservation.adults > 0 &&
                selectedReservationType !== 'out' &&
                selectedReservationType !== 'staff' &&
                reservation.reservationLines
              "
            >
              {{
                (
                  reservation.reservationLines
                    .map((l) => l.price * (l.discount !== 0 ? l.discount / 100 : 1))
                    .reduce((a, b) => a + b, 0) +
                  [...reservation.extraServices.map((el) => el.items)]
                    .reduce((a, b) => a.concat(b), [])
                    .map(
                      (el) =>
                        el.priceUnit * (el.discount !== 0 ? el.discount / 100 : 1) * el.quantity
                    )
                    .reduce((a, b) => a + b, 0)
                ).toFixed(2)
              }}
              €
            </div>
            <div
              class="price"
              v-else-if="
                reservation.roomPrice &&
                selectedReservationType !== 'staff' &&
                selectedReservationType !== 'out'
              "
            >
              {{ reservation.roomPrice.toFixed(2) }} €
            </div>
          </div>
        </div>
        <div class="right">
          <CustomIcon
            v-if="reservation.editable"
            imagePath="/app-images/three-dots-white.svg"
            width="25px"
            height="25px"
            color="white"
            @click.stop="isOpenMenu = !isOpenMenu"
            @blur="isOpenMenu = false"
            tabindex="1"
          />
          <div v-else :style="{ width: '25px' }"></div>
          <transition name="menu">
            <div class="menu" v-if="isOpenMenu">
              <div @mousedown="removeReservation(reservation.roomTypeId, reservation.id)">
                <span> Eliminar </span>
                <CustomIcon
                  imagePath="/app-images/icon-delete.svg"
                  width="20px"
                  height="20px"
                  color="black"
                />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div
      class="content"
      v-show="reservation.expanded"
      @toggleReservationAutoAssignRoomChanged="
        $emit('toggleReservationAutoAssignRoomChanged', $event)
      "
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import { type ReservationsToCreateInterface } from '@/_legacy/interfaces/BookingEngine';
import { useStore } from '@/_legacy/store';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
export default defineComponent({
  components: {
    CustomIcon,
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
    checkinDateSelected: {
      type: Date,
      required: true,
    },
    checkoutDateSelected: {
      type: Date,
      required: true,
    },
    selectedReservationType: {
      type: String,
      required: true,
    },
  },
  emits: ['toggleReservation', 'removeReservation', 'toggleReservationAutoAssignRoomChanged'],
  setup(props, context) {
    const store = useStore();
    const isOpenMenu = ref(false);
    const roomTypeShortName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.defaultCode;
    const boardServiceName = (boardServiceId: number) =>
      store.state.boardServices.boardServices.find((el) => el.id === boardServiceId)?.name;
    const toggleReservation = (roomTypeId: number, reservationId: number) => {
      context.emit('toggleReservation', {
        roomTypeId,
        reservationId,
      });
    };
    const removeReservation = (roomTypeId: number, reservationId: number) => {
      context.emit('removeReservation', {
        roomTypeId,
        reservationId,
      });
    };
    return {
      isOpenMenu,
      roomTypeShortName,
      boardServiceName,
      toggleReservation,
      removeReservation,
    };
  },
});
</script>
<style lang="scss" scoped>
.reservation {
  .top-bar {
    color: white;
    padding: 0.5rem;
    padding-right: 0;
    cursor: pointer;
    user-select: none;
    &.bg-grey {
      background-color: grey;
    }
    &.bg-red {
      background-color: red !important;
    }
    &.bg-primary {
      background-color: $primary;
    }

    .top-bar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1rem;
      .left {
        display: flex;
        align-items: center;
        flex: 1 1 auto;
        .arrow {
          padding-right: 0.5rem;
          .icon-expanded {
            rotate: 90deg;
          }
          .icon-not-expanded {
            rotate: 0;
          }
        }
        .middle {
          display: flex;
          align-items: center;
          flex: 1 1 auto;
          .room-warning-services {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            .room-warning {
              display: flex;
              .room {
                font-weight: bold;
              }
              .warning {
                display: flex;
                align-items: center;
                flex: 1 1 auto;

                font-size: 0.8rem;
                .icon {
                  margin-left: 1rem;
                  margin-right: 0.5rem;
                }
              }
            }
            .services {
              display: flex;
              padding-top: 0.25rem;
              .tag {
                border-radius: 15px;
                padding: 0 0.5rem 0 0.5rem;
                font-size: 0.7rem;
                background-color: lightgrey;
                color: $corduroy;
                margin-right: 0.5rem;
              }
            }
          }
          .price {
            display: flex;
            font-weight: bold;
          }
        }
      }
      .right {
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        .menu {
          font-weight: bold;
          user-select: none;
          position: absolute;
          display: flex;
          background-color: #ffffff;
          color: black;
          font-size: 14px;
          box-shadow: 0px 4px 14px rgb(0 0 0 / 20%);
          border-radius: 10px;
          cursor: pointer;
          padding: 0.2rem 0;
          left: -110px;
          div {
            display: flex;
            padding: 0.2rem 1rem;
            &:hover {
              font-weight: bold;
            }
          }
        }
      }
    }
  }
  .out {
    background: repeating-linear-gradient(
      -34deg,
      white,
      white 4px,
      rgb(171, 222, 254) 4px,
      rgb(171, 222, 254) 8px
    ) !important;
    color: $primary !important;
    .top-bar-content {
      background-color: rgba(white, 0.75);
      margin-right: 0.5rem;
    }
  }
  .out-grey {
    background: repeating-linear-gradient(-34deg, white, white 4px, grey 4px, grey 8px) !important;
    color: grey !important;
    .left {
      background-color: rgba(white, 0.75);
      padding-right: 0.4rem;
    }
  }
  .content {
    padding: 0.5rem;
    padding-bottom: 0;
  }
}
</style>
