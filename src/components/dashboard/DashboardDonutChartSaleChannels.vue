<template>
  <div class="donut-2 cell">
    <div class="top">
      <span class="title"> Canales de venta </span>
      <div class="select-day">
        <CustomSelect
          iconDropdown="app-images/dropdown.svg"
          :options="dateOptionsReservationBySaleChannel"
          v-model="dateOptionsReservationBySaleChannelSelected"
          :optionsMarginTop="2"
          :textBold="true"
          :text2Bold="false"
          focusable
        />
      </div>
    </div>
    <div class="bottom" v-if="reservationsBySaleChannel.length > 0">
      <div class="chart">
        <DoughnutChart v-bind="doughnutChartProps" />
      </div>
      <div class="legend">
        <div
          class="legend-item"
          v-for="(label, index) in reservationsBySalechannelsLabels"
          :key="index"
        >
          <div class="legend-row-1">
            <div
              class="square"
              :style="{
                backgroundColor: colorsReservationsBySaleChannelChart[index],
              }"
            />
            <div class="legend-item-title">
              {{ reservationsBySaleChannelData[index] }}% {{ label }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-alternative" v-else>No hay ventas en el periodo seleccionado</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { Chart, type ChartData, type ChartOptions, registerables } from 'chart.js';
import { DoughnutChart, useDoughnutChart } from 'vue-chart-3';

import { useStore } from '../../store';
import CustomSelect from '@/components/roomdooComponents/CustomSelect.vue';
import { dialogService } from '@/services/DialogService';

Chart.register(...registerables);

export default defineComponent({
  components: {
    CustomSelect,
    DoughnutChart,
  },
  setup() {
    const store = useStore();
    const colorsReservationsBySaleChannelChart = [
      '#4BB1E0',
      '#A5E9A5',
      '#F24E1E',
      '#1A4371',
      '#FFD700',
      '#C6fbf7',
      '#FF69B4',
      '#e28743',
      '#873e23',
    ];

    const dateOptionsReservationBySaleChannel = [
      { id: 1, text: 'Últimos 7 días' },
      { id: 2, text: 'Últimos 30 días' },
      { id: 3, text: 'Último año' },
    ];

    const dateOptionsReservationBySaleChannelSelected = ref(1);

    const reservationsBySaleChannel = computed(
      () => store.state.dashboard.reservationsBySaleChannel,
    );

    const reservationsBySalechannelsLabels = computed(() => {
      let result = [];
      result = reservationsBySaleChannel.value.map((el) => el.saleChannelName).slice(0, 8);
      if (result.length === 8) {
        if (reservationsBySaleChannel.value.length === 9) {
          result.push(reservationsBySaleChannel.value[8].saleChannelName);
        } else {
          result.push('Otros');
        }
      }
      return result;
    });

    const reservationsBySaleChannelData = computed(() => {
      let result = [];
      result = reservationsBySaleChannel.value
        .map((el) => el.percentageReservationsSoldBySaleChannel)
        .slice(0, 8);
      if (result.length === 8) {
        if (reservationsBySaleChannel.value.length === 9) {
          result.push(reservationsBySaleChannel.value[8].percentageReservationsSoldBySaleChannel);
        } else {
          let sum = 0;
          reservationsBySaleChannel.value.slice(8).forEach((item) => {
            sum += item.percentageReservationsSoldBySaleChannel;
          });
          result.push(sum);
        }
      }
      return result;
    });

    watch(dateOptionsReservationBySaleChannelSelected, async () => {
      void store.dispatch('layout/showSpinner', true);
      try {
        const dateFrom = new Date();
        if (dateOptionsReservationBySaleChannelSelected.value === 1) {
          dateFrom.setDate(dateFrom.getDate() - 7);
        } else if (dateOptionsReservationBySaleChannelSelected.value === 2) {
          dateFrom.setDate(dateFrom.getDate() - 30);
        } else if (dateOptionsReservationBySaleChannelSelected.value === 3) {
          dateFrom.setDate(dateFrom.getDate() - 365);
        }
        const payloadReservationsBySaleChannel = {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom,
          dateTo: new Date(),
        };
        await store.dispatch(
          'dashboard/fetchReservationsBySaleChannel',
          payloadReservationsBySaleChannel,
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

    const donutData = computed<ChartData<'doughnut'>>(() => ({
      labels: reservationsBySalechannelsLabels.value,
      datasets: [
        {
          data: reservationsBySaleChannelData.value,
          backgroundColor: colorsReservationsBySaleChannelChart,
        },
      ],
    }));

    const options = computed<ChartOptions<'doughnut'>>(() => ({
      options: {
        responsive: true,
        aspectRatio: 2,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
        labels: {
          precision: 2,
        },
      },
    }));

    const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
      chartData: donutData,
      options,
    });

    return {
      colorsReservationsBySaleChannelChart,
      dateOptionsReservationBySaleChannel,
      dateOptionsReservationBySaleChannelSelected,
      reservationsBySaleChannel,
      reservationsBySalechannelsLabels,
      reservationsBySaleChannelData,
      donutData,
      options,
      doughnutChartRef,
      doughnutChartProps,
    };
  },
});
</script>

<style lang="scss" scoped>
.donut-2 {
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 13px;
  border-radius: 20px;
  .top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 11px;
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    .select-day {
      box-shadow: 0px 4px 14px 0px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      background-color: white;
      width: 150px;
      height: 30px;
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
          margin-bottom: 7px;
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
      }
    }
  }
  .bottom-alternative {
    font-size: 16px;
    margin-top: 2rem;
  }
}
@media (min-width: 768px) {
  .donut-2 {
    .top {
      .select-day {
        font-size: 13px;
      }
    }
    .bottom {
      .legend {
        .legend-row-1 {
          .legend-item-title {
            font-size: 14px !important;
          }
        }
      }
    }
  }
}
@media (min-width: 1024px) {
  .donut-2 {
    .top {
      .title {
        font-size: 18px;
      }
    }
  }
}
</style>
