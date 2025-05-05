<template>
  <router-view />
  <DialogContainer />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DialogContainer from '@/legacy/components/dialogs/DialogContainer.vue';
export default defineComponent({
  name: 'App',
  components: {
    DialogContainer,
  },
});
</script>
<style lang="scss" scoped>
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.5) !important;
}
</style>
