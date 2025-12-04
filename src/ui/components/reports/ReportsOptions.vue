<template>
  <span class="explanation-text">{{ t('reports.subtitle') }}</span>
  <div class="grid">
    <div class="square" @click="$emit('selectedReport', 'kelly')">
      <BrushCleaning :size="30" class="report-icon" />
      <span>{{ t('reports.cleaningReportShortName') }}</span>
    </div>
    <div class="square" @click="$emit('selectedReport', 'arrivals')">
      <BaggageClaim :size="30" class="report-icon" />
      <span>{{ t('reports.checkinReportShortName') }}</span>
    </div>
    <div class="square" @click="$emit('selectedReport', 'departures')">
      <DoorOpen :size="30" class="report-icon" />
      <span>{{ t('reports.checkoutReportShortName') }}</span>
    </div>
    <div class="square" @click="$emit('selectedReport', 'services')">
      <HandPlatter :size="30" class="report-icon" />
      <span>{{ t('reports.servicesReportShortName') }}</span>
    </div>
    <div class="square" @click="$emit('selectedReport', 'transactions')">
      <Banknote :size="30" class="report-icon" />
      <span>{{ t('reports.paymentsReportShortName') }}</span>
    </div>
    <div class="square" @click="$emit('selectedReport', 'ine')">
      <ChartPie :size="30" class="report-icon" />
      <span>{{ t('reports.ineReportShortName') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import {
  BrushCleaning,
  BaggageClaim,
  DoorOpen,
  HandPlatter,
  Banknote,
  ChartPie,
} from 'lucide-vue-next';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Reports',
  components: {
    BrushCleaning,
    BaggageClaim,
    DoorOpen,
    HandPlatter,
    Banknote,
    ChartPie,
  },
  emits: ['selectedReport'],
  setup() {
    const { t } = useI18n();
    return { t };
  },
});
</script>

<style lang="scss" scoped>
.explanation-text {
  font-size: 14px;
  margin-bottom: 14px;
}
.grid {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  .square {
    width: calc((100% - 24px) / 2);
    border: 1px solid blue;
    height: 99px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    border-radius: var(--border-radius-md, 6px);
    border: 1px solid var(--form-field-border-color, #cbd5e1);
    background: var(--surface-0, #fff);
    .report-icon {
      color: var(--p-primary-color);
    }
    &:hover {
      background-color: #eff6ff;
      opacity: 0.95;
    }
  }
}

@media (min-width: 1024px) {
  .grid {
    .square {
      width: 117px;
    }
  }
}
</style>
