<template>
  <div
    class="index-container"
    id="index-container"
    @mouseleave="endDrag"
    @mousemove="whileDragging"
    @mouseup="endDrag"
  >
    <div class="header">
      <div class="header-left">
        <img src="/app-images/icon-burger.svg" @click="openLeftDrawer" class="icon-menu" />
        <DatePicker
          class="calendar-select"
          v-model="selectedDate"
          dateFormat="MM yy"
          placeholder="DD/MM/YYYY"
          :manualInput="false"
          :inputStyle="{
            width: '115px',
            height: '25px',
            padding: '0px 5px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
          }"
        />

        <div class="select-property-desk" v-if="properties.length > 1">
          <AutocompleteComponent
            id="partners-autocomplete"
            :placeholderValue="activeProperty?.name ?? ''"
            placeholderShowingOptions="Buscar propiedad"
            placeholderColor="#000000"
            v-model="selectedPropertyId"
            :items="sortedProperties.map((el) => ({ value: el?.id ?? 0, name: el?.name ?? '' }))"
            iconExpandCollapse
            :showAddNewOption="false"
            :minChars="0"
            :emptyResultsAfterClick="false"
            isWithBorder
            iconDropdown="/app-images/icon-dropdown-black.svg"
          >
            <template #icon>
              <img src="/app-images/property-black.svg" />
            </template>
          </AutocompleteComponent>
        </div>

        <div v-else class="property-desk">
          <img src="/app-images/property.svg" />
          {{ activeProperty?.name ?? '' }}
        </div>

        <div
          class="select-filters"
          :class="isFilterOpened ? 'select-filters-open' : ''"
          @blur="isFilterOpened = false"
          tabindex="1"
        >
          <div class="filter-top" @click="isFilterOpened = !isFilterOpened">
            <img class="filter-img" src="/app-images/filter-icon-tuning-black.svg" />
            <span>
              {{ numFiltersApplied > 0 ? `${numFiltersApplied}` : '' }}
              Filtro{{ numFiltersApplied === 1 ? '' : 's' }} del planning
            </span>
            <CustomIcon
              imagePath="/app-images/icon-dropdown-black.svg"
              color="#000000"
              width="11px"
              height="11px"
              class="dropdown-img"
            />
          </div>
          <div class="filter-options" v-if="isFilterOpened">
            <div class="multiselect-container">
              <MultiSelect
                title="Categoría"
                v-model="selectedRoomTypes"
                :options="optionsRoomTypes"
              />
              <hr />
              <MultiSelect
                title="Capacidad habitación"
                v-model="selectedCapacities"
                :options="optionsCapacities"
              />
              <hr />
              <MultiSelect
                title="Clase"
                v-model="selectedRoomTypeClasses"
                :options="optionsRoomTypeClasses"
              />
            </div>
            <div v-if="numFiltersApplied > 0" class="clear-filters">
              <span @click="clearFilters"> Borrar filtros </span>
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div
          class="notifications"
          @click="isOpenNotifications = !isOpenNotifications"
          @blur="isOpenNotifications = false"
          tabindex="2"
          v-if="numReservationsToAssign > 0"
        >
          <img src="/app-images/notification-empty.svg" class="notification-empty" />
          <div class="bubble-notifications">
            <span>{{ numReservationsToAssign }}</span>
          </div>
          <div
            class="notifications-content"
            v-if="isOpenNotifications"
            @click="openSearchFolioWithFilter"
          >
            {{ numReservationsToAssign }} habitaciones por asignar
          </div>
        </div>
        <img src="/app-images/icon-event.svg" @click="moveToToday()" />
        <img src="/app-images/search.svg" @click="openSearchFolio" />
        <div class="select-property-mobile">
          <div
            @click="openSelectProperty"
            class="property-image"
            :style="{
              backgroundImage: imageActiveProperty ? `url(${imageActiveProperty})` : 'none',
              backgroundColor: imageActiveProperty ? 'none' : 'aquamarine',
            }"
          >
            <span v-if="!imageActiveProperty">
              {{ initialsActiveProperty }}
            </span>
          </div>
        </div>
        <div class="button-new-reservation" @click="openBookingEngine">
          <div>
            <CustomIcon
              imagePath="/app-images/icon-add-white.svg"
              color="#FFFFFF"
              width="21px"
              height="21px"
            />
          </div>
          <span class="text-new-reservation">Nueva reserva</span>
        </div>
        <div class="search-folio">
          <InputText
            v-model="searchFolio"
            placeholder="Buscar reserva"
            iconBefore="/app-images/search-black.svg"
            @keydown.enter="openSearchFolio"
            isWhithoutBorder
          />
        </div>
      </div>
    </div>
    <div class="up-container" @click="closeLeftDrawer">
      <PlanningReservations
        :filteredRoomIds="filteredRoomIds"
        :hideHorizontalScrollbar="isDownExpanded"
        :numPricesRulesToSave="numPricesRulesToSave"
        @hidePricelist="isDownExpanded = false"
        @updateSelectedDate="selectedDate = $event"
        @moveOneDayBackward="performIsOneDayBackward()"
        @moveOneDayForward="performIsOneDayForward()"
      />
    </div>

    <Transition name="bottom-bar-transition">
      <div
        class="down-container"
        v-if="isDownExpanded"
        :style="{
          minHeight: `${minHeightDownContent}px`,
        }"
      >
        <div class="arrow-down" @click="closePlanningPricelists">
          <img src="/app-images/icon_white_double_arrow_up.svg" />
        </div>
        <div
          class="dragger"
          @mousedown="startDrag"
          @mousedown.prevent
          :class="isDragging ? 'dragger-dragging' : ''"
        >
          <img src="/app-images/icon-drag-handle-black.svg" />
          <div class="border-right" v-show="!isDragging" />
          <div class="border-left" v-show="!isDragging" />
        </div>

        <div class="pricelist-content">
          <PlanningPricelist
            class="pricelist"
            :style="{
              height: `${minHeightDownContent - 15}px`,
            }"
            :roomTypeIds="selectedRoomTypes"
            :roomTypeClassIds="selectedRoomTypeClasses"
            v-if="activeProperty && activeAvailabilityPlan && activePricelist"
            @numPricesRulesToSave="numPricesRulesToSave = $event"
          />
        </div>
      </div>
    </Transition>
    <div class="bottom-bar" v-if="finishLoadingData">
      <div class="first-bottom">
        <div class="btn-open-pricelist-planning" @click="openPlanningPricelists">
          <CustomIcon
            imagePath="/app-images/icon_blue_double_arrow_up.svg"
            color="#000000"
            width="23px"
            height="23px"
            :class="isDownExpanded ? 'icon-arrow-rotate' : ''"
          />
          <span> Cambiar precios y restricciones </span>
        </div>

        <div class="selector">
          <CustomSelect
            :options="
              pricelists.map((el) => ({
                id: el.id,
                text: el.name,
              }))
            "
            v-model="selectedPricelistId"
            textBeforeOptionSelected="Tarifa "
            rightArrowColor="#000000"
            backgroundColor="#FFFFFF"
            showFromBottom
            iconDropdown="app-images/dropdown-black.svg"
            textBold
            focusable
            :isBorder="false"
          />
        </div>

        <div class="selector">
          <CustomSelect
            :options="
              availabilityPlans.map((el) => ({
                id: el.id ?? 0,
                text: el.name ?? '',
              }))
            "
            v-model="selectedAvailabilityPlanId"
            textBeforeOptionSelected="Plan de disp. "
            showFromBottom
            iconDropdown="app-images/dropdown-black.svg"
            textBold
            focusable
            rightArrowColor="#000000"
            backgroundColor="#FFFFFF"
            :isBorder="false"
          />
        </div>
      </div>
      <div class="btn-open-massive-changes" @click="openMassiveChangesDialog()">
        <span> Cambios masivos </span>
      </div>
    </div>
    <span class="speed-dial-wrapper">
      <SpeedDial
        v-if="!isBookingEngineOpenInMobile"
        :model="[
          {
            icon: 'pi pi-pencil',
            command: () => {
              openMassiveChangesDialog();
            },
          },
          {
            icon: 'pi pi-plus',
            command: () => {
              openBookingEngine();
            },
          },
        ]"
        direction="up"
        mask
        :maskStyle="{ zIndex: 998, pointerEvents: 'none' }"
        :style="{
          zIndex: 999,
          position: 'absolute',
          right: '1rem',
          bottom: '1rem',
        }"
        :itemStyle="{ zIndex: 1001, position: 'relative', border: '1px solid red' }"
        :buttonProps="{
          style: {
            backgroundColor: '#ffffff',
            color: '#2563eb',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            opacity: '0.75',
          },
        }"
        :actionButtonProps="{
          style: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            marginBottom: '1rem',
          },
        }"
      />
    </span>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  type Ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  inject,
  nextTick,
  markRaw,
  h,
} from 'vue';
import { useRouter } from 'vue-router';

