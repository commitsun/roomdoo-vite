<template>
  <div class="operative cell" :style="{ backgroundImage: `url(${activeProperty?.hotelImageUrl})` }">
    <div class="overlay" />

    <div class="header-operative">
      <div class="left">
        <div class="property-name">
          {{ activeProperty?.name }}
        </div>
        <div class="property-location">
          {{ activeProperty?.stateName }}
        </div>
      </div>

      <div class="select-day">
        <DatePicker
          v-model="selectedDate"
          dateFormat="dd/mm/yy"
          :manualInput="false"
          inputClass="w-full"
          class="w-full cursor-pointer"
          showIcon
          fluid
          iconDisplay="input"
        />
      </div>
    </div>
    <div
      class="yesterday-info"
      v-if="
        selectedDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) &&
        todayPendingYesterdayReservations > 0
      "
      @click="openYesterdayPendingReservations()"
    >
      <div>
        <img src="/app-images/warning.svg" />
        {{ todayPendingYesterdayReservations }}
        reserva{{ todayPendingYesterdayReservations === 1 ? '' : 's' }} pendiente{{
          todayPendingYesterdayReservations === 1 ? '' : 's'
        }}
        de ayer ({{ yesterdayStr }})
      </div>
    </div>
    <div class="pending-info">
      <div class="pending-info-cell checkins">
        <div class="icon">
          <img src="/app-images/icon-checkin.svg" />
        </div>
        <div class="title">
          <span> Check-ins </span>
        </div>
        <div
          class="pending"
          v-if="pendingArrivalReservations !== 0"
          @click="openPendingCheckinReservations()"
        >
          {{ pendingArrivalReservations }} por llegar
        </div>
        <div class="all-completed" v-else>Completado</div>
        <div
          class="completed"
          @click="openCompletedCheckinReservations(completedArrivalReservations)"
          :class="{
            'click-disabled': completedArrivalReservations === 0,
          }"
        >
          {{ completedArrivalReservations }} completado{{
            completedArrivalReservations === 1 ? '' : 's'
          }}
        </div>
      </div>
      <div class="pending-info-cell checkouts">
        <div class="icon"><img src="/app-images/icon-checkout.svg" /></div>
        <div class="title">
          <span> Check-outs </span>
        </div>
        <div
          class="pending"
          v-if="pendingDepartureReservations !== 0"
          @click="openPendingCheckoutReservations()"
        >
          {{ pendingDepartureReservations }} por salir
        </div>
        <div class="all-completed" v-else>Completado</div>
        <div
          class="completed"
          :class="{
            'click-disabled': completedDepartureReservations === 0,
          }"
          @click="openCompletedCheckoutReservations(completedDepartureReservations)"
        >
          {{ completedDepartureReservations }}
          completado{{ completedDepartureReservations === 1 ? '' : 's' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onUnmounted, watch, onMounted } from 'vue';
import { useStore } from '@/_legacy/store';
import CustomSelect from '@/_legacy/components/roomdooComponents/CustomSelect.vue';
import { dialogService } from '@/_legacy/services/DialogService';
import DatePicker from 'primevue/datepicker';

export default defineComponent({
  components: {
    CustomSelect,
    DatePicker,
  },
  setup() {
    const store = useStore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const todayStr = `${today.getDate().toString()}/${(today.getMonth() + 1).toString()}/${today
      .getFullYear()
      .toString()
      .substring(2)}`;
    const tomorrowStr = `${tomorrow.getDate().toString()}/${(
      tomorrow.getMonth() + 1
    ).toString()}/${tomorrow.getFullYear().toString().substring(2)}`;
    const yesterdayStr = `${yesterday.getDate().toString()}/${(
      yesterday.getMonth() + 1
    ).toString()}/${yesterday.getFullYear().toString().substring(2)}`;

    const dateOptions = [
      { id: 1, text: 'Hoy', text2: `(${todayStr})` },
      { id: 2, text: 'Mañana', text2: `(${tomorrowStr})` },
    ];
    const dateOptionsSelected = ref(1);
    const selectedDate = ref<Date>(today);
    const todayPendingYesterdayReservations = ref(0);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const pendingReservations = computed(() => store.state.dashboard.pendingReservations);
    const pendingArrivalReservations = computed(
      () => store.state.dashboard.pendingReservations[0]?.pendingArrivalReservations,
    );
    const pendingDepartureReservations = computed(
      () => store.state.dashboard.pendingReservations[0]?.pendingDepartureReservations,
    );
    const completedArrivalReservations = computed(
      () => store.state.dashboard.pendingReservations[0]?.completedArrivalReservations,
    );
    const completedDepartureReservations = computed(
      () => store.state.dashboard.pendingReservations[0]?.completedDepartureReservations,
    );
    const openYesterdayPendingReservations = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('layout/rightDrawerDisplayed', false);
        await store.dispatch('layout/setRightDrawerFilter', '');
        await store.dispatch('layout/setRightDrawerFilter', 'yesterdayCheckins');
        await store.dispatch('layout/changeRightDrawerContent', 'FolioList');
        void store.dispatch('layout/rightDrawerDisplayed', true);
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

    const openPendingCheckinReservations = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('layout/rightDrawerDisplayed', false);
        await store.dispatch('layout/setRightDrawerFilter', 'isFromDashboard');
        await store.dispatch('layout/changeRightDrawerContent', 'FolioList');

        await store.dispatch('folios/fetchFolios', {
          propertyId: activeProperty.value?.id,
          checkinDate: selectedDate.value,
          pendingCheckin: true,
        });
        void store.dispatch('layout/rightDrawerDisplayed', true);
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

    const openCompletedCheckinReservations = async (completedCheckins: number) => {
      if (completedCheckins === 0) return;
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('layout/rightDrawerDisplayed', false);
        await store.dispatch('layout/setRightDrawerFilter', 'isFromDashboard');
        await store.dispatch('layout/changeRightDrawerContent', 'FolioList');

        await store.dispatch('folios/fetchFolios', {
          propertyId: activeProperty.value?.id,
          checkinDate: selectedDate.value,
          completedCheckin: true,
        });
        void store.dispatch('layout/rightDrawerDisplayed', true);
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

    const openPendingCheckoutReservations = async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('layout/rightDrawerDisplayed', false);
        await store.dispatch('layout/setRightDrawerFilter', 'isFromDashboard');
        await store.dispatch('layout/changeRightDrawerContent', 'FolioList');

        await store.dispatch('folios/fetchFolios', {
          propertyId: activeProperty.value?.id,
          checkoutDate: selectedDate.value,
          pendingCheckout: true,
        });
        void store.dispatch('layout/rightDrawerDisplayed', true);
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

    const openCompletedCheckoutReservations = async (completedCheckouts: number) => {
      if (completedCheckouts === 0) return;
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('layout/rightDrawerDisplayed', false);
        await store.dispatch('layout/setRightDrawerFilter', 'isFromDashboard');
        await store.dispatch('layout/changeRightDrawerContent', 'FolioList');

        await store.dispatch('folios/fetchFolios', {
          propertyId: activeProperty.value?.id,
          checkoutDate: selectedDate.value,
          completedCheckout: true,
        });
        void store.dispatch('layout/rightDrawerDisplayed', true);
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

    const fetchPendingReservations = async () => {
      if (
        selectedDate.value instanceof Date &&
        selectedDate.value.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      ) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        await store.dispatch('dashboard/fetchPendingReservations', {
          pmsPropertyId: activeProperty.value?.id,
          dateFrom: yesterday,
          dateTo: yesterday,
        });
        todayPendingYesterdayReservations.value = pendingArrivalReservations.value;
      }
      await store.dispatch('dashboard/fetchPendingReservations', {
        pmsPropertyId: activeProperty.value?.id,
        dateFrom: selectedDate.value,
        dateTo: selectedDate.value,
      });
    };

    watch(
      () => activeProperty.value?.id,
      (newId, oldId) => {
        if (!newId || newId === oldId) return;
        fetchPendingReservations();
      },
      { immediate: true },
    );

    watch(selectedDate, async () => {
      fetchPendingReservations();
    });

    onMounted(async () => {
      fetchPendingReservations();
    });

    onUnmounted(() => {
      void store.dispatch('layout/setRightDrawerFilter', '');
    });

    return {
      dateOptionsSelected,
      activeProperty,
      dateOptions,
      pendingReservations,
      yesterdayStr,
      selectedDate,
      pendingArrivalReservations,
      pendingDepartureReservations,
      completedArrivalReservations,
      completedDepartureReservations,
      todayPendingYesterdayReservations,
      openYesterdayPendingReservations,
      openPendingCheckinReservations,
      openCompletedCheckinReservations,
      openPendingCheckoutReservations,
      openCompletedCheckoutReservations,
    };
  },
});
</script>

<style lang="scss" scoped>
.cell {
  border-radius: 20px;
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 8px;
  margin-right: 8px;
}
.operative {
  grid-area: operative;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  background-color: $primary;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  padding-top: 14px;
  padding-bottom: 13px;
  position: relative;
  justify-content: space-between;
  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.6;
    border-radius: 20px;
    top: 0;
    left: 0;
  }
  .header-operative,
  .yesterday-info,
  .pending-info {
    z-index: 1;
  }
  .header-operative {
    display: flex;
    justify-content: space-between;
    height: 25%;
    margin-bottom: 75px;
    .left {
      color: white;
      .property-name {
        font-size: 15px;
        font-weight: bold;
      }
      .property-location {
        font-size: 12px;
      }
    }
    .select-day {
      width: 150px;
      height: 30px;
      border-radius: 8px;
      background-color: white;
      font-size: 11px;
    }
  }
  .yesterday-info {
    height: 25%;
    display: flex;
    align-items: center;
    margin-bottom: 13px;
    user-select: none;
    cursor: pointer;
    &:hover {
      div {
        background-color: #f4f1f1;
      }
    }
    div {
      padding-left: 10px;
      border-radius: 15px;
      background: #ffeab2;
      height: 38px;
      display: flex;
      align-items: center;
      width: 100%;
      font-size: 12px;
      color: #263941;
      font-weight: bold;
    }
    img {
      margin-right: 7px;
    }
  }
  .pending-info {
    display: flex;
    justify-content: space-between;
    .pending-info-cell {
      width: calc(50% - 6px);
      display: flex;
      flex-direction: column;
      background-color: white;
      border-radius: 15px;
      padding: 11px 1rem;
      .icon {
        img {
          width: 20px;
          height: 16px;
        }
        margin-bottom: 7px;
      }

      .title {
        font-size: 12px;
        margin-bottom: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.checkins > .title {
        color: #008000;
      }

      &.checkouts > .title {
        color: #c82626;
      }
      .pending,
      .all-completed {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 3px;
        width: fit-content;
        cursor: pointer;
        border-radius: 5px;
        padding: 0 10px;
        margin-left: -10px;
        user-select: none;
        &:hover {
          background-color: #f4f1f1;
        }
      }
      .completed {
        font-size: 12px;
        cursor: pointer;
        width: fit-content;
        padding: 0 10px;
        margin-left: -10px;
        border-radius: 5px;
        user-select: none;
        &:hover {
          background-color: #f4f1f1;
        }
      }
      .all-completed {
        color: #a4a4a4;
        font-size: 16px;
        cursor: auto;
        width: fit-content;
        padding: 0 10px;
        margin-left: -10px;
        border-radius: 5px;
        user-select: none;
        &:hover {
          background-color: white;
        }
      }
      .click-disabled {
        cursor: auto;
        &:hover {
          background-color: white;
        }
      }
    }
  }
}

@media (min-width: 768px) {
  .operative {
    .header-operative {
      .left {
        .property-name {
          font-size: 18px;
        }
        .property-location {
          font-size: 16px;
        }
      }
      .select-day {
        font-size: 13px;
      }
    }
    .yesterday-info {
      div {
        font-size: 13px;
      }
    }
    .pending-info {
      .pending-info-cell {
        .icon {
          img {
            width: 22px;
            height: 17px;
          }
        }
        .title {
          font-size: 16px;
        }
        .pending,
        .all-completed {
          font-size: 20px;
          font-weight: 500;
        }
        .completed {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
