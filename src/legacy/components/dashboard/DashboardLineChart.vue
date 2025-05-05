<template>
  <div class="graph cell">
    <div class="top">
      <div class="title">Gráficas de evolución</div>
      <div class="right">
        <div class="select">
          <CustomSelect
            :options="lineChartOptionType"
            v-model="lineChartOptionTypeSelected"
            iconDropdown="app-images/dropdown.svg"
            :optionsMarginTop="2"
            :textBold="true"
            focusable
          />
        </div>
        <div class="select">
          <CustomSelect
            :options="lineChartOptionPeriod"
            v-model="lineChartOptionPeriodSelected"
            iconDropdown="app-images/dropdown.svg"
            :optionsMarginTop="2"
            :textBold="true"
            focusable
          />
        </div>
        <div class="select">
          <CustomSelect
            :options="lineChartOptionsComparative"
            v-model="lineChartOPtionPeriodComparativeSelected"
            iconDropdown="app-images/dropdown.svg"
            :optionsMarginTop="2"
            :textBold="true"
            focusable
          />
        </div>
      </div>
    </div>
    <LineChart v-bind="lineChartProps" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { LineChart, useLineChart } from 'vue-chart-3';
import { Chart, type ChartData, type ChartOptions, registerables } from 'chart.js';

import CustomSelect from '@/legacy/components/roomdooComponents/CustomSelect.vue';
import { useStore } from '@/legacy/store';
import { dialogService } from '@/legacy/services/DialogService';

Chart.register(...registerables);

