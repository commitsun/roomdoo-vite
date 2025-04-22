<template>
  <div class="folio-list-container">
    <div class="drawer-header-mbl">
      <div class="drawer-search">
        <CustomIcon
          imagePath="/app-images/arrow-left-blue.svg"
          color="primary"
          width="20px"
          height="20px"
          @click="closeRightDrawer()"
        />
        <InputText
          class="input-search"
          v-model="searchFolio"
          placeholder="Buscar en el listado de folios..."
          allowRemove
          :isBorder="false"
          :isBorderBottom="false"
          :showBottomLine="false"
          @input="filterFolios()"
          @clear="
            searchFolio = '';
            filterFolios();
          "
        />
        <CustomIcon
          imagePath="/app-images/icon-filters.svg"
          color="primary"
          width="20px"
          height="20px"
          @click="showFilters = !showFilters"
          v-if="isFilters"
        />
      </div>
      <div class="drawer-filters" v-if="showFilters">
        <div class="filters-content">
          <CustomSelect
            iconBefore="/app-images/suitcase.svg"
            :options="filterOptions"
            v-model="filterOptionSelected"
            allowRemove
            focusable
            :disabled="folios.length === 0 && searchFolio !== ''"
            :textBeforeOptionSelected="filterOptionSelected === 0 ? 'Ver solo...' : ''"
          />
        </div>
        <div class="filters-content">
          <CustomSelect
            iconBefore="/app-images/order-by.svg"
            :options="orderByOptions"
            v-model="orderOptionSelected"
            allowRemove
            focusable
            :disabled="folios.length === 0 && searchFolio !== ''"
            :textBeforeOptionSelected="orderOptionSelected === 0 ? 'Ordenar por...' : ''"
          />
        </div>
      </div>
    </div>
    <div class="drawer-header-dsk">
      <div class="drawer-search">
        <InputText
          v-model="searchFolio"
          placeholder="Buscar reserva"
          iconBefore="/app-images/search.svg"
          allowRemove
          @input="filterFolios()"
          @clear="
            searchFolio = '';
            filterFolios();
          "
        />
      </div>
      <div class="drawer-filters" v-if="isFilters">
        <div class="filters-content">
          <CustomSelect
            iconBefore="/app-images/suitcase.svg"
            :options="filterOptions"
            v-model="filterOptionSelected"
            allowRemove
            :disabled="folios.length === 0 && searchFolio !== ''"
            focusable
            :textBeforeOptionSelected="filterOptionSelected === 0 ? 'Ver solo...' : ''"
          />
        </div>

        <div class="filters-content">
          <CustomSelect
            iconBefore="/app-images/order-by.svg"
            :options="orderByOptions"
            v-model="orderOptionSelected"
            allowRemove
            :disabled="folios.length === 0 && searchFolio !== ''"
            focusable
            :textBeforeOptionSelected="orderOptionSelected === 0 ? 'Ordenar por...' : ''"
          />
        </div>
      </div>
    </div>
    <div class="drawer-content" v-if="folios.length > 0">
      <FolioCard
        @moveToFirstReservation="moveToFirstReservation($event)"
        v-for="folio in folios"
        :key="folio.id"
        :folio="folio"
      />
    </div>
    <div v-else class="no-folio-results">No hay resultados para esa búsqueda</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ReservationInterface } from '@/interfaces/ReservationInterface';
import type { FolioInterface } from '@/interfaces/FolioInterface';
import FolioCard from '@/components/folios/FolioCard.vue';
import { useStore } from '@/store';
import InputText from '@/components/roomdooComponents/InputText.vue';
import CustomIcon from '@/components/roomdooComponents/CustomIcon.vue';
import CustomSelect from '@/components/roomdooComponents/CustomSelect.vue';

import {
  isAllowedAddRooms,
  isAllowedBatchChanges,
  isAllowedConfirmReservations,
  isAllowedCancelReservations,
} from '@/utils/folio';
import { dialogService } from '@/services/DialogService';

