<template>
  <div class="donut-1 cell" v-if="stateRooms.length > 0">
    <div class="top">
      <span class="title">
        Estado de las
        {{
          stateRooms[0].numFreeRooms +
          stateRooms[0].numOccupiedRooms +
          stateRooms[0].numOutOfServiceRooms
        }}
        habitaciones
      </span>
      <div class="select-day">
        <CustomSelect
          iconDropdown="app-images/dropdown.svg"
          :options="dateOptionsRoomStates"
          v-model="dateOptionsRoomStatesSelected"
          :optionsMarginTop="2"
          :textBold="true"
          :text2Bold="false"
          focusable
        />
      </div>
    </div>
    <div class="bottom">
      <div class="chart">
        <DoughnutChart v-bind="doughnutChartProps" />
      </div>
      <div class="legend">
        <div class="legend-item" v-if="stateRoomsPercentages.occupiedRooms > 0">
          <div class="legend-row-1">
            <div class="square" style="background-color: #4bb1e0" />
            <div class="legend-item-title">
              {{ stateRoomsPercentages.occupiedRooms.toFixed(0) }}% ocupadas
            </div>
          </div>
          <div class="legend-row-2">
            <div class="legend-item-subtitle">
              {{ stateRooms[dateOptionsRoomStatesSelected - 1].numOccupiedRooms }} habitaciones
            </div>
          </div>
        </div>
        <div class="legend-item" v-if="stateRoomsPercentages.freeRooms > 0">
          <div class="legend-row-1">
            <div class="square" style="background-color: #a5e9a5" />
            <div class="legend-item-title">
              {{ stateRoomsPercentages.freeRooms.toFixed(0) }}% libres
            </div>
          </div>
          <div class="legend-row-2">
            <div class="legend-item-subtitle">
              {{ stateRooms[dateOptionsRoomStatesSelected - 1].numFreeRooms }} habitaciones
            </div>
          </div>
        </div>
        <div class="legend-item" v-if="stateRoomsPercentages.outOfServiceRooms > 0">
          <div class="legend-row-1">
            <div class="square" style="background-color: #929292" />
            <div class="legend-item-title">
              {{ stateRoomsPercentages.outOfServiceRooms.toFixed(0) }}% fuera de servicio
            </div>
          </div>
          <div class="legend-row-2">
            <div class="legend-item-subtitle">
              {{ stateRooms[dateOptionsRoomStatesSelected - 1].numOutOfServiceRooms }} habitaciones
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { Chart, type ChartData, type ChartOptions, registerables } from 'chart.js';
import { DoughnutChart, useDoughnutChart } from 'vue-chart-3';

import { useStore } from '../../store';
import CustomSelect from '../roomdooComponents/CustomSelect.vue';

Chart.register(...registerables);

export default defineComponent({
  components: {
    CustomSelect,
    DoughnutChart,
  },
  setup() {
    const store = useStore();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const todayStr = `${today.getDate().toString()}/${(today.getMonth() + 1).toString()}/${today.getFullYear().toString().substring(2)}`;
    const tomorrowStr = `${tomorrow.getDate().toString()}/${(tomorrow.getMonth() + 1).toString()}/${tomorrow.getFullYear().toString().substring(2)}`;
    const yesterdayStr = `${yesterday.getDate().toString()}/${(yesterday.getMonth() + 1).toString()}/${yesterday.getFullYear().toString().substring(2)}`;

    const dateOptionsRoomStates = [
      { id: 1, text: 'Ayer', text2: `(${yesterdayStr})` },
      { id: 2, text: 'Hoy', text2: `(${todayStr})` },
      { id: 3, text: 'Mañana', text2: `(${tomorrowStr})` },
    ];
    const dateOptionsRoomStatesSelected = ref(2);
    const stateRooms = computed(() => store.state.dashboard.stateRooms);
    const stateRoomsPercentages = computed(() => {
      if (stateRooms.value.length === 0) {
        return {
          freeRooms: 0,
          occupiedRooms: 0,
          outOfServiceRooms: 0,
        };
      }
      const totalRooms =
        stateRooms.value[0].numFreeRooms +
        stateRooms.value[0].numOccupiedRooms +
        stateRooms.value[0].numOutOfServiceRooms;

      return {
        freeRooms:
          (stateRooms.value[dateOptionsRoomStatesSelected.value - 1].numFreeRooms * 100) /
          totalRooms,
        occupiedRooms:
          (stateRooms.value[dateOptionsRoomStatesSelected.value - 1].numOccupiedRooms * 100) /
          totalRooms,
        outOfServiceRooms:
          (stateRooms.value[dateOptionsRoomStatesSelected.value - 1].numOutOfServiceRooms * 100) /
          totalRooms,
      };
    });

    const donutData = computed<ChartData<'doughnut'>>(() => ({
      labels: ['libres', 'ocupadas', 'fuera de servicio'],
      datasets: [
        {
          data: [
            stateRooms.value[dateOptionsRoomStatesSelected.value - 1].numOccupiedRooms,
            stateRooms.value[dateOptionsRoomStatesSelected.value - 1].numFreeRooms,
            stateRooms.value[dateOptionsRoomStatesSelected.value - 1].numOutOfServiceRooms,
          ],
          backgroundColor: ['#4BB1E0', '#A5E9A5', '#929292'],
        },
      ],
    }));

    const options = computed<ChartOptions<'doughnut'>>(() => ({
      options: {
        responsive: true,
        aspectRatio: true,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
    }));

    const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
      chartData: donutData,
      options,
    });
    return {
      dateOptionsRoomStatesSelected,
      stateRooms,
      dateOptionsRoomStates,
      stateRoomsPercentages,
      donutData,
      options,
      doughnutChartRef,
      doughnutChartProps,
    };
  },
});
</script>

<style lang="scss" scoped>
.donut-1 {
  grid-area: donut-1;
  padding: 13px;
  border-radius: 20px;
  background-color: white;
  display: flex;
  flex-direction: column;
  .top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 11px;

    .title {
      font-size: 16px;
      font-weight: 600;
      margin-right: 5px;
    }
    .select-day {
      box-shadow: 0px 4px 14px 0px rgba(0, 0, 0, 0.2);
      width: 150px;
      height: 30px;
      border-radius: 8px;
      background-color: white;
      font-size: 11px;
    }
  }
  .bottom {
    flex: 1 1 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .chart {
      width: 60%;
    }
    .legend {
      width: calc(40% - 2rem);
      margin-left: 2rem;
      .legend-item {
        .legend-row-1 {
          white-space: nowrap;
          display: flex;
          align-items: center;
          .square {
            height: 10px;
            width: 18px;
            margin-right: 7px;
            border-radius: 4px;
          }
          .legend-item-title {
            font-size: 10px;
            line-height: normal;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          }
        }
        .legend-row-2 {
          margin-left: 25px;
          .legend-item-subtitle {
            white-space: nowrap;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
            line-height: normal;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          }
        }
      }
    }
  }
}
@media (min-width: 768px) {
  .donut-1 {
    .top {
      .select-day {
        font-size: 13px;
      }
    }
    .bottom {
      .legend {
        .legend-row-1 {
          .legend-item-title {
            font-size: 18px !important;
          }
        }
      }
    }
  }
}
@media (min-width: 1024px) {
  .donut-1 {
    .top {
      .title {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}
</style>