import AutocompleteComponent from '@/_legacy/components/roomdooComponents/AutocompleteComponent.vue';
import CustomSelect from '@/_legacy/components/roomdooComponents/CustomSelect.vue';

import { useStore } from '@/_legacy/store';
import { useHead } from '@vueuse/head';
import DatePicker from 'primevue/datepicker';
import SpeedDial from 'primevue/speeddial';

import InputText from '@/_legacy/components/roomdooComponents/InputText.vue';
import PlanningReservations from '@/_legacy/components/planningReservations/PlanningReservations.vue';
import PlanningPricelist from '@/_legacy/components/planningPricelists/PlanningPricelist.vue';
import PriceAvailBatchChanges from '@/_legacy/components/priceAvailBatchChanges/PriceAvailBatchChanges.vue';
import MultiSelect from '@/_legacy/components/roomdooComponents/MultiSelect.vue';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import { usePlanning } from '@/_legacy/utils/usePlanning';
import { localeSpain } from '@/_legacy/utils/dates';
import utils from '@/_legacy/utils/utils';
import { dialogService } from '@/_legacy/services/DialogService';

export default defineComponent({
  components: {
    DatePicker,
    PlanningReservations,
    PlanningPricelist,
    SpeedDial,
    InputText,
    MultiSelect,
    AutocompleteComponent,
    CustomSelect,
    CustomIcon,
  },
  emits: ['openLeftDrawer'],
  setup(props, context) {
    const store = useStore();
    const router = useRouter();
    const { refreshPlanning } = usePlanning();

    const optionsCapacities = [
      {
        id: 1,
        name: '1',
      },
      {
        id: 2,
        name: '2',
      },
      {
        id: 3,
        name: '3',
      },
      {
        id: 4,
        name: '4',
      },
      {
        id: 5,
        name: '5 +',
      },
    ];

    const localeValue = ref(localeSpain);
    const searchFolio = ref('');
    const selectedRoomTypes = ref([] as number[]);
    const selectedRoomTypeClasses = ref([] as number[]);
    const selectedCapacities = ref([] as number[]);
    const textSearchProperty = ref('');
    const isFilterOpened = ref(false);
    const isOpenNotifications = ref(false);
    const selectedDate = ref(new Date());
    const showCalendarModal = ref(false);
    const isDownExpanded = ref(false);
    const isDragging = ref(false);
    const minHeightDownContent = ref(500);
    const scrollLeftTop = ref(0);
    const scrollLeftBottom = ref(0);
    const smoothScrollLeft = ref(0);
    const selectedPropertyId = ref(0);
    const selectedPricelistId = ref(0);
    const selectedAvailabilityPlanId = ref(0);
    const isButtonClicked = ref(false);
    const isScrollingOneDay = ref(false);
    const refPlanningHeader: Ref<null | HTMLElement> = ref(null);
    const refPlanningBody: Ref<null | HTMLElement> = ref(null);
    const refPlanningPricelists: Ref<null | HTMLElement> = ref(null);
    const refPlanningRooms: Ref<null | HTMLElement> = ref(null);
    const refPlanningRoomTypes: Ref<null | HTMLElement> = ref(null);
    const moveToReservation = ref(inject('moveToReservation'));
    const moveToFirstReservation = ref(inject('moveToFirstReservation'));
    const selectedPropertyIdFromRightSelector = ref(inject('selectedPropertyIdFromRightSelector'));
    const massiveChangesDialog = ref(false);
    const finishLoadingData = ref(false);
    const numPricesRulesToSave = ref(0);

    const isBookingEngineOpenInMobile = computed(
      () =>
        (store.state.layout.showing === 'NewFolioStep1' ||
          store.state.layout.showing === 'NewFolioStep2') &&
        rightDrawerExpanded.value
    );

    const activeUser = computed(() => store.state.user.activeUser);
    const activeProperty = computed(() => store.state.properties.activeProperty);
    const properties = computed(() => store.state.properties.properties);
    const pricelists = computed(() => store.state.pricelists.dailyPricelists);
    const availabilityPlans = computed(() => store.state.availabilityPlans.availabilityPlans);
    const currentRightDrawerView = computed(() => store.state.layout.showing);
    const rightDrawerExpanded = computed(() => store.state.layout.rightDrawerExpanded);
    const dateStartYear = computed(() => store.state.planning.dateStart.getFullYear());

    const imageActiveProperty = computed(() => activeProperty.value?.hotelImageUrl);

    const initialsActiveProperty = computed(() => {
      const result = '';
      if (activeProperty.value && activeProperty.value.name) {
        if (activeProperty.value.name.split(' ').length === 1) {
          return activeProperty.value.name[0].toUpperCase();
        }

        return (
          activeProperty.value.name.split(' ')[0][0].toUpperCase() +
          activeProperty.value.name.split(' ')[1][0].toUpperCase()
        );
      }
      return result;
    });

    const activePricelistId = computed(() => store.state.pricelists.activePricelist?.id);

    const activePricelist = computed(() =>
      store.state.pricelists.dailyPricelists.find((el) => el.id === activePricelistId.value)
    );

    const activeAvailabilityPlan = computed(() =>
      store.state.availabilityPlans.availabilityPlans.find(
        (el) => el.id === store.state.availabilityPlans.activeAvailabilityPlan?.id
      )
    );

    const numReservationsToAssign = computed(
      () => store.state.notifications.numReservationsToAssign
    );

    const sortedProperties = computed(() => {
      const result = store.state.properties.properties.filter(
        (el) => el.id !== activeUser.value?.defaultPropertyId
      );
      const defaultProperty = store.state.properties.properties.find(
        (el) => el.id === activeUser.value?.defaultPropertyId
      );
      if (defaultProperty) {
        result.unshift(defaultProperty);
      }
      return result;
    });

    const optionsRoomTypes = computed(() =>
      store.state.roomTypes.roomTypes.map((el) => ({ id: el.id, name: el.name }))
    );

    const optionsRoomTypeClasses = computed(() =>
      store.state.roomTypeClasses.roomTypeClasses.map((el) => ({ id: el.id, name: el.name }))
    );

    const numFiltersApplied = computed(() => {
      const numFilters =
        selectedRoomTypeClasses.value.length +
        selectedRoomTypes.value.length +
        selectedCapacities.value.length;
      return numFilters;
    });

    const dateStartMonth = computed(
      () => localeValue.value.months[store.state.planning.dateStart.getMonth()]
    );

    const title = computed(() => {
      let rdo = '';
      if (activeProperty.value) {
        rdo += activeProperty.value.name;
      }
      if (numReservationsToAssign.value > 0) {
        rdo += ` (${numReservationsToAssign.value})`;
      }
      return rdo;
    });

    const filteredRoomIds = computed(() => {
      if (store.state.planning.filteredRoomIds.length === 0) {
        return store.state.rooms.rooms.map((el) => el.id);
      }

      return store.state.planning.filteredRoomIds;
    });

    const openMassiveChangesDialog = () => {
      dialogService.open({
        header: 'CAMBIOS MASIVOS',
        content: markRaw(PriceAvailBatchChanges),
        closable: true,
      });
    };
    const openSearchFolio = async () => {
      await store.dispatch('layout/changeRightDrawerContent', 'FolioList');
      await store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const openSearchFolioWithFilter = async () => {
      await store.dispatch('layout/setRightDrawerFilter', 'toAssignFilter');
      await store.dispatch('layout/changeRightDrawerContent', 'FolioList');
      await store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const openSelectProperty = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'PropertySelector');
      void store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const openBookingEngine = () => {
      void store.dispatch('layout/changeRightDrawerContent', 'NewFolioStep1');
      void store.dispatch('layout/rightDrawerDisplayed', true);
    };

    const openLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', true);
      context.emit('openLeftDrawer');
    };

    const closeLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', false);
    };

    const refreshPropertyDependantData = async () => {
      finishLoadingData.value = false;
      void store.dispatch(
        'notifications/fetchNotificationsReservationsToAssign',
        activeProperty.value?.id
      );
      void store.dispatch(
        'saleChannels/fetchSaleChannels',
        store.state.properties.activeProperty?.id
      );
      void store.dispatch('products/fetchProducts', store.state.properties.activeProperty?.id);
      void store.dispatch(
        'boardServices/fetchBoardServices',
        store.state.properties.activeProperty?.id
      );
      void store.dispatch('agencies/fetchAgencies', store.state.properties.activeProperty?.id);
      void store.dispatch('accountJournals/fetchAccountJournals', {
        pmsPropertyId: store.state.properties.activeProperty?.id,
      });

      await Promise.all([
        store.dispatch('pricelists/fetchPricelists', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          daily: true,
        }),
        store.dispatch('pricelists/fetchDailyPricelists', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
        }),
        store.dispatch(
          'availabilityPlans/fetchAvailabilityPlans',
          store.state.properties.activeProperty?.id
        ),
        store.dispatch('amenities/fetchAmenities', store.state.properties.activeProperty?.id),
        store.dispatch('roomTypeClasses/fetchRoomTypeClasses', activeProperty.value?.id),
        store.dispatch('roomTypes/fetchRoomTypes', activeProperty.value?.id),
        store.dispatch('rooms/fetchRooms', store.state.properties.activeProperty?.id),
        store.dispatch('roomClosureReasons/fetchRoomClosureReasons'),
      ]);
      await store.dispatch('planning/setFilteredRoomIds', []);

      const pricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === store.state.properties.activeProperty?.defaultPricelistId
      );
      await store.dispatch('pricelists/setActivePricelist', pricelist);
      const availabilityPlan = store.state.availabilityPlans.availabilityPlans.find(
        (el) => el.id === store.state.pricelists.activePricelist?.defaultAvailabilityPlanId
      );
      await store.dispatch('availabilityPlans/setActiveAvailabilityPlan', availabilityPlan);
      await refreshPlanning();
      finishLoadingData.value = true;
    };

    const clearFilters = () => {
      selectedRoomTypes.value = [];
      selectedRoomTypeClasses.value = [];
      selectedCapacities.value = [];
      isFilterOpened.value = false;
    };

    const startDrag = () => {
      isDragging.value = true;
    };

    const endDrag = (event: MouseEvent) => {
      if (!isDragging.value) {
        return;
      }
      isDragging.value = false;
      if (window.innerHeight - event.clientY <= 50) {
        isDownExpanded.value = false;
        minHeightDownContent.value = 500;
      }
    };

    const whileDragging = (event: MouseEvent) => {
      if (isDragging.value) {
        let newHeight = window.innerHeight - event.clientY - 42;
        if (newHeight >= 740) {
          newHeight = 740;
        }
        minHeightDownContent.value = newHeight;
      }
    };

    const updateScrollLeftTop = (value: number) => {
      const a = document.getElementById('top-middle');
      const b = document.getElementById('bottom-middle');
      if (a && b) {
        a.scrollLeft = value;
        b.scrollLeft = value;
      }
    };

    const updateScrollLeftBottom = (value: number) => {
      if (!isDownExpanded.value) {
        smoothScrollLeft.value = value;
      } else {
        const a = document.getElementById('calendar-pricelists');
        if (a) {
          a.scrollLeft = value;
        }
      }
    };

    const moveToToday = () => {
      const today = new Date();
      today.setDate(today.getDate() - 1);
      selectedDate.value = today;
    };

    const scrollToAndWait = (
      element: HTMLElement | null,
      position: number
    ): Promise<void> | null => {
      if (element === null) {
        return new Promise<void>((resolve) => {
          resolve();
        });
      }
      return new Promise((resolve) => {
        element.scrollTo({
          left: position,
          behavior: 'smooth',
        });
        element.addEventListener('scroll', function handleScroll() {
          if (element.scrollLeft === position) {
            element.removeEventListener('scroll', handleScroll);
            resolve();
          }
        });
      });
    };

    const moveOneDayBackward = async () => {
      if (refPlanningBody.value && refPlanningBody.value.scrollLeft - 140 < 0) {
        if (numPricesRulesToSave.value > 0) {
          if (
            await new Promise((resolve) =>
              dialogService.open({
                header: 'Hay cambios sin guardar',
                content: 'Existen cambios sin guardar en el planning de precios y restricciones.',
                btnAccept: 'Descartar los cambios',
                btnCancel: 'Cancelar',
                onClose: () => resolve(true),
                onAccept: () => resolve(false),
              })
            )
          ) {
            return;
          }
        }
        isScrollingOneDay.value = false;
        const newDateStart = new Date(store.state.planning.dateStart.getTime());
        newDateStart.setDate(newDateStart.getDate() - 1);
        const newDateEnd = new Date(store.state.planning.dateEnd.getTime());
        newDateEnd.setDate(newDateEnd.getDate() - 1);
        await store.dispatch('planning/updateDateStart', newDateStart);
        await store.dispatch('planning/updateDateEnd', newDateEnd);
        void store.dispatch('layout/showSpinner', true);
        try {
          await refreshPlanning();
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        refPlanningBody.value.scrollLeft = 0;
      } else {
        isScrollingOneDay.value = true;
        await Promise.all([
          scrollToAndWait(
            refPlanningPricelists.value,
            (refPlanningPricelists.value?.scrollLeft ?? 0) - 140
          ),
          scrollToAndWait(
            refPlanningHeader.value,
            (refPlanningHeader.value?.scrollLeft ?? 0) - 140
          ),
          scrollToAndWait(refPlanningBody.value, (refPlanningBody.value?.scrollLeft ?? 0) - 140),
        ]);
        isScrollingOneDay.value = false;
      }
    };

    const performIsOneDayBackward = utils.throttle(moveOneDayBackward, 500);

    const moveOneDayForward = async () => {
      const newScrollLeft = (refPlanningBody.value?.scrollLeft ?? 0) + 140;
      const maxScrollLeft =
        (refPlanningBody.value?.scrollWidth ?? 0) - (refPlanningBody.value?.clientWidth ?? 0);
      if (refPlanningBody.value && newScrollLeft >= maxScrollLeft) {
        if (numPricesRulesToSave.value > 0) {
          if (
            await new Promise((resolve) =>
              dialogService.open({
                header: 'Hay cambios sin guardar',
                content: 'Existen cambios sin guardar en el planning de precios y restricciones.',
                btnAccept: 'Descartar los cambios',
                btnCancel: 'Cancelar',
                onClose: () => resolve(true),
                onAccept: () => resolve(false),
              })
            )
          ) {
            return;
          }
        }
        isScrollingOneDay.value = false;
        const newDateStart = new Date(store.state.planning.dateStart.getTime());
        newDateStart.setDate(newDateStart.getDate() + 1);
        const newDateEnd = new Date(store.state.planning.dateEnd.getTime());
        newDateEnd.setDate(newDateEnd.getDate() + 1);
        await store.dispatch('planning/updateDateStart', newDateStart);
        await store.dispatch('planning/updateDateEnd', newDateEnd);
        void store.dispatch('layout/showSpinner', true);
        try {
          await refreshPlanning();
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
        isScrollingOneDay.value = true;
        await Promise.all([
          scrollToAndWait(
            refPlanningPricelists.value,
            (refPlanningPricelists.value?.scrollLeft ?? 0) + 140
          ),
          scrollToAndWait(
            refPlanningHeader.value,
            (refPlanningHeader.value?.scrollLeft ?? 0) + 140
          ),
          scrollToAndWait(refPlanningBody.value, (refPlanningBody.value?.scrollLeft ?? 0) + 140),
        ]);
        isScrollingOneDay.value = false;
      }
    };

    const performIsOneDayForward = utils.throttle(moveOneDayForward, 500);

    const movePlanningToCurrentReservation = async () => {
      if (numPricesRulesToSave.value > 0) {
        if (
          await new Promise((resolve) =>
            dialogService.open({
              header: 'Hay cambios sin guardar',
              content: 'Existen cambios sin guardar en el planning de precios y restricciones.',
              btnAccept: 'Descartar los cambios',
              btnCancel: 'Cancelar',
              onClose: () => resolve(true),
              onAccept: () => resolve(false),
            })
          )
        ) {
          return;
        }
      }
      clearFilters();
      const dateStartRange = new Date(store.state.reservations.currentReservation?.checkin as Date);
      dateStartRange.setDate(dateStartRange.getDate() - 1);
      const dateEndRange = new Date(dateStartRange);
      dateEndRange.setDate(dateEndRange.getDate() + 32);
      void store.dispatch('layout/showSpinner', true);
      try {
        await store.dispatch('planning/updateDateStart', dateStartRange);
        await store.dispatch('planning/updateDateEnd', dateEndRange);
        await refreshPlanning();
        if (
          store.state.reservations.currentReservation &&
          store.state.reservationLines.reservationLines[0]?.id &&
          refPlanningBody.value
        ) {
          const selector = `${store.state.reservations.currentReservation.id}-${store.state.reservationLines.reservationLines[0].id}`;
          const refReservation = document.getElementById(selector);
          refReservation?.scrollIntoView({
            block: 'center',
          });
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

    const handleScrollPlanning = () => {
      if (!isScrollingOneDay.value) {
        if (refPlanningHeader.value && refPlanningRooms.value && refPlanningBody.value) {
          refPlanningHeader.value.scrollLeft = refPlanningBody.value.scrollLeft;
          refPlanningRooms.value.scrollTop = refPlanningBody.value.scrollTop;
        }
        if (refPlanningPricelists.value && refPlanningBody.value) {
          refPlanningPricelists.value.scrollLeft = refPlanningBody.value.scrollLeft;
        }
      }
    };

    const handleScrollPlanningPricelists = () => {
      if (!isScrollingOneDay.value) {
        if (
          refPlanningPricelists.value &&
          refPlanningRoomTypes.value &&
          refPlanningBody.value &&
          refPlanningHeader.value
        ) {
          refPlanningHeader.value.scrollLeft = refPlanningPricelists.value.scrollLeft;
          refPlanningBody.value.scrollLeft = refPlanningPricelists.value.scrollLeft;
          refPlanningRoomTypes.value.scrollTop = refPlanningPricelists.value.scrollTop;
        }
      }
    };

    const openPlanningPricelists = () => {
      isDownExpanded.value = !isDownExpanded.value;
      if (isDownExpanded.value) {
        minHeightDownContent.value = 500;
        void nextTick(() => {
          refPlanningPricelists.value = document.getElementById('calendar-pricelists');
          refPlanningRoomTypes.value = document.getElementById('room-type-names');
          if (refPlanningPricelists.value && refPlanningBody.value) {
            refPlanningPricelists.value.scrollLeft = refPlanningBody.value.scrollLeft;
            refPlanningPricelists.value.addEventListener('scroll', handleScrollPlanningPricelists);
          }
        });
      }
    };

    const closePlanningPricelists = () => {
      isDownExpanded.value = false;
      refPlanningPricelists.value?.removeEventListener('scroll', handleScrollPlanningPricelists);
      refPlanningPricelists.value = null;
    };

    watch(selectedPropertyId, async () => {
      if (selectedPropertyId.value !== activeProperty.value?.id && selectedPropertyId.value !== 0) {
        await store.dispatch('properties/setActiveProperty', selectedPropertyId.value);
        void router.push(`/planning/${selectedPropertyId.value}`);
        void store.dispatch('layout/rightDrawerDisplayed', false);
        void store.dispatch('layout/changeRightDrawerContent', 'FoliosList');
        void store.dispatch('layout/showSpinner', true);
        try {
          await refreshPropertyDependantData();
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        selectedRoomTypeClasses.value = [];
        selectedRoomTypes.value = [];
        selectedCapacities.value = [];
      }
    });

    watch(selectedDate, async (value) => {
      if (value !== null) {
        const dateStartSelected = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const dateEndSelected = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        dateEndSelected.setDate(dateStartSelected.getDate() + 32);
        void store.dispatch('planning/updateDateStart', dateStartSelected);
        void store.dispatch('planning/updateDateEnd', dateEndSelected);
        void store.dispatch('layout/showSpinner', true);
        try {
          await refreshPlanning();
        } catch {
          dialogService.open({
            header: 'Error',
            content: 'Algo ha ido mal',
            btnAccept: 'Ok',
          });
        } finally {
          void store.dispatch('layout/showSpinner', false);
        }
        refPlanningBody.value?.scrollTo({
          top: 0,
          left: 0,
          // behavior: 'smooth',
        });
      }
    });

    watch(searchFolio, () => {
      void store.dispatch('layout/setRightDrawerSearchParam', searchFolio.value);
    });

    watch(rightDrawerExpanded, () => {
      if (!rightDrawerExpanded.value) {
        searchFolio.value = '';
        void store.dispatch('layout/setRightDrawerFilter', '');
      }
    });

    watch(selectedPricelistId, async () => {
      if (selectedPricelistId.value !== activePricelist.value?.id) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch(
            'pricelists/setActivePricelist',
            pricelists.value.find((el) => el.id === selectedPricelistId.value)
          );
          await store.dispatch('planning/fetchPlanningPricesRules', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
            pricelistId: store.state.pricelists.activePricelist?.id,
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
    });

    watch(selectedAvailabilityPlanId, async () => {
      if (selectedAvailabilityPlanId.value !== activeAvailabilityPlan.value?.id) {
        void store.dispatch('layout/showSpinner', true);
        try {
          await store.dispatch(
            'availabilityPlans/setActiveAvailabilityPlan',
            availabilityPlans.value.find((el) => el.id === selectedAvailabilityPlanId.value)
          );
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
          await store.dispatch('planning/fetchPlanningPricesRules', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
            pricelistId: store.state.pricelists.activePricelist?.id,
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
    });

    watch(moveToReservation, async () => {
      if (moveToReservation.value) {
        await movePlanningToCurrentReservation();
        moveToReservation.value = false;
      }
    });

    watch(moveToFirstReservation, async () => {
      if (moveToFirstReservation.value) {
        await movePlanningToCurrentReservation();
        moveToFirstReservation.value = false;
      }
    });

    watch(selectedPropertyIdFromRightSelector, (value) => {
      selectedPropertyId.value = value as number;
    });

    watch(numFiltersApplied, async () => {
      const roomIds = store.state.rooms.rooms
        .filter(
          (el) =>
            (selectedRoomTypes.value.includes(el.roomTypeId) ||
              selectedRoomTypes.value.length === 0) &&
            (selectedRoomTypeClasses.value.includes(el.roomTypeClassId) ||
              selectedRoomTypeClasses.value.length === 0) &&
            ((selectedCapacities.value.includes(el.capacity) && el.capacity !== 5) ||
              (selectedCapacities.value.includes(5) && el.capacity >= 5) ||
              selectedCapacities.value.length === 0)
        )
        .map((el) => el.id);
      if (roomIds.length > 0) {
        await store.dispatch('planning/setFilteredRoomIds', roomIds);
        await store.dispatch('planning/fetchPlanningHeaders', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          roomIds: store.state.planning.filteredRoomIds,
        });
      } else {
        void store.dispatch('planning/clearPlanningHeaders');
      }
    });

    useHead(() => ({
      title: title.value,
    }));

    onMounted(async () => {
      selectedPropertyId.value = activeProperty.value?.id ?? 0;

      void store.dispatch('layout/showSpinner', true);
      try {
        finishLoadingData.value = false;
        await refreshPropertyDependantData();
        selectedPricelistId.value = activePricelist.value?.id ?? 0;
        selectedAvailabilityPlanId.value = activeAvailabilityPlan.value?.id ?? 0;

        finishLoadingData.value = true;
        void store.dispatch('documentType/fetchDocumentTypes');
        void store.dispatch('languages/fetchLanguages');
        void store.dispatch('countries/fetchCountries');
        void store.dispatch('categories/fetchCategories');
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal planning mounted',
          btnAccept: 'Ok',
        });
      } finally {
        void store.dispatch('layout/showSpinner', false);
      }

      refPlanningHeader.value = document.getElementById('top-middle');
      refPlanningBody.value = document.getElementById('bottom-middle');
      refPlanningRooms.value = document.getElementById('bottom-left');

      refPlanningBody.value?.addEventListener('scroll', handleScrollPlanning);
      if (store.state.planning.movePlanningToSelectedReservation) {
        await movePlanningToCurrentReservation();
        void store.dispatch('planning/setMovePlanningToSelectedReservation', false);
      }
    });
    onUnmounted(() => {
      if (refPlanningBody.value) {
        refPlanningBody.value.removeEventListener('scroll', handleScrollPlanning);
      }
      void store.dispatch('layout/rightDrawerDisplayed', false);
    });

    return {
      isScrollingOneDay,
      activeProperty,
      imageActiveProperty,
      initialsActiveProperty,
      activePricelist,
      selectedPricelistId,
      activeAvailabilityPlan,
      availabilityPlans,
      selectedAvailabilityPlanId,
      properties,
      pricelists,
      openLeftDrawer,
      openSearchFolio,
      openBookingEngine,
      closeLeftDrawer,
      movePlanningToCurrentReservation,
      moveToReservation,
      moveToFirstReservation,
      isButtonClicked,
      showCalendarModal,
      selectedDate,
      localeSpain,
      dateStartMonth,
      dateStartYear,
      searchFolio,
      selectedRoomTypes,
      selectedRoomTypeClasses,
      selectedCapacities,
      optionsRoomTypes,
      optionsCapacities,
      optionsRoomTypeClasses,
      isFilterOpened,
      numFiltersApplied,
      clearFilters,
      textSearchProperty,
      sortedProperties,
      selectedPropertyId,
      openSelectProperty,
      openSearchFolioWithFilter,
      currentRightDrawerView,
      rightDrawerExpanded,
      isOpenNotifications,
      numReservationsToAssign,
      isDownExpanded,
      startDrag,
      endDrag,
      whileDragging,
      minHeightDownContent,
      isDragging,
      scrollLeftTop,
      scrollLeftBottom,
      updateScrollLeftTop,
      updateScrollLeftBottom,
      smoothScrollLeft,
      moveToToday,
      filteredRoomIds,
      performIsOneDayBackward,
      performIsOneDayForward,
      openPlanningPricelists,
      closePlanningPricelists,
      openMassiveChangesDialog,
      activePricelistId,
      massiveChangesDialog,
      numPricesRulesToSave,
      finishLoadingData,
      isBookingEngineOpenInMobile,
    };
  },
});
</script>
<style lang="scss" scoped>
.index-container {
  display: flex;
  height: 100%;
  flex-direction: column;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: auto;
    padding: 15px 21px;
    background-color: #f0fcff;

    .header-left {
      display: flex;
      align-items: center;
      position: relative;
      width: 60%;
      height: 100%;
      .icon-menu {
        width: 20px;
        margin-right: 13px;
      }
      .calendar-select {
        height: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        span {
          font-size: 18px;
          font-weight: bold;
          margin-right: 0.5rem;
        }
        .icon-arrow {
          font-size: 1.2rem;
          color: $primary;
        }
      }
      .select-property-desk {
        display: none;
        height: 40px;
        max-width: 400px;
        font-size: 15px;
        width: 50%;
        z-index: 8;
      }

      .property-desk {
        display: none;
        max-width: 300px;
        font-size: 17px;
        width: 50%;
        margin-left: 2rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: bold;
        img {
          margin-right: 1rem;
        }
      }

      .select-filters {
        display: none;
        position: relative;
        max-width: 230px;
        width: 50%;
        height: 40px;
        border-radius: 10px;
        background-color: white;
        cursor: pointer;
        user-select: none;
        margin: 0 0.5rem;
        outline: none;
        .filter-top {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-around;
          .filter-img {
            width: 18px;
            height: 18px;
          }
          span {
            font-size: 15px;
          }
          .dropdown-img {
            width: 11px;
            height: 11px;
            transition: transform 0.3s ease;
          }
        }
        .filter-options {
          position: absolute;
          top: 35px;
          left: -1px;
          width: 101%;
          z-index: 120;
          border-right: 1px solid #d2ecf2;
          border-left: 1px solid #d2ecf2;
          border-bottom: 1px solid #d2ecf2;
          background-color: white;
          border-radius: 0 0 10px 10px;
          display: flex;
          flex-direction: column;
          box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25);

          .multiselect-container {
            max-height: 850px;
            overflow-y: scroll;
            flex: 1 1 auto;
          }
          .clear-filters {
            padding: 0.5rem 1rem;
            border-top: 1px solid grey;
            color: $primary;
          }
        }
      }
      .select-filters-open {
        background-color: white;
        border-radius: 10px 10px 0 0;
        box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.25);
        .dropdown-img {
          transform: rotate(-180deg);
          transition: transform 0.3s ease;
        }
      }
    }
    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      .notifications {
        margin-right: 1rem;
        cursor: pointer;
        display: none;
        height: 40px;
        width: 40px;
        min-width: 35px;
        min-height: 35px;
        border-radius: 6px;
        justify-content: center;
        background-color: $call_to_action_color;
        align-items: center;
        position: relative;
        user-select: none;
        &:focus {
          outline: none;
        }
        img {
          width: 50%;
        }
        .bubble-notifications {
          position: absolute;
          top: -8px;
          right: -12px;
          width: 23px;
          height: 23px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: tomato;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
        }
        .notifications-content {
          position: absolute;
          z-index: 100;
          top: 45px;
          left: 0;
          width: 230px;
          background-color: white;
          border-radius: 8px;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          box-shadow: 0px -1px 6px 1px rgba(0, 0, 0, 0.25);

          cursor: pointer;
          &:hover {
            font-weight: bold;
          }
        }
      }
      img {
        height: 24px;
        width: 24px;
        margin-right: 1rem;
        cursor: pointer;
      }
      .select-property-mobile {
        width: 2rem;
        height: 2rem;
      }

      .select-property-mobile {
        width: 35px;
        height: 35px;
        .property-image {
          cursor: pointer;
          border-radius: 50%;
          font-weight: bold;
          font-size: 1.3rem;
          display: flex;
          height: 100%;
          justify-content: center;
          align-items: center;
          border: 1px solid black;
          background-size: cover;
        }
      }
      .button-new-reservation {
        display: none;
        height: 40px;
        justify-content: space-around;
        width: 170px;
        align-items: center;
        background-color: $call_to_action_color;
        color: white;
        border-radius: 6px;
        padding: 0.5rem 1rem 0.5rem 0.5rem;
        cursor: pointer;
        .text-new-reservation {
          font-size: 15px;
          font-weight: bold;
          user-select: none;
        }
      }
      .search-folio {
        height: 100%;
        margin-left: 1rem;
        display: none;
        font-size: 15px;
      }
    }
  }
  .up-container {
    flex: 1 1 auto;
    overflow: hidden;
  }

  .bottom-bar {
    display: flex;
    align-items: center;
    min-height: 42px;
    position: relative;
    background-color: #ffffff;
    box-shadow: 0px -2px 14px rgba(0, 0, 0, 0.2);
    padding-left: 1.5rem;
    padding-right: 80px;
    display: none;
    user-select: none;
    justify-content: space-between;
    .btn-open-massive-changes {
      cursor: pointer;
      display: flex;
      align-items: center;
      background-color: #ffffff;
      border-radius: 5px;
      padding: 0 16px 0 14px;
      height: 30px;
      span {
        margin-left: 4px;
        width: 100%;
        font-size: 14px;
        font-weight: 700;
        color: black;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .first-bottom {
      margin-right: 1rem;
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      justify-content: flex-start;
      .btn-open-pricelist-planning {
        cursor: pointer;
        display: flex;
        align-items: center;
        background-color: #f0fcff;
        border-radius: 5px;
        padding: 0 16px 0 14px;
        height: 30px;
        span {
          width: 100%;
          font-size: 14px;
          font-weight: 700;
          color: black;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .icon-arrow-rotate {
          transform: rotate(180deg);
        }
      }
      .selector {
        margin-left: 1rem;
        font-size: 14px;
        color: black;
        height: 30px;
        max-width: 280px;
      }
    }
  }
  .down-container {
    max-height: 780px;
    position: relative;
    background-color: white;
    box-shadow: 0px -2px 14px rgba(0, 0, 0, 0.2);
    display: none;
    margin-left: 1rem;
    .arrow-down {
      height: 25px;
      width: 25px;
      position: absolute;
      top: -10px;
      left: 0px;
      border-radius: 4px;
      background-color: $primary;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 5;
      cursor: pointer;
      img {
        height: 20px;
        width: 20px;
        rotate: 180deg;
      }
    }
    .dragger {
      display: flex;
      justify-content: center;
      cursor: row-resize;
      height: 15px;
      user-select: none;
      position: relative;
      &.dragger-dragging {
        background-color: $roomdoo_lightgray;
        opacity: 0.5;
      }
      img {
        pointer-events: none;
      }
      .border-left {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 235px;
      }
      .border-right {
        position: absolute;
        right: 82px;
        height: 100%;
        width: 20px;
      }
    }
    .pricelist-content {
      height: 0;
      position: relative;
      .pricelist {
        position: absolute;
        border-right: 2px solid #d9d9d9;
      }
    }
  }
  .new-reservation {
    position: fixed;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    margin: 0 1rem 1.5rem 0;
    background: rgba(255, 255, 255, 0.58);
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.58);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(2px);
    z-index: 50;
  }
}

.bottom-bar-transition-enter-active,
.bottom-bar-transition-leave-active {
  transition: all 0.25s;
}
.bottom-bar-transition-enter-to,
.bottom-bar-transition-leave-from {
  transform: translateY(0);
}
.bottom-bar-transition-enter-from,
.bottom-bar-transition-leave-to {
  transform: translateY(100%);
}

@media (min-width: 1024px) {
  .index-container {
    .header {
      background-color: #f8f8f8;
      padding-left: 40px;
      padding-right: 82px;
      margin-left: 1rem;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.17);
      .header-left {
        display: flex;
        align-items: center;
        .icon-menu,
        .calendar-select {
          display: none;
        }
        .select-property-desk,
        .property-desk,
        .select-filters {
          display: flex;
        }
      }
      .header-right {
        .notifications {
          display: flex;
          .notification-empty {
            display: flex;
            margin: 0;
          }
        }
        img,
        .select-property-mobile {
          display: none;
        }

        .button-new-reservation {
          display: flex;
          align-items: center;
          margin-right: 1rem;
        }
        .search-folio {
          display: flex;
        }
      }
    }
    .bottom-bar {
      display: flex;
      margin-left: 1rem;
      box-shadow: none;
      background-color: #f0f0f0;
      box-shadow: 0px -2px 14px 0px #0000001a;
    }
    .speed-dial-wrapper {
      display: none;
      border: 1px solid red;
    }
    .down-container {
      display: block;
    }
    .new-reservation {
      display: none;
    }
  }
}
</style>