export default defineComponent({
  components: {
    InputText,
    CustomSelect,
    FolioCard,
    CustomIcon,
  },
  emits: ['moveToFirstReservation'],
  setup(props, context) {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const filterOptions = [
      { id: 1, text: 'Check-ins pendientes' },
      { id: 2, text: 'Check-outs pendientes' },
      { id: 3, text: 'Abordo actualmente' },
      { id: 4, text: 'Por asignar' },
      { id: 5, text: 'Canceladas' },
      { id: 14, text: 'Overbooking' },
    ];
    const orderByOptions = [
      { id: 1, text: 'Prioridad' },
      { id: 2, text: 'Fecha check-in' },
      { id: 3, text: 'Fecha check-out' },
      { id: 4, text: 'Precio más bajo' },
    ];

    const searchFolio = ref('');
    const cardOpened = ref([] as boolean[]);
    const filterOptionSelected = ref(0);
    const orderOptionSelected = ref(0);
    const openFolioOptionsMenu = ref([] as boolean[]);
    const showAllReservationsInClass = ref([] as boolean[]);
    const showFilters = ref(false);
    const isFilters = ref(true);

    const folios = computed(() => store.state.folios.folios);
    const currentReservation = computed(() => store.state.reservations.currentReservation);

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

    const isSomeItemMenu = (folio: FolioInterface) => {
      let result = false;
      if (
        isAllowedAddRooms(folio) ||
        isAllowedBatchChanges(folio) ||
        isAllowedConfirmReservations(folio) ||
        isAllowedCancelReservations(folio)
      ) {
        result = true;
      }
      return result;
    };

    const closeRightDrawer = () => {
      void store.dispatch('layout/rightDrawerDisplayed', false);
    };

    const filterFolios = async () => {
      cardOpened.value.fill(true);
      let payload = {};
      if (searchFolio.value && filterOptionSelected.value === 0) {
        payload = {
          propertyId: store.state.properties.activeProperty?.id,
          filter: searchFolio.value,
          limit: 40,
          offset: 0,
        };
      } else if (searchFolio.value && filterOptionSelected.value !== 0) {
        payload = {
          propertyId: store.state.properties.activeProperty?.id,
          filter: searchFolio.value,
          filterByState: filterOptionSelected.value,
          limit: 40,
          offset: 0,
        };
      } else if (!searchFolio.value && filterOptionSelected.value !== 0) {
        payload = {
          propertyId: store.state.properties.activeProperty?.id,
          filterByState: filterOptionSelected.value,
          limit: 40,
          offset: 0,
        };
      } else {
        payload = {
          propertyId: store.state.properties.activeProperty?.id,
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          limit: 40,
          offset: 0,
        };
      }
      await store.dispatch('folios/fetchFolios', payload);
      if (
        store.state.layout.rightDrawerFilter !== '' &&
        store.state.layout.rightDrawerFilter !== 'toAssignFilter'
      ) {
        isFilters.value = false;
      } else {
        isFilters.value = true;
      }
    };

    const orderByOption = async () => {
      if (orderOptionSelected.value === 0 || orderOptionSelected.value === 1) {
        const payload = {
          propertyId: store.state.properties.activeProperty?.id,
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          limit: 40,
          offset: 0,
        };
        if (searchFolio.value) {
          await filterFolios();
        } else {
          await store.dispatch('folios/fetchFolios', payload);
        }
      }
      if (orderOptionSelected.value === 2) {
        store.state.folios.folios?.sort((a, b) => {
          if (a.firstCheckin && b.firstCheckin) {
            const aDate = new Date(a.firstCheckin);
            const bDate = new Date(b.firstCheckin);
            if (aDate.getTime() < bDate.getTime()) return -1;
            if (aDate.getTime() > bDate.getTime()) return 1;
          }
          return 0;
        });
      }
      if (orderOptionSelected.value === 3) {
        store.state.folios.folios?.sort((a, b) => {
          if (a.lastCheckout && b.lastCheckout) {
            const aDate = new Date(a.lastCheckout);
            const bDate = new Date(b.lastCheckout);
            if (aDate.getTime() < bDate.getTime()) return -1;
            if (aDate.getTime() > bDate.getTime()) return 1;
          }
          return 0;
        });
      }
      if (orderOptionSelected.value === 4) {
        store.state.folios.folios?.sort((a, b) => {
          if (a.amountTotal && b.amountTotal) {
            if (a.amountTotal < b.amountTotal) return -1;
            if (a.amountTotal > b.amountTotal) return 1;
          }
          return 0;
        });
      }
    };

    const updateFolio = async (folioId: number | undefined) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
        ]);
        void store.dispatch('layout/changeRightDrawerContent', 'NewFolioStep1');
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

    const setCurrentReservation = async (folioId: number, reservationId: number) => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await Promise.all([
          store.dispatch('folios/fetchFolio', folioId),
          store.dispatch('reservations/fetchReservations', folioId),
          store.dispatch('reservations/fetchReservation', reservationId),
          store.dispatch('reservationLines/fetchReservationLines', reservationId),
        ]);
        void store.dispatch('layout/changeRightDrawerContent', 'FolioDetail');
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

    const moveToFirstReservation = async (reservation: ReservationInterface | null) => {
      if (!reservation) {
        return;
      }
      await store.dispatch('reservations/setCurrentReservation', reservation);
      await store.dispatch('reservationLines/fetchReservationLines', reservation.id);
      if (route.name === 'planning') {
        context.emit('moveToFirstReservation');
      } else if (route.name === 'dashboard') {
        await store.dispatch('planning/setMovePlanningToSelectedReservation', true);
        await router.push(`/planning${endPath.value}`);
      }
    };

    const folioHeaderBackgroundColorStyle = (state: string | undefined) => {
      let backgroundColor = '#263941';
      if (state === 'confirm') {
        backgroundColor = '#1E9ED9';
      } else if (state === 'draft') {
        backgroundColor = '#DCA81C';
      }
      const style = {
        backgroundColor,
      };
      return style;
    };

    const styleInput = () => {
      let style = {};
      style = {
        paddingLeft: `${1}rem`,
      };
      return style;
    };

    watch(filterOptionSelected, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await filterFolios();
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

    watch(orderOptionSelected, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await orderByOption();
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

    watch(searchFolio, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('layout/setRightDrawerSearchParam', searchFolio.value);
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

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        if (store.state.layout.rightDrawerSearchParam) {
          searchFolio.value = store.state.layout.rightDrawerSearchParam;
          await filterFolios();
        } else if (store.state.layout.rightDrawerFilter === 'toAssignFilter') {
          filterOptionSelected.value = 4;
        } else if (store.state.layout.rightDrawerFilter === 'yesterdayCheckins') {
          filterOptionSelected.value = 6;
        } else if (store.state.layout.rightDrawerFilter === 'todayPendingCheckins') {
          filterOptionSelected.value = 7;
        } else if (store.state.layout.rightDrawerFilter === 'todayCompletedCheckins') {
          filterOptionSelected.value = 8;
        } else if (store.state.layout.rightDrawerFilter === 'tomorrowPendingCheckins') {
          filterOptionSelected.value = 9;
        } else if (store.state.layout.rightDrawerFilter === 'todayPendingCheckouts') {
          filterOptionSelected.value = 10;
        } else if (store.state.layout.rightDrawerFilter === 'tomorrowPendingCheckouts') {
          filterOptionSelected.value = 11;
        } else if (store.state.layout.rightDrawerFilter === 'todayCompletedCheckouts') {
          filterOptionSelected.value = 12;
        } else if (store.state.layout.rightDrawerFilter === 'tomorrowCompletedCheckouts') {
          filterOptionSelected.value = 13;
        } else {
          const payload = {
            propertyId: store.state.properties.activeProperty?.id,
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            limit: 160,
            offset: 0,
          };
          if (
            store.state.layout.rightDrawerFilter === '' ||
            store.state.layout.rightDrawerFilter !== 'overbookingReservations'
          ) {
            await store.dispatch('folios/fetchFolios', payload);
          }
        }
        store.state.folios.folios.forEach((el, index) => {
          openFolioOptionsMenu.value[index] = false;
          cardOpened.value[index] = true;
        });
        showAllReservationsInClass.value.length = folios.value.length;
        showAllReservationsInClass.value.fill(false);
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
      filterOptions,
      filterOptionSelected,
      orderOptionSelected,
      orderByOptions,
      searchFolio,
      showFilters,
      folios,
      openFolioOptionsMenu,
      cardOpened,
      currentReservation,
      showAllReservationsInClass,
      isFilters,
      isAllowedAddRooms,
      isAllowedBatchChanges,
      isAllowedConfirmReservations,
      isAllowedCancelReservations,
      isSomeItemMenu,
      setCurrentReservation,
      closeRightDrawer,
      styleInput,
      updateFolio,
      folioHeaderBackgroundColorStyle,
      orderByOption,
      filterFolios,
      moveToFirstReservation,
    };
  },
});
</script>
<style lang="scss" scoped>
.folio-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .drawer-header-mbl {
    display: flex;
    flex-direction: column;
    .drawer-search {
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
      padding: 1rem 1rem 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .input-search {
        flex: 1 1 auto;
        margin-left: 1rem;
        margin-right: 1rem;
        height: 35px;
        font-size: 1rem;
      }
      img {
        height: 25px;
      }
    }
    .drawer-filters {
      display: flex;
      padding-top: 1rem;
      padding-right: 11px;
      padding-left: 11px;
      height: fit-content;
      justify-content: space-between;
      .filters-content {
        background-color: white;
        width: 45%;
        height: 35px;
      }
    }
  }
  .drawer-header-dsk {
    display: none;
    flex-direction: column;
    margin-right: 20px;
    margin-left: 28px;
    .drawer-search {
      height: 48px;
      margin-top: 15px;
    }
    .drawer-filters {
      height: 50px;
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      .filters-content {
        background-color: white;
        width: 280px;
        height: 40px;
      }
    }
  }
  .drawer-content {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    padding-right: 11px;
    padding-left: 11px;
    padding-top: 18px;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .no-folio-results {
    display: flex;
    width: 100%;
    font-weight: bold;
    justify-content: center;
    padding-top: 1rem;
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
    .reservation-blocked {
      padding-bottom: 1rem;
      .first-row {
        font-weight: bold;
      }
    }
  }
}
@media (min-width: 1024px) {
  .folio-list-container {
    .drawer-header-dsk {
      display: flex;
    }
    .drawer-header-mbl {
      display: none;
    }
    .drawer-content {
      -ms-overflow-style: block;
      scrollbar-width: block;
      &::-webkit-scrollbar {
        display: block;
      }
      padding-right: 20px;
      padding-left: 28px;
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
      border-top: 1px solid #d9d9d9;
      font-size: 16px;
    }
  }
}
.accordion-transition-enter-to,
.accordion-transition-leave-from {
  max-height: 10000px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}
.accordion-transition-enter-from,
.accordion-transition-leave-to {
  max-height: 0;
  overflow: hidden;
  transition: all 0.1s linear;
}
</style>
