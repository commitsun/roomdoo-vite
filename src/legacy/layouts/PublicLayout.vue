<template>
  <router-view />
  <Spinner :show="showSpinner" />
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from '@/legacy/store';
import Spinner from '@/legacy/components/roomdooComponents/SpinnerComponent.vue';

export default defineComponent({
  components: {
    Spinner,
  },
  setup() {
    const store = useStore();

    const showSpinner = computed(() => store.state.layout.showSpinner);

    return {
      showSpinner,
    };
  },
});
</script>
