<template>
  <div class="reports-container">
    <ReportsOptions @selectedReport="reportSelected = $event" v-if="reportSelected === ''" />
    <ReportsGeneration :reportType="reportSelected" @back="reportSelected = ''" v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import ReportsOptions from './ReportsOptions.vue';
import ReportsGeneration from './ReportsGeneration.vue';
export default defineComponent({
  name: 'Reports',
  components: {
    ReportsOptions,
    ReportsGeneration,
  },
  setup() {
    const reportSelected = ref('');
    return {
      reportSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
.reports-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (min-width: 1024px) {
    width: 375px;
  }
}
</style>
