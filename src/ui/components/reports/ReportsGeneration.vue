<template>
  <div class="reports-generation-container">
    <div>
      <Button
        :label="t('reports.back')"
        variant="text"
        icon="pi pi-arrow-left"
        size="small"
        @click="$emit('back')"
        color="black"
      />
    </div>

    <div v-if="reportType === 'kelly'" class="report-title">
      <BrushCleaning :size="13" />
      {{ t('reports.cleaningReportLongName') }}
    </div>
    <div v-else-if="reportType === 'arrivals'" class="report-title">
      <BaggageClaim :size="13" />
      {{ t('reports.checkinReportLongName') }}
    </div>
    <div v-else-if="reportType === 'departures'" class="report-title">
      <DoorOpen :size="13" />
      {{ t('reports.checkoutReportLongName') }}
    </div>
    <div v-else-if="reportType === 'services'" class="report-title">
      <HandPlatter :size="13" />
      {{ t('reports.servicesReportLongName') }}
    </div>
    <div v-else-if="reportType === 'transactions'" class="report-title">
      <Banknote :size="13" />
      {{ t('reports.paymentsReportLongName') }}
    </div>
    <div v-else-if="reportType === 'ine'" class="report-title">
      <ChartPie :size="13" />
      {{ t('reports.ineReportLongName') }}
    </div>
    <div class="dates-container">
      <div class="date-wrapper">
        <div class="date-label">
          {{
            reportType === 'kelly' || reportType === 'arrivals' || reportType === 'departures'
              ? t('reports.dateLabel')
              : t('reports.dateFromLabel')
          }}
        </div>
        <DatePicker
          v-model="dateFrom"
          showIcon
          showClear
          :placeholder="t('reports.dateFormatPlaceholder')"
          :inputStyle="{ width: '100%' }"
        />
      </div>
      <div
        class="date-wrapper"
        v-if="reportType === 'services' || reportType === 'transactions' || reportType === 'ine'"
      >
        <div class="date-label">
          {{ t('reports.dateToLabel') }}
        </div>
        <DatePicker
          v-model="dateTo"
          showIcon
          showClear
          :placeholder="t('reports.dateFormatPlaceholder')"
          :inputStyle="{ width: '100%' }"
        />
      </div>
    </div>

    <Message severity="info" icon="pi pi-info-circle">
      <span v-if="reportType === 'kelly'">
        {{ t('reports.cleaningReportDescription') }}
      </span>
      <span v-else-if="reportType === 'arrivals'">
        {{ t('reports.checkinReportDescription') }}
      </span>
      <span v-else-if="reportType === 'departures'">
        {{ t('reports.checkoutReportDescription') }}
      </span>
      <span v-else-if="reportType === 'services'">
        {{ t('reports.servicesReportDescription') }}
      </span>
      <span v-else-if="reportType === 'transactions'">
        {{ t('reports.paymentsReportDescription') }}
      </span>
      <span v-else-if="reportType === 'ine'">
        {{ t('reports.ineReportDescription') }}
      </span>
    </Message>

    <div class="footer">
      <Button
        :label="t('reports.cancel')"
        severity="secondary"
        @click="$emit('back')"
        color="black"
      />
      <Button
        :label="t('reports.generateReport')"
        :disabled="generationDisabled"
        severity="primary"
        @click="generateReport"
        icon="pi pi-download"
        iconPos="right"
        color="black"
      />
      <!-- @kclick="$emit('back')" -->
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import DatePicker from 'primevue/datepicker';
import { useI18n } from 'vue-i18n';
import {
  BrushCleaning,
  BaggageClaim,
  DoorOpen,
  HandPlatter,
  Banknote,
  ChartPie,
} from 'lucide-vue-next';

import { useUIStore } from '@/infrastructure/stores/ui';
import { ReportsService } from '@/application/reports/ReportsService';
import { ReportsRepositoryImpl } from '@/infrastructure/repositories/ReportsRepositoryImpl';

