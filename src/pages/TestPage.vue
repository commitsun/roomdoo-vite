<template>
  <div class="test" @click="openDialog">hola</div>
</template>

<script lang="ts">
import PartnerForm from '@/components/partners/PartnerForm.vue';
import { dialogService } from '@/services/DialogService';
import { defineComponent, markRaw, ref } from 'vue';

export default defineComponent({
  setup() {
    const openDialog = () => {
      dialogService.open({
        header: 'test',
        content: markRaw(PartnerForm),

        closable: true,
      });
    };
    return {
      openDialog,
    };
  },
});
</script>
