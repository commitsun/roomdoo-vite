<template>
  <div class="menu" v-if="currentReservations && currentReservations?.length > 1">
    <transition-group name="accordion-transition">
      <div
        class="menu-item"
        :class="{ 'menu-item-active': selectedReservation?.id === reservation.id }"
        v-for="(reservation, index) in currentReservations"
        :key="reservation.id"
        @click="openReservation(reservation.id)"
        v-show="
          isMenuExpanded ||
          (!isMenuExpanded && getMenuCurrentRow(`#reservation-${index.toString()}`) === activeRow)
        "
        :id="`reservation-${index.toString()}`"
        :style="{ 'z-index': currentReservations.length - index }"
      >
        <span
          class="num-reservation"
          :style="`background-color: ${getReservationColor(
            reservation,
            currentFolio?.pendingAmount || 0
          )}`"
        >
          {{ index + 1 }}
        </span>
        <span>
          {{ getRoomShortName(reservation.preferredRoomId ?? 0) }}
          {{ getRoomTypeName(reservation.roomTypeId ?? 0) }}
        </span>
      </div>
    </transition-group>
  </div>
  <div
    class="arrow-container"
    v-if="
      currentReservations &&
      ((screenWidth < 1024 && currentReservations?.length > 4) ||
        (screenWidth >= 1024 && currentReservations?.length > 5))
    "
  >
    <img
      src="/app-images/arrow-left-blue.svg"
      class="arrow-img"
      :class="!isMenuExpanded ? 'arrow-img-rotate' : ''"
      @click="toggleMenuExpanded()"
    />
  </div>
  <div class="back-button" v-if="currentReservations && currentReservations?.length > 1">
    <img src="/app-images/back-arrow-blue.svg" class="icon-back" @click="goBackToReservations()" />
    <span class="num-reservations">Listado de {{ currentReservations?.length }} reservas</span>
  </div>
  <div class="reservation-container" v-if="selectedReservation" :key="selectedReservation.id">
    <div class="reservation-header">
      <Reservation v-if="currentFolio" :reservation="selectedReservation" :folio="currentFolio" />
    </div>
    <div class="reservation-tabs">
      <div
        class="tab"
        :class="currentTab === 'general' ? 'selected' : ''"
        @click="setTabValue('general')"
      >
        <span class="tab-text"> Detalles </span>
      </div>
      <div
        class="tab"
        :class="currentTab === 'room' ? 'selected' : ''"
        @click="setTabValue('room')"
      >
        <span class="tab-text"> Habitación </span>
      </div>
      <div
        class="tab"
        :class="[
          currentTab === 'guests' ? 'selected' : '',
          currentReservation?.reservationType === 'out' ? 'disabled-tab' : '',
        ]"
        @click="setTabValue('guests')"
      >
        <span class="tab-text"> Huéspedes </span>
      </div>
      <div
        class="tab"
        :class="[
          currentTab === 'services' ? 'selected' : '',
          currentReservation?.reservationType === 'out' ? 'disabled-tab' : '',
        ]"
        @click="setTabValue('services')"
      >
        <span class="tab-text"> Servicios </span>
      </div>
      <div
        class="tab"
        :class="[
          currentTab === 'prices' ? 'selected' : '',
          currentReservation?.reservationType === 'out' ? 'disabled-tab' : '',
        ]"
        @click="setTabValue('prices')"
      >
        <span class="tab-text"> Precio </span>
      </div>
      <div class="slider" />
    </div>
    <div v-if="currentTab === 'general'">
      <ReservationGeneralTab @setTabValue="setTabValue($event)" />
    </div>
    <div v-if="currentTab === 'room'">
      <ReservationRoomTab />
    </div>
    <div v-if="currentTab === 'prices'">
      <ReservationPricesTab @setTabValue="setTabValue($event)" />
    </div>
    <div v-if="currentTab === 'guests'">
      <ReservationCheckinsTab />
    </div>
    <div v-if="currentTab === 'services'">
      <ReservationServicesTab />
    </div>
    <div
      class="view-reservation-btn"
      @click="moveToReservation()"
      v-if="
        selectedReservation?.stateCode !== 'cancel' &&
        reservationLines.some((el) => !el.isReselling)
      "
    >
      <img src="/app-images/icon-eye.svg" class="icon-eye" />
      <span> Ver reserva en el planning </span>
    </div>
  </div>
  <div class="navigation" v-if="currentReservations && currentReservations?.length > 1">
    <img
      src="/app-images/back-arrow-black.svg"
      class="navigation-left-arrow"
      @click="goToPreviousReservation()"
      :style="getReservationPosition() === 1 ? 'cursor: not-allowed;' : 'cursor: pointer'"
    />
    <span> {{ getReservationPosition() }} reserva de {{ currentReservations?.length }} </span>
    <img
      src="/app-images/back-arrow-black.svg"
      class="navigation-right-arrow"
      @click="goToNextReservation()"
      :style="
        getReservationPosition() === currentReservations?.length
          ? 'cursor: not-allowed'
          : 'cursor: pointer'
      "
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type Ref, ref, onMounted, onUnmounted, watch } from 'vue';
import type { ReservationInterface } from '@/interfaces/ReservationInterface';
import { useRouter, useRoute } from 'vue-router';
import Reservation from '@/components/reservations/ReservationComponent.vue';
import ReservationGeneralTab from '@/components/reservations/reservationTabs/ReservationGeneralTab.vue';
import ReservationRoomTab from '@/components/reservations/reservationTabs/ReservationRoomTab.vue';
import ReservationPricesTab from '@/components/reservations/reservationTabs/ReservationPricesTab.vue';
import ReservationCheckinsTab from '@/components/reservations/reservationTabs/ReservationCheckinsTab.vue';
import ReservationServicesTab from '@/components/reservations/reservationTabs/ReservationServicesTab.vue';
import { useStore } from '@/store';
import { dialogService } from '@/services/DialogService';

export default defineComponent({
  components: {
    Reservation,
    ReservationGeneralTab,
    ReservationRoomTab,
    ReservationPricesTab,
    ReservationCheckinsTab,
    ReservationServicesTab,
  },
  emits: ['moveToReservation'],
  setup(props, context) {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const selectedReservation: Ref<ReservationInterface | null> = ref(null);
    const isMenuExpanded = ref(true);
    const changeDatesModal = ref(false);
    const changeRoomsModal = ref(false);
    const currentTab = ref('general');
    const screenWidth = ref(window.innerWidth);

    const currentFolio = computed(() => store.state.folios.currentFolio);
    const currentReservations = computed(() => store.state.reservations.reservations);
    const currentReservation = computed(() => store.state.reservations.currentReservation);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const reservationLines = computed(() => store.state.reservationLines.reservationLines);
    const endPath = computed(() => {
      let result = '';
      const indexSlashAndProperty = route.fullPath.search(/\d/);
      if (indexSlashAndProperty !== -1) {
        result = `${route.fullPath.substring(indexSlashAndProperty)}`;
      } else {
        result = '';
      }
      result = `/${result}`;

      return result;
    });

    const getMenuCurrentRow = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) return 0;
      const gridContainer = element.parentElement as HTMLElement;
      const gridItems = Array.from(gridContainer.children);
      const rowSize = parseInt(
        window.getComputedStyle(gridContainer).gridTemplateColumns.split(' ').length.toString(),
        10
      );
      const rowIndex = Math.floor(gridItems.indexOf(element) / rowSize) + 1;
      return rowIndex;
    };

    const activeRow = ref(getMenuCurrentRow('.menu-item-active'));

    const setTabValue = (tab: string) => {
      if (
        currentReservation.value?.reservationType === 'out' &&
        (tab === 'guests' || tab === 'services' || tab === 'prices')
      ) {
        return;
      }
      currentTab.value = tab;
    };

    const getRoomShortName = (roomId: number) =>
      store.state.rooms.rooms.find((el) => el.id === roomId)?.shortName;
    const getRoomTypeName = (roomTypeId: number) =>
      store.state.roomTypes.roomTypes.find((el) => el.id === roomTypeId)?.defaultCode;

    const getReservationColor = (
      onGoingReservation: ReservationInterface,
      folioPendingAmount: number
    ) => {
      let result;
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
      } else {
        if (onGoingReservation.stateCode === 'cancel' || onGoingReservation.stateCode === 'done') {
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
      return result;
    };

    const getReservationPosition = () => {
      if (currentReservations.value && selectedReservation.value) {
        const index = currentReservations.value.findIndex(
          (el) => el.id === selectedReservation.value?.id
        );
        return index + 1;
      }
      return 0;
    };

    const goBackToReservations = () => {
      void store.dispatch('reservations/setCurrentReservation', null);
    };

    const openReservation = async (id: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('reservations/fetchReservation', id).then(() => {
          activeRow.value = getMenuCurrentRow('.menu-item-active');
          isMenuExpanded.value = false;
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
    };

    const goToPreviousReservation = async () => {
      if (currentReservations.value && selectedReservation.value) {
        const index = currentReservations.value.findIndex(
          (el) => el.id === selectedReservation.value?.id
        );
        if (index > 0) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch(
              'reservations/fetchReservation',
              currentReservations.value[index - 1].id
            );
            const item = document.querySelector('.menu-item-active');
            if (item) {
              activeRow.value = getMenuCurrentRow('.menu-item-active');
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
      }
    };

    const goToNextReservation = async () => {
      if (currentReservations.value && selectedReservation.value) {
        const index = currentReservations.value.findIndex(
          (el) => el.id === selectedReservation.value?.id
        );
        if (index < currentReservations.value.length - 1) {
          void store.dispatch('layout/showSpinner', true);
          try {
            await store.dispatch(
              'reservations/fetchReservation',
              currentReservations.value[index + 1].id
            );
            const item = document.querySelector('.menu-item-active');
            if (item) {
              activeRow.value = getMenuCurrentRow('.menu-item-active');
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
      }
    };

    const toggleMenuExpanded = () => {
      isMenuExpanded.value = !isMenuExpanded.value;
      const item = document.querySelector('.menu-item-active');
      if (item) {
        activeRow.value = getMenuCurrentRow('.menu-item-active');
      }
    };

    const moveToReservation = async () => {
      if (route.name === 'planning') {
        context.emit('moveToReservation');
      } else if (route.name === 'dashboard') {
        await store.dispatch('planning/setMovePlanningToSelectedReservation', true);
        await router.push(`/planning${endPath.value}`);
      }
    };

    const refreshReservationDependentData = async () => {
      await store.dispatch('reservationLines/fetchReservationLines', currentReservation.value?.id);
      await store.dispatch('checkinPartners/fetchCheckinPartners', currentReservation.value?.id);
      await store.dispatch('services/fetchServices', currentReservation.value?.id);
    };

    watch(currentReservation, async () => {
      if (currentReservation.value) {
        selectedReservation.value = currentReservation.value;
        if (currentReservation.value.reservationType === 'out') {
          currentTab.value = 'general';
        }
        await refreshReservationDependentData();
      }
    });

    onMounted(async () => {
      if (currentReservations.value && currentReservations.value.length === 1) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store
            .dispatch('reservations/fetchReservation', currentReservations.value[0].id)
            .then(() => {
              selectedReservation.value = currentReservation.value;
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
      } else {
        selectedReservation.value = currentReservation.value;
      }
      if (currentReservation.value) {
        await refreshReservationDependentData();
        if (currentReservation.value.reservationType === 'out') {
          currentTab.value = 'general';
        }
      }
      if (store.state.layout.isMoveToGuestsTab) {
        currentTab.value = 'guests';
      }
    });

    onUnmounted(() => {
      void store.dispatch('reservations/setCurrentReservation', null);
    });

    return {
      currentFolio,
      currentReservations,
      selectedReservation,
      reservationLines,
      isMenuExpanded,
      activeRow,
      changeDatesModal,
      changeRoomsModal,
      currentTab,
      screenWidth,
      currentReservation,
      toggleMenuExpanded,
      getRoomShortName,
      getRoomTypeName,
      goBackToReservations,
      openReservation,
      goToPreviousReservation,
      goToNextReservation,
      getReservationPosition,
      getMenuCurrentRow,
      getReservationColor,
      setTabValue,
      moveToReservation,
    };
  },
});
</script>
<style scoped lang="scss">
.menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr;
  user-select: none;
  gap: 0.75rem;
  .menu-item {
    display: flex;
    align-items: center;
    border-radius: 30px;
    background-color: white;
    color: #848484;
    position: relative;
    cursor: pointer;
    height: 25px;
    box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.2);

    font-size: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    .num-reservation {
      font-size: 10px;
      border-radius: 50%;
      color: white;
      width: 15px;
      height: 15px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 7px;
      margin-left: 5px;
      font-weight: 600;
    }
  }
  .menu-item-active {
    background-color: #263941;
    color: white;
  }
}
.arrow-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  .arrow-img {
    width: 14px;
    height: 14px;
    transform: rotate(90deg);
    transition: transform 0.2s linear;
    user-select: none;
  }
  .arrow-img-rotate {
    width: 14px;
    height: 14px;
    transform: rotate(-90deg);
    transition: transform 0.2s linear;
    user-select: none;
  }
}
.back-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  height: fit-content;
  user-select: none;
  .icon-back {
    width: 16px;
    height: 16px;
    margin-left: 12px;
    margin-right: 7px;
    font-size: 13px;
  }
  .num-reservations {
    color: #848484;
  }
}

.reservation-container {
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.49);
  border-radius: 10px;
  padding-bottom: 1rem;

  .reservation-header {
    background-color: $roomdoo_lightgray4;
    height: 55px;
    width: 100%;
    padding: 11px;
    display: flex;
    align-items: center;
    border-radius: 10px 10px 0px 0px;
  }
  .reservation-tabs {
    display: flex;
    align-items: center;
    border-radius: 10px;
    font-size: 12px;
    z-index: 1;
    border-radius: 20px;
    color: #848484;
    position: relative;
    height: 25px;
    .tab {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
      justify-content: space-around;
      padding: 0.5rem 0;
      transition: all 0.2s linear;
      position: relative;
      user-select: none;
      span {
        user-select: none;
        z-index: 25;
      }
    }
    .selected {
      color: black;
      font-weight: bold;
    }
    .slider {
      position: absolute;
      left: 0;
      height: 90%;
      border-bottom: 1px solid $primary;
      z-index: 0;
      transition: all 0.3s linear;
    }
    .tab:nth-of-type(1).selected ~ .slider {
      left: 0.5%;
      width: 19%;
    }
    .tab:nth-of-type(2).selected ~ .slider {
      left: 20%;
      width: 20%;
    }
    .tab:nth-of-type(3).selected ~ .slider {
      left: 40%;
      width: 20%;
    }
    .tab:nth-of-type(4).selected ~ .slider {
      left: 60%;
      width: 20%;
    }
    .tab:nth-of-type(5).selected ~ .slider {
      left: 80%;
      width: 19.5%;
    }
  }
  .view-reservation-btn {
    display: none;
    align-items: center;
    background-color: #f0f0f0;
    border-radius: 5px;
    margin-top: 30px;
    margin-left: 10px;
    margin: 30px 0 20px 10px;
    height: 30px;
    img {
      margin-left: 1rem;
      margin-right: 1rem;
    }
  }
}

.navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 35px;
  padding-top: 15px;
  user-select: none;
  .navigation-left-arrow {
    width: 13px;
    height: 13px;
    cursor: pointer;
  }
  span {
    margin: 0 30px;
    font-size: 13px;
    color: #848484;
  }
  .navigation-right-arrow {
    width: 13px;
    height: 13px;
    cursor: pointer;
    transform: rotate(180deg);
  }
}

@media (min-width: 1024px) {
  .menu {
    grid-template-columns: repeat(5, 1fr);
    margin: 0 1.2rem;
    .menu-item {
      height: 35px;
      font-size: 16px;
      margin-bottom: 0.25rem;
      cursor: pointer;
      .num-reservation {
        font-size: 12px;
        height: 20px;
        width: 20px;
        cursor: pointer;
      }
    }
  }
  .arrow-container {
    .arrow-img {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
  .back-button {
    width: fit-content;
    margin-left: 8px;
    .icon-back {
      cursor: pointer;
      width: 22px;
      height: 22px;
    }
    .num-reservations {
      font-size: 16px;
      margin-bottom: 2px;
      cursor: default;
    }
  }
  .reservation-container {
    font-size: 16px;
    margin: 0 20px;
    .reservation-tabs {
      font-size: 16px;
      background-color: #f9f9f9;
      border-radius: 20px;
      height: 32px;
      display: flex;
      align-items: center;
      margin: 15px 8px 0 8px;
      .tab {
        cursor: pointer;
      }
      .disabled-tab {
        cursor: not-allowed;
        color: #848484;
      }
    }
    .slider {
      background: linear-gradient(45deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%);
      box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.2);
      border-radius: 45px;
      border-bottom: none !important;
    }
  }
  .view-reservation-btn {
    display: flex !important;
    width: 255px !important;
    margin-left: 25px !important;
    user-select: none;
    cursor: pointer;
    font-size: 14px;
  }
  .navigation {
    height: 40px;
    padding-top: 20px;
    .navigation-left-arrow {
      width: 20px;
      height: 20px;
    }
    span {
      margin: 0 30px;
      font-size: 14px;
      color: #848484;
    }
    .navigation-right-arrow {
      width: 20px;
      height: 20px;
    }
  }
}
.accordion-transition-enter-active,
.accordion-transition-leave-active {
  transition: transform 0.1s linear;
}
.accordion-transition-enter-to,
.accordion-transition-leave-from {
  transform: translateY(0);
}
.accordion-transition-enter-from {
  transform: translateY(-150%);
}
.accordion-transition-leave-to {
  transform: translateY(-150%);
  overflow: hidden;
}
</style>