export default defineComponent({
  name: 'ReportsGeneration',
  components: {
    BrushCleaning,
    BaggageClaim,
    DoorOpen,
    HandPlatter,
    Banknote,
    ChartPie,
    Button,
    Message,
    DatePicker,
  },
  emits: ['back'],
  props: {
    reportType: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const uiStore = useUIStore();
    const reportsService = new ReportsService(new ReportsRepositoryImpl());
    const dateFrom = ref<Date | null>(null);
    const dateTo = ref<Date | null>(null);
    const generationDisabled = computed(() => {
      if (
        (props.reportType === 'kelly' ||
          props.reportType === 'arrivals' ||
          props.reportType === 'departures') &&
        dateFrom.value === null
      ) {
        return true;
      }
      if (
        (props.reportType === 'services' ||
          props.reportType === 'transactions' ||
          props.reportType === 'ine') &&
        (dateFrom.value === null || dateTo.value === null)
      ) {
        return true;
      }
      return false;
    });

    const convertResponseToReport = (response: { data: string }, fileName: string): void => {
      const a: HTMLAnchorElement = document.createElement('a');
      if (response.data) {
        a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data}`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
      }
    };

    const generateReport = async (): Promise<void> => {
      let dateFromString = '';
      let dateToString = '';
      if (dateFrom.value !== null) {
        dateFromString = dateFrom.value.toISOString().split('T')[0];
      }
      if (dateTo.value !== null) {
        dateToString = dateTo.value.toISOString().split('T')[0];
      }
      try {
        uiStore.startLoading();
        if (props.reportType === 'kelly' && dateFrom.value !== null) {
          const response = await reportsService.kellyReport(1, dateFrom.value);
          convertResponseToReport(
            response,
            t('reports.cleaningReportShortName') + '_' + dateFromString + '.xlsx',
          );
        } else if (props.reportType === 'arrivals' && dateFrom.value !== null) {
          const response = await reportsService.arrivalsReport(1, dateFrom.value);
          convertResponseToReport(
            response,
            t('reports.checkinReportShortName') + '_' + dateFromString + '.xlsx',
          );
        } else if (props.reportType === 'departures' && dateFrom.value !== null) {
          const response = await reportsService.departuresReport(1, dateFrom.value);
          convertResponseToReport(
            response,
            t('reports.checkoutReportShortName') + '_' + dateFromString + '.xlsx',
          );
        } else if (
          props.reportType === 'services' &&
          dateFrom.value !== null &&
          dateTo.value !== null
        ) {
          const response = await reportsService.servicesReport(1, dateFrom.value, dateTo.value);
          convertResponseToReport(
            response,
            t('reports.servicesReportShortName') +
              '_' +
              dateFromString +
              '_to_' +
              dateToString +
              '.xlsx',
          );
        } else if (
          props.reportType === 'transactions' &&
          dateFrom.value !== null &&
          dateTo.value !== null
        ) {
          const response = await reportsService.transactionsReport(1, dateFrom.value, dateTo.value);
          convertResponseToReport(
            response,
            t('reports.paymentsReportShortName') +
              '_' +
              dateFromString +
              '_to_' +
              dateToString +
              '.xlsx',
          );
        } else if (props.reportType === 'ine' && dateFrom.value !== null && dateTo.value !== null) {
          const response = await reportsService.ineReport(1, dateFrom.value, dateTo.value);
          convertResponseToReport(
            response,
            t('reports.ineReportShortName') +
              '_' +
              dateFromString +
              '_to_' +
              dateToString +
              '.xlsx',
          );
        }
      } finally {
        uiStore.stopLoading();
      }
    };
    return { t, dateFrom, dateTo, generationDisabled, generateReport };
  },
});
</script>
<style lang="scss" scoped>
.reports-generation-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .dates-container {
    display: flex;
    flex-direction: column;
    .date-wrapper {
      display: flex;
      flex-direction: column;
      margin-top: 14px;
      .date-label {
        color: var(--Light-text-color, #64748b);
        font-size: 14px;
        user-select: none;
      }
    }
  }
  .report-title {
    display: flex;
    align-items: center;
    gap: 8px;
    span {
      font-size: 14px;
      font-weight: bold;
    }
  }
  .footer {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
@media (min-width: 1024px) {
  .reports-generation-container {
    .dates-container {
      flex-direction: row;
      gap: 15px;
      .date-wrapper {
        margin-top: 0;
        flex: 1;
      }
    }
  }
}
</style>
