<template>
  <div class="modal-header">
    <div class="modal-title">{{ t('reports.title') }}</div>
    <div class="property-name">
      {{ activePmsPropertyName }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePmsPropertiesStore } from '@/infrastructure/stores/pmsProperties';
export default defineComponent({
  name: 'ReportsHeader',
  setup() {
    const { t } = useI18n();
    const pmsPropertiesStore = usePmsPropertiesStore();
    const activePmsPropertyName = pmsPropertiesStore.pmsProperties.find(
      (p) => p.id === pmsPropertiesStore.currentPmsPropertyId,
    )?.name;
    return {
      t,
      activePmsPropertyName,
    };
  },
});
</script>
<style lang="scss" scoped>
.modal-header {
  display: flex;
  flex-direction: column;
  .modal-title {
    font-size: 17.5px;
    font-weight: bold;
  }
  .property-name {
    font-size: 14px;
  }
}
</style>
