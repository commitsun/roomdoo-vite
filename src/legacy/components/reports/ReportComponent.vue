<template>
  <div class="main-content">
    <div class="top">
      <div class="from">
        <div class="label">
          {{
            reportType === 'services' || reportType === 'transactions' || reportType === 'INE'
              ? 'Desde:'
              : 'Fecha:'
          }}
        </div>

        <DatePicker
          v-model="dateFrom"
          class="datepicker"
          showIcon
          inputClass="input-date-picker"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
        />
      </div>
      <div
        class="to"
        v-if="reportType === 'services' || reportType === 'transactions' || reportType === 'INE'"
      >
        <div class="label">Hasta:</div>
        <DatePicker
          v-model="dateTo"
          class="datepicker"
          showIcon
          inputClass="input-date-picker"
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
        />
      </div>
    </div>
    <div class="bottom">
      <AppButton
        :label="'Cancelar'"
        raised
        size="small"
        severity="secondary"
        @click="$emit('close')"
      />
      <AppButton
        class="ml-3"
        :label="'Generar informe'"
        raised
        size="small"
        @click="downloadReport()"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import DatePicker from 'primevue/datepicker';
import { useStore } from '@/legacy/store';
import type { AxiosResponse } from 'axios';
import { dialogService } from '@/legacy/services/DialogService';
import Button from 'primevue/button';

export default defineComponent({
  components: {
    DatePicker,
    AppButton: Button,
  },
  props: {
    reportType: {
      type: String,
    },
  },
  emits: ['close'],
  setup(props) {
    const store = useStore();

    const isCalendarRange = ref(false);
    const dateFrom = ref();
    const dateTo = ref();
    const activeProperty = computed(() => store.state.properties.activeProperty);

    const downloadReport = async () => {
      if (!dateFrom.value && !dateFrom.value) {
        return;
      }
      if (!dateTo.value) {
        dateTo.value = dateFrom.value;
      }
      let path = '';
      if (props.reportType === 'kelly') {
        path = 'reservations/kellyReport';
      } else if (props.reportType === 'arrivals') {
        path = 'reservations/arrivalsReport';
      } else if (props.reportType === 'departures') {
        path = 'reservations/departuresReport';
      } else if (props.reportType === 'transactions') {
        path = 'transactions/transactionReport';
      } else if (props.reportType === 'services') {
        path = 'services/servicesReport';
      } else if (props.reportType === 'traveller') {
        path = 'properties/travellerReport';
      } else if (props.reportType === 'INE') {
        if (!activeProperty.value?.canDownloadIneReport) {
          dialogService.open({
            header: 'Faltan datos para exportar el Informe INE',
            content:
              'Para exportar este informe, es necesario configurar el número de turismo y la categoría INE de este establecimiento.<br>Contacta con el equipo de soporte de Roomdoo.',
            btnAccept: 'Aceptar',
          });
          return;
        }
        path = 'properties/ineReport';
      }
      const payload = {
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        pmsPropertyId: activeProperty.value?.id,
      };
      void store.dispatch('layout/showSpinner', true);
      await store
        .dispatch(path, payload)
        .then((response: AxiosResponse<{ fileName: string; binary: string }>) => {
          const a: HTMLAnchorElement = document.createElement('a');
          if (response.data && response.data.binary && response.data.fileName) {
            a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data.binary}`;
          }
          a.download = response.data.fileName;
          document.body.appendChild(a);
          a.click();
        });
      void store.dispatch('layout/showSpinner', false);
    };
    return {
      isCalendarRange,
      dateFrom,
      dateTo,
      downloadReport,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-content {
  display: flex;
  flex-direction: column;

  .top {
    display: flex;
    flex-direction: column;

    .from,
    .to {
      flex-direction: column;
      display: flex;
    }
  }

  .bottom {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    .top {
      flex-direction: row;

      .from {
        margin-right: 1rem;
      }
    }
  }
}
</style>
