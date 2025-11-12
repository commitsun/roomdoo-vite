<template>
  <br>  </br>
  <DatePicker  v-model="dates"
              placeholder="Fechas"
              selectionMode="range"
              :showClear="true"
              :manualInput="false"
              dateFormat="dd/mm/yy"
              clearIcon="pi pi-times"
              :inputStyle="{ width: '250px' }"/>
  <br>  </br>

</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import DatePicker from 'primevue/datepicker';

export default defineComponent({
  name: 'TestPage',
  components: {
    DatePicker,
  },
  setup() {
    const dates = ref<Date[] | null>(null);
    return { dates };
  },
});
</script>
<style scoped></style>
