<template>
  <div class="header">
    <!-- <img src="/app-images/icon-burger.svg" @click="openLeftDrawer()" class="icon-menu" /> -->
    <button class="icon-menu" @click="openLeftDrawer()" aria-label="Open menu">
      <i class="pi pi-bars" style="font-size: 1.5rem" />
    </button>
    <div class="logo-container">
      <img src="/logos/logo-text.svg" />
    </div>
  </div>
  <div class="main" id="page-dashboard">
    <div class="grid-layout">
      <DashboardGreetingCell class="greeting" />
      <DashboardPropertyOperativeCell class="operative" />
      <!-- OCCUPANCY -->
      <div class="kpi-1 cell">
        <div class="title">Ocupación de hoy</div>
        <div class="main-text" v-if="occupancyToday && occupancyToday > 0">
          {{ occupancyToday.toFixed(2).toString().replace('.', ',').toString().replace('.', ',') }}%
        </div>
        <div class="main-text" v-else>Sin ocupación</div>
        <div
          v-if="
            occupancyToday &&
            occupancyToday > 0 &&
            occupancyLastWeek &&
            occupancyLastWeek > 0 &&
            (occupancyLastWeek > occupancyToday || occupancyLastWeek < occupancyToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="occupancyToday > occupancyLastWeek ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: occupancyToday < occupancyLastWeek }"
          />
          <span
            :class="
              occupancyToday > occupancyLastWeek
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{ (occupancyToday - occupancyLastWeek).toFixed(2).toString().replace('.', ',') }}%
          </span>
          Respecto a la semana pasada
        </div>
        <div
          v-else-if="occupancyLastWeek === 0"
          class="alternative-data"
          :class="occupancyToday && occupancyToday > 0 ? 'margin-class' : ''"
        >
          Sin ocupación hace una semana
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ (occupancyLastWeek ?? 0).toFixed(2).toString().replace('.', ',') }}%
          </span>
          hace una semana
        </div>
        <div
          v-if="
            occupancyToday &&
            occupancyToday > 0 &&
            occupancyLastYear &&
            occupancyLastYear > 0 &&
            (occupancyLastYear > occupancyToday || occupancyLastYear < occupancyToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="occupancyToday > occupancyLastYear ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: occupancyToday < occupancyLastYear }"
          />
          <span
            :class="
              occupancyToday > occupancyLastYear
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{ (occupancyToday - occupancyLastYear).toFixed(2).toString().replace('.', ',') }}%
          </span>
          Respecto al año pasado
        </div>
        <div
          v-else-if="occupancyLastYear === 0"
          class="alternative-data"
          :class="occupancyToday && occupancyToday > 0 ? 'margin-class' : ''"
        >
          Sin ocupación hace un año
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ (occupancyLastYear ?? 0).toFixed(2).toString().replace('.', ',') }}%
          </span>
          hace un año
        </div>
      </div>
      <!-- DAILY OPERATIVE -->
      <div class="kpi-2 cell">
        <div class="title">Operativa de hoy</div>
        <div class="main-text">
          {{ totalDepartures + totalArrivals + (overnights ?? 0) + (cancelledOvernights ?? 0) }}
          reservas
        </div>
        <div class="daily-operations-summary">
          <div v-if="pendingReservations.length > 0">
            {{ totalDepartures }} salidas / {{ totalArrivals }} llegadas
          </div>
          <div>{{ overnights }} estancias overnight</div>
          <div v-if="cancelledOvernights ?? 0 > 0">{{ cancelledOvernights }} cancelaciones</div>
          <div class="overbookings" v-if="overbookings && overbookings > 0">
            {{ overbookings }} overbooking{{ overbookings === 1 ? '' : 's' }}
            <CustomIcon
              class="icon"
              imagePath="/app-images/icon-warning-white.svg"
              color="#FF4E00"
              width="15px"
              height="15px"
            />
          </div>
        </div>
      </div>
      <!-- DAILY BILLING -->
      <div class="kpi-3 cell">
        <div class="title">Facturación de hoy</div>
        <div class="main-text" v-if="billingToday && billingToday > 0">
          {{ billingToday.toFixed(2).toString().replace('.', ',') }}€
        </div>
        <div class="main-text" v-else>Sin facturación</div>
        <div
          v-if="
            billingToday &&
            billingToday > 0 &&
            billingLastWeek &&
            billingLastWeek > 0 &&
            (billingLastWeek > billingToday || billingLastWeek < billingToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="billingToday > billingLastWeek ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: billingToday < billingLastWeek }"
          />
          <span
            :class="
              billingToday > billingLastWeek
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{
              (((billingToday - billingLastWeek) / billingLastWeek) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto a la semana pasada
        </div>
        <div
          v-else-if="billingLastWeek === 0"
          class="alternative-data"
          :class="billingToday && billingToday > 0 ? 'margin-class' : ''"
        >
          Sin facturación hace una semana
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ (billingLastWeek ?? 0).toFixed(2).toString().replace('.', ',') }}€
          </span>
          hace una semana
        </div>
        <div
          v-if="
            billingToday &&
            billingToday > 0 &&
            billingLastYear &&
            billingLastYear > 0 &&
            (billingLastYear > billingToday || billingLastYear < billingToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="billingToday > billingLastYear ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: billingToday < billingLastYear }"
          />
          <span
            :class="
              billingToday > billingLastYear
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{
              (((billingToday - billingLastYear) / billingLastYear) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto al año pasado
        </div>
        <div
          v-else-if="billingLastYear === 0"
          class="alternative-data"
          :class="billingToday && billingToday > 0 ? 'margin-class' : ''"
        >
          Sin facturación hace un año
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ (billingLastYear ?? 0).toFixed(2).toString().replace('.', ',') }}€
          </span>
          hace un año
        </div>
      </div>
      <!-- DAILY NEW RESERVATIONS -->
      <div class="kpi-4 cell">
        <div class="title">Reservas recib. hoy</div>
        <div class="main-text" v-if="newFoliosToday && newFoliosToday > 0">
          {{ newFoliosToday }} nueva{{ newFoliosToday > 1 ? 's' : '' }}
        </div>
        <div class="main-text" v-else>Sin reservas</div>
        <div
          v-if="
            newFoliosToday &&
            newFoliosToday > 0 &&
            newFoliosLastWeek &&
            newFoliosLastWeek > 0 &&
            (newFoliosLastWeek > newFoliosToday || newFoliosLastWeek < newFoliosToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            v-if="newFoliosToday != newFoliosLastWeek"
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="newFoliosToday > newFoliosLastWeek ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: newFoliosToday < newFoliosLastWeek }"
          />
          <span
            :class="
              newFoliosToday > newFoliosLastWeek
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{
              (((newFoliosToday - newFoliosLastWeek) / newFoliosLastWeek) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto a la semana pasada
        </div>
        <div
          v-else-if="newFoliosLastWeek === 0"
          class="alternative-data"
          :class="newFoliosToday && newFoliosToday > 0 ? 'margin-class' : ''"
        >
          Sin reservas hace una semana
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ newFoliosLastWeek }}
          </span>
          reserva{{ (newFoliosLastWeek ?? 0) > 1 ? 's' : '' }} la semana pasada
        </div>
        <div
          v-if="
            newFoliosToday &&
            newFoliosToday > 0 &&
            newFoliosLastYear &&
            newFoliosLastYear > 0 &&
            (newFoliosLastYear > newFoliosToday || newFoliosLastYear < newFoliosToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="newFoliosToday > newFoliosLastYear ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: newFoliosToday < newFoliosLastYear }"
          />
          <span
            :class="
              newFoliosToday > newFoliosLastYear
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{
              (((newFoliosToday - newFoliosLastYear) / newFoliosLastYear) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}
          </span>
          Respecto al año pasado
        </div>
        <div
          v-else-if="newFoliosLastYear === 0"
          class="alternative-data"
          :class="newFoliosToday && newFoliosToday > 0 ? 'margin-class' : ''"
        >
          Sin reservas hace un año
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ newFoliosLastYear }}
          </span>
          reserva{{ (newFoliosLastYear ?? 0) > 1 ? 's' : '' }} hace un año
        </div>
      </div>
      <!-- ADR -->
      <div class="kpi-5 cell">
        <div class="title">ADR de hoy</div>
        <div class="main-text" v-if="ADRToday && ADRToday > 0">
          {{ ADRToday.toFixed(2).toString().replace('.', ',') }}€
        </div>
        <div class="main-text" v-else>Sin datos</div>
        <div
          v-if="
            ADRToday &&
            ADRToday > 0 &&
            ADRLastWeek &&
            ADRLastWeek > 0 &&
            (ADRLastWeek > ADRToday || ADRLastWeek < ADRToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="ADRToday >= ADRLastWeek ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: ADRToday < ADRLastWeek }"
          />
          <span
            :class="
              ADRToday >= ADRLastWeek ? 'positive-percentage-value' : 'negative-percentage-value'
            "
          >
            {{
              (((ADRToday - ADRLastWeek) / ADRLastWeek) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto a la semana pasada
        </div>
        <div
          v-else-if="ADRLastWeek === 0"
          class="alternative-data"
          :class="ADRToday && ADRToday > 0 ? 'margin-class' : ''"
        >
          Sin datos hace una semana
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ ADRLastWeek?.toFixed(2).toString().replace('.', ',') }}%
          </span>
          hace una semana
        </div>
        <div
          v-if="
            ADRToday &&
            ADRToday > 0 &&
            ADRLastYear &&
            ADRLastYear > 0 &&
            (ADRLastYear > ADRToday || ADRLastYear < ADRToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="ADRToday >= ADRLastYear ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: ADRToday < ADRLastYear }"
          />
          <span
            :class="
              ADRToday >= ADRLastYear ? 'positive-percentage-value' : 'negative-percentage-value'
            "
          >
            {{
              (((ADRToday - ADRLastYear) / ADRLastYear) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto al año pasado
        </div>
        <div
          v-else-if="ADRLastYear === 0"
          class="alternative-data"
          :class="ADRToday && ADRToday > 0 ? 'margin-class' : ''"
        >
          Sin datos hace un año
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data">
            {{ (ADRLastYear ?? 0).toFixed(2).toString().replace('.', ',') }}%
          </span>
          hace un año
        </div>
      </div>
      <!-- REVPAR -->
      <div class="kpi-6 cell">
        <div class="title">RevPAR de hoy</div>
        <div class="main-text" v-if="RevPARToday && RevPARToday > 0">
          {{ RevPARToday.toFixed(2).toString().replace('.', ',') }}€
        </div>
        <div class="main-text" v-else>Sin datos</div>
        <div
          v-if="
            RevPARToday &&
            RevPARToday > 0 &&
            RevPARLastWeek &&
            RevPARLastWeek > 0 &&
            (RevPARLastWeek > RevPARToday || RevPARLastWeek < RevPARToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="RevPARToday > RevPARLastWeek ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: RevPARToday < RevPARLastWeek }"
          />
          <span
            :class="
              RevPARToday > RevPARLastWeek
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{
              (((RevPARToday - RevPARLastWeek) / RevPARLastWeek) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto a la semana pasada
        </div>
        <div
          v-else-if="RevPARLastWeek === 0"
          class="alternative-data"
          :class="RevPARToday && RevPARToday > 0 ? 'margin-class' : ''"
        >
          Sin datos hace una semana
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data"> {{ RevPARLastWeek }}% </span>
          hace una semana
        </div>
        <div
          v-if="
            RevPARToday &&
            RevPARToday > 0 &&
            RevPARLastYear &&
            RevPARLastYear > 0 &&
            (RevPARLastYear > RevPARToday || RevPARLastYear < RevPARToday)
          "
          class="comparative-value"
        >
          <CustomIcon
            class="icon"
            imagePath="/app-images/icon-arrow-up.svg"
            :color="RevPARToday > RevPARLastYear ? '#27C153' : '#C82626'"
            width="15px"
            height="15px"
            :class="{ rotate: RevPARToday < RevPARLastYear }"
          />
          <span
            :class="
              RevPARToday > RevPARLastYear
                ? 'positive-percentage-value'
                : 'negative-percentage-value'
            "
          >
            {{
              (((RevPARToday - RevPARLastYear) / RevPARLastYear) * 100)
                .toFixed(2)
                .toString()
                .replace('.', ',')
            }}%
          </span>
          Respecto al año pasado
        </div>
        <div
          v-else-if="RevPARLastYear === 0"
          class="alternative-data"
          :class="RevPARToday && RevPARToday > 0 ? 'margin-class' : ''"
        >
          Sin datos hace un año
        </div>
        <div v-else class="alternative-data">
          <span class="bold-data"> {{ RevPARLastYear }}% </span>
          hace un año
        </div>
      </div>
      <DashboardLastReservationsReceivedCell class="new-reservations" />
      <DashboardDonutChartRoomStates class="donut-1" />
      <DashboardDonutChartSaleChannels class="donut-2" />
      <DashboardFeedPosts class="feed-rss cell" />
      <DashboardLineChart class="graph" />
    </div>
  </div>
  <!-- main (dashboard) -->
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';

import { useStore } from '@/_legacy/store';
import { dialogService } from '@/_legacy/services/DialogService';
import CustomIcon from '@/_legacy/components/roomdooComponents/CustomIcon.vue';
import DashboardGreetingCell from '@/_legacy/components/dashboard/DashboardGreetingCell.vue';
import DashboardPropertyOperativeCell from '@/_legacy/components/dashboard/DashboardPropertyOperativeCell.vue';
import DashboardLastReservationsReceivedCell from '@/_legacy/components/dashboard/DashboardLastReservationsReceivedCell.vue';
import DashboardDonutChartSaleChannels from '@/_legacy/components/dashboard/DashboardDonutChartSaleChannels.vue';
import DashboardDonutChartRoomStates from '@/_legacy/components/dashboard/DashboardDonutChartRoomStates.vue';
import DashboardFeedPosts from '@/_legacy/components/dashboard/DashboardFeedPosts.vue';
import DashboardLineChart from '@/_legacy/components/dashboard/DashboardLineChart.vue';

export default defineComponent({
  components: {
    CustomIcon,
    DashboardGreetingCell,
    DashboardPropertyOperativeCell,
    DashboardLastReservationsReceivedCell,
    DashboardDonutChartSaleChannels,
    DashboardDonutChartRoomStates,
    DashboardFeedPosts,
    DashboardLineChart,
  },
  emits: ['openLeftDrawer'],
  setup(props, context) {
    const store = useStore();
    // dates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);
    aWeekAgo.setHours(0, 0, 0, 0);

    // comparative dates
    const thirtyDaysAgoLastYear = new Date();
    thirtyDaysAgoLastYear.setFullYear(thirtyDaysAgoLastYear.getFullYear() - 1);
    thirtyDaysAgoLastYear.setDate(thirtyDaysAgoLastYear.getDate() - 30);
    thirtyDaysAgoLastYear.setHours(0, 0, 0, 0);

    const todayLastYear = new Date();
    todayLastYear.setFullYear(todayLastYear.getFullYear() - 1);
    todayLastYear.setHours(0, 0, 0, 0);

    const yesterdayStr = `${yesterday.getDate().toString()}/${(
      yesterday.getMonth() + 1
    ).toString()}/${yesterday.getFullYear().toString().substring(2)}`;

    const lineChartOptionType = [
      {
        id: 1,
        text: 'Ocupación',
      },
      {
        id: 2,
        text: 'Facturación',
      },
    ];

    const lineChartOptionPeriod = [
      {
        id: 1,
        text: 'Últimos 30 días',
      },
      {
        id: 2,
        text: 'Mes actual',
      },
      {
        id: 3,
        text: 'Mes anterior',
      },
      {
        id: 4,
        text: 'Año actual',
      },
    ];

    const lineChartOptionsComparative = [
      {
        id: 1,
        text: 'Comp. año pasado',
      },
      {
        id: 2,
        text: 'Comp. hace 2 años',
      },
    ];

    const dateOptionsSelected = ref(1);
    const lineChartOptionTypeSelected = ref(1);
    const lineChartOptionPeriodSelected = ref(1);
    const lineChartOPtionPeriodComparativeSelected = ref(1);

    const activeProperty = computed(() => store.state.properties.activeProperty);
    const occupancyToday = computed(() => store.state.dashboard.occupancyToday);
    const billingToday = computed(() => store.state.dashboard.billingToday);
    const billingLastWeek = computed(() => store.state.dashboard.billingLastWeek);
    const billingLastYear = computed(() => store.state.dashboard.billingLastYear);
    const ADRToday = computed(() => store.state.dashboard.ADRToday);
    const ADRLastWeek = computed(() => store.state.dashboard.ADRLastWeek);
    const ADRLastYear = computed(() => store.state.dashboard.ADRLastYear);
    const RevPARToday = computed(() => store.state.dashboard.RevPARToday);
    const RevPARLastWeek = computed(() => store.state.dashboard.RevPARLastWeek);
    const RevPARLastYear = computed(() => store.state.dashboard.RevPARLastYear);
    const newFoliosToday = computed(() => store.state.dashboard.newFoliosToday);
    const newFoliosLastWeek = computed(() => store.state.dashboard.newFoliosLastWeek);
    const newFoliosLastYear = computed(() => store.state.dashboard.newFoliosLastYear);
    const overnights = computed(() => store.state.dashboard.overnights);
    const occupiedRooms = computed(() => store.state.dashboard.linearGraphOccupancy);
    const occupiedRoomsComparative = computed(
      () => store.state.dashboard.linearGraphOccupancyComparative
    );
    const dailyBillings = computed(() => store.state.dashboard.linearGraphBilling);
    const dailyBillingsComparative = computed(
      () => store.state.dashboard.linearGraphBillingComparative
    );
    const cancelledOvernights = computed(() => store.state.dashboard.cancelledOvernights);
    const overbookings = computed(() => store.state.dashboard.overbookings);

    const pendingReservations = computed(() => store.state.dashboard.pendingReservations);

    const totalDepartures = computed(() => {
      const pendingDepartures = pendingReservations.value[1]?.pendingDepartureReservations;
      const completedDepartures = pendingReservations.value[1]?.completedDepartureReservations;
      return pendingDepartures + completedDepartures;
    });

    const totalArrivals = computed(() => {
      const pendingArrivals = pendingReservations.value[1]?.pendingArrivalReservations;
      const completedArrivals = pendingReservations.value[1]?.completedArrivalReservations;
      return pendingArrivals + completedArrivals;
    });

    const occupancyLastWeek = computed(() => store.state.dashboard.occupancyLastWeek);

    const occupancyLastYear = computed(() => store.state.dashboard.occupancyLastYear);

    const openLeftDrawer = () => {
      void store.dispatch('layout/leftDrawerDisplayed', true);
      context.emit('openLeftDrawer');
    };

    const refreshPropertyDependantData = async () => {
      await Promise.all([
        store.dispatch('roomTypeClasses/fetchRoomTypeClasses', activeProperty.value?.id),
        store.dispatch('roomTypes/fetchRoomTypes', activeProperty.value?.id),
        store.dispatch('rooms/fetchRooms', store.state.properties.activeProperty?.id),
        store.dispatch('products/fetchProducts', store.state.properties.activeProperty?.id),
        store.dispatch(
          'notifications/fetchNotificationsReservationsToAssign',
          activeProperty.value?.id
        ),
        store.dispatch(
          'boardServices/fetchBoardServices',
          store.state.properties.activeProperty?.id
        ),
        store.dispatch('accountJournals/fetchAccountJournals', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
        }),
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
        store.dispatch('saleChannels/fetchSaleChannels', store.state.properties.activeProperty?.id),
        store.dispatch('agencies/fetchAgencies', store.state.properties.activeProperty?.id),
        store.dispatch('roomClosureReasons/fetchRoomClosureReasons'),
        store.dispatch('dashboard/fetchLastReceivedFolios', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          offset: 0,
          limit: 7,
        }),
        store.dispatch(
          'dashboard/fetchNumLastReceivedFolios',
          store.state.properties.activeProperty?.id
        ),
        store.dispatch('dashboard/fetchPendingReservations', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: yesterday,
          dateTo: tomorrow,
        }),
        store.dispatch('dashboard/fetchStateRooms', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: yesterday,
          dateTo: tomorrow,
        }),
        store.dispatch('dashboard/fetchOccupiedRooms', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: thirtyDaysAgo,
          dateTo: today,
        }),
        store.dispatch('dashboard/fetchOccupiedRoomsComparative', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: thirtyDaysAgoLastYear,
          dateTo: todayLastYear,
        }),
        store.dispatch('dashboard/fetchDailyBillings', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: thirtyDaysAgo,
          dateTo: today,
        }),
        store.dispatch('dashboard/fetchDailyBillingsComparative', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: thirtyDaysAgoLastYear,
          dateTo: todayLastYear,
        }),
        store.dispatch('dashboard/fetchReservationsBySaleChannel', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: aWeekAgo,
          dateTo: today,
        }),
        store.dispatch('dashboard/fetchOccupancy', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          date: today,
        }),
        store.dispatch('dashboard/fetchBilling', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          date: today,
        }),
        store.dispatch('dashboard/fetchAdr', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: today,
          dateTo: today,
        }),
        store.dispatch('dashboard/fetchRevpar', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: today,
          dateTo: today,
        }),
        store.dispatch('dashboard/fetchNewFolios', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          date: today,
        }),
        store.dispatch('dashboard/fetchOvernights', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          date: today,
        }),
        store.dispatch('dashboard/fetchCancelledOvernights', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          date: today,
        }),
        store.dispatch('dashboard/fetchOverbookings', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          date: today,
        }),
      ]);
      const pricelist = store.state.pricelists.pricelists.find(
        (el) => el.id === store.state.properties.activeProperty?.defaultPricelistId
      );
      await store.dispatch('pricelists/setActivePricelist', pricelist);
      const availabilityPlan = store.state.availabilityPlans.availabilityPlans.find(
        (el) => el.id === store.state.pricelists.activePricelist?.defaultAvailabilityPlanId
      );
      await store.dispatch('availabilityPlans/setActiveAvailabilityPlan', availabilityPlan);
    };

    watch(activeProperty, async () => {
      void store.dispatch('layout/showSpinner', true);
      await refreshPropertyDependantData();
      void store.dispatch('layout/showSpinner', false);
    });

    onMounted(async () => {
      void store.dispatch('layout/showSpinner', true);
      await refreshPropertyDependantData();
      void store.dispatch('documentType/fetchDocumentTypes');
      void store.dispatch('languages/fetchLanguages');
      void store.dispatch('countries/fetchCountries');
      void store.dispatch('categories/fetchCategories');
      void store.dispatch('layout/showSpinner', false);
    });

    return {
      activeProperty,
      dateOptionsSelected,
      yesterdayStr,
      pendingReservations,
      totalDepartures,
      totalArrivals,
      occupancyToday,
      occupancyLastWeek,
      occupancyLastYear,
      billingToday,
      billingLastWeek,
      billingLastYear,
      ADRToday,
      ADRLastWeek,
      ADRLastYear,
      RevPARToday,
      RevPARLastWeek,
      RevPARLastYear,
      newFoliosToday,
      newFoliosLastWeek,
      newFoliosLastYear,
      overnights,
      cancelledOvernights,
      overbookings,
      openLeftDrawer,
      occupiedRooms,
      lineChartOptionType,
      lineChartOptionPeriod,
      lineChartOptionTypeSelected,
      lineChartOptionPeriodSelected,
      dailyBillings,
      dailyBillingsComparative,
      occupiedRoomsComparative,
      lineChartOptionsComparative,
      lineChartOPtionPeriodComparativeSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
.header {
  height: 57px;
  display: flex;
  align-items: center;
  background-color: white;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25));
  .icon-menu {
    margin-right: 13px;
    margin-left: 21px;
    width: 20px;
  }
  .logo-container {
    padding-bottom: 6px;
    img {
      width: 118px;
    }
  }
}
.main {
  height: calc(100% - 57px);
  padding-top: 15px;
  padding-bottom: 13px;
  background-color: $roomdoo_lightgray3;
  overflow-y: scroll;
  .grid-layout {
    max-width: 1720px;
    margin: 0 auto;
    display: grid;
    grid-row-gap: 18px;
    grid-template-columns: 50%;
    grid-template-areas:
      'greeting         greeting'
      'operative        operative'
      'operative        operative'
      'kpi-1            kpi-2'
      'kpi-3            kpi-4'
      'kpi-5            kpi-6'
      'reservations     reservations'
      'reservations     reservations'
      'reservations     reservations'
      'donut-1          donut-1'
      'donut-1          donut-1'
      'donut-2          donut-2'
      'donut-2          donut-2'
      'feed-rss         feed-rss'
      'feed-rss         feed-rss';

    .cell {
      border-radius: 20px;
      padding-left: 12px;
      padding-right: 12px;
      margin-left: 8px;
      margin-right: 8px;
    }
    .greeting {
      grid-area: greeting;
    }
    .operative {
      grid-area: operative;
    }

    @for $i from 1 through 6 {
      $isEven: $i % 2 == 0;
      .kpi-#{$i} {
        @if $isEven {
          margin-right: 8px;
          margin-left: 6px;
        } @else {
          margin-left: 8px;
          margin-right: 6px;
        }
        grid-area: kpi-#{$i};
        background: #fff;
        font-size: 12px;
        font-weight: 400;
        color: #808080;
        line-height: 15px;
        border-radius: 20px;
        padding: 12px 12px 8px 12px;
        .title {
          font-size: 12px;
          color: rgba(#000, 0.5);
          font-weight: 500;
          margin-bottom: 5px;
        }
        .main-text {
          color: #000;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .daily-operations-summary {
          font-size: 14px;
          line-height: 19px;
          .icon {
            margin-top: 2px;
            margin-left: 4px;
          }
          .overbookings {
            display: flex;
            color: #ff4e00;
            font-weight: 700;
          }
        }
        .comparative-value {
          font-size: 14px;
          line-height: 19px;
          color: rgba(#000, 0.5);
          position: relative;
          margin-left: 15px;
          .positive-percentage-value,
          .negative-percentage-value {
            font-size: 12px;
            font-weight: bold;
          }
          .positive-percentage-value {
            color: #27c153;
          }
          .negative-percentage-value {
            color: #c82626;
          }
          .rotate {
            rotate: 180deg;
          }
          .icon {
            position: absolute;
            left: -16px;
            top: 1px;
          }
        }
        .alternative-data {
          margin-top: 7px;
          font-size: 14px;
          line-height: 19px;
          margin-bottom: 7px;
          .bold-data {
            font-weight: 600;
            color: #000;
          }
        }
        .margin-class {
          margin-left: 15px;
        }
      }
    }
    .new-reservations {
      grid-area: reservations;
    }
    .donut-1 {
      grid-area: donut-1;
    }
    .donut-2 {
      grid-area: donut-2;
    }
    .feed-rss {
      grid-area: feed-rss;
    }
    .graph {
      display: none;
      grid-area: graph;
    }
  }
}
@media (min-width: 768px) {
  .main {
    .grid-layout {
      grid-column-gap: 12px;
      grid-template-columns: calc(50% - 8px);

      .graph {
        display: inline;
      }
      grid-template-columns: repeat(4, 1fr);
      grid-template-areas:
        'greeting       greeting      kpi-1       kpi-2'
        'operative      operative     kpi-3       kpi-4'
        'operative      operative     kpi-5       kpi-6'
        'reservations   reservations  donut-1     donut-1'
        'reservations   reservations  donut-1     donut-1'
        'reservations   reservations  donut-1     donut-1'
        'reservations   reservations  donut-2     donut-2'
        'feed-rss       feed-rss      donut-2     donut-2'
        'feed-rss       feed-rss      donut-2     donut-2'
        'graph          graph         graph       graph';
      .cell {
        padding: 15px 20px;
      }
      @for $i from 1 through 6 {
        .kpi-#{$i} {
          .title {
            font-size: 16px;
            margin-bottom: 13px;
          }
          .main-text {
            font-size: 18px;
            margin-bottom: 15px;
          }
          .comparative-value {
            margin-bottom: 6px;
            font-weight: 500;
            .positive-percentage-value,
            .negative-percentage-value {
              font-size: 14px;
            }
          }
          .alternative-data {
            margin-bottom: 6px;
          }
        }
      }
    }
  }
}
@media (min-width: 1024px) {
  .header {
    display: none;
  }
  .main {
    padding-right: 20px;
    padding-left: 20px;
    height: 100%;
    .grid-layout {
      @for $i from 1 through 6 {
        .kpi-#{$i} {
          .main-text {
            font-size: 20px;
          }
        }
      }
    }
  }
}
@media (min-width: 1440px) {
  .main {
    .grid-layout {
      grid-template-columns: repeat(6, 1fr);
      margin-bottom: 0.15rem;
      grid-template-areas:
        'greeting   greeting  kpi-1     kpi-2     reservations  reservations'
        'operative  operative kpi-3     kpi-4     reservations  reservations'
        'operative  operative kpi-5     kpi-6     reservations  reservations'
        'donut-1    donut-1   donut-2   donut-2   feed-rss      feed-rss'
        'donut-1    donut-1   donut-2   donut-2   feed-rss      feed-rss'
        'graph      graph     graph     graph     graph         graph';
    }
  }
}
</style>