export default defineComponent({
  components: {
    CustomSelect,
    LineChart,
  },
  setup() {
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

    const firstDayOfCurrentMonth = new Date();
    firstDayOfCurrentMonth.setDate(1);
    firstDayOfCurrentMonth.setHours(0, 0, 0, 0);

    const lastDayOfCurrentMonth = new Date();
    lastDayOfCurrentMonth.setMonth(lastDayOfCurrentMonth.getMonth() + 1);
    lastDayOfCurrentMonth.setDate(0);
    lastDayOfCurrentMonth.setHours(0, 0, 0, 0);

    const firstDayOfPreviousMonth = new Date();
    firstDayOfPreviousMonth.setMonth(firstDayOfPreviousMonth.getMonth() - 1);
    firstDayOfPreviousMonth.setDate(1);
    firstDayOfPreviousMonth.setHours(0, 0, 0, 0);

    const lastDayOfPreviousMonth = new Date();
    lastDayOfPreviousMonth.setDate(0);
    lastDayOfPreviousMonth.setHours(0, 0, 0, 0);

    const firstDayOfCurrentYear = new Date();
    firstDayOfCurrentYear.setMonth(0);
    firstDayOfCurrentYear.setDate(1);
    firstDayOfCurrentYear.setHours(0, 0, 0, 0);

    const lastDayOfCurrentYear = new Date();
    lastDayOfCurrentYear.setMonth(11);
    lastDayOfCurrentYear.setDate(31);
    lastDayOfCurrentYear.setHours(0, 0, 0, 0);

    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);
    aWeekAgo.setHours(0, 0, 0, 0);

    // comparative dates
    const thirtyDaysAgoLastYear = new Date();
    thirtyDaysAgoLastYear.setFullYear(thirtyDaysAgoLastYear.getFullYear() - 1);
    thirtyDaysAgoLastYear.setDate(thirtyDaysAgoLastYear.getDate() - 30);
    thirtyDaysAgoLastYear.setHours(0, 0, 0, 0);

    const thirtyDaysAgoTwoYearsAgo = new Date();
    thirtyDaysAgoTwoYearsAgo.setFullYear(thirtyDaysAgoTwoYearsAgo.getFullYear() - 2);
    thirtyDaysAgoTwoYearsAgo.setDate(thirtyDaysAgoTwoYearsAgo.getDate() - 30);
    thirtyDaysAgoTwoYearsAgo.setHours(0, 0, 0, 0);

    const todayLastYear = new Date();
    todayLastYear.setFullYear(todayLastYear.getFullYear() - 1);
    todayLastYear.setHours(0, 0, 0, 0);

    const todayTwoYearsAgo = new Date();
    todayTwoYearsAgo.setFullYear(todayTwoYearsAgo.getFullYear() - 2);
    todayTwoYearsAgo.setHours(0, 0, 0, 0);

    const firstDayOfCurrentMonthLastYear = new Date();
    firstDayOfCurrentMonthLastYear.setFullYear(firstDayOfCurrentMonthLastYear.getFullYear() - 1);
    firstDayOfCurrentMonthLastYear.setDate(1);
    firstDayOfCurrentMonthLastYear.setHours(0, 0, 0, 0);

    const firstDayOfCurrentMonthTwoYearsAgo = new Date();
    firstDayOfCurrentMonthTwoYearsAgo.setFullYear(
      firstDayOfCurrentMonthTwoYearsAgo.getFullYear() - 2
    );
    firstDayOfCurrentMonthTwoYearsAgo.setDate(1);
    firstDayOfCurrentMonthTwoYearsAgo.setHours(0, 0, 0, 0);

    const lastDayOfCurrentMonthLastYear = new Date();
    lastDayOfCurrentMonthLastYear.setFullYear(lastDayOfCurrentMonthLastYear.getFullYear() - 1);
    lastDayOfCurrentMonthLastYear.setMonth(lastDayOfCurrentMonthLastYear.getMonth() + 1);
    lastDayOfCurrentMonthLastYear.setDate(0);
    lastDayOfCurrentMonthLastYear.setHours(0, 0, 0, 0);

    const lastDayOfCurrentMonthTwoYearsAgo = new Date();
    lastDayOfCurrentMonthTwoYearsAgo.setFullYear(
      lastDayOfCurrentMonthTwoYearsAgo.getFullYear() - 2
    );
    lastDayOfCurrentMonthTwoYearsAgo.setMonth(lastDayOfCurrentMonthTwoYearsAgo.getMonth() + 1);
    lastDayOfCurrentMonthTwoYearsAgo.setDate(0);
    lastDayOfCurrentMonthTwoYearsAgo.setHours(0, 0, 0, 0);

    const firstDayOfPreviousMonthLastYear = new Date();
    firstDayOfPreviousMonthLastYear.setFullYear(firstDayOfPreviousMonthLastYear.getFullYear() - 1);
    firstDayOfPreviousMonthLastYear.setMonth(firstDayOfPreviousMonthLastYear.getMonth() - 1);
    firstDayOfPreviousMonthLastYear.setDate(1);
    firstDayOfPreviousMonthLastYear.setHours(0, 0, 0, 0);

    const firstDayOfPreviousMonthTwoYearsAgo = new Date();
    firstDayOfPreviousMonthTwoYearsAgo.setFullYear(
      firstDayOfPreviousMonthTwoYearsAgo.getFullYear() - 2
    );
    firstDayOfPreviousMonthTwoYearsAgo.setMonth(firstDayOfPreviousMonthTwoYearsAgo.getMonth() - 1);
    firstDayOfPreviousMonthTwoYearsAgo.setDate(1);
    firstDayOfPreviousMonthTwoYearsAgo.setHours(0, 0, 0, 0);

    const lastDayOfPreviousMonthLastYear = new Date();
    lastDayOfPreviousMonthLastYear.setFullYear(lastDayOfPreviousMonthLastYear.getFullYear() - 1);
    lastDayOfPreviousMonthLastYear.setDate(0);
    lastDayOfPreviousMonthLastYear.setHours(0, 0, 0, 0);

    const lastDayOfPreviousMonthTwoYearsAgo = new Date();
    lastDayOfPreviousMonthTwoYearsAgo.setFullYear(
      lastDayOfPreviousMonthTwoYearsAgo.getFullYear() - 2
    );
    lastDayOfPreviousMonthTwoYearsAgo.setDate(0);
    lastDayOfPreviousMonthTwoYearsAgo.setHours(0, 0, 0, 0);

    const firstDayLastYear = new Date();
    firstDayLastYear.setFullYear(firstDayLastYear.getFullYear() - 1);
    firstDayLastYear.setMonth(0);
    firstDayLastYear.setDate(1);
    firstDayLastYear.setHours(0, 0, 0, 0);

    const firstDayTwoYearsAgo = new Date();
    firstDayTwoYearsAgo.setFullYear(firstDayTwoYearsAgo.getFullYear() - 2);
    firstDayTwoYearsAgo.setMonth(0);
    firstDayTwoYearsAgo.setDate(1);
    firstDayTwoYearsAgo.setHours(0, 0, 0, 0);

    const lastDayLastYear = new Date();
    lastDayLastYear.setFullYear(lastDayLastYear.getFullYear() - 1);
    lastDayLastYear.setMonth(11);
    lastDayLastYear.setDate(31);
    lastDayLastYear.setHours(0, 0, 0, 0);

    const lastDayTwoYearsAgo = new Date();
    lastDayTwoYearsAgo.setFullYear(lastDayTwoYearsAgo.getFullYear() - 2);
    lastDayTwoYearsAgo.setMonth(11);
    lastDayTwoYearsAgo.setDate(31);
    lastDayTwoYearsAgo.setHours(0, 0, 0, 0);

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

    const lineChartOptionTypeSelected = ref(1);
    const lineChartOptionPeriodSelected = ref(1);
    const lineChartOPtionPeriodComparativeSelected = ref(1);

    const occupiedRooms = computed(() => store.state.dashboard.linearGraphOccupancy);
    const occupiedRoomsComparative = computed(
      () => store.state.dashboard.linearGraphOccupancyComparative
    );
    const dailyBillings = computed(() => store.state.dashboard.linearGraphBilling);
    const dailyBillingsComparative = computed(
      () => store.state.dashboard.linearGraphBillingComparative
    );

    const labels = computed(() => {
      if (lineChartOptionPeriodSelected.value === 4) {
        // año actual
        return [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ];
      }

      if (lineChartOptionTypeSelected.value === 1) {
        // occupancy
        return occupiedRooms.value.map((el) =>
          el.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        );
      }
      return dailyBillings.value.map((el) =>
        el.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      );
    });

    const labelA = computed(() => new Date().getFullYear().toString());

    const labelB = computed(() => {
      let result = new Date().getFullYear() - 1;
      if (lineChartOPtionPeriodComparativeSelected.value === 2) {
        result = new Date().getFullYear() - 2;
      }
      return result.toString();
    });

    const setA = computed(() => {
      const result: number[] = [];
      if (lineChartOptionPeriodSelected.value === 4) {
        // año actual
        if (lineChartOptionTypeSelected.value === 1) {
          // occupancy
          occupiedRooms.value.forEach((el) => {
            const month = el.date.getMonth();
            if (el.date.getMonth() === result.length) {
              result.push(el.numOccupiedRooms);
            } else {
              result[month] += el.numOccupiedRooms;
            }
          });
        } else if (lineChartOptionTypeSelected.value === 2) {
          // billing
          dailyBillings.value.forEach((el) => {
            const month = el.date.getMonth();
            if (el.date.getMonth() === result.length) {
              result.push(el.billing);
            } else {
              result[month] += el.billing;
            }
          });
        }
      } else {
        if (lineChartOptionTypeSelected.value === 1) {
          // monthly periods
          return occupiedRooms.value.map((el) => el.numOccupiedRooms);
        }
        return dailyBillings.value.map((el) => el.billing);
      }
      return result;
    });

    const setB = computed(() => {
      const result: number[] = [];
      if (lineChartOptionPeriodSelected.value === 4) {
        // año actual
        if (lineChartOptionTypeSelected.value === 1) {
          // occupancy
          occupiedRoomsComparative.value.forEach((el) => {
            const month = el.date.getMonth();
            if (el.date.getMonth() === result.length) {
              result.push(el.numOccupiedRooms);
            } else {
              result[month] += el.numOccupiedRooms;
            }
          });
        } else if (lineChartOptionTypeSelected.value === 2) {
          // billing
          dailyBillingsComparative.value.forEach((el) => {
            const month = el.date.getMonth();
            if (el.date.getMonth() === result.length) {
              result.push(el.billing);
            } else {
              result[month] += el.billing;
            }
          });
        }
      } else {
        if (lineChartOptionTypeSelected.value === 1) {
          // monthly periods
          return occupiedRoomsComparative.value.map((el) => el.numOccupiedRooms);
        }
        return dailyBillingsComparative.value.map((el) => el.billing);
      }
      return result;
    });

    watch(lineChartOptionTypeSelected, () => {
      lineChartOptionPeriodSelected.value = 1;
      lineChartOPtionPeriodComparativeSelected.value = 1;
    });

    watch(lineChartOptionPeriodSelected, async () => {
      void store.dispatch('layout/showSpinner', true);
      const payloadBillingOccupancy: {
        dateFrom?: Date;
        dateTo?: Date;
        pmsPropertyId?: number;
      } = {
        pmsPropertyId: store.state.properties.activeProperty?.id ?? 0,
      };
      const payloadBillingOccupancyComparative: {
        dateFrom?: Date;
        dateTo?: Date;
        pmsPropertyId?: number;
      } = {
        pmsPropertyId: store.state.properties.activeProperty?.id ?? 0,
      };
      if (lineChartOptionPeriodSelected.value === 1) {
        // ultimos 30 dias
        payloadBillingOccupancy.dateFrom = thirtyDaysAgo;
        payloadBillingOccupancy.dateTo = today;
        payloadBillingOccupancyComparative.dateFrom = thirtyDaysAgoLastYear;
        payloadBillingOccupancyComparative.dateTo = todayLastYear;
      } else if (lineChartOptionPeriodSelected.value === 2) {
        // mes actual
        payloadBillingOccupancy.dateFrom = firstDayOfCurrentMonth;
        payloadBillingOccupancy.dateTo = lastDayOfCurrentMonth;
        payloadBillingOccupancyComparative.dateFrom = firstDayOfCurrentMonthLastYear;
        payloadBillingOccupancyComparative.dateTo = lastDayOfCurrentMonthLastYear;
      } else if (lineChartOptionPeriodSelected.value === 3) {
        // mes anterior
        payloadBillingOccupancy.dateFrom = firstDayOfPreviousMonth;
        payloadBillingOccupancy.dateTo = lastDayOfPreviousMonth;
        payloadBillingOccupancyComparative.dateFrom = firstDayOfPreviousMonthLastYear;
        payloadBillingOccupancyComparative.dateTo = lastDayOfPreviousMonthLastYear;
      } else if (lineChartOptionPeriodSelected.value === 4) {
        // año en curso
        payloadBillingOccupancy.dateFrom = firstDayOfCurrentYear;
        payloadBillingOccupancy.dateTo = lastDayOfCurrentYear;
        payloadBillingOccupancyComparative.dateFrom = firstDayLastYear;
        payloadBillingOccupancyComparative.dateTo = lastDayLastYear;
      }
      try {
        await store.dispatch('dashboard/fetchDailyBillings', payloadBillingOccupancy);
        await store.dispatch(
          'dashboard/fetchDailyBillingsComparative',
          payloadBillingOccupancyComparative
        );
        await store.dispatch('dashboard/fetchOccupiedRooms', payloadBillingOccupancy);
        await store.dispatch(
          'dashboard/fetchOccupiedRoomsComparative',
          payloadBillingOccupancyComparative
        );
      } catch {
        dialogService.open({
          header: 'Error',
          content: 'Algo ha ido mal',
          btnAccept: 'Ok',
        });
      } finally {
        lineChartOPtionPeriodComparativeSelected.value = 1;
        void store.dispatch('layout/showSpinner', false);
      }
    });

    // watch comparative
    watch(lineChartOPtionPeriodComparativeSelected, async () => {
      void store.dispatch('layout/showSpinner', true);
      const payloadBillingOccupancyComparative: {
        dateFrom?: Date;
        dateTo?: Date;
        pmsPropertyId?: number;
      } = {
        pmsPropertyId: store.state.properties.activeProperty?.id ?? 0,
      };

      if (lineChartOptionPeriodSelected.value === 1) {
        // ultimos 30 dias
        if (lineChartOPtionPeriodComparativeSelected.value === 1) {
          payloadBillingOccupancyComparative.dateFrom = thirtyDaysAgoLastYear;
          payloadBillingOccupancyComparative.dateTo = todayLastYear;
        } else {
          payloadBillingOccupancyComparative.dateFrom = thirtyDaysAgoTwoYearsAgo;
          payloadBillingOccupancyComparative.dateTo = todayTwoYearsAgo;
        }
      } else if (lineChartOptionPeriodSelected.value === 2) {
        // mes actual
        if (lineChartOPtionPeriodComparativeSelected.value === 1) {
          payloadBillingOccupancyComparative.dateFrom = firstDayOfCurrentMonthLastYear;
          payloadBillingOccupancyComparative.dateTo = lastDayOfCurrentMonthLastYear;
        } else if (lineChartOPtionPeriodComparativeSelected.value === 2) {
          payloadBillingOccupancyComparative.dateFrom = firstDayOfCurrentMonthTwoYearsAgo;
          payloadBillingOccupancyComparative.dateTo = lastDayOfCurrentMonthTwoYearsAgo;
        }
      } else if (lineChartOptionPeriodSelected.value === 3) {
        // mes anterior
        if (lineChartOPtionPeriodComparativeSelected.value === 1) {
          payloadBillingOccupancyComparative.dateFrom = firstDayOfPreviousMonthLastYear;
          payloadBillingOccupancyComparative.dateTo = lastDayOfPreviousMonthLastYear;
        } else if (lineChartOPtionPeriodComparativeSelected.value === 2) {
          payloadBillingOccupancyComparative.dateFrom = firstDayOfPreviousMonthTwoYearsAgo;
          payloadBillingOccupancyComparative.dateTo = lastDayOfPreviousMonthTwoYearsAgo;
        }
      } else if (lineChartOptionPeriodSelected.value === 4) {
        // año en curso
        if (lineChartOPtionPeriodComparativeSelected.value === 1) {
          payloadBillingOccupancyComparative.dateFrom = firstDayLastYear;
          payloadBillingOccupancyComparative.dateTo = lastDayLastYear;
        } else if (lineChartOPtionPeriodComparativeSelected.value === 2) {
          payloadBillingOccupancyComparative.dateFrom = firstDayTwoYearsAgo;
          payloadBillingOccupancyComparative.dateTo = lastDayTwoYearsAgo;
        }
      }
      try {
        await store.dispatch(
          'dashboard/fetchDailyBillingsComparative',
          payloadBillingOccupancyComparative
        );
        await store.dispatch(
          'dashboard/fetchOccupiedRoomsComparative',
          payloadBillingOccupancyComparative
        );
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

    const data = computed<ChartData<'line'>>(() => ({
      labels: labels.value,
      datasets: [
        {
          label: labelA.value,
          data: setA.value,
          fill: true,
          borderColor: 'rgb(105,197,216)',
          backgroundColor: 'rgb(105,197,216, 0.2)',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: labelB.value,
          data: setB.value,
          fill: true,
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          pointHitRadius: 10,
        },
      ],
    }));

    const options = computed<ChartOptions<'line'>>(() => ({
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          align: 'end',
        },
      },
    }));

    const { lineChartProps, lineChartRef } = useLineChart({
      chartData: data,
      options,
    });

    return {
      lineChartOptionType,
      lineChartOptionTypeSelected,
      lineChartOptionPeriod,
      lineChartOptionPeriodSelected,
      lineChartOptionsComparative,
      lineChartOPtionPeriodComparativeSelected,
      labels,
      labelA,
      labelB,
      setA,
      setB,
      data,
      options,
      lineChartRef,
      lineChartProps,
    };
  },
});
</script>
<style lang="scss" scoped>
.graph {
  display: none;
  grid-area: graph;
  padding: 13px;
  border-radius: 20px;
  background-color: white;
  .top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 21px;
    .title {
      font-size: 18px;
      font-weight: 600;
    }
    .right {
      display: flex;
      justify-content: space-around;
      .select {
        margin-left: 0.5rem;
        border-radius: 8px;
        box-shadow: 0px 4px 14px 0px rgba(0, 0, 0, 0.2);
        width: 150px;
        height: 30px;
        border-radius: 8px;
        background-color: white;
      }
    }
  }
}
</style>
